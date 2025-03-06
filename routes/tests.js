const express = require("express");
const multer = require('multer');
const { getTests, createTestController, fetchTestPartData, saveTestPart, saveUserAnswer} = require("../controllers/testsController");
const listeningController = require("../controllers/listeningController");
const router = express.Router();

//Listening Test functionalities Start
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// router.post("/upload-audio", upload.single("audio"), uploadAudio);
// router.post("/upload-image", upload.single("image"), uploadImage);
// router.post("/add-listening-material", addListeningMaterial);

// // ✅ New routes for full listening test data
// router.get("/listening/:testId/:partId", getListeningData);  // Fetch data
// router.post("/listening/:testId/:partId", upload.none(), saveListeningData); // Save data
router.get("/listening/:testId/:partName", listeningController.getListeningPart);
router.post("/listening/:testId/:partName", listeningController.saveListeningPart);
router.post("/upload-audio", upload.single("audio"), listeningController.uploadAudio);
router.post("/upload-image", upload.array("images"), listeningController.uploadImages);







// // Route to get all tests
router.get("/listening/tests", listeningController.getListeningTests);

// // Route to create a new test
router.post("/listening/create", listeningController.createListeningTestController);

//Listening Test functionalities End




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
