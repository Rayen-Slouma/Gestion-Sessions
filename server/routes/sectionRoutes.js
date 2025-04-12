const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSections,
  getSection,
  getSectionsByDepartment,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');

// Protect all routes
router.use(protect);

// Public routes
router.get('/', getSections);
router.get('/department/:departmentId', getSectionsByDepartment);
router.get('/:id', getSection);

// Admin-only routes
router.post('/', authorize('admin'), createSection);
router.put('/:id', authorize('admin'), updateSection);
router.delete('/:id', authorize('admin'), deleteSection);

module.exports = router;
