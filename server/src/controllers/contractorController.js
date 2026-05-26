// contractorController.js
const Stall       = require('../models/Stall');
const Application = require('../models/Application');

// ── Helper: resolve stallNumber from application ──────────
async function findStallByAppStallNumber(raw) {
  if (!raw) return null;

  // 1. Exact match
  let stall = await Stall.findOne({ stallNumber: raw });
  if (stall) return stall;

  // 2. Strip leading zeros (e.g. "045" → "45")
  const stripped = String(Number(raw.replace(/\D/g, '')));
  stall = await Stall.findOne({ stallNumber: stripped });
  if (stall) return stall;

  // 3. Digits only (e.g. "STALL #045" → "45")
  const numOnly = raw.replace(/\D/g, '');
  stall = await Stall.findOne({ stallNumber: numOnly });
  if (stall) return stall;

  return null;
}

// ── GET /api/contractor/stalls ────────────────────────────
exports.getStalls = async (req, res) => {
  try {
    const { email, unmanaged, hasContractor } = req.query;
    let query = {};
    if (email) {
      query = { managedBy: email.toLowerCase() };
    } else if (unmanaged === 'true') {
      query = {
        $or: [
          { managedBy: { $exists: false } },
          { managedBy: null },
          { managedBy: '' }
        ]
      };
    } else if (hasContractor === 'true') {
      query = {
        managedBy: { $exists: true, $nin: [null, ''] }
      };
    }
    const stalls = await Stall.find(query).sort({ section: 1, floorArea: 1, floorCol: 1, floorRow: 1 });

    // Find all users who are contractors to map their emails to names
    const User = require('../models/User');
    const contractors = await User.find({ role: 'contractor' }, 'email full_name');
    const contractorMap = {};
    contractors.forEach(c => {
      if (c.email) {
        contractorMap[c.email.toLowerCase()] = c.full_name;
      }
    });

    const stallsWithContractor = stalls.map(stall => {
      const stallObj = stall.toObject();
      if (stallObj.managedBy) {
        stallObj.contractorName = contractorMap[stallObj.managedBy.toLowerCase()] || stallObj.managedBy;
      } else {
        stallObj.contractorName = 'None';
      }
      return stallObj;
    });

    res.json(stallsWithContractor);
  } catch (err) {
    console.error('getStalls error:', err);
    res.status(500).json({ error: 'Failed to fetch stalls' });
  }
};

// ── GET /api/contractor/stalls/:id ───────────────────────
exports.getStallById = async (req, res) => {
  try {
    const stall = await Stall.findById(req.params.id);
    if (!stall) return res.status(404).json({ error: 'Stall not found' });
    res.json(stall);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stall' });
  }
};

// ── PATCH /api/contractor/stalls/:id/status ──────────────
exports.updateStallStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['available', 'occupied', 'pending'];
    if (!valid.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const stall = await Stall.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );
    if (!stall) return res.status(404).json({ error: 'Stall not found' });
    res.json(stall);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stall status' });
  }
};

