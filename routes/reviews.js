const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validation');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and text file types
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html',
      'application/json',
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only text, PDF, Word, HTML, JSON, and CSV files are allowed.'), false);
    }
  }
});

// All routes require authentication
router.use(protect);

// Review routes
router.post('/submit', upload.single('file'), validate('submitReview'), reviewController.submitReview);
router.get('/', validateQuery('pagination'), reviewController.getUserReviews);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', validate('updateReview'), reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router; 