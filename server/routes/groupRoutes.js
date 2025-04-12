const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');

// Protect all routes
router.use(protect);

// Public routes
router.get('/', getGroups);
router.get('/:id', getGroup);

// Admin-only routes
router.post('/', authorize('admin'), createGroup);
router.put('/:id', authorize('admin'), updateGroup);
router.delete('/:id', authorize('admin'), deleteGroup);

module.exports = router;
