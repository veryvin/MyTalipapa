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
        profilePicture: user.profilePicture || null,
        contact_number: user.contact_number || '',
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
        profilePicture: userRecord.profilePicture || null,
        contact_number: userRecord.contact_number || '',
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
        profilePicture: user.profilePicture || null,
        contact_number: user.contact_number || '',
      },
      token,
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ---------------------------------------------------
// GET /api/profile
// ---------------------------------------------------
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mytalipapa-secret-key-12345');
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Auto-expire archive access status if 24 hours have passed since approval
    if (user.archiveAccessStatus === 'approved' && user.archiveAccessApprovedAt) {
      const now = new Date();
      const approvedTime = new Date(user.archiveAccessApprovedAt);
      const diffMs = now - approvedTime;
      const validityMs = 24 * 60 * 60 * 1000; // 24 hours
      if (diffMs > validityMs) {
        user.archiveAccessStatus = 'none';
        user.archiveAccessApprovedAt = null;
        await user.save();
      }
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error('Fetch profile error:', err);
    return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
  }
});

// ---------------------------------------------------
// PUT /api/profile
// ---------------------------------------------------
router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mytalipapa-secret-key-12345');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { full_name, contact_number, profilePicture } = req.body;
    if (full_name) user.full_name = full_name;
    if (contact_number) user.contact_number = contact_number;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        contact_number: user.contact_number,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;