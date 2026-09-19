const db = require('../config/db');
const { sendNotification } = require('../utils/notificationService');

// Valid chronological lifecycle stages
const VALID_STAGES = [
  'booked',
  'checked_in',
  'inspection',
  'repair',
  'quality_check',
  'ready_for_delivery',
  'completed'
];

exports.assignMechanic = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { mechanicId, notes } = req.body;

    if (!mechanicId) {
      return res.status(400).json({ success: false, message: 'Mechanic ID is required.' });
    }

    // Verify mechanic is staff
    const [mechanics] = await db.query(
      'SELECT id, name, email FROM users WHERE id = ? AND role = "staff"',
      [mechanicId]
    );

    if (mechanics.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected user is not a valid staff/mechanic.' });
    }

    const mechanic = mechanics[0];

    // Check if assignment exists
    const [existing] = await db.query(
      'SELECT id FROM job_assignments WHERE booking_id = ?',
      [bookingId]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE job_assignments SET mechanic_user_id = ?, notes = ?, assigned_at = NOW() WHERE booking_id = ?',
        [mechanicId, notes || null, bookingId]
      );
    } else {
      await db.query(
        'INSERT INTO job_assignments (booking_id, mechanic_user_id, status, notes) VALUES (?, ?, "assigned", ?)',
        [bookingId, mechanicId, notes || null]
      );
    }

    // Log history
    await db.query(
      `INSERT INTO service_history_logs (booking_id, status_from, status_to, changed_by_user_id, comments)
       VALUES (?, NULL, 'mechanic_assigned', ?, ?)`,
      [bookingId, req.user.id, `Mechanic assigned: ${mechanic.name}`]
    );

    // Fetch booking details for notification
    const [bookings] = await db.query(
      `SELECT b.id, b.booking_code, b.user_id, v.reg_no, v.make, v.model
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length > 0) {
      const b = bookings[0];
      // Notify customer
      await sendNotification({
        userId: b.user_id,
        bookingId: b.id,
        channel: 'sms',
        title: `Mechanic Assigned - Booking #${b.booking_code}`,
        message: `Lead technician ${mechanic.name} has been assigned to service your ${b.make} ${b.model} (${b.reg_no}).`
      });
    }

    res.json({
      success: true,
      message: `Job successfully assigned to ${mechanic.name}.`,
      mechanic: { id: mechanic.id, name: mechanic.name }
    });
  } catch (error) {
    console.error('Assign mechanic error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign mechanic.' });
  }
};

exports.updateJobStatus = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId } = req.params;
    const { status, comments, estimatedCompletionHours } = req.body;

    if (!VALID_STAGES.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${VALID_STAGES.join(', ')}.`
      });
    }

    const [bookings] = await connection.query(
      `SELECT b.*, u.id as customer_id, u.name as customer_name, u.email as customer_email,
              v.reg_no, v.make, v.model
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];
    const previousStatus = booking.status;

    let estimatedCompletionSql = '';
    const updateParams = [status];

    if (estimatedCompletionHours) {
      estimatedCompletionSql = ', estimated_completion = DATE_ADD(NOW(), INTERVAL ? HOUR)';
      updateParams.push(parseInt(estimatedCompletionHours, 10));
    }

    updateParams.push(bookingId);

    // Update booking status
    await connection.query(
      `UPDATE bookings SET status = ? ${estimatedCompletionSql} WHERE id = ?`,
      updateParams
    );

    // Update job assignment status if applicable
    if (status === 'completed') {
      await connection.query(
        'UPDATE job_assignments SET status = "completed", completed_at = NOW() WHERE booking_id = ?',
        [bookingId]
      );
    } else if (['inspection', 'repair'].includes(status)) {
      await connection.query(
        'UPDATE job_assignments SET status = "in_progress" WHERE booking_id = ?',
        [bookingId]
      );
    }

    // Insert into audit trail service_history_logs
    await connection.query(
      `INSERT INTO service_history_logs (booking_id, status_from, status_to, changed_by_user_id, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [
        bookingId,
        previousStatus,
        status,
        req.user.id,
        comments || `Status advanced from ${previousStatus.replace(/_/g, ' ')} to ${status.replace(/_/g, ' ')}`
      ]
    );

    // Auto-generate invoice if moving to ready_for_delivery or completed AND invoice doesn't exist
    if (['ready_for_delivery', 'completed'].includes(status)) {
      const [existingInvoice] = await connection.query(
        'SELECT id FROM invoices WHERE booking_id = ?',
        [bookingId]
      );

      if (existingInvoice.length === 0) {
        // Calculate subtotal from booking services
        const [services] = await connection.query(
          `SELECT st.name, bs.price
           FROM booking_services bs
           JOIN service_types st ON bs.service_type_id = st.id
           WHERE bs.booking_id = ?`,
          [bookingId]
        );

        const subtotal = services.reduce((sum, s) => sum + parseFloat(s.price), 0);
        const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST standard
        const grandTotal = subtotal + tax;
        const invoiceNum = `INV-${new Date().getFullYear()}-${String(bookingId).padStart(4, '0')}`;

        const [invResult] = await connection.query(
          `INSERT INTO invoices (invoice_number, booking_id, user_id, subtotal, tax, discount, grand_total, payment_status, payment_method)
           VALUES (?, ?, ?, ?, ?, 0.00, ?, 'unpaid', 'Pending')`,
          [invoiceNum, bookingId, booking.customer_id, subtotal, tax, grandTotal]
        );

        const invoiceId = invResult.insertId;

        // Insert items
        for (const s of services) {
          await connection.query(
            `INSERT INTO invoice_items (invoice_id, description, item_type, quantity, unit_price, total_price)
             VALUES (?, ?, 'service', 1, ?, ?)`,
            [invoiceId, s.name, s.price, s.price]
          );
        }
      }
    }

    await connection.commit();

    // Friendly messages for milestone notifications
    const milestoneMessages = {
      checked_in: `Your ${booking.make} ${booking.model} (${booking.reg_no}) has arrived and is checked-in at the service bay.`,
      inspection: `Diagnostic inspection is now underway for your ${booking.make} ${booking.model}.`,
      repair: `Active servicing and maintenance is in progress on your vehicle.`,
      quality_check: `Repairs completed! Vehicle is undergoing comprehensive quality assurance and safety inspection.`,
      ready_for_delivery: `Your vehicle has passed quality checks and is washed, detailed, and READY FOR PICKUP!`,
      completed: `Service order #${booking.booking_code} is completed. Thank you for choosing Apex Auto Hub!`
    };

    const statusTitle = status.replace(/_/g, ' ').toUpperCase();
    const notifText = comments ? `${milestoneMessages[status] || `Status updated to ${statusTitle}.`} Note: ${comments}` : (milestoneMessages[status] || `Status updated to ${statusTitle}.`);

    // Dispatch real-time SMS alert
    await sendNotification({
      userId: booking.customer_id,
      bookingId: booking.id,
      channel: 'sms',
      title: `Service Update: ${statusTitle}`,
      message: notifText
    });

    // Dispatch real-time Email alert
    await sendNotification({
      userId: booking.customer_id,
      bookingId: booking.id,
      channel: 'email',
      title: `Status Alert: ${booking.make} ${booking.model} is now ${statusTitle}`,
      message: notifText
    });

    res.json({
      success: true,
      message: `Booking #${booking.booking_code} status updated to '${status}'.`,
      status
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update job status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update job status.' });
  } finally {
    connection.release();
  }
};

