const express = require('express');
const router = express.Router();
const Stall = require('../models/Stall');

// GET /api/public/stalls/stats
router.get('/stalls/stats', async (req, res) => {
  try {
    const totalStalls = await Stall.countDocuments();
    const occupiedStalls = await Stall.countDocuments({ status: 'occupied' });
    const availableStalls = totalStalls - occupiedStalls;
    res.json({ totalStalls, occupiedStalls, availableStalls });
  } catch (error) {
    console.error('Error fetching stall stats:', error);
    res.status(500).json({ error: 'Failed to fetch stall statistics' });
  }
});

module.exports = router;
