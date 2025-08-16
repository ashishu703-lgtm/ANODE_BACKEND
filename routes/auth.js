const express = require('express');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, validate('updateProfile'), authController.updateProfile);
router.post('/logout', protect, authController.logout);
router.put('/change-password', protect, authController.changePassword);

module.exports = router; 