const { body, query, param } = require('express-validator');

// Validation rules for creating a lead
const createLeadSchema = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('business')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Business name must not exceed 255 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('gstNo')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),
  
  body('productType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product type must not exceed 100 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('leadSource')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Lead source must not exceed 100 characters'),
  
  body('customerType')
    .optional()
    .isIn(['individual', 'business', 'corporate'])
    .withMessage('Customer type must be one of: individual, business, corporate'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('connectedStatus')
    .optional()
    .isIn(['connected', 'not_connected', 'pending'])
    .withMessage('Connected status must be one of: connected, not_connected, pending'),
  
  body('finalStatus')
    .optional()
    .isIn(['open', 'closed', 'next_meeting'])
    .withMessage('Final status must be one of: open, closed, next_meeting'),
  
  body('whatsapp')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid WhatsApp number')
];

// Validation rules for updating a lead
const updateLeadSchema = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('business')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Business name must not exceed 255 characters'),
  
  body('address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('gstNo')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),
  
  body('productType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product type must not exceed 100 characters'),
  
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('leadSource')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Lead source must not exceed 100 characters'),
  
  body('customerType')
    .optional()
    .isIn(['individual', 'business', 'corporate'])
    .withMessage('Customer type must be one of: individual, business, corporate'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('connectedStatus')
    .optional()
    .isIn(['connected', 'not_connected', 'pending'])
    .withMessage('Connected status must be one of: connected, not_connected, pending'),
  
  body('finalStatus')
    .optional()
    .isIn(['open', 'closed', 'next_meeting'])
    .withMessage('Final status must be one of: open, closed, next_meeting'),
  
  body('whatsapp')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid WhatsApp number')
];

// Validation rules for query parameters
const querySchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Search term must not exceed 255 characters'),
  
  query('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State filter must not exceed 100 characters'),
  
  query('productType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product type filter must not exceed 100 characters'),
  
  query('connectedStatus')
    .optional()
    .isIn(['connected', 'not_connected', 'pending'])
    .withMessage('Connected status filter must be one of: connected, not_connected, pending'),
  
  query('createdBy')
    .optional()
    .isEmail()
    .withMessage('Created by filter must be a valid email address')
];

// Validation rules for CSV import
const importCSVSchema = [
  body('leads')
    .isArray({ min: 1 })
    .withMessage('Leads data must be a non-empty array'),
  
  body('leads.*.name')
    .notEmpty()
    .withMessage('Name is required for all leads')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('leads.*.phone')
    .notEmpty()
    .withMessage('Phone number is required for all leads')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number for all leads'),
  
  body('leads.*.email')
    .optional()
    .isEmail()
    .withMessage('Please provide valid email addresses'),
  
  body('leads.*.business')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Business name must not exceed 255 characters'),
  
  body('leads.*.address')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Address must not exceed 1000 characters'),
  
  body('leads.*.gstNo')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide valid GST numbers'),
  
  body('leads.*.productType')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Product type must not exceed 100 characters'),
  
  body('leads.*.state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),
  
  body('leads.*.leadSource')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Lead source must not exceed 100 characters'),
  
  body('leads.*.customerType')
    .optional()
    .isIn(['individual', 'business', 'corporate'])
    .withMessage('Customer type must be one of: individual, business, corporate'),
  
  body('leads.*.date')
    .optional()
    .isISO8601()
    .withMessage('Please provide valid dates'),
  
  body('leads.*.connectedStatus')
    .optional()
    .isIn(['connected', 'not_connected', 'pending'])
    .withMessage('Connected status must be one of: connected, not_connected, pending'),
  
  body('leads.*.finalStatus')
    .optional()
    .isIn(['open', 'closed', 'next_meeting'])
    .withMessage('Final status must be one of: open, closed, next_meeting'),
  
  body('leads.*.whatsapp')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide valid WhatsApp numbers')
];

// Validation rules for ID parameter
const idParamSchema = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Lead ID must be a positive integer')
];

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  querySchema,
  importCSVSchema,
  idParamSchema
};
