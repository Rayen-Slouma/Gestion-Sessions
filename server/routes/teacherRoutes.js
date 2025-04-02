const express = require('express');
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  updateAvailability,
  getAvailability
} = require('../controllers/teacherController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Routes with all authentication
router.use(protect);

// Routes only for admin
router.route('/')
  .get(authorize('admin'), getTeachers)
  .post(authorize('admin'), createTeacher);

router.route('/:id')
  .get(authorize('admin'), getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

// Routes for updating and getting availability
router.route('/:id/availability')
  .get(authorize('admin', 'teacher'), getAvailability)
  .put(authorize('admin', 'teacher'), updateAvailability);

// Teacher can see and update their own availability
router.route('/me/availability')
  .get(authorize('teacher'), getAvailability)
  .put(authorize('teacher'), updateAvailability);

module.exports = router;
