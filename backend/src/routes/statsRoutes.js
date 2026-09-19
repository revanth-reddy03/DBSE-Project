const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('admin', 'staff'));

router.get('/dashboard', statsController.getAdminDashboardStats);

module.exports = router;
