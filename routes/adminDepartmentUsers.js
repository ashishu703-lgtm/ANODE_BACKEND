const express = require('express');
const router = express.Router();
const AdminDepartmentUserController = require('../controllers/adminDepartmentUserController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createUserSchema, updateUserSchema, updateStatusSchema, querySchema } = require('../apis/adminDepartmentUsers/validators');

router.post('/', validate(createUserSchema), AdminDepartmentUserController.create);
router.get('/', validate(querySchema, 'query'), AdminDepartmentUserController.getAll);
router.get('/stats', AdminDepartmentUserController.getStats);
router.get('/heads/:companyName/:departmentType', AdminDepartmentUserController.getDepartmentHeads);
router.get('/under-head/:headEmail', AdminDepartmentUserController.getUsersUnderHead);
router.get('/:id', AdminDepartmentUserController.getById);
router.put('/:id', validate(updateUserSchema), AdminDepartmentUserController.update);
router.put('/:id/status', validate(updateStatusSchema), AdminDepartmentUserController.updateStatus);
router.delete('/:id', AdminDepartmentUserController.delete);

module.exports = router;