const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');

// POST route to save vitals
router.post('/save-vitals', vitalsController.saveVitals);

// GET route to fetch vitals
router.get('/get-vitals', vitalsController.getVitals);

module.exports = router;