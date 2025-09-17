const BaseController = require('./BaseController');
const authService = require('../services/authService');
const logger = require('../utils/logger');

// @desc    Register user (SuperAdmin only)
// @route   POST /api/auth/register
// @access  Private (SuperAdmin)
const register = async (req, res) => {
  await BaseController.handleAsyncOperation(
    res,
    async () => {
      const result = await authService.registerUser(req.body, req.user?.id);
      return result;
    },
    'User registered successfully',
    'Registration failed'
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for superadmin bypass
    if (password === 'superadmin_bypass') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ success: false, error: 'Invalid superadmin bypass' });
      }

      const token = authHeader.split(' ')[1];
      const result = await authService.authenticateSuperadminBypass(email, token);
      
      return res.json({
        success: true,
        message: 'User switched successfully',
        data: result
      });
    }

    // Normal authentication
    const result = await authService.authenticateUser(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    BaseController.handleError(res, error, error.message, 401);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  await BaseController.handleAsyncOperation(
    res,
    async () => {
      const userType = req.user.type || req.user.role;
      const result = await authService.getUserProfile(req.user.id, userType);
      return result;
    },
    'Profile retrieved successfully',
    'Failed to get profile'
  );
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  BaseController.handleError(res, new Error('Profile update not implemented'), 'Profile update not implemented', 501);
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  await BaseController.handleAsyncOperation(
    res,
    async () => {
      const { currentPassword, newPassword } = req.body;
      
      BaseController.validateRequiredFields(['currentPassword', 'newPassword'], req.body);
      
      const userType = req.user.type || req.user.role;
      const result = await authService.changePassword(
        req.user.id, 
        currentPassword, 
        newPassword, 
        userType
      );
      return result;
    },
    'Password changed successfully',
    'Failed to change password'
  );
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  logger.info('User logged out', { userId: req.user.id });
  BaseController.handleResponse(res, null, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
}; 