const express = require('express');
const {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  generateSchedule
} = require('../controllers/sessionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (accessible by all authenticated users)
router.route('/')
  .get(getSessions);

router.route('/:id')
  .get(getSession);

// Admin-only routes
router.route('/')
  .post(authorize('admin'), createSession);

router.route('/:id')
  .put(authorize('admin'), updateSession)
  .delete(authorize('admin'), deleteSession);

router.route('/generate')
  .post(authorize('admin'), generateSchedule);

module.exports = router;
