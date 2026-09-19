const db = require('../config/db');

exports.getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Total counts
    const [[counts]] = await db.query(`
      SELECT
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status IN ('booked', 'checked_in', 'inspection', 'repair', 'quality_check', 'ready_for_delivery') THEN 1 ELSE 0 END) as active_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
      FROM bookings
    `);

    // 2. Revenue figures from invoices
    const [[revenue]] = await db.query(`
      SELECT
        COALESCE(SUM(grand_total), 0) as total_invoiced,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN grand_total ELSE 0 END), 0) as paid_revenue,
        COALESCE(SUM(CASE WHEN payment_status = 'unpaid' THEN grand_total ELSE 0 END), 0) as pending_revenue
      FROM invoices
    `);

    // 3. Status breakdown
    const [statusBreakdown] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM bookings
      GROUP BY status
    `);

    // 4. Center stats
    const [centerStats] = await db.query(`
      SELECT sc.id, sc.name, sc.city, sc.capacity_per_slot,
             COUNT(b.id) as total_bookings,
             SUM(CASE WHEN b.status IN ('booked', 'checked_in', 'inspection', 'repair', 'quality_check', 'ready_for_delivery') THEN 1 ELSE 0 END) as active_bookings
      FROM service_centers sc
      LEFT JOIN bookings b ON sc.id = b.service_center_id
      GROUP BY sc.id, sc.name, sc.city, sc.capacity_per_slot
    `);

    // 5. Recent audit history logs (latest 10)
    const [recentActivity] = await db.query(`
      SELECT shl.*, b.booking_code, u.name as user_name, v.reg_no, v.make, v.model
      FROM service_history_logs shl
      JOIN bookings b ON shl.booking_id = b.id
      JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN users u ON shl.changed_by_user_id = u.id
      ORDER BY shl.created_at DESC
      LIMIT 10
    `);

    // 6. Registered vehicles and users count
    const [[entityCounts]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'staff') as total_mechanics,
        (SELECT COUNT(*) FROM vehicles) as total_vehicles
    `);

    res.json({
      success: true,
      metrics: {
        totalBookings: counts.total_bookings,
        activeBookings: counts.active_bookings,
        completedBookings: counts.completed_bookings,
        cancelledBookings: counts.cancelled_bookings,
        totalInvoiced: parseFloat(revenue.total_invoiced),
        paidRevenue: parseFloat(revenue.paid_revenue),
        pendingRevenue: parseFloat(revenue.pending_revenue),
        totalCustomers: entityCounts.total_customers,
        totalMechanics: entityCounts.total_mechanics,
        totalVehicles: entityCounts.total_vehicles
      },
      statusBreakdown,
      centerStats,
      recentActivity
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve administrative statistics.' });
  }
};
