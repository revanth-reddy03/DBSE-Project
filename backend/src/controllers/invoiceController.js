const db = require('../config/db');
const { sendNotification } = require('../utils/notificationService');

exports.getInvoiceByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [invoices] = await db.query(
      `SELECT
        i.*,
        b.booking_code,
        b.booking_date,
        b.slot_time,
        b.status as booking_status,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        v.reg_no,
        v.make,
        v.model,
        v.year,
        sc.name as service_center_name,
        sc.address as service_center_address,
        sc.city as service_center_city,
        sc.phone as service_center_phone
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN users u ON i.user_id = u.id
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN service_centers sc ON b.service_center_id = sc.id
       WHERE i.booking_id = ?`,
      [bookingId]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found for this booking.' });
    }

    const invoice = invoices[0];

    // Check authorization: customer can only view their own
    if (req.user.role === 'customer' && invoice.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
    }

    const [items] = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC',
      [invoice.id]
    );

    invoice.items = items;

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve invoice.' });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    let query = `
      SELECT
        i.*,
        b.booking_code,
        u.name as customer_name,
        u.email as customer_email,
        v.reg_no,
        v.make,
        v.model,
        sc.name as service_center_name
      FROM invoices i
      JOIN bookings b ON i.booking_id = b.id
      JOIN users u ON i.user_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN service_centers sc ON b.service_center_id = sc.id
    `;
    const params = [];

    if (req.user.role === 'customer') {
      query += ' WHERE i.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY i.invoice_date DESC';

    const [invoices] = await db.query(query, params);
    res.json({ success: true, count: invoices.length, invoices });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve invoices.' });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method = 'UPI' } = req.body;

    const [invoices] = await db.query(
      `SELECT i.*, b.booking_code, u.id as customer_id, u.name as customer_name
       FROM invoices i
       JOIN bookings b ON i.booking_id = b.id
       JOIN users u ON i.user_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const invoice = invoices[0];

    // Only customer owner or staff/admin can pay
    if (req.user.role === 'customer' && invoice.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    await db.query(
      'UPDATE invoices SET payment_status = "paid", payment_method = ? WHERE id = ?',
      [payment_method, id]
    );

    // Send payment receipt notification
    await sendNotification({
      userId: invoice.customer_id,
      bookingId: invoice.booking_id,
      channel: 'email',
      title: `Payment Receipt: ${invoice.invoice_number}`,
      message: `Dear ${invoice.customer_name}, payment of ₹${parseFloat(invoice.grand_total).toFixed(2)} for invoice ${invoice.invoice_number} has been received via ${payment_method}. Thank you!`
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully.',
      invoiceNumber: invoice.invoice_number,
      payment_status: 'paid',
      payment_method
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ success: false, message: 'Failed to process payment.' });
  }
};
