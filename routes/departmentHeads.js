const express = require('express');
const router = express.Router();
const DepartmentHeadController = require('../controllers/departmentHeadController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { createHeadSchema, updateHeadSchema, updateStatusSchema, querySchema } = require('../apis/departmentHeads/validators');

router.use(protect);

router.post('/', validateRequest(createHeadSchema), DepartmentHeadController.create);
router.get('/', validateRequest(querySchema, 'query'), DepartmentHeadController.getAll);
router.get('/stats', DepartmentHeadController.getStats);
router.get('/by-company-department/:companyName/:departmentType', DepartmentHeadController.getByCompanyAndDepartment);
router.get('/:id', DepartmentHeadController.getById);
router.put('/:id', validateRequest(updateHeadSchema), DepartmentHeadController.update);
router.put('/:id/status', validateRequest(updateStatusSchema), DepartmentHeadController.updateStatus);
router.delete('/:id', DepartmentHeadController.delete);

module.exports = router;
