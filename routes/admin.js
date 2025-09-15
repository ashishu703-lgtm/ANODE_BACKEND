const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Admin routes
router.get('/reviews', validateQuery('pagination'), adminController.getAllReviews);
router.get('/users', validateQuery('pagination'), adminController.getAllUsers);
router.get('/stats', adminController.getSystemStats);
router.put('/reviews/:id/status', adminController.updateReviewStatus);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/reviews/:id', adminController.getReviewById);

module.exports = router; 