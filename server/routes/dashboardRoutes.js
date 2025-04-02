const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin-only routes
router.get('/stats', authorize('admin'), getStats);

module.exports = router;
