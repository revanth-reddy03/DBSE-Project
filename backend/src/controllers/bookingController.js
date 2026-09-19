const db = require('../config/db');
const { sendNotification } = require('../utils/notificationService');

exports.createBooking = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      vehicle_id,
      service_center_id,
      booking_date,
      slot_time,
      service_ids,
      notes
    } = req.body;

    const userId = req.user.id;

    if (!vehicle_id || !service_center_id || !booking_date || !slot_time || !service_ids || service_ids.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Vehicle, service center, date, slot time, and at least one service must be selected.'
      });
    }

    // 1. Verify vehicle belongs to user (or user is admin)
    const [vehicles] = await connection.query(
      'SELECT id, reg_no, make, model FROM vehicles WHERE id = ?',
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    const vehicle = vehicles[0];

    // 2. Verify service center & slot capacity
    const [centers] = await connection.query(
      'SELECT id, name, capacity_per_slot FROM service_centers WHERE id = ? AND is_active = TRUE',
      [service_center_id]
    );

    if (centers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Service center not found or inactive.' });
    }

    const center = centers[0];
    const maxCapacity = center.capacity_per_slot || 5;

    // Check count of active bookings for this center, date, and slot
    const [slotBookings] = await connection.query(
      `SELECT COUNT(*) as current_count
       FROM bookings
       WHERE service_center_id = ? AND booking_date = ? AND slot_time = ? AND status != 'cancelled'`,
      [service_center_id, booking_date, slot_time]
    );

    const currentCount = slotBookings[0].current_count;
    if (currentCount >= maxCapacity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Selected slot (${slot_time}) is fully booked. Maximum capacity of ${maxCapacity} reached. Please pick another slot.`
      });
    }

    // 3. Find or create slot in service_slots table
    let slotId = null;
    const [existingSlots] = await connection.query(
      'SELECT id, booked_count FROM service_slots WHERE service_center_id = ? AND slot_date = ? AND slot_time = ?',
      [service_center_id, booking_date, slot_time]
    );

    if (existingSlots.length > 0) {
      slotId = existingSlots[0].id;
      await connection.query(
        'UPDATE service_slots SET booked_count = booked_count + 1 WHERE id = ?',
        [slotId]
      );
    } else {
      const [slotInsert] = await connection.query(
        `INSERT INTO service_slots (service_center_id, slot_date, slot_time, max_capacity, booked_count)
         VALUES (?, ?, ?, ?, 1)`,
        [service_center_id, booking_date, slot_time, maxCapacity]
      );
      slotId = slotInsert.insertId;
    }

    // 4. Calculate total amount based on selected service_ids
    const [serviceRows] = await connection.query(
      `SELECT id, name, base_price FROM service_types WHERE id IN (?) AND is_active = TRUE`,
      [service_ids]
    );

    if (serviceRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid service selection.' });
    }

    const totalAmount = serviceRows.reduce((sum, s) => sum + parseFloat(s.base_price), 0);

    // 5. Generate unique booking code: VSB-YYYYMMDD-XXXX
    const dateStr = booking_date.replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `VSB-${dateStr}-${randSuffix}`;

    // 6. Insert booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (booking_code, user_id, vehicle_id, service_center_id, slot_id, booking_date, slot_time, status, notes, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'booked', ?, ?)`,
      [
        bookingCode,
        userId,
        vehicle_id,
        service_center_id,
        slotId,
        booking_date,
        slot_time,
        notes || null,
        totalAmount
      ]
    );

    const bookingId = bookingResult.insertId;

    // 7. Insert booking_services mapping
    for (const service of serviceRows) {
      await connection.query(
        'INSERT INTO booking_services (booking_id, service_type_id, price) VALUES (?, ?, ?)',
        [bookingId, service.id, service.base_price]
      );
    }

    // 8. Insert initial audit history log
    await connection.query(
      `INSERT INTO service_history_logs (booking_id, status_from, status_to, changed_by_user_id, comments)
       VALUES (?, NULL, 'booked', ?, 'Online booking confirmed via Customer Portal.')`,
      [bookingId, userId]
    );

    await connection.commit();

    // 9. Dispatch notifications (SMS & Email)
    await sendNotification({
      userId,
      bookingId,
      channel: 'sms',
      title: `Booking Confirmed #${bookingCode}`,
      message: `Your appointment for ${vehicle.make} ${vehicle.model} (${vehicle.reg_no}) at ${center.name} on ${booking_date} (${slot_time}) has been confirmed.`
    });

    await sendNotification({
      userId,
      bookingId,
      channel: 'email',
      title: `Service Booking Receipt #${bookingCode}`,
      message: `Thank you for scheduling with Apex Auto Hub. Your booking code is ${bookingCode}. Services: ${serviceRows.map(s => s.name).join(', ')}. Total Estimated: ₹${totalAmount.toFixed(2)}.`
    });

    res.status(201).json({
      success: true,
      message: 'Service appointment successfully booked!',
      booking: {
        id: bookingId,
        booking_code: bookingCode,
        total_amount: totalAmount,
        booking_date,
        slot_time
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete booking transaction.' });
  } finally {
    connection.release();
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { status, centerId, date, search } = req.query;

    let query = `
      SELECT
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        v.reg_no,
        v.make,
        v.model,
        v.year,
        v.fuel_type,
        sc.name as service_center_name,
        sc.city as service_center_city,
        ja.mechanic_user_id,
        m.name as mechanic_name,
        i.id as invoice_id,
        i.invoice_number,
        i.payment_status,
        i.grand_total as invoice_total
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN service_centers sc ON b.service_center_id = sc.id
      LEFT JOIN job_assignments ja ON b.id = ja.booking_id
      LEFT JOIN users m ON ja.mechanic_user_id = m.id
      LEFT JOIN invoices i ON b.id = i.booking_id
      WHERE 1=1
    `;

    const params = [];

    // Role filtering: customers only see their bookings
    if (req.user.role === 'customer') {
      query += ' AND b.user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'staff') {
      // Staff see assigned jobs or active bookings
      if (req.query.assignedOnly === 'true') {
        query += ' AND ja.mechanic_user_id = ?';
        params.push(req.user.id);
      }
    }

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (centerId) {
      query += ' AND b.service_center_id = ?';
      params.push(centerId);
    }

    if (date) {
      query += ' AND b.booking_date = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (b.booking_code LIKE ? OR v.reg_no LIKE ? OR u.name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY b.booking_date DESC, b.created_at DESC';

    const [bookings] = await db.query(query, params);

    // Fetch services for each booking
    if (bookings.length > 0) {
      const bookingIds = bookings.map(b => b.id);
      const [services] = await db.query(
        `SELECT bs.booking_id, st.id, st.name, st.category, bs.price
         FROM booking_services bs
         JOIN service_types st ON bs.service_type_id = st.id
         WHERE bs.booking_id IN (?)`,
        [bookingIds]
      );

      const servicesByBooking = {};
      services.forEach(s => {
        if (!servicesByBooking[s.booking_id]) servicesByBooking[s.booking_id] = [];
        servicesByBooking[s.booking_id].push(s);
      });

      bookings.forEach(b => {
        b.services = servicesByBooking[b.id] || [];
      });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
};

exports.getBookingByCodeOrId = async (req, res) => {
  try {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);
    const query = `
      SELECT
        b.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        v.reg_no,
        v.make,
        v.model,
        v.year,
        v.fuel_type,
        v.mileage,
        v.color,
        sc.name as service_center_name,
        sc.address as service_center_address,
        sc.city as service_center_city,
        sc.phone as service_center_phone,
        ja.id as assignment_id,
        ja.mechanic_user_id,
        m.name as mechanic_name,
        m.phone as mechanic_phone,
        i.id as invoice_id,
        i.invoice_number,
        i.payment_status,
        i.grand_total as invoice_total
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN service_centers sc ON b.service_center_id = sc.id
      LEFT JOIN job_assignments ja ON b.id = ja.booking_id
      LEFT JOIN users m ON ja.mechanic_user_id = m.id
      LEFT JOIN invoices i ON b.id = i.booking_id
      WHERE ${isNumeric ? 'b.id = ?' : 'b.booking_code = ?'}
    `;

    const [rows] = await db.query(query, [identifier]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = rows[0];

    // Check authorization: customer can only view their own
    if (req.user && req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    // Fetch services
    const [services] = await db.query(
      `SELECT bs.price, st.id, st.name, st.category, st.description, st.estimated_hours
       FROM booking_services bs
       JOIN service_types st ON bs.service_type_id = st.id
       WHERE bs.booking_id = ?`,
      [booking.id]
    );
    booking.services = services;

    // Fetch audit trail history logs
    const [history] = await db.query(
      `SELECT shl.*, u.name as changed_by_name, u.role as changed_by_role
       FROM service_history_logs shl
       LEFT JOIN users u ON shl.changed_by_user_id = u.id
       WHERE shl.booking_id = ?
       ORDER BY shl.created_at ASC`,
      [booking.id]
    );
    booking.history = history;

    // Fetch invoice if exists
    if (booking.invoice_id) {
      const [invoiceRows] = await db.query(
        'SELECT * FROM invoices WHERE id = ?',
        [booking.invoice_id]
      );
      if (invoiceRows.length > 0) {
        const [items] = await db.query(
          'SELECT * FROM invoice_items WHERE invoice_id = ?',
          [booking.invoice_id]
        );
        booking.invoice = { ...invoiceRows[0], items };
      }
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve booking details.' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (req.user.role === 'customer' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (['repair', 'quality_check', 'ready_for_delivery', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking currently in status '${booking.status}'. Service work has already commenced.`
      });
    }

    await db.query(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [id]
    );

    // Decrement slot count if slot exists
    if (booking.slot_id) {
      await db.query(
        'UPDATE service_slots SET booked_count = GREATEST(0, booked_count - 1) WHERE id = ?',
        [booking.slot_id]
      );
    }

    // Log history
    await db.query(
      `INSERT INTO service_history_logs (booking_id, status_from, status_to, changed_by_user_id, comments)
       VALUES (?, ?, 'cancelled', ?, ?)`,
      [id, booking.status, req.user.id, reason || 'Cancelled by user/admin']
    );

    // Notify customer
    await sendNotification({
      userId: booking.user_id,
      bookingId: booking.id,
      channel: 'email',
      title: `Booking Cancelled #${booking.booking_code}`,
      message: `Your booking #${booking.booking_code} has been cancelled. Reason: ${reason || 'Requested cancellation'}.`
    });

    res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
};
