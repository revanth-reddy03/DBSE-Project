const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/:identifier', bookingController.getBookingByCodeOrId);
router.patch('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
