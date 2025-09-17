const Joi = require('joi');
const { validationResult } = require('express-validator');

// Validation schemas
const schemas = {
  // User registration
  register: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    departmentType: Joi.string()
      .valid('telesales', 'marketing_sales', 'office_sales')
      .required()
      .messages({
        'any.only': 'Department type must be one of: telesales, marketing_sales, office_sales',
        'any.required': 'Department type is required'
      }),
    companyName: Joi.string()
      .valid('Anode Electric Pvt. Ltd.', 'Anode Metals', 'Samrridhi Industries')
      .required()
      .messages({
        'any.only': 'Company name must be one of: Anode Electric Pvt. Ltd., Anode Metals, Samrridhi Industries',
        'any.required': 'Company name is required'
      }),
    role: Joi.string()
      .valid('department_user', 'department_head')
      .required()
      .messages({
        'any.only': 'Role must be one of: department_user, department_head, superadmin',
        'any.required': 'Role is required'
      }),
    headUser: Joi.string()
      .allow('')
      .when('role', { is: 'department_user', then: Joi.required().messages({ 'any.required': 'Head user is required for department users' }), otherwise: Joi.optional() })
  }),

  // User login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  // Review submission
  submitReview: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required'
      }),
    content: Joi.string()
      .min(10)
      .max(10000)
      .required()
      .messages({
        'string.min': 'Content must be at least 10 characters long',
        'string.max': 'Content cannot exceed 10,000 characters',
        'any.required': 'Content is required'
      }),
    category: Joi.string()
      .valid('academic', 'business', 'creative', 'technical', 'other')
      .required()
      .messages({
        'any.only': 'Category must be one of: academic, business, creative, technical, other',
        'any.required': 'Category is required'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      })
  }),

  // Review update
  updateReview: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters'
      }),
    content: Joi.string()
      .min(10)
      .max(10000)
      .messages({
        'string.min': 'Content must be at least 10 characters long',
        'string.max': 'Content cannot exceed 10,000 characters'
      }),
    category: Joi.string()
      .valid('academic', 'business', 'creative', 'technical', 'other')
      .messages({
        'any.only': 'Category must be one of: academic, business, creative, technical, other'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .messages({
        'any.only': 'Priority must be one of: low, medium, high, urgent'
      })
  }),

  // User profile update
  updateProfile: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .messages({
        'string.alphanum': 'Username must contain only alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters'
      }),
    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    bio: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      })
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      })
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: 'Validation schema not found'
      });
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorMessages
      });
    }

    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  schemas,
  // Express-validator middleware for leads and other express-validator schemas
  validateRequest: (validations, source = 'body') => {
    return async (req, res, next) => {
      // Ensure validations is an array
      const validationArray = Array.isArray(validations) ? validations : [validations];
      
      // Run all validations sequentially
      for (const validation of validationArray) {
        await validation.run(req);
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      next();
    };
  }
}; 