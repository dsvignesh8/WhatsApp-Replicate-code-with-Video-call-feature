const express = require('express');
const {
  getUsers,
  updateUserRole,
  getAnalytics,
  getReports,
  handleReport,
  toggleUserBan
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

// User management routes
router
  .route('/users')
  .get(getUsers);

router
  .route('/users/:id/role')
  .put(updateUserRole);

router
  .route('/users/:id/ban')
  .put(toggleUserBan);

// Analytics routes
router
  .route('/analytics')
  .get(getAnalytics);

// Content moderation routes
router
  .route('/reports')
  .get(getReports);

router
  .route('/reports/:id')
  .put(handleReport);

// System monitoring routes
router.get('/system-status', (req, res) => {
  const status = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    platform: process.platform,
    nodeVersion: process.version,
    activeConnections: req.app.get('socketHandler').connectedUsers.size,
    activeCalls: req.app.get('webRTC').getCallStats()
  };

  res.status(200).json({
    success: true,
    data: status
  });
});

// Backup routes (for future implementation)
router.post('/backup', (req, res) => {
  // TODO: Implement database backup functionality
  res.status(501).json({
    success: false,
    error: 'Backup functionality not implemented yet'
  });
});

router.post('/restore', (req, res) => {
  // TODO: Implement database restore functionality
  res.status(501).json({
    success: false,
    error: 'Restore functionality not implemented yet'
  });
});

// Settings routes
router.get('/settings', (req, res) => {
  // TODO: Implement system settings retrieval
  res.status(501).json({
    success: false,
    error: 'Settings functionality not implemented yet'
  });
});

router.put('/settings', (req, res) => {
  // TODO: Implement system settings update
  res.status(501).json({
    success: false,
    error: 'Settings update functionality not implemented yet'
  });
});

// Export router
module.exports = router;
