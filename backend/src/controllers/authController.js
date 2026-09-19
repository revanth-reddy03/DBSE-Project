const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_dbse_2026_vehicle_tracker';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await db.query(
      'SELECT id, name, email, password_hash, role, phone, created_at FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const userRole = ['customer', 'staff', 'admin'].includes(role) ? role : 'customer';
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanEmail, passwordHash, userRole, phone || null]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: cleanEmail,
      role: userRole,
      phone: phone || null
    };

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getStaffMembers = async (req, res) => {
  try {
    const [staff] = await db.query(
      'SELECT id, name, email, role, phone FROM users WHERE role = "staff" ORDER BY name ASC'
    );
    res.json({ success: true, staff });
  } catch (error) {
    console.error('Staff list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff members.' });
  }
};
