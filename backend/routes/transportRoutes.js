const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', transportController.getAllTransport);
router.post('/', authenticateToken, requireAdmin, transportController.createTransport);
router.delete('/:id', authenticateToken, requireAdmin, transportController.deleteTransport);

module.exports = router;
