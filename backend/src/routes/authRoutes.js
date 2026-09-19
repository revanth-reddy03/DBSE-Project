const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/staff', authenticateToken, authorizeRoles('admin', 'staff'), authController.getStaffMembers);

module.exports = router;
