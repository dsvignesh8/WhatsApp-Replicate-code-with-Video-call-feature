const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Import status controller
const {
  getStatuses,
  createStatus,
  getStatus,
  deleteStatus,
  viewStatus,
  getStatusViewers
} = require('../controllers/statusController');

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getStatuses)
  .post(createStatus);

router
  .route('/:id')
  .get(getStatus)
  .delete(deleteStatus);

router.post('/:id/view', viewStatus);
router.get('/:id/viewers', getStatusViewers);

module.exports = router;
