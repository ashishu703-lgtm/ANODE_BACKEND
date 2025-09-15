const AdminDepartmentUser = require('../models/AdminDepartmentUser');
const BaseController = require('./BaseController');

class AdminDepartmentUserController extends BaseController {
  static async create(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { username, email, password, departmentType, companyName, role, headUser } = req.body;
      
      BaseController.validateRequiredFields(['username', 'email', 'password', 'departmentType', 'companyName', 'role'], req.body);
      if (role === 'superadmin') throw new Error('Invalid role');
      
      if (role === 'department_user' && !headUser) {
        throw new Error('Head user email is required for department users');
      }

      const existingUser = await AdminDepartmentUser.findByEmail(email);
      if (existingUser) throw new Error('User with this email already exists');

      const existingUsername = await AdminDepartmentUser.findByUsername(username);
      if (existingUsername) throw new Error('User with this username already exists');

      const userData = {
        username, email, password, departmentType, companyName, role,
        headUser: role === 'department_head' ? null : headUser,
        createdBy: req.user.id
      };

      const newUser = await AdminDepartmentUser.create(userData);
      return { user: newUser.toJSON() };
    }, 'Department user created successfully', 'Failed to create department user');
  }

  static async getAll(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { page = 1, limit = 10, companyName, departmentType, role, isActive, search } = req.query;
      
      const filters = { companyName, departmentType, role, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined };
      if (search) filters.search = search;
      
      const pagination = { page: parseInt(page), limit: parseInt(limit) };
      const result = await AdminDepartmentUser.findAll(filters, pagination);
      
      return {
        users: result.data.map(user => user.toJSON()),
        pagination: result.pagination
      };
    }, 'Users retrieved successfully', 'Failed to get users');
  }

  static async getById(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { id } = req.params;
      const user = await AdminDepartmentUser.findById(id);
      if (!user) throw new Error('Department user not found');
      return { user: user.toJSON() };
    }, 'User retrieved successfully', 'Failed to get user');
  }

  static async update(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { id } = req.params;
      const updateData = req.body;
      
      const user = await AdminDepartmentUser.findById(id);
      if (!user) throw new Error('Department user not found');

      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await AdminDepartmentUser.findByEmail(updateData.email);
        if (existingUser) throw new Error('User with this email already exists');
      }

      if (updateData.username && updateData.username !== user.username) {
        const existingUsername = await AdminDepartmentUser.findByUsername(updateData.username);
        if (existingUsername) throw new Error('User with this username already exists');
      }

      const updatedUser = await user.update(updateData, req.user.id);
      return { user: updatedUser.toJSON() };
    }, 'User updated successfully', 'Failed to update user');
  }

  static async delete(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { id } = req.params;
      const user = await AdminDepartmentUser.findById(id);
      if (!user) throw new Error('Department user not found');
      
      await user.delete();
      return {};
    }, 'User deleted successfully', 'Failed to delete user');
  }

  static async getDepartmentHeads(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { companyName, departmentType } = req.params;
      const heads = await AdminDepartmentUser.getDepartmentHeads(companyName, departmentType);
      return { heads: heads.map(head => head.toJSON()) };
    }, 'Department heads retrieved successfully', 'Failed to get department heads');
  }

  static async getUsersUnderHead(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { headEmail } = req.params;
      const users = await AdminDepartmentUser.getUsersUnderHead(headEmail);
      return { users: users.map(user => user.toJSON()) };
    }, 'Users under head retrieved successfully', 'Failed to get users under head');
  }

  static async updateStatus(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') throw new Error('isActive must be a boolean value');
      
      const user = await AdminDepartmentUser.findById(id);
      if (!user) throw new Error('Department user not found');
      
      const updatedUser = await user.update({ isActive }, req.user.id);
      return { user: updatedUser.toJSON() };
    }, `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`, 'Failed to update user status');
  }

  static async getStats(req, res) {
    await BaseController.handleAsyncOperation(res, async () => {
      const { query } = require('../config/database');
      
      const [companyStats, departmentStats, roleStats, recentActivity] = await Promise.all([
        query(`SELECT company_name, COUNT(*) as total_users,
               COUNT(CASE WHEN role = 'department_head' THEN 1 END) as heads,
               COUNT(CASE WHEN role = 'department_user' THEN 1 END) as users,
               COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
               FROM admin_department_users GROUP BY company_name ORDER BY company_name`),
        query(`SELECT department_type, COUNT(*) as total_users,
               COUNT(CASE WHEN role = 'department_head' THEN 1 END) as heads,
               COUNT(CASE WHEN role = 'department_user' THEN 1 END) as users,
               COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
               FROM admin_department_users GROUP BY department_type ORDER BY department_type`),
        query(`SELECT role, COUNT(*) as total_users,
               COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
               FROM admin_department_users GROUP BY role ORDER BY role`),
        query(`SELECT DATE(created_at) as date, COUNT(*) as count
               FROM admin_department_users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
               GROUP BY DATE(created_at) ORDER BY date DESC`)
      ]);

      return {
        byCompany: companyStats.rows.map(row => ({
          companyName: row.company_name,
          totalUsers: parseInt(row.total_users),
          heads: parseInt(row.heads),
          users: parseInt(row.users),
          activeUsers: parseInt(row.active_users)
        })),
        byDepartment: departmentStats.rows.map(row => ({
          departmentType: row.department_type,
          totalUsers: parseInt(row.total_users),
          heads: parseInt(row.heads),
          users: parseInt(row.users),
          activeUsers: parseInt(row.active_users)
        })),
        byRole: roleStats.rows.map(row => ({
          role: row.role,
          totalUsers: parseInt(row.total_users),
          activeUsers: parseInt(row.active_users)
        })),
        recentActivity: recentActivity.rows.map(row => ({
          date: row.date,
          count: parseInt(row.count)
        }))
      };
    }, 'Statistics retrieved successfully', 'Failed to get statistics');
  }
}

module.exports = AdminDepartmentUserController;