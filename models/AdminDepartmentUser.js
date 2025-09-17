const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class AdminDepartmentUser extends BaseModel {
  static TABLE_NAME = 'admin_department_users';
  
  static VALID_COMPANIES = ['Anode Electric Pvt. Ltd.', 'Anode Metals', 'Samrridhi Industries'];
  static VALID_DEPARTMENTS = ['marketing_sales', 'office_sales'];
  static VALID_ROLES = ['department_user', 'department_head'];

  static async create(userData) {
    const { username, email, password, departmentType, companyName, role, headUser, createdBy } = userData;
    
    this.validateData({ username, email, departmentType, companyName, role });
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await this.query(
      `INSERT INTO ${this.TABLE_NAME} (username, email, password, department_type, company_name, role, head_user, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [username, email, hashedPassword, departmentType, companyName, role, headUser, createdBy]
    );

    return new this(result.rows[0]);
  }

  static async findByEmail(email) {
    return await this.findByField(this.TABLE_NAME, 'email', email);
  }

  static async findByUsername(username) {
    return await this.findByField(this.TABLE_NAME, 'username', username);
  }

  static async findById(id) {
    return await super.findById(this.TABLE_NAME, id);
  }

  static async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    // Map camelCase filters to snake_case columns
    const columnMap = {
      companyName: 'company_name',
      departmentType: 'department_type',
      role: 'role',
      isActive: 'is_active',
    };

    const { search, ...rest } = filters || {};

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const column = columnMap[key] || key;
        whereConditions.push(`${column} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (search) {
      const likeParam = `%${search}%`;
      whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      values.push(likeParam);
      paramCount += 1;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await this.query(`SELECT COUNT(*) FROM ${this.TABLE_NAME} ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await this.query(
      `SELECT * FROM ${this.TABLE_NAME} ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );

    return {
      data: result.rows.map(row => new this(row)),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  static async getDepartmentHeads(companyName, departmentType) {
    const result = await this.query(
      `SELECT * FROM ${this.TABLE_NAME} 
       WHERE company_name = $1 AND department_type = $2 AND role = 'department_head' AND is_active = true
       ORDER BY created_at ASC`,
      [companyName, departmentType]
    );
    return result.rows.map(row => new this(row));
  }

  static async getUsersUnderHead(headUserEmail) {
    const result = await this.query(
      `SELECT * FROM ${this.TABLE_NAME} WHERE head_user = $1 AND is_active = true ORDER BY created_at ASC`,
      [headUserEmail]
    );
    return result.rows.map(row => new this(row));
  }

  static validateData({ username, email, departmentType, companyName, role }) {
    if (!this.VALID_ROLES.includes(role)) {
      throw new Error('Invalid role');
    }
    
    if (!this.VALID_COMPANIES.includes(companyName)) {
      throw new Error('Invalid company name');
    }
    if (!this.VALID_DEPARTMENTS.includes(departmentType)) {
      throw new Error('Invalid department type');
    }
  }

  async update(updateData, updatedBy) {
    // Map camelCase to snake_case for DB columns
    const mapped = {};
    if (updateData.username !== undefined) mapped.username = updateData.username;
    if (updateData.email !== undefined) mapped.email = updateData.email;
    if (updateData.departmentType !== undefined) mapped.department_type = updateData.departmentType;
    if (updateData.companyName !== undefined) mapped.company_name = updateData.companyName;
    if (updateData.role !== undefined) mapped.role = updateData.role;
    if (updateData.headUser !== undefined) mapped.head_user = updateData.headUser;
    if (updateData.isActive !== undefined) mapped.is_active = updateData.isActive;
    if (updateData.emailVerified !== undefined) mapped.email_verified = updateData.emailVerified;

    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      mapped.password = await bcrypt.hash(updateData.password, 12);
    }

    return await super.update(this.constructor.TABLE_NAME, mapped, updatedBy);
  }

  async delete() {
    return await super.delete(this.constructor.TABLE_NAME);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  async updateLastLogin() {
    const result = await this.constructor.query(
      `UPDATE ${this.constructor.TABLE_NAME} SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [this.id]
    );
    if (result.rows.length > 0) this.lastLogin = result.rows[0].last_login;
    return this;
  }
}

module.exports = AdminDepartmentUser;