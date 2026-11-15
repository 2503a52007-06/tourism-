const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/', authenticateToken, requireAdmin, hotelController.createHotel);
router.put('/:id', authenticateToken, requireAdmin, hotelController.updateHotel);
router.patch('/:id/availability', authenticateToken, requireAdmin, hotelController.updateAvailability);
router.delete('/:id', authenticateToken, requireAdmin, hotelController.deleteHotel);

module.exports = router;
