const db = require('../config/db');

exports.getAllServices = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM service_types WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY category ASC, base_price ASC';

    const [services] = await db.query(query, params);
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve services.' });
  }
};

exports.createService = async (req, res) => {
  try {
    const { name, category, description, estimated_hours, base_price } = req.body;

    if (!name || !base_price) {
      return res.status(400).json({ success: false, message: 'Service name and base price are required.' });
    }

    const [result] = await db.query(
      `INSERT INTO service_types (name, category, description, estimated_hours, base_price)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        category || 'Maintenance',
        description || '',
        parseFloat(estimated_hours || 2.0),
        parseFloat(base_price)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
};
