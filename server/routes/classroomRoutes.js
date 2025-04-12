const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  deleteClassroom
} = require('../controllers/classroomController');

// Protect all routes
router.use(protect);

// Public routes
router.get('/', getClassrooms);
router.get('/:id', getClassroom);

// Admin-only routes
router.post('/', authorize('admin'), createClassroom);
router.put('/:id', authorize('admin'), updateClassroom);
router.delete('/:id', authorize('admin'), deleteClassroom);

module.exports = router;
