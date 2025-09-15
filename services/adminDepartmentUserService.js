const AdminDepartmentUser = require('../models/AdminDepartmentUser');
const logger = require('../utils/logger');

class AdminDepartmentUserService {
  // Create a new department user
  static async createUser(userData) {
    try {
      const {
        username,
        email,
        password,
        departmentType,
        companyName,
        role,
        headUser,
        createdBy
      } = userData;

      // Validate business rules
      await this.validateUserCreation({
        email,
        username,
        role,
        headUser,
        companyName,
        departmentType
      });

      const newUser = await AdminDepartmentUser.create({
        username,
        email,
        password,
        departmentType,
        companyName,
        role,
        headUser: role === 'department_head' ? null : headUser,
        createdBy
      });

      logger.info('Department user created via service', {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      return newUser;
    } catch (error) {
      logger.error('Service error creating department user:', error);
      throw error;
    }
  }

  // Get all users with advanced filtering
  static async getAllUsers(filters = {}, pagination = {}) {
    try {
      const result = await AdminDepartmentUser.findAll(filters, pagination);
      
      logger.info('Retrieved department users via service', {
        count: result.users.length,
        filters,
        pagination
      });

      return result;
    } catch (error) {
      logger.error('Service error getting all department users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const user = await AdminDepartmentUser.findById(id);
      
      if (!user) {
        throw new Error('Department user not found');
      }

      logger.info('Retrieved department user by ID via service', {
        userId: id
      });

      return user;
    } catch (error) {
      logger.error('Service error getting department user by ID:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id, updateData, updatedBy) {
    try {
      const user = await AdminDepartmentUser.findById(id);
      
      if (!user) {
        throw new Error('Department user not found');
      }

      // Validate business rules for update
      await this.validateUserUpdate(user, updateData);

      const updatedUser = await user.update(updateData, updatedBy);

      logger.info('Department user updated via service', {
        userId: id,
        updatedFields: Object.keys(updateData),
        updatedBy
      });

      return updatedUser;
    } catch (error) {
      logger.error('Service error updating department user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const user = await AdminDepartmentUser.findById(id);
      
      if (!user) {
        throw new Error('Department user not found');
      }

      // Check if user has subordinates (for department heads)
      if (user.role === 'department_head') {
        const subordinates = await AdminDepartmentUser.getUsersUnderHead(user.email);
        if (subordinates.length > 0) {
          throw new Error('Cannot delete department head with active subordinates');
        }
      }

      await user.delete();

      logger.info('Department user deleted via service', {
        userId: id,
        userEmail: user.email
      });

      return true;
    } catch (error) {
      logger.error('Service error deleting department user:', error);
      throw error;
    }
  }

  // Get department heads
  static async getDepartmentHeads(companyName, departmentType) {
    try {
      const heads = await AdminDepartmentUser.getDepartmentHeads(companyName, departmentType);

      logger.info('Retrieved department heads via service', {
        companyName,
        departmentType,
        count: heads.length
      });

      return heads;
    } catch (error) {
      logger.error('Service error getting department heads:', error);
      throw error;
    }
  }

  // Get users under a head
  static async getUsersUnderHead(headEmail) {
    try {
      const users = await AdminDepartmentUser.getUsersUnderHead(headEmail);

      logger.info('Retrieved users under head via service', {
        headEmail,
        count: users.length
      });

      return users;
    } catch (error) {
      logger.error('Service error getting users under head:', error);
      throw error;
    }
  }

  // Update user status
  static async updateUserStatus(id, isActive, updatedBy) {
    try {
      const user = await AdminDepartmentUser.findById(id);
      
      if (!user) {
        throw new Error('Department user not found');
      }

      const updatedUser = await user.update({ isActive }, updatedBy);

      logger.info('Department user status updated via service', {
        userId: id,
        newStatus: isActive,
        updatedBy
      });

      return updatedUser;
    } catch (error) {
      logger.error('Service error updating user status:', error);
      throw error;
    }
  }

  // Get comprehensive statistics
  static async getStatistics() {
    try {
      const { query } = require('../config/database');

      // Get detailed statistics
      const [
        companyStats,
        departmentStats,
        roleStats,
        recentActivity,
        activeUsers,
        inactiveUsers,
        emailVerified,
        emailUnverified
      ] = await Promise.all([
        query(`
          SELECT company_name, COUNT(*) as total_users,
                 COUNT(CASE WHEN role = 'department_head' THEN 1 END) as heads,
                 COUNT(CASE WHEN role = 'department_user' THEN 1 END) as users,
                 COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
          FROM admin_department_users
          GROUP BY company_name
          ORDER BY company_name
        `),
        query(`
          SELECT department_type, COUNT(*) as total_users,
                 COUNT(CASE WHEN role = 'department_head' THEN 1 END) as heads,
                 COUNT(CASE WHEN role = 'department_user' THEN 1 END) as users,
                 COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
          FROM admin_department_users
          GROUP BY department_type
          ORDER BY department_type
        `),
        query(`
          SELECT role, COUNT(*) as total_users,
                 COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
          FROM admin_department_users
          GROUP BY role
          ORDER BY role
        `),
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM admin_department_users
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `),
        query('SELECT COUNT(*) FROM admin_department_users WHERE is_active = true'),
        query('SELECT COUNT(*) FROM admin_department_users WHERE is_active = false'),
        query('SELECT COUNT(*) FROM admin_department_users WHERE email_verified = true'),
        query('SELECT COUNT(*) FROM admin_department_users WHERE email_verified = false')
      ]);

      const stats = {
        overview: {
          totalUsers: parseInt(activeUsers.rows[0].count) + parseInt(inactiveUsers.rows[0].count),
          activeUsers: parseInt(activeUsers.rows[0].count),
          inactiveUsers: parseInt(inactiveUsers.rows[0].count),
          emailVerified: parseInt(emailVerified.rows[0].count),
          emailUnverified: parseInt(emailUnverified.rows[0].count)
        },
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

      logger.info('Retrieved department user statistics via service');

      return stats;
    } catch (error) {
      logger.error('Service error getting statistics:', error);
      throw error;
    }
  }

  // Validate user creation business rules
  static async validateUserCreation({ email, username, role, headUser, companyName, departmentType }) {
    // Check if email already exists
    const existingEmail = await AdminDepartmentUser.findByEmail(email);
    if (existingEmail) {
      throw new Error('User with this email already exists');
    }

    // Check if username already exists
    const existingUsername = await AdminDepartmentUser.findByUsername(username);
    if (existingUsername) {
      throw new Error('User with this username already exists');
    }

    // Validate head user exists if provided
    if (role === 'department_user' && headUser) {
      const headUserExists = await AdminDepartmentUser.findByEmail(headUser);
      if (!headUserExists) {
        throw new Error('Specified head user does not exist');
      }

      if (headUserExists.role !== 'department_head') {
        throw new Error('Specified head user is not a department head');
      }

      if (headUserExists.companyName !== companyName) {
        throw new Error('Head user must be from the same company');
      }

      if (headUserExists.departmentType !== departmentType) {
        throw new Error('Head user must be from the same department');
      }
    }

    // Check for duplicate department heads in same company and department
    if (role === 'department_head') {
      const existingHeads = await AdminDepartmentUser.getDepartmentHeads(companyName, departmentType);
      if (existingHeads.length > 0) {
        throw new Error('A department head already exists for this company and department');
      }
    }
  }

  // Validate user update business rules
  static async validateUserUpdate(user, updateData) {
    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await AdminDepartmentUser.findByEmail(updateData.email);
      if (existingEmail) {
        throw new Error('User with this email already exists');
      }
    }

    // Check username uniqueness if username is being updated
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await AdminDepartmentUser.findByUsername(updateData.username);
      if (existingUsername) {
        throw new Error('User with this username already exists');
      }
    }

    // Validate head user if being updated
    if (updateData.headUser && updateData.headUser !== user.headUser) {
      const headUserExists = await AdminDepartmentUser.findByEmail(updateData.headUser);
      if (!headUserExists) {
        throw new Error('Specified head user does not exist');
      }

      if (headUserExists.role !== 'department_head') {
        throw new Error('Specified head user is not a department head');
      }

      const companyName = updateData.companyName || user.companyName;
      const departmentType = updateData.departmentType || user.departmentType;

      if (headUserExists.companyName !== companyName) {
        throw new Error('Head user must be from the same company');
      }

      if (headUserExists.departmentType !== departmentType) {
        throw new Error('Head user must be from the same department');
      }
    }

    // Check for duplicate department heads if role is being changed to department_head
    if (updateData.role === 'department_head' && user.role !== 'department_head') {
      const companyName = updateData.companyName || user.companyName;
      const departmentType = updateData.departmentType || user.departmentType;
      
      const existingHeads = await AdminDepartmentUser.getDepartmentHeads(companyName, departmentType);
      if (existingHeads.length > 0) {
        throw new Error('A department head already exists for this company and department');
      }
    }
  }

  // Bulk operations
  static async bulkUpdateStatus(userIds, isActive, updatedBy) {
    try {
      const results = [];
      
      for (const id of userIds) {
        try {
          const user = await this.updateUserStatus(id, isActive, updatedBy);
          results.push({ id, success: true, user: user.toJSON() });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      logger.info('Bulk status update completed via service', {
        totalUsers: userIds.length,
        successfulUpdates: results.filter(r => r.success).length,
        failedUpdates: results.filter(r => !r.success).length,
        updatedBy
      });

      return results;
    } catch (error) {
      logger.error('Service error in bulk status update:', error);
      throw error;
    }
  }

  // Search users with advanced filters
  static async searchUsers(searchCriteria) {
    try {
      const {
        query: searchQuery,
        companyName,
        departmentType,
        role,
        isActive,
        emailVerified,
        hasHeadUser,
        page = 1,
        limit = 10
      } = searchCriteria;

      const filters = {
        companyName,
        departmentType,
        role,
        isActive,
        search: searchQuery
      };

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit)
      };

      let result = await AdminDepartmentUser.findAll(filters, pagination);

      // Additional filtering for email verification and head user
      if (emailVerified !== undefined || hasHeadUser !== undefined) {
        result.users = result.users.filter(user => {
          if (emailVerified !== undefined && user.emailVerified !== emailVerified) {
            return false;
          }
          if (hasHeadUser !== undefined) {
            const hasHead = user.headUser !== null && user.headUser !== undefined;
            if (hasHeadUser !== hasHead) {
              return false;
            }
          }
          return true;
        });
      }

      logger.info('User search completed via service', {
        searchCriteria,
        resultCount: result.users.length
      });

      return result;
    } catch (error) {
      logger.error('Service error in user search:', error);
      throw error;
    }
  }
}

module.exports = AdminDepartmentUserService;
