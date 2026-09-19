const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'vehicle_service_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+05:30' // Match IST local time
});

// Test connection on startup
pool.getConnection()
  .then(connection => {
    console.log(`🔌 Database connection pool established with '${process.env.DB_NAME || 'vehicle_service_db'}'`);
    connection.release();
  })
  .catch(err => {
    console.error('❌ Failed to establish MySQL pool connection:', err.message);
  });

module.exports = pool;
