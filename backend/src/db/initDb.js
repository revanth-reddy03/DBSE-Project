const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true
};

async function initializeDatabase() {
  console.log('🚀 Starting Database Setup for Vehicle Service Booking & Tracking System...');
  console.log(`📡 Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port} as '${dbConfig.user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server successfully.');

    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`📄 Executing schema script: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema created successfully. Tables, indexes, and constraints initialized.');

    // Read seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    console.log(`🌱 Populating seed data: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    // Quick verification query
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM vehicle_service_db.users');
    const [bookingRows] = await connection.query('SELECT COUNT(*) as count FROM vehicle_service_db.bookings');
    const [centerRows] = await connection.query('SELECT COUNT(*) as count FROM vehicle_service_db.service_centers');

    console.log('📊 Database Initialization Verification:');
    console.log(`   - Users loaded: ${userRows[0].count}`);
    console.log(`   - Service Centers: ${centerRows[0].count}`);
    console.log(`   - Bookings initialized: ${bookingRows[0].count}`);
    console.log('🎉 Database initialization complete and ready for production/demo!\n');
  } catch (error) {
    console.error('❌ Database Initialization Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
