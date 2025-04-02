const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for login only
router.post('/login', login);

// Protected route for getting current user
router.get('/me', protect, getMe);

module.exports = router;
