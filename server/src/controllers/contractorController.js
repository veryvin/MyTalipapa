// contractorController.js
// Fetches stall/application data from MongoDB — no hardcoded mock arrays

const Stall       = require('../models/Stall');
const Application = require('../models/Application');

// ── GET /api/contractor/stalls ────────────────────────────
exports.getStalls = async (req, res) => {
  try {
    const stalls = await Stall.find({}).sort({ section: 1, stallNumber: 1 });
    res.json(stalls);
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
    const { status } = req.body; // "available" | "occupied" | "pending"
    const valid = ['available', 'occupied', 'pending'];
    if (!valid.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const stall = await Stall.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
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
    const apps = await Application.find({}).sort({ appliedAt: -1 });
    const mapped = apps.map(app => ({
      // FIX: stringify ObjectId so the frontend === comparisons work correctly
      id: app._id.toString(),
      name: app.fullName,
      phone: app.contactNumber,
      stall: app.stallLabel || app.preferredStall,
      stallColor: app.avatarColor || '#f97316',
      applied: app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '',
      type: app.intendedBusinessUse,
      typeColor: '#2563eb',
      status: app.status,
      initials: app.initials,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('getApplications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// ── PATCH /api/contractor/applications/:id/status ────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { action } = req.body; // "approve" | "reject"

    if (!['approve', 'reject'].includes(action))
      return res.status(400).json({ error: 'Invalid action' });

    const status = action === 'approve' ? 'approved' : 'rejected';

    const app = await Application.findByIdAndUpdate(
      id,
      { status, reviewedAt: new Date(), reviewedBy: req.user?.id || null },
      { new: true }
    );
    if (!app) return res.status(404).json({ error: 'Application not found' });
    res.json(app);
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// ── GET /api/contractor/records ──────────────────────────
// Keep existing records controller (replace with DB query when ready)
const records = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    phone: '+63 917 123 4567',
    stall: 'Stall #042',
    status: 'active',
    since: 'Jan 2021',
    initials: 'JD',
    amountDue: '₱3,500',
    lastPayment: 'Oct 1, 2023',
  },
];

exports.getRecords = (req, res) => res.json(records);