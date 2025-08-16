const { query } = require('../config/database');
const reviewService = require('../services/reviewService');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

// @desc    Submit content for review
// @route   POST /api/reviews/submit
// @access  Private
const submitReview = async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;
    const userId = req.user.id;

    // Handle file upload if present
    let filePath = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    // Create review record
    const result = await query(
      `INSERT INTO reviews (user_id, title, content, category, priority, status, file_path, file_name, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [userId, title, content, category, priority, 'pending', filePath, fileName, fileSize]
    );

    const review = result.rows[0];

    // Process review asynchronously
    processReviewAsync(review.id, content, category);

    logger.info('Review submitted successfully', { reviewId: review.id, userId });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Processing will begin shortly.',
      data: {
        review: {
          id: review.id,
          title,
          category,
          priority,
          status: 'pending',
          createdAt: review.created_at
        }
      }
    });
  } catch (error) {
    logger.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review'
    });
  }
};

// @desc    Get user's review history
// @route   GET /api/reviews
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get reviews with pagination
    const result = await query(
      `SELECT id, title, category, priority, status, overall_score, created_at, updated_at
       FROM reviews 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const reviews = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      priority: row.priority,
      status: row.status,
      overallScore: row.overall_score,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
    logger.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reviews'
    });
  }
};

// @desc    Get specific review by ID
// @route   GET /api/reviews/:id
// @access  Private
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get review details
    const result = await query(
      `SELECT r.id, r.title, r.content, r.category, r.priority, r.status, 
              r.overall_score, r.file_path, r.file_name, r.file_size, 
              r.processing_time, r.feedback, r.created_at, r.updated_at,
              u.username as user_username
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [id, userId]
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
          userUsername: review.user_username,
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

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, category, priority } = req.body;

    // Check if review exists and belongs to user
    const existingResult = await query(
      'SELECT id, status FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const existingReview = existingResult.rows[0];

    // Only allow updates if review is pending or failed
    if (existingReview.status === 'processing' || existingReview.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update review that is being processed or completed'
      });
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id, userId);

    const result = await query(
      `UPDATE reviews SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, title, category, priority, status, updated_at`,
      values
    );

    const updatedReview = result.rows[0];

    logger.info('Review updated successfully', { reviewId: id, userId });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: {
          id: updatedReview.id,
          title: updatedReview.title,
          category: updatedReview.category,
          priority: updatedReview.priority,
          status: updatedReview.status,
          updatedAt: updatedReview.updated_at
        }
      }
    });
  } catch (error) {
    logger.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const existingResult = await query(
      'SELECT id, file_path FROM reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const existingReview = existingResult.rows[0];

    // Delete associated file if exists
    if (existingReview.file_path) {
      try {
        await fs.unlink(existingReview.file_path);
      } catch (fileError) {
        logger.warn('Failed to delete file:', fileError);
      }
    }

    // Delete review scores first (due to foreign key constraint)
    await query('DELETE FROM review_scores WHERE review_id = $1', [id]);

    // Delete review
    await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [id, userId]);

    logger.info('Review deleted successfully', { reviewId: id, userId });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    logger.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
};

// Async function to process review
const processReviewAsync = async (reviewId, content, category) => {
  try {
    // Update status to processing
    await query(
      'UPDATE reviews SET status = $1 WHERE id = $2',
      ['processing', reviewId]
    );

    const startTime = Date.now();

    // Analyze content
    const analysis = await reviewService.analyzeContent(content, category);

    // Save scores to database
    for (const scoreData of analysis.scores) {
      await query(
        `INSERT INTO review_scores (review_id, criteria_id, score, feedback)
         VALUES ($1, $2, $3, $4)`,
        [reviewId, scoreData.criteriaId, scoreData.score.score, scoreData.score.feedback]
      );
    }

    const processingTime = Date.now() - startTime;

    // Update review with results
    await query(
      `UPDATE reviews 
       SET status = $1, overall_score = $2, processing_time = $3, feedback = $4
       WHERE id = $5`,
      ['completed', analysis.overallScore, processingTime, 'Review completed successfully', reviewId]
    );

    logger.info('Review processing completed', { 
      reviewId, 
      overallScore: analysis.overallScore, 
      processingTime 
    });

  } catch (error) {
    logger.error('Review processing failed:', error);
    
    // Update status to failed
    await query(
      'UPDATE reviews SET status = $1, feedback = $2 WHERE id = $3',
      ['failed', 'Review processing failed', reviewId]
    );
  }
};

module.exports = {
  submitReview,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview
}; 