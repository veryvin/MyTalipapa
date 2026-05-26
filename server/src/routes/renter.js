const express = require('express');
const router = express.Router();
const Stall = require('../models/Stall');
const Application = require('../models/Application');

// ── GET /api/renter/applications ──
router.get('/applications', async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query = { email: email.toLowerCase() };
    }
    const apps = await Application.find(query).sort({ appliedAt: -1 });
    
    // Format to match client-side ApplicationCard expectations
    const mapped = apps.map(app => {
      let initials = app.initials;
      if (!initials && app.fullName) {
        initials = app.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
      
      let status = 'Pending';
      if (app.status === 'approved') status = 'Approved';
      if (app.status === 'rejected') status = 'Rejected';
      
      return {
        id: app._id.toString(),
        stall: app.preferredStall.startsWith('#') ? app.preferredStall : `#${app.preferredStall}`,
        zone: app.stallLabel || 'Market Stall',
        status: status,
        submittedOn: app.appliedAt
          ? new Date(app.appliedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : '',
        fullName: app.fullName,
        contactNumber: app.contactNumber,
        email: app.email,
        intendedBusinessUse: app.intendedBusinessUse,
        additionalMessage: app.additionalMessage,
        rejectionReason: app.rejectionReason,
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error('Renter getApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ── POST /api/renter/applications ──
router.post('/applications', async (req, res) => {
  try {
    const { fullName, contactNumber, email, preferredStall, intendedBusinessUse, additionalMessage } = req.body;

    if (!fullName || !contactNumber || !email || !preferredStall || !intendedBusinessUse) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }

    // Clean preferredStall (e.g. extract "11" from "Stall #11" or "#11")
    const cleanedStall = preferredStall.replace(/Stall\s*#/gi, '').replace('#', '').trim();

    // Check if the stall exists
    const stall = await Stall.findOne({ stallNumber: cleanedStall });
    if (!stall) {
      console.warn(`Stall number ${cleanedStall} not found in database.`);
    }

    // Generate avatar color
    const colors = ['#1a5c2a', '#e8621a', '#2563eb', '#7c3aed', '#db2777', '#059669'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Generate initials
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const newApp = await Application.create({
      fullName,
      contactNumber,
      email: email.toLowerCase(),
      preferredStall: cleanedStall,
      stallLabel: stall ? `${stall.section} (${stall.floorArea === 'upper' ? 'Upper' : 'Lower'} Floor)` : 'Market Stall',
      intendedBusinessUse,
      additionalMessage: additionalMessage || '',
      status: 'pending',
      initials,
      avatarColor: randomColor,
    });

    // Update Stall status to pending so it reflects immediately in Floor Plan!
    if (stall && stall.status === 'available') {
      await Stall.findByIdAndUpdate(stall._id, { $set: { status: 'pending' } });
    }

    res.status(201).json(newApp);
  } catch (err) {
    console.error('Renter createApplication error:', err);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

module.exports = router;
