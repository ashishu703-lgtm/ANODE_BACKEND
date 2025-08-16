const { query } = require('../config/database');
const logger = require('../utils/logger');

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
// @access  Admin
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`r.status = $${paramCount++}`);
      values.push(status);
    }

    if (category) {
      whereConditions.push(`r.category = $${paramCount++}`);
      values.push(category);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM reviews r ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Add pagination parameters
    values.push(limit, offset);

    // Get reviews with pagination
    const result = await query(
      `SELECT r.id, r.title, r.category, r.priority, r.status, r.overall_score, 
              r.created_at, r.updated_at, u.username, u.email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC 
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );

    const reviews = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      priority: row.priority,
      status: row.status,
      overallScore: row.overall_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        username: row.username,
        email: row.email
      }
    }));

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reviews'
    });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    if (role) {
      whereConditions.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (isActive !== undefined) {
      whereConditions.push(`is_active = $${paramCount++}`);
      values.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Add pagination parameters
    values.push(limit, offset);

    // Get users with pagination
    const result = await query(
      `SELECT id, username, email, role, bio, is_active, email_verified, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );

    const users = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      bio: row.bio,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
};

// @desc    Get system statistics (admin)
// @route   GET /api/admin/stats
// @access  Admin
const getSystemStats = async (req, res) => {
  try {
    // Get total counts
    const userCountResult = await query('SELECT COUNT(*) FROM users');
    const reviewCountResult = await query('SELECT COUNT(*) FROM reviews');
    const completedReviewCountResult = await query("SELECT COUNT(*) FROM reviews WHERE status = 'completed'");
    const pendingReviewCountResult = await query("SELECT COUNT(*) FROM reviews WHERE status = 'pending'");

    // Get reviews by category
    const categoryStatsResult = await query(`
      SELECT category, COUNT(*) as count, AVG(overall_score) as avg_score
      FROM reviews 
      WHERE status = 'completed'
      GROUP BY category
    `);

    // Get reviews by status
    const statusStatsResult = await query(`
      SELECT status, COUNT(*) as count
      FROM reviews 
      GROUP BY status
    `);

    // Get recent activity (last 7 days)
    const recentActivityResult = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM reviews 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get average processing time
    const avgProcessingTimeResult = await query(`
      SELECT AVG(processing_time) as avg_time
      FROM reviews 
      WHERE status = 'completed' AND processing_time IS NOT NULL
    `);

    const stats = {
      users: {
        total: parseInt(userCountResult.rows[0].count)
      },
      reviews: {
        total: parseInt(reviewCountResult.rows[0].count),
        completed: parseInt(completedReviewCountResult.rows[0].count),
        pending: parseInt(pendingReviewCountResult.rows[0].count)
      },
      categories: categoryStatsResult.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score) || 0
      })),
      status: statusStatsResult.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      })),
      recentActivity: recentActivityResult.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      performance: {
        avgProcessingTime: parseFloat(avgProcessingTimeResult.rows[0].avg_time) || 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system statistics'
    });
  }
};

// @desc    Update review status (admin)
// @route   PUT /api/admin/reviews/:id/status
// @access  Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: pending, processing, completed, failed'
      });
    }

    const result = await query(
      `UPDATE reviews SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, title, status, updated_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const review = result.rows[0];

    logger.info('Review status updated by admin', { 
      reviewId: id, 
      newStatus: status, 
      adminId: req.user.id 
    });

    res.json({
      success: true,
      message: 'Review status updated successfully',
      data: {
        review: {
          id: review.id,
          title: review.title,
          status: review.status,
          updatedAt: review.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review status'
    });
  }
};

// @desc    Update user status (admin)
// @route   PUT /api/admin/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      });
    }

    const result = await query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, username, email, is_active, updated_at`,
      [isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    logger.info('User status updated by admin', { 
      userId: id, 
      newStatus: isActive, 
      adminId: req.user.id 
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.is_active,
          updatedAt: user.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

// @desc    Get specific review by ID (admin)
// @route   GET /api/admin/reviews/:id
// @access  Admin
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get review details
    const result = await query(
      `SELECT r.id, r.title, r.content, r.category, r.priority, r.status, 
              r.overall_score, r.file_path, r.file_name, r.file_size, 
              r.processing_time, r.feedback, r.created_at, r.updated_at,
              u.username as user_username, u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const review = result.rows[0];

    // Get detailed scores if review is completed
    let scores = [];
    if (review.status === 'completed') {
      const scoresResult = await query(
        `SELECT rs.score, rs.feedback, rc.name as criteria_name, rc.weight
         FROM review_scores rs
         JOIN review_criteria rc ON rs.criteria_id = rc.id
         WHERE rs.review_id = $1
         ORDER BY rc.weight DESC`,
        [id]
      );
      scores = scoresResult.rows.map(row => ({
        criteriaName: row.criteria_name,
        score: row.score,
        weight: row.weight,
        feedback: row.feedback
      }));
    }

    res.json({
      success: true,
      data: {
        review: {
          id: review.id,
          title: review.title,
          content: review.content,
          category: review.category,
          priority: review.priority,
          status: review.status,
          overallScore: review.overall_score,
          filePath: review.file_path,
          fileName: review.file_name,
          fileSize: review.file_size,
          processingTime: review.processing_time,
          feedback: review.feedback,
          user: {
            username: review.user_username,
            email: review.user_email
          },
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          scores
        }
      }
    });
  } catch (error) {
    logger.error('Get review by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get review'
    });
  }
};

module.exports = {
  getAllReviews,
  getAllUsers,
  getSystemStats,
  updateReviewStatus,
  updateUserStatus,
  getReviewById
}; 