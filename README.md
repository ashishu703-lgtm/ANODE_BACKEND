# Automatic Review System

A comprehensive automatic review system built with Node.js, Express, and PostgreSQL that allows users to submit content for automated review and analysis.

## Features

- **User Management**: Registration, authentication, and role-based access control
- **Content Submission**: Upload and submit content for review
- **Automatic Review Processing**: AI-powered content analysis and scoring
- **Review History**: Track and manage review submissions
- **API Endpoints**: RESTful API for all system operations
- **File Upload**: Support for various file formats
- **Security**: JWT authentication, rate limiting, and input validation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd automatic-review-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   - Database credentials
   - JWT secret
   - Server port
   - Other settings

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb automatic_review_system
   
   # Run database setup
   npm run db:setup
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Reviews
- `POST /api/reviews/submit` - Submit content for review
- `GET /api/reviews` - Get user's review history
- `GET /api/reviews/:id` - Get specific review details
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin (Admin role required)
- `GET /api/admin/reviews` - Get all reviews
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/reviews/:id/status` - Update review status

## Database Schema

The system uses the following main tables:
- `users` - User accounts and profiles
- `reviews` - Review submissions and results
- `review_criteria` - Review criteria and scoring rules
- `review_scores` - Detailed scoring breakdown

## Project Structure

```
automatic-review-system/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── scripts/         # Database setup scripts
├── services/        # Business logic
├── utils/           # Utility functions
├── uploads/         # File upload directory
├── server.js        # Main server file
└── package.json     # Dependencies
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with Joi
- CORS protection
- Helmet security headers
- File upload validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 