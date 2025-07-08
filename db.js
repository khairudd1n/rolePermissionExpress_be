const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'auth_express',
  password: process.env.DB_PASSWORD || 'k123',
  port: process.env.DB_PORT || 5432,
});

// Test the connection
pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error', err));

module.exports = pool;
