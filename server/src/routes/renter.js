const express = require('express');
const router = express.Router();
const Stall = require('../models/Stall');
const Application = require('../models/Application');
const Payment = require('../models/Payment');

// ── GET /api/renter/applications ──
router.get('/applications', async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};
    if (email) {
      query = { email: email.toLowerCase() };
    }
    const apps = await Application.find(query).sort({ appliedAt: -1 });
    
    // Format to match client-side expectations
    const mapped = await Promise.all(apps.map(async (app) => {
      // Find corresponding stall to get monthly rate
      const stall = await Stall.findOne({ stallNumber: app.preferredStall });
      const rate = stall && stall.monthlyRate ? `₱${stall.monthlyRate.toLocaleString()}/mo` : '—';
      
      let initials = app.initials;
      if (!initials && app.fullName) {
        initials = app.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
      
      let status = 'Pending';
      if (app.status === 'approved') status = 'Approved';
      if (app.status === 'rejected') status = 'Rejected';
      
      const formattedDate = app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : '';

      return {
        id: app._id.toString(),
        stall: app.preferredStall.startsWith('#') ? app.preferredStall : `#${app.preferredStall}`,
        zone: app.stallLabel || 'Market Stall',
        section: app.stallLabel || 'Market Stall',
        status: status,
        submittedOn: formattedDate,
        date: formattedDate,
        fee: rate,
        fullName: app.fullName,
        contactNumber: app.contactNumber,
        email: app.email,
        intendedBusinessUse: app.intendedBusinessUse,
        additionalMessage: app.additionalMessage,
        rejectionReason: app.rejectionReason,
      };
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Renter getApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// ── GET /api/renter/active-lease ──
router.get('/active-lease', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required.' });
    }
    
    // Find a stall occupied by the tenant with this email
    const stall = await Stall.findOne({
      status: 'occupied',
      'tenant.email': email.toLowerCase()
    });

    if (!stall) {
      return res.json(null);
    }

    // Find renter's approved application to get payment history
    const app = await Application.findOne({
      email: email.toLowerCase(),
      status: 'approved'
    });

    let lastPaidDate = null;
    if (app) {
      const payments = await Payment.find({ renter: app._id }).sort({ date: -1 });
      const lastPaid = payments.find(p => p.status === 'paid');
      if (lastPaid) {
        lastPaidDate = lastPaid.date;
      }
    }

    // Base date for next payment due calculation: last paid date or leaseStart date
    const baseDate = lastPaidDate || stall.tenant.leaseStart || stall.createdAt || new Date();
    const nextDueDate = new Date(baseDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1); // validity is exactly 1 month from previous payment

    const formattedNextDue = nextDueDate.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const now = new Date();
    let status = 'Active';

    // Calculate dynamic status based on payment validity window
    const diffMs = now - nextDueDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      status = 'long_overdue';
    } else if (diffDays > 0) {
      status = 'late_payment';
    } else {
      status = 'active';
    }

    res.json({
      id: stall._id.toString(),
      stallNumber: stall.stallNumber.startsWith('#') ? stall.stallNumber : `#${stall.stallNumber}`,
      section: stall.section,
      monthlyRate: stall.monthlyRate ? `₱${stall.monthlyRate.toLocaleString()}` : '—',
      status: status,
      nextDue: formattedNextDue,
      leaseStart: stall.tenant.leaseStart
        ? new Date(stall.tenant.leaseStart).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : '—',
      leaseEnd: stall.tenant.leaseEnd
        ? new Date(stall.tenant.leaseEnd).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : 'No Expiry',
    });
  } catch (err) {
    console.error('Renter getActiveLease error:', err);
    res.status(500).json({ error: 'Failed to fetch active lease' });
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

    // Trigger notification to the contractor who manages this stall (or admin if unmanaged)
    const Notification = require('../models/Notification');
    if (stall && stall.managedBy) {
      await Notification.create({
        recipient: stall.managedBy.toLowerCase(),
        title: 'New Stall Application',
        message: `${fullName} has applied for Stall #${stall.stallNumber} in the ${stall.section} section.`,
        link: '/contractor/applications'
      });
    } else {
      await Notification.create({
        recipient: 'admin',
        title: 'New Stall Application',
        message: `${fullName} has applied for Stall #${cleanedStall}. This stall is currently unmanaged.`,
        link: '/admin/applications'
      });
    }

    res.status(201).json(newApp);
  } catch (err) {
    console.error('Renter createApplication error:', err);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});
module.exports = router;

