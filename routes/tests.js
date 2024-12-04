const express = require("express");
const { getTests, createTestController } = require("../controllers/testsController");



const router = express.Router();

// Route to get all tests
router.get("/", getTests);

// Route to create a new test
router.post("/create", createTestController);

module.exports = router;
