const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function viewDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'vehicle_service_db',
    port: parseInt(process.env.DB_PORT || '3306', 10)
  });

  console.log('\n=============================================================');
  console.log('📊 DATABASE VIEWER: vehicle_service_db (MySQL 8.0)');
  console.log('=============================================================\n');

  // 1. Show all tables
  const [tables] = await connection.query('SHOW TABLES');
  console.log('📁 TABLES IN DATABASE:');
  tables.forEach((t, i) => console.log(`   ${i + 1}. ${Object.values(t)[0]}`));

  // 2. Sample Users
  console.log('\n👥 REGISTERED USERS:');
  const [users] = await connection.query('SELECT id, name, email, role, phone FROM users');
  console.table(users);

  // 3. Registered Vehicles
  console.log('\n🚗 REGISTERED VEHICLES:');
  const [vehicles] = await connection.query('SELECT id, reg_no, make, model, year, fuel_type, mileage FROM vehicles');
  console.table(vehicles);

  // 4. Live Bookings
  console.log('\n📅 SERVICE BOOKINGS:');
  const [bookings] = await connection.query('SELECT id, booking_code, status, booking_date, slot_time, total_amount FROM bookings');
  console.table(bookings);

  // 5. Invoices
  console.log('\n🧾 DIGITAL INVOICES:');
  const [invoices] = await connection.query('SELECT id, invoice_number, subtotal, tax, grand_total, payment_status, payment_method FROM invoices');
  console.table(invoices);

  console.log('\n=============================================================\n');
  await connection.end();
}

viewDatabase().catch(err => console.error('Database viewer error:', err.message));
