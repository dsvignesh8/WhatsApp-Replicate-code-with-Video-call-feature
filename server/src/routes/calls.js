const express = require('express');
const {
  getCallHistory,
  getCall,
  updateCallStatus,
  deleteCall,
  clearCallHistory
} = require('../controllers/callController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getCallHistory)
  .delete(clearCallHistory);

router
  .route('/:id')
  .get(getCall)
  .put(updateCallStatus)
  .delete(deleteCall);

module.exports = router;
