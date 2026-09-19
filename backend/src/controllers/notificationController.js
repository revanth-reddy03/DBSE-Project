const db = require('../config/db');

exports.getUserNotifications = async (req, res) => {
  try {
    let query = `
      SELECT n.*, b.booking_code
      FROM notifications n
      LEFT JOIN bookings b ON n.booking_id = b.id
    `;
    const params = [];

    if (req.user.role === 'customer') {
      query += ' WHERE n.user_id = ?';
      params.push(req.user.id);
    } else if (req.query.userId) {
      query += ' WHERE n.user_id = ?';
      params.push(req.query.userId);
    }

    query += ' ORDER BY n.sent_at DESC LIMIT 30';

    const [notifications] = await db.query(query, params);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};
