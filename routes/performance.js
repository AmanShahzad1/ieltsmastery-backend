const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Update user performance after test submission
router.post('/update-performance', performanceController.updatePerformance);
router.get('/user-performance/:userId', performanceController.getUserPerformance);
router.get('/historical-performance/:userId', performanceController.getHistoricalPerformance);


module.exports = router;