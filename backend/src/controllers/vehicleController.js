const db = require('../config/db');

exports.getVehicles = async (req, res) => {
  try {
    let query = `
      SELECT v.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
             (SELECT COUNT(*) FROM bookings b WHERE b.vehicle_id = v.id) as service_count
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
    `;
    const params = [];

    // If customer, only show their vehicles
    if (req.user.role === 'customer') {
      query += ' WHERE v.user_id = ?';
      params.push(req.user.id);
    } else if (req.query.userId) {
      query += ' WHERE v.user_id = ?';
      params.push(req.query.userId);
    }

    query += ' ORDER BY v.created_at DESC';

    const [vehicles] = await db.query(query, params);
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicles.' });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicles] = await db.query(
      `SELECT v.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM vehicles v
       JOIN users u ON v.user_id = u.id
       WHERE v.id = ?`,
      [id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const vehicle = vehicles[0];
    if (req.user.role === 'customer' && vehicle.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this vehicle.' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve vehicle details.' });
  }
};

exports.createVehicle = async (req, res) => {
  try {
    const { reg_no, make, model, year, fuel_type, mileage, color } = req.body;
    const userId = req.user.role === 'admin' && req.body.user_id ? req.body.user_id : req.user.id;

    if (!reg_no || !make || !model || !year) {
      return res.status(400).json({
        success: false,
        message: 'Registration number, make, model, and year are required.'
      });
    }

    const cleanRegNo = reg_no.trim().toUpperCase();

    // Check unique reg_no
    const [existing] = await db.query('SELECT id FROM vehicles WHERE reg_no = ?', [cleanRegNo]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A vehicle with registration number ${cleanRegNo} is already registered.`
      });
    }

    const [result] = await db.query(
      `INSERT INTO vehicles (user_id, reg_no, make, model, year, fuel_type, mileage, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        cleanRegNo,
        make.trim(),
        model.trim(),
        parseInt(year, 10),
        fuel_type || 'Petrol',
        parseInt(mileage || 0, 10),
        color || 'Standard'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully.',
      vehicleId: result.insertId
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to register vehicle.' });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, fuel_type, mileage, color } = req.body;

    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (vehicles.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (req.user.role === 'customer' && vehicles[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await db.query(
      `UPDATE vehicles SET make = ?, model = ?, year = ?, fuel_type = ?, mileage = ?, color = ?
       WHERE id = ?`,
      [
        make || vehicles[0].make,
        model || vehicles[0].model,
        year || vehicles[0].year,
        fuel_type || vehicles[0].fuel_type,
        mileage !== undefined ? mileage : vehicles[0].mileage,
        color || vehicles[0].color,
        id
      ]
    );

    res.json({ success: true, message: 'Vehicle updated successfully.' });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to update vehicle.' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const [vehicles] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (vehicles.length === 0) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    if (req.user.role === 'customer' && vehicles[0].user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    res.json({ success: true, message: 'Vehicle removed successfully.' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vehicle.' });
  }
};
