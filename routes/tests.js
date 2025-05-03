const express = require("express");
const multer = require('multer');
const fs = require('fs');
const { getTests,createTestController, fetchTestPartData, saveTestPart,savewritingTestPart, saveUserAnswer, fetchTestType, saveTestType} = require("../controllers/testsController");
const listeningController = require("../controllers/listeningController");
const writingController = require("../controllers/writingController");
const router = express.Router();

const{createSpeakingTestController,getSpeakingTests} = require("../controllers/speakingController");
const{saveSpeakingTest,getSpeakingDataTest, saveSpeakingAnswer}= require("../controllers/speakingController");

//Listening Test functionalities Start
// const upload = multer({ dest: 'uploads/' }); // Temporary storage

//Changes in Eid Holidays
// Configure multer with file size limits
const upload = multer({
    dest: 'uploads/',
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB for audio
      files: 1
    },
  });

// Cleanup middleware
const cleanupFile = (req, res, next) => {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err);
      });
    }
    next();
  };

router.get("/listening/:testId/:partName", listeningController.getListeningPart);
router.post("/listening/:testId/:partName", listeningController.saveListeningPart);
router.post("/upload-audio", 
    upload.single("audio"),
    // cleanupFile,
    listeningController.uploadAudio
  );
  router.post("/upload-image", 
    upload.single("image"),
    // cleanupFile,
    listeningController.uploadImage
  );
router.post("/saveListeningAnswer", listeningController.saveListeningAnswer);




// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Operation failed' 
    });
});

// // Route to get all tests
router.get("/listening/tests", listeningController.getListeningTests);

// // Route to create a new test
router.post("/listening/create", listeningController.createListeningTestController);
//Listening Test functionalities End


//Speaking Test
//get all tests
router.get("/speaking/tests", getSpeakingTests);
router.post("/speaking/:testId/:partName", saveSpeakingTest);


router.get("/speaking/:testId/:partName", getSpeakingDataTest);
router.post("/speaking/saveSpeakingAnswer", saveSpeakingAnswer);


// Writing Test Routes
// router.get("/writing/tests", writingController.getWritingTests); // Fetch all writing tests
// router.post("/writing/create", writingController.createWritingTest); // Create a new writing test
// router.get("/writing/:testId/:partName", writingController.getWritingPart); // Fetch writing part data
// router.post("/writing/:testId/:partName", writingController.saveWritingPart); // Save writing part data
// router.post("/upload-writing-image", upload.single("image"), writingController.uploadImage); // Upload image






//Speaking Test functionalities Start
// // Route to create a new test
router.post("/speaking/create", createSpeakingTestController);
//get all tests



//writingWork
// Route to get all tests
router.get("/writing", writingController.getwritingTests);

// Writing Test Routes
router.post("/writing/saveWritingAnswer", writingController.saveWritingAnswer);
// Writing LLM Api
router.post("/writing/saveWritingLLMResponse", writingController.saveWritingLLMResponse);



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
//Plan Gen
router.get("/type/:testId", fetchTestType);
router.post("/type/:testId", saveTestType);


// Get test part data (questions and reading material)
router.get("/:testId/:partName", fetchTestPartData);



// Save test part data (questions and reading material)
router.post("/:testId/:partName", saveTestPart);

// In your routes file
router.post("/saveUserAnswer", saveUserAnswer);

module.exports = router;

// // Route to fetch test data
// router.get("/reading/:testId", getTestData);

// // Route to create a new test
// router.post("/reading", createTestData);

// // Route to update an existing test
// router.put("/api/tests/reading/:testId", updateTestDataController);