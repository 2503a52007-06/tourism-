const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/stats', authenticateToken, requireAdmin, adminController.getStats);
router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, adminController.updateUserRole);
router.delete('/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);

module.exports = router;
