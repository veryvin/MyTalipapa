// server/src/routes/contractor.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/contractorController');

// Get applications list
router.get('/applications', controller.getApplications);

// Update application status (approve/reject)
router.post('/applications/:id/status', controller.updateApplicationStatus);

// Get stalls list
router.get('/stalls', controller.getStalls);

// Get renter records
router.get('/records', controller.getRecords);

module.exports = router;
