const express = require('express');
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (accessible by all authenticated users)
router.route('/')
  .get(getSubjects);

router.route('/:id')
  .get(getSubject);

// Admin-only routes
router.route('/')
  .post(authorize('admin'), createSubject);

router.route('/:id')
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
