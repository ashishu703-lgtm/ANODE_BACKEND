const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');
const logger = require('../utils/logger');

async function runMigration() {
  try {
    logger.info('Starting migration process...');

    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '001_create_admin_department_users.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await query(migrationSQL);

    logger.info('Migration completed successfully!');
    logger.info('AdminDepartmentUser table created with all required fields and constraints.');

    // Verify the table was created
    const result = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'admin_department_users'
      ORDER BY ordinal_position
    `);

    logger.info('Table structure verified:');
    result.rows.forEach(row => {
      logger.info(`- ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
