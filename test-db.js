const { Pool } = require('pg');
require('dotenv').config();

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');

// Try different connection configurations
const configs = [
  {
    name: 'With password from env',
    config: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'automatic_review_system',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD
    }
  },
  {
    name: 'Try username "saim8" with password "saim8"',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'saim8',
      password: 'saim8'
    }
  },
  {
    name: 'Try username "saim8" with password "saim8" on automatic_review_system',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'automatic_review_system',
      user: 'saim8',
      password: 'saim8'
    }
  },
  {
    name: 'Try username "saim8" with password "saim8" on default postgres',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'saim8',
      password: 'saim8'
    }
  },
  {
    name: 'Try username "postgres" with password "saim8" on postgres database',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: 'saim8'
    }
  }
];

async function testConnection(config, name) {
  console.log(`\n--- Testing ${name} ---`);
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log(`✅ ${name}: Connected successfully!`);
    
    const result = await client.query('SELECT version()');
    console.log(`Database version: ${result.rows[0].version}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    await pool.end();
    return false;
  }
}

async function testAll() {
  console.log('Testing database connections...\n');
  
  for (const config of configs) {
    const success = await testConnection(config.config, config.name);
    if (success) {
      console.log(`\n🎉 Success with: ${config.name}`);
      console.log('Use this configuration in your .env file');
      break;
    }
  }
}

testAll().catch(console.error);
