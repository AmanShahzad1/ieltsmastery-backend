const express = require("express");
const { getTests, createTestController, fetchTestPartData, saveTestPart, saveUserAnswer} = require("../controllers/testsController");



const router = express.Router();

// Route to get all tests
router.get("/", getTests);

// Route to create a new test
router.post("/create", createTestController);


// // Route to fetch test data
// router.get("/reading/:testId", getTestData);

// // Route to create a new test
// router.post("/reading", createTestData);

// // Route to update an existing test
// router.put("/api/tests/reading/:testId", updateTestDataController);

// Get test part data (questions and reading material)
router.get("/:testId/:partName", fetchTestPartData);

// Save test part data (questions and reading material)
router.post("/:testId/:partName", saveTestPart);

// In your routes file
router.post("/saveUserAnswer", saveUserAnswer);

module.exports = router;
