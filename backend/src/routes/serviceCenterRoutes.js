const express = require('express');
const router = express.Router();
const serviceCenterController = require('../controllers/serviceCenterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', serviceCenterController.getAllCenters);
router.get('/:id/slots', serviceCenterController.getCenterSlots);
router.post('/', authenticateToken, authorizeRoles('admin'), serviceCenterController.createCenter);

module.exports = router;