exports.addPartsOrLabor = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { description, item_type, quantity, unit_price } = req.body;

    if (!description || !unit_price) {
      return res.status(400).json({ success: false, message: 'Description and unit price are required.' });
    }

    const qty = parseInt(quantity || 1, 10);
    const price = parseFloat(unit_price);
    const totalPrice = qty * price;

    // Check or find invoice
    let [invoices] = await db.query('SELECT * FROM invoices WHERE booking_id = ?', [bookingId]);
    let invoiceId;

    if (invoices.length === 0) {
      // Find booking user
      const [bookings] = await db.query('SELECT user_id, total_amount FROM bookings WHERE id = ?', [bookingId]);
      if (bookings.length === 0) return res.status(404).json({ success: false, message: 'Booking not found.' });

      const invoiceNum = `INV-${new Date().getFullYear()}-${String(bookingId).padStart(4, '0')}`;
      const [invResult] = await db.query(
        `INSERT INTO invoices (invoice_number, booking_id, user_id, subtotal, tax, discount, grand_total, payment_status)
         VALUES (?, ?, ?, ?, ?, 0.00, ?, 'unpaid')`,
        [invoiceNum, bookingId, bookings[0].user_id, totalPrice, totalPrice * 0.18, totalPrice * 1.18]
      );
      invoiceId = invResult.insertId;
    } else {
      invoiceId = invoices[0].id;
    }

    // Insert line item
    await db.query(
      `INSERT INTO invoice_items (invoice_id, description, item_type, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceId, description.trim(), item_type || 'part', qty, price, totalPrice]
    );

    // Recalculate invoice totals
    const [items] = await db.query(
      'SELECT SUM(total_price) as subtotal FROM invoice_items WHERE invoice_id = ?',
      [invoiceId]
    );

    const subtotal = items[0].subtotal || 0;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const grandTotal = subtotal + tax;

    await db.query(
      'UPDATE invoices SET subtotal = ?, tax = ?, grand_total = ? WHERE id = ?',
      [subtotal, tax, grandTotal, invoiceId]
    );

    // Update booking total
    await db.query(
      'UPDATE bookings SET total_amount = ? WHERE id = ?',
      [grandTotal, bookingId]
    );

    // Log mechanic record
    await db.query(
      `INSERT INTO service_history_logs (booking_id, status_from, status_to, changed_by_user_id, comments)
       VALUES (?, 'parts_logged', 'parts_logged', ?, ?)`,
      [bookingId, req.user.id, `Added ${item_type || 'part'}: ${description} (${qty}x @ ₹${price}) = ₹${totalPrice}`]
    );

    res.json({
      success: true,
      message: 'Part / labor added to vehicle service record.',
      subtotal,
      tax,
      grandTotal
    });
  } catch (error) {
    console.error('Add parts error:', error);
    res.status(500).json({ success: false, message: 'Failed to record parts/labor.' });
  }
};
