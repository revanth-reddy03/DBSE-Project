const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Assign mechanic (Admin only)
router.post('/assign/:bookingId', authorizeRoles('admin'), jobController.assignMechanic);

// Update status (Admin and Staff/Mechanics)
router.patch('/status/:bookingId', authorizeRoles('admin', 'staff'), jobController.updateJobStatus);

// Add parts or labor (Admin and Staff/Mechanics)
router.post('/parts/:bookingId', authorizeRoles('admin', 'staff'), jobController.addPartsOrLabor);

module.exports = router;
