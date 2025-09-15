const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminDepartmentUser = require('../models/AdminDepartmentUser');
const SuperAdmin = require('../models/SuperAdmin');
const logger = require('../utils/logger');

// Generate JWT token with subject type
const generateToken = (subject) => {
  return jwt.sign(subject, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// @desc    Register user (SuperAdmin only)
// @route   POST /api/auth/register
// @access  Private (SuperAdmin)
const register = async (req, res) => {
  try {
    const { username, email, password, departmentType, companyName, role, headUser } = req.body;

    // Check if user already exists
    const existingUser = await AdminDepartmentUser.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    const existingUsername = await AdminDepartmentUser.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: 'User with this username already exists'
      });
    }

    // Block creating superadmin here
    if (role === 'superadmin') {
      return res.status(400).json({ success: false, error: 'Cannot create superadmin via this endpoint' });
    }

    // Create user using AdminDepartmentUser model
    const userData = {
      username,
      email,
      password,
      departmentType,
      companyName,
      role,
      headUser: headUser,
      createdBy: req.user?.id || 1 // Default to 1 if no authenticated user
    };

    const newUser = await AdminDepartmentUser.create(userData);

    // Generate token
    const token = generateToken({ id: newUser.id, type: 'department_user' });

    logger.info('User registered successfully', { userId: newUser.id, email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          departmentType: newUser.departmentType,
          companyName: newUser.companyName,
          createdAt: newUser.createdAt
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try superadmin first
    let tokenUser = null;
    let tokenPayload = null;
    let role = null;

    const superAdmin = await SuperAdmin.findByEmail(email);
    if (superAdmin && await superAdmin.verifyPassword(password)) {
      await superAdmin.updateLastLogin();
      tokenUser = superAdmin;
      tokenPayload = { id: superAdmin.id, type: 'superadmin' };
      role = 'superadmin';
    } else {
      const user = await AdminDepartmentUser.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      if (!user.is_active) {
        return res.status(401).json({ success: false, error: 'Account is deactivated' });
      }
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      await user.updateLastLogin();
      tokenUser = user;
      tokenPayload = { id: user.id, type: 'department_user' };
      role = user.role;
    }

    // Generate token
    const token = generateToken(tokenPayload);

    logger.info('User logged in successfully', { userId: tokenUser.id, email, role });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: tokenPayload.type === 'superadmin' ? {
          id: tokenUser.id,
          username: tokenUser.username,
          email: tokenUser.email,
          role: 'superadmin'
        } : {
          id: tokenUser.id,
          username: tokenUser.username,
          email: tokenUser.email,
          role: tokenUser.role,
          departmentType: tokenUser.department_type,
          companyName: tokenUser.company_name,
          headUser: tokenUser.head_user
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await AdminDepartmentUser.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          departmentType: user.department_type,
          companyName: user.company_name,
          headUser: user.head_user,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(username);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Check for duplicate email/username if updating
    if (email || username) {
      const checkQuery = [];
      const checkValues = [];
      let checkParamCount = 1;

      if (email) {
        checkQuery.push(`email = $${checkParamCount++} AND id != $${checkParamCount++}`);
        checkValues.push(email, req.user.id);
      }
      if (username) {
        checkQuery.push(`username = $${checkParamCount++} AND id != $${checkParamCount++}`);
        checkValues.push(username, req.user.id);
      }

      const existingUser = await query(
        `SELECT id FROM users WHERE ${checkQuery.join(' OR ')}`,
        checkValues
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email or username already exists'
        });
      }
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, username, email, role, bio, email_verified, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    logger.info('Profile updated successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          bio: user.bio,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    logger.info('Password changed successfully', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // In a more complex system, you might want to blacklist the token
    // For now, we'll just return a success response
    logger.info('User logged out', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
}; 