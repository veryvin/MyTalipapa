// server/src/routes/contractor.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/contractorController');

// Get applications list
router.get('/applications', controller.getApplications);

// Update application status (approve/reject)
router.post('/applications/:id/status', controller.updateApplicationStatus);

// Get contractor registration applications
router.get('/contractor-applications', controller.getContractorApplications);

// Update contractor registration application status (approve/reject)
router.post('/contractor-applications/:id/status', controller.updateContractorApplicationStatus);

// Get stalls list
router.get('/stalls', controller.getStalls);

// Get renter records
router.get('/records', controller.getRecords);

module.exports = router;
