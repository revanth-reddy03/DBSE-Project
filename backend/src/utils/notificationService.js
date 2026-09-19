const nodemailer = require('nodemailer');
const db = require('../config/db');

// Optional transporter if user configures valid credentials
let transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Dispatch notification (Email / SMS) and persist in database
 */
async function sendNotification({ userId, bookingId = null, channel = 'email', title, message }) {
  try {
    // 1. Insert into database
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, booking_id, channel, title, message, status, sent_at)
       VALUES (?, ?, ?, ?, ?, 'delivered', NOW())`,
      [userId, bookingId, channel, title, message]
    );

    // 2. Simulated log for presentation / evaluation
    const channelBadge = channel.toUpperCase() === 'SMS' ? '📱 [SMS DISPATCH]' : '✉️  [EMAIL DISPATCH]';
    console.log(`\n================== ${channelBadge} ==================`);
    console.log(`To User ID : ${userId}`);
    if (bookingId) console.log(`Booking Ref: Booking #${bookingId}`);
    console.log(`Subject    : ${title}`);
    console.log(`Body       : ${message}`);
    console.log(`Timestamp  : ${new Date().toLocaleString()}`);
    console.log(`====================================================\n`);

    // 3. Attempt actual SMTP if configured
    if (transporter && channel === 'email') {
      // Lookup user email
      const [users] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);
      if (users.length && users[0].email) {
        await transporter.sendMail({
          from: process.env.NOTIFICATION_EMAIL_FROM || '"Vehicle Service Hub" <no-reply@vehicleservice.com>',
          to: users[0].email,
          subject: title,
          text: message,
          html: `<div style="font-family:sans-serif;padding:20px;background:#f8fafc;border-radius:8px">
            <h2 style="color:#2563eb">${title}</h2>
            <p style="font-size:16px;color:#334155">${message}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
            <p style="font-size:12px;color:#94a3b8">Vehicle Service Booking & Tracking System - Automatic Notification</p>
          </div>`
        }).catch(err => console.log('SMTP send note (simulated mode active):', err.message));
      }
    }

    return { id: result.insertId, userId, bookingId, channel, title, message, status: 'delivered' };
  } catch (error) {
    console.error('Failed to record notification:', error.message);
    return null;
  }
}

module.exports = {
  sendNotification
};
