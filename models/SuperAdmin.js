const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');

class SuperAdmin extends BaseModel {
  static TABLE_NAME = 'superadmins';

  static async findByEmail(email) {
    return await this.findByField(this.TABLE_NAME, 'email', email);
  }

  static async findById(id) {
    return await super.findById(this.TABLE_NAME, id);
  }

  static async create({ email, password, username = 'superadmin' }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await this.query(
      `INSERT INTO ${this.TABLE_NAME} (email, password, username) VALUES ($1, $2, $3) RETURNING *`,
      [email, hashedPassword, username]
    );
    return new this(result.rows[0]);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  async updateLastLogin() {
    const result = await this.constructor.query(
      `UPDATE ${this.constructor.TABLE_NAME} SET last_login = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [this.id]
    );
    if (result.rows.length > 0) this.last_login = result.rows[0].last_login;
    return this;
  }
}

module.exports = SuperAdmin;

