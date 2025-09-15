const { query } = require('../config/database');
const logger = require('../utils/logger');

class BaseModel {
  constructor(data) {
    Object.assign(this, data);
  }

  static async query(sql, params = []) {
    return await query(sql, params);
  }

  static async findById(tableName, id) {
    const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    return result.rows.length > 0 ? new this(result.rows[0]) : null;
  }

  static async findByField(tableName, field, value) {
    const result = await query(`SELECT * FROM ${tableName} WHERE ${field} = $1`, [value]);
    return result.rows.length > 0 ? new this(result.rows[0]) : null;
  }

  static async findAll(tableName, filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        whereConditions.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const countResult = await query(`SELECT COUNT(*) FROM ${tableName} ${whereClause}`, values);
    const total = parseInt(countResult.rows[0].count);

    values.push(limit, offset);
    const result = await query(
      `SELECT * FROM ${tableName} ${whereClause} ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      values
    );

    return {
      data: result.rows.map(row => new this(row)),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  async update(tableName, updateData, updatedBy) {
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) throw new Error('No fields to update');

    updateFields.push(`updated_by = $${paramCount++}`);
    values.push(updatedBy);
    values.push(this.id);

    const result = await query(
      `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = $${paramCount++} RETURNING *`,
      values
    );

    if (result.rows.length === 0) throw new Error('Record not found');
    Object.assign(this, new this.constructor(result.rows[0]));
    return this;
  }

  async delete(tableName) {
    const result = await query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [this.id]);
    if (result.rows.length === 0) throw new Error('Record not found');
    return true;
  }

  toJSON() {
    const json = { ...this };
    delete json.password;
    return json;
  }
}

module.exports = BaseModel;