// ── GET /api/contractor/applications ─────────────────────
exports.getApplications = async (req, res) => {
  try {
    const { email } = req.query;
    const apps = await Application.find({}).sort({ appliedAt: -1 });

    const mapped = await Promise.all(apps.map(async (app) => {
      const stall = await findStallByAppStallNumber(app.preferredStall);

      // Filter by contractor email if query param is provided
      if (email && (!stall || stall.managedBy !== email.toLowerCase())) {
        return null;
      }

      let stallDisplay = '';
      if (app.stallLabel) {
        stallDisplay = app.stallLabel;
      } else if (stall) {
        stallDisplay = `Stall #${stall.stallNumber}`;
      } else {
        stallDisplay = `Stall #${app.preferredStall}`;
      }

      return {
        id:                app._id.toString(),
        name:              app.fullName,
        phone:             app.contactNumber,
        email:             app.email,
        stall:             stallDisplay,
        stallId:           stall ? stall._id.toString() : null,
        stallColor:        app.avatarColor || '#f97316',
        applied:           app.appliedAt
          ? new Date(app.appliedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })
          : '',
        type:              app.intendedBusinessUse,
        typeColor:         '#2563eb',
        status:            app.status,
        initials:          app.initials,
        additionalMessage: app.additionalMessage,
        rejectionReason:   app.rejectionReason,
        reviewedAt:        app.reviewedAt,
        preferredStall:    app.preferredStall,
      };
    }));

    res.json(mapped.filter(Boolean));
  } catch (err) {
    console.error('getApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// ── POST /api/contractor/applications/:id/status ─────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" | "reject"

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
    }

    // 1. Find the application
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    // 2. Find the linked stall
    const stall = await findStallByAppStallNumber(app.preferredStall);
    if (!stall) {
      console.warn(`[updateApplicationStatus] No stall found for preferredStall="${app.preferredStall}"`);
    }

    // 3. Update stall based on action
    if (stall) {
      if (action === 'approve') {
        // ✅ Set stall to occupied + write tenant object wholesale
        // Using $set with full tenant object works even when tenant is currently null
        await Stall.findByIdAndUpdate(
          stall._id,
          {
            $set: {
              status: 'occupied',
              tenant: {
                name:       app.fullName,
                contact:    app.contactNumber,
                email:      app.email,
                leaseStart: new Date(),
                leaseEnd:   null,
              },
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      } else {
        // ❌ Rejected — revert stall to available, clear tenant
        await Stall.findByIdAndUpdate(
          stall._id,
          {
            $set: {
              status: 'available',
              tenant: {
                name:       null,
                contact:    null,
                email:      null,
                leaseStart: null,
                leaseEnd:   null,
              },
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      }
    }

    // 4. Update application status
    const updatedApp = await Application.findByIdAndUpdate(
      id,
      {
        $set: {
          status:     action === 'approve' ? 'approved' : 'rejected',
          reviewedAt: new Date(),
          reviewedBy: req.user?.name || req.user?.id || 'Admin',
        },
      },
      { new: true }
    );

    res.json({
      application:    updatedApp,
      stallUpdated:   !!stall,
      stallId:        stall?._id,
      newStallStatus: action === 'approve' ? 'occupied' : 'available',
    });

  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

 // ── GET /api/contractor/records ──────────────────────────
exports.getRecords = async (req, res) => {
  try {
    const { email } = req.query;
    const approved = await Application.find({ status: 'approved' }).sort({ reviewedAt: -1 });
    const Payment = require('../models/Payment'); // import here to avoid circular deps
    const records = await Promise.all(approved.map(async (app) => {
      const stall = await findStallByAppStallNumber(app.preferredStall);
      
      // Filter by contractor email if query param is provided
      if (email && (!stall || stall.managedBy !== email.toLowerCase())) {
        return null;
      }

      // fetch payment history for this renter
      const payments = await Payment.find({ renter: app._id }).sort({ date: -1 });
      const history = payments.map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: `₱${p.amount.toLocaleString()}`,
        status: p.status,
      }));
      const lastPaid = payments.find(p => p.status === 'paid');
      const lastPayment = lastPaid ? new Date(lastPaid.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      return {
        id: app._id.toString(),
        name: app.fullName,
        phone: app.contactNumber,
        email: app.email,
        stall: stall ? `Stall #${stall.stallNumber}` : `Stall #${app.preferredStall}`,
        stallId: stall?._id?.toString() || null,
        status: 'active',
        since: app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
        initials: app.initials,
        amountDue: stall?.monthlyRate ? `₱${stall.monthlyRate.toLocaleString()}` : '—',
        lastPayment,
        section: stall?.section || '',
        history,
      };
    }));
    res.json(records.filter(Boolean));
  } catch (err) {
    console.error('getRecords error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
};

// ── GET /api/admin/contractor-applications ───────────────
exports.getContractorApplications = async (req, res) => {
  try {
    const { email } = req.query;
    const ContractorApplication = require('../models/ContractorApplication');
    let query = {};
    if (email) {
      query = { email: email.toLowerCase() };
    }

    const apps = await ContractorApplication.find(query).sort({ appliedAt: -1 });
    const formatted = apps.map(app => {
      const initials = app.fullName
        ? app.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '';
      return {
        id: app._id.toString(),
        fullName: app.fullName,
        businessName: app.businessName,
        contactNumber: app.contactNumber,
        email: app.email,
        selectedStalls: app.selectedStalls,
        status: app.status,
        rejectionReason: app.rejectionReason || '',
        appliedAt: app.appliedAt
          ? new Date(app.appliedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
        initials,
      };
    });
    res.json(formatted);
  } catch (err) {
    console.error('getContractorApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch contractor applications' });
  }
};

// ── POST /api/admin/contractor-applications/:id/status ────
exports.updateContractorApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // "approve" | "reject", optional rejectionReason

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject".' });
    }

    const ContractorApplication = require('../models/ContractorApplication');
    const app = await ContractorApplication.findById(id);
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const User = require('../models/User');
    if (action === 'approve') {
      const userExists = await User.findOne({ email: app.email.toLowerCase() });
      if (userExists) {
        userExists.status = 'approved';
        await userExists.save();
      } else {
        // Fallback: Create new user if they didn't have one (for older records)
        await User.create({
          full_name: app.fullName,
          email: app.email.toLowerCase(),
          contact_number: app.contactNumber,
          role: 'contractor',
          passwordHash: app.passwordHash,
          status: 'approved',
          agreed: true,
        });
      }

      // Update stalls to be managed by this contractor email
      if (app.selectedStalls && app.selectedStalls.length > 0) {
        await Stall.updateMany(
          { stallNumber: { $in: app.selectedStalls } },
          { $set: { managedBy: app.email.toLowerCase() } }
        );
      }

      app.status = 'approved';
      app.rejectionReason = undefined; // clear rejection reason on approval
    } else {
      // Reject action
      const userExists = await User.findOne({ email: app.email.toLowerCase() });
      if (userExists) {
        userExists.status = 'rejected';
        await userExists.save();
      }

      app.status = 'rejected';
      app.rejectionReason = rejectionReason || 'Your application was rejected by the admin.';
    }

    await app.save();

    res.json({
      message: `Application successfully ${action}d`,
      application: app,
    });
  } catch (err) {
    console.error('updateContractorApplicationStatus error:', err);
    res.status(500).json({ error: 'Failed to update contractor application status' });
  }
};