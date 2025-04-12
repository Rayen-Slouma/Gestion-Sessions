const express = require('express');
const {
  getStudentProfile,
  updateStudentProfile,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Student profile routes
router.route('/profile')
  .get(authorize('student'), getStudentProfile)
  .put(authorize('student'), updateStudentProfile);

// Admin-only routes
router.route('/')
  .get(authorize('admin'), getStudents);

router.route('/:id')
  .get(authorize('admin'), getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
