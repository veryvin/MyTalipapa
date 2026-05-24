// contractorController.js
// Fetches stall data from MongoDB — no more hardcoded mock arrays

const Stall = require('../models/Stall'); // your Mongoose model

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
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
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

// ── Keep your existing application + records controllers ──

const applications = [
  {
    id: 1,
    name: "Jose Rizal",
    phone: "+63 917 123 4567",
    stall: "STALL #045",
    stallColor: "#f97316",
    applied: "Oct 24, 2023",
    type: "New Vendor",
    typeColor: "#2563eb",
    status: "pending",
    initials: "JR",
  },
];

const records = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    stall: "Stall #042",
    status: "active",
    since: "Jan 2021",
    initials: "JD",
    amountDue: "₱3,500",
    lastPayment: "Oct 1, 2023",
  },
];

exports.getApplications = (req, res) => res.json(applications);

exports.updateApplicationStatus = (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const app = applications.find(a => a.id === parseInt(id));
  if (!app) return res.status(404).json({ error: 'Application not found' });
  app.status = action === 'approve' ? 'approved' : 'rejected';
  res.json(app);
};

exports.getRecords = (req, res) => res.json(records);