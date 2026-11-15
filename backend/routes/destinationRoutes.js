const express = require('express');
const router = express.Router();
const destController = require('../controllers/destinationController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', destController.getAllDestinations);
router.get('/:id', destController.getDestinationById);
router.post('/', authenticateToken, requireAdmin, destController.createDestination);
router.put('/:id', authenticateToken, requireAdmin, destController.updateDestination);
router.delete('/:id', authenticateToken, requireAdmin, destController.deleteDestination);

module.exports = router;
