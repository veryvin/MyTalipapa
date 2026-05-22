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

module.exports = router;


// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
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
      },
      token,
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});