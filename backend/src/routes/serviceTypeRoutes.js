const express = require('express');
const router = express.Router();
const serviceTypeController = require('../controllers/serviceTypeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', serviceTypeController.getAllServices);
router.post('/', authenticateToken, authorizeRoles('admin'), serviceTypeController.createService);

module.exports = router;
