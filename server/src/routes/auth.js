// server/src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ---------------------------------------------------
// POST /api/register
// ---------------------------------------------------
router.post('/register', async (req, res) => {
  const {
    full_name,
    email,
    password,
    contact_number,
    role,
    agreed,
  } = req.body;

  // ---------- Basic validation ----------
  if (
    !full_name ||
    !email ||
    !password ||
    !contact_number ||
    !role ||
    agreed === undefined
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // ---------- Duplicate‑email check ----------
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists.' });
    }

    // ---------- Password hashing ----------
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // ---------- Create user ----------
    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      contact_number,
      role,
      passwordHash,
      agreed,
    });

    // ---------- JWT generation ----------
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ---------- Respond ----------
    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      token,               // client will store this in localStorage
      message: 'Account created',
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------------------------------
// POST /api/contractor/register-application
// ---------------------------------------------------
router.post('/contractor/register-application', async (req, res) => {
  const {
    fullName,
    businessName,
    email,
    password,
    contactNumber,
    selectedStalls,
  } = req.body;

  if (
    !fullName ||
    !businessName ||
    !email ||
    !password ||
    !contactNumber ||
    !selectedStalls
  ) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });
    const ContractorApplication = require('../models/ContractorApplication');

    if (userExists) {
      if (userExists.role !== 'contractor') {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
      if (userExists.status === 'pending') {
        return res.status(409).json({ error: 'A pending application with this email already exists.' });
      }
      if (userExists.status === 'approved') {
        return res.status(409).json({ error: 'An approved contractor account with this email already exists.' });
      }
      // If rejected, we allow them to resubmit
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let application;
    let userRecord;

    if (userExists && userExists.status === 'rejected') {
      // Update existing User
      userExists.full_name = fullName;
      userExists.contact_number = contactNumber;
      userExists.passwordHash = passwordHash;
      userExists.status = 'pending';
      await userExists.save();
      userRecord = userExists;

      // Update existing ContractorApplication
      const app = await ContractorApplication.findOne({ email: email.toLowerCase() });
      if (app) {
        app.fullName = fullName;
        app.businessName = businessName;
        app.contactNumber = contactNumber;
        app.passwordHash = passwordHash;
        app.selectedStalls = selectedStalls;
        app.status = 'pending';
        app.rejectionReason = undefined; // clear rejection reason
        app.appliedAt = new Date();
        await app.save();
        application = app;
      } else {
        application = await ContractorApplication.create({
          fullName,
          businessName,
          contactNumber,
          email: email.toLowerCase(),
          passwordHash,
          selectedStalls,
          status: 'pending',
        });
      }
    } else {
      // Create new application
      application = await ContractorApplication.create({
        fullName,
        businessName,
        contactNumber,
        email: email.toLowerCase(),
        passwordHash,
        selectedStalls,
        status: 'pending',
      });

      // Create new User with status 'pending'
      userRecord = await User.create({
        full_name: fullName,
        email: email.toLowerCase(),
        contact_number: contactNumber,
        role: 'contractor',
        passwordHash,
        status: 'pending',
        agreed: true,
      });
    }

    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
      user: {
        id: userRecord._id,
        email: userRecord.email,
        full_name: userRecord.full_name,
        role: userRecord.role,
        status: userRecord.status,
      }
    });
  } catch (err) {
    console.error('Contractor application registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Check if there is a pending or rejected contractor application
      const ContractorApplication = require('../models/ContractorApplication');
      const app = await ContractorApplication.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
      if (app) {
        if (app.status === 'pending') {
          return res.status(403).json({ error: 'Your registration is still pending admin review.' });
        } else if (app.status === 'rejected') {
          return res.status(403).json({ error: 'Your registration application was rejected by the admin.' });
        }
      }
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check role matches
    if (user.role !== role) {
      return res.status(403).json({ error: `This account is not registered as a ${role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status || 'approved',
      },
      token,
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;