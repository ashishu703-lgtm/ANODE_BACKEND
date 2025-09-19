const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { mapLeadFields, mapLeadArray } = require('../middleware/mapLeadFields');
const {
  createLeadSchema,
  updateLeadSchema,
  querySchema,
  importCSVSchema,
  idParamSchema
} = require('../apis/leads/validators');
const SalespersonLeadController = require('../controllers/salespersonLeadController');

router.use(protect);

router.post('/', mapLeadFields, validateRequest(createLeadSchema), LeadController.create);
router.get('/', validateRequest(querySchema, 'query'), LeadController.getAll);
router.get('/stats', LeadController.getStats);
router.get('/:id', validateRequest(idParamSchema, 'params'), LeadController.getById);
router.put('/:id', mapLeadFields, validateRequest([...idParamSchema, ...updateLeadSchema]), LeadController.update);
router.delete('/:id', validateRequest(idParamSchema, 'params'), LeadController.delete);

router.post('/:id/transfer', validateRequest(idParamSchema, 'params'), LeadController.transferLead);

router.post('/import', mapLeadArray, validateRequest(importCSVSchema), LeadController.importCSV);

// Salesperson assigned leads for logged-in department_user or by username
router.get('/assigned/salesperson', SalespersonLeadController.listForLoggedInUser);
router.get('/assigned/salesperson/:username', SalespersonLeadController.listForUsername);

module.exports = router;
