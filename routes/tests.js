const express = require("express");
const multer = require('multer');
const { getTests,createTestController, fetchTestPartData, saveTestPart,savewritingTestPart, saveUserAnswer} = require("../controllers/testsController");
const listeningController = require("../controllers/listeningController");
const writingController = require("../controllers/writingController");
const router = express.Router();
// writing work
// const writingController = require("../controllers/writingController");
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
router.post("/upload-image", upload.single("image"), listeningController.uploadImage);
router.post("/saveListeningAnswer", listeningController.saveListeningAnswer);

// writing test work
// const writingController = require("../controllers/writingController");


// Writing Test Routes
// router.get("/writing/tests", writingController.getWritingTests); // Fetch all writing tests
// router.post("/writing/create", writingController.createWritingTest); // Create a new writing test
// router.get("/writing/:testId/:partName", writingController.getWritingPart); // Fetch writing part data
// router.post("/writing/:testId/:partName", writingController.saveWritingPart); // Save writing part data
// router.post("/upload-writing-image", upload.single("image"), writingController.uploadImage); // Upload image




// // Route to get all tests
router.get("/listening/tests", listeningController.getListeningTests);

// // Route to create a new test
router.post("/listening/create", listeningController.createListeningTestController);

//Listening Test functionalities End

//writingWork
// Route to get all tests
router.get("/writing", writingController.getwritingTests);

// Writing Test Routes
router.post("/writing/saveWritingAnswer", writingController.saveWritingAnswer);


// Route to create a new test
router.post("/createwriting", writingController.createwritingTestController);

// Save test part data (questions and reading material)
router.get("/writingPart/part/:testId/:partName", writingController.getWritingPart);
router.post("/writing/:testId/:partName", writingController.savewritingTestPart);
router.post("/upload-image", upload.single("file"), writingController.uploadImage);

// Route to get all tests
router.get("/", getTests);

// Route to create a new test
router.post("/create", createTestController);



// Get test part data (questions and reading material)
router.get("/:testId/:partName", fetchTestPartData);

// Save test part data (questions and reading material)
// router.post("/:testId/:partName", saveTestPart);

// In your routes file
router.post("/saveUserAnswer", saveUserAnswer);

module.exports = router;

// // Route to fetch test data
// router.get("/reading/:testId", getTestData);

// // Route to create a new test
// router.post("/reading", createTestData);

// // Route to update an existing test
// router.put("/api/tests/reading/:testId", updateTestDataController);