const db = require('../config/db');

exports.getAllCenters = async (req, res) => {
  try {
    const [centers] = await db.query(`
      SELECT sc.*,
        (SELECT COUNT(*) FROM bookings b WHERE b.service_center_id = sc.id AND b.status IN ('booked', 'checked_in', 'inspection', 'repair', 'quality_check', 'ready_for_delivery')) as active_jobs_count
      FROM service_centers sc
      WHERE sc.is_active = TRUE
      ORDER BY sc.name ASC
    `);

    res.json({ success: true, count: centers.length, centers });
  } catch (error) {
    console.error('Get service centers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve service centers.' });
  }
};

exports.getCenterSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Standard slot timings
    const standardSlots = [
      '09:00 AM - 11:00 AM',
      '11:30 AM - 01:30 PM',
      '02:30 PM - 04:30 PM',
      '04:30 PM - 06:30 PM'
    ];

    // Get center capacity
    const [centers] = await db.query('SELECT * FROM service_centers WHERE id = ?', [id]);
    if (centers.length === 0) {
      return res.status(404).json({ success: false, message: 'Service center not found.' });
    }

    const defaultCapacity = centers[0].capacity_per_slot || 5;

    // Get any existing slot records or bookings count for each slot on this date
    const [existingSlots] = await db.query(
      `SELECT slot_time, COUNT(*) as current_bookings
       FROM bookings
       WHERE service_center_id = ? AND booking_date = ? AND status != 'cancelled'
       GROUP BY slot_time`,
      [id, targetDate]
    );

    const bookingMap = {};
    existingSlots.forEach(s => {
      bookingMap[s.slot_time] = s.current_bookings;
    });

    const slotsResult = standardSlots.map(time => {
      const booked = bookingMap[time] || 0;
      const available = Math.max(0, defaultCapacity - booked);
      return {
        slot_time: time,
        max_capacity: defaultCapacity,
        booked_count: booked,
        available_slots: available,
        is_available: available > 0
      };
    });

    res.json({
      success: true,
      center: centers[0],
      date: targetDate,
      slots: slotsResult
    });
  } catch (error) {
    console.error('Get center slots error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch slots.' });
  }
};

exports.createCenter = async (req, res) => {
  try {
    const { name, code, address, city, phone, email, capacity_per_slot } = req.body;

    if (!name || !code || !address || !city || !phone) {
      return res.status(400).json({ success: false, message: 'All required center fields must be provided.' });
    }

    const [result] = await db.query(
      `INSERT INTO service_centers (name, code, address, city, phone, email, capacity_per_slot)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, code.toUpperCase(), address, city, phone, email || null, capacity_per_slot || 5]
    );

    res.status(201).json({
      success: true,
      message: 'Service center created successfully',
      centerId: result.insertId
    });
  } catch (error) {
    console.error('Create center error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service center.' });
  }
};
