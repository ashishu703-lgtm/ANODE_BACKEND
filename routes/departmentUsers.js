const express = require('express');
const router = express.Router();
const DepartmentUserController = require('../controllers/departmentUserController');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { createUserSchema, updateUserSchema, updateStatusSchema, querySchema } = require('../apis/departmentUsers/validators');

router.use(protect);

router.post('/', validateRequest(createUserSchema), DepartmentUserController.create);
router.get('/', validateRequest(querySchema, 'query'), DepartmentUserController.getAll);
router.get('/stats', DepartmentUserController.getStats);
router.get('/by-head/:headUserId', DepartmentUserController.getByHeadUserId);
router.get('/:id', DepartmentUserController.getById);
router.put('/:id', validateRequest(updateUserSchema), DepartmentUserController.update);
router.put('/:id/status', validateRequest(updateStatusSchema), DepartmentUserController.updateStatus);
router.delete('/:id', DepartmentUserController.delete);

module.exports = router;
