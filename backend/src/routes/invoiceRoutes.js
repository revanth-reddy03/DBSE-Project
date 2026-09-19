const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', invoiceController.getAllInvoices);
router.get('/booking/:bookingId', invoiceController.getInvoiceByBooking);
router.patch('/:id/pay', invoiceController.markAsPaid);

module.exports = router;
