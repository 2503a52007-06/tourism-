const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/hotels', authenticateToken, bookingController.getHotelBookings);
router.post('/hotels', authenticateToken, bookingController.createHotelBooking);
router.post('/hotels/:id/cancel', authenticateToken, bookingController.cancelHotelBooking);

router.get('/transport', authenticateToken, bookingController.getTransportBookings);
router.post('/transport', authenticateToken, bookingController.createTransportBooking);
router.post('/transport/:id/cancel', authenticateToken, bookingController.cancelTransportBooking);

module.exports = router;
