// routes/plans.js
const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.post('/update-test', planController.updatePlanWithTest);

router.post('/assign', planController.assignPlan);
router.get('/user/:userId', planController.getUserPlan);
module.exports = router;