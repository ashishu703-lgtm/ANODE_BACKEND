const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const {
  createLeadSchema,
  updateLeadSchema,
  querySchema,
  importCSVSchema,
  idParamSchema
} = require('../apis/leads/validators');

// All routes require authentication
router.use(protect);

// Lead routes
router.post('/', validateRequest(createLeadSchema), LeadController.create);
router.get('/', validateRequest(querySchema, 'query'), LeadController.getAll);
router.get('/stats', LeadController.getStats);
router.get('/:id', validateRequest(idParamSchema, 'params'), LeadController.getById);
router.put('/:id', validateRequest([...idParamSchema, ...updateLeadSchema]), LeadController.update);
router.delete('/:id', validateRequest(idParamSchema, 'params'), LeadController.delete);

// Transfer lead route
router.post('/:id/transfer', validateRequest(idParamSchema, 'params'), LeadController.transferLead);

// CSV import route
router.post('/import', validateRequest(importCSVSchema), LeadController.importCSV);

module.exports = router;
