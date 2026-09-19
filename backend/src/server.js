const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Vehicle Service Booking and Tracking API',
    course: '25CS1302E - Database Systems Engineering'
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/service-centers', require('./routes/serviceCenterRoutes'));
app.use('/api/services', require('./routes/serviceTypeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 handler for unknown endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚗 Vehicle Service Booking & Tracking Backend API`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`⚡ Health check:      http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
