const cloudinary = require('../cloudinary');
const pool = require('../dbConfig'); // PostgreSQL connection
const { getListeningPartData, createListeningTest, getAllListeningTests, saveListeningTestPartData, saveListeningAnswerToDatabase, saveListeningTestTypeData, getListeningTestType} = require("../models/testsModel");

// Controller to handle GET request to fetch all tests
exports.getListeningTests = async (req, res) => {
     try {
       const tests = await getAllListeningTests();
       res.status(200).json(tests); // Return all tests
     } catch (error) {
       console.error("Error in getTests:", error);
       res.status(500).json({ error: "Failed to fetch tests" });
     }
   };
  
   // Controller to handle POST request to create a new test
   exports.createListeningTestController = async (req, res) => {
     const { name } = req.body;
  
     if (!name) {
       return res.status(400).json({ error: "Test name is required" });
     }
  
     try {
       const newTest = await createListeningTest(name);
       res.status(201).json(newTest); // Return newly created test
     } catch (error) {
       console.error("Error in createTestController:", error);
       res.status(500).json({ error: "Failed to create test" });
     }
   };
  



exports.getListeningPart = async (req, res) => {
// Controller to fetch test part data
  const { testId, partName } = req.params;
  console.log("Request received: ", testId, partName);
  try {
    const data = await getListeningPartData(testId, partName);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.saveListeningPart = async (req, res) => {
 
  const { testId, partName } = req.params;
  const { questions, audioUrl, imageUrl } = req.body;
    console.log("Received data:", { testId, partName, questions, audioUrl, imageUrl });
    try {
      const response = await saveListeningTestPartData(testId, partName, questions, audioUrl, imageUrl);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.uploadAudio = async (req, res) => {
  try {
    console.log("Audio received");
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "video" });
    res.json({ audioUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Audio upload failed", error });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    console.log("Image received");
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error });
  }
};



//Save listening results
exports.saveListeningAnswer = async (req, res) => {
  const { testId, questionId, userAnswer, partId, correctAnswer, userId } = req.body;
  console.log("In backend");
  // Check if the answer is correct
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  console.log("Storing answers",  { testId, questionId, userAnswer, partId, correctAnswer, isCorrect });
  try {
    const newAnswer = await saveListeningAnswerToDatabase({
      testId,
      questionId,
      userAnswer,
      partId,
      correctAnswer,
      isCorrect,
      userId
    });

    res.status(200).json(newAnswer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Plan Gen
exports.fetchListeningTestType = async (req, res) => {
  const { testId } = req.params;
  console.log("Request received type123: ", testId);
  try {
    const data = await getListeningTestType(testId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveListeningTestType = async (req, res) => {
  const { testId, type, difficulty } = req.body;
  console.log("Received data:", { testId, difficulty});
  try {
    const response = await saveListeningTestTypeData(testId, difficulty);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};