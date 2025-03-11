const { getAllTests, createTest, getTestPartData,saveTestPartData, saveAnswerToDatabase} = require("../models/testsModel");


// Controller to handle GET request to fetch all tests
exports.getTests = async (req, res) => {
  try {
    const tests = await getAllTests();
    res.status(200).json(tests); // Return all tests
  } catch (error) {
    console.error("Error in getTests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

// Controller to handle POST request to create a new test
exports.createTestController = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Test name is required" });
  }

  try {
    const newTest = await createTest(name);
    res.status(201).json(newTest); // Return newly created test
  } catch (error) {
    console.error("Error in createTestController:", error);
    res.status(500).json({ error: "Failed to create test" });
  }
};


  
//Controller to fetch test part data
exports.fetchTestPartData = async (req, res) => {
  const { testId, partName } = req.params;
  console.log("Request received: ", testId, partName);
  try {
    const data = await getTestPartData(testId, partName);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to save test part data
exports.saveTestPart = async (req, res) => {
  const { testId, partName, questions, readingMaterial } = req.body;
  console.log("Received data:", { testId, partName, questions, readingMaterial });
  try {
    const response = await saveTestPartData(testId, partName, questions, readingMaterial);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Controller to save test part data
exports.saveTestPart = async (req, res) => {
  const { testId, partName, questions, readingMaterial } = req.body;
  console.log("Received data:", { testId, partName, questions, readingMaterial });
  try {
    const response = await saveTestPartData(testId, partName, questions, readingMaterial);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In your controller.js file
exports.saveUserAnswer = async (req, res) => {
  const { testId, questionId, userAnswer, partId, correctAnswer } = req.body;
  
  // Check if the answer is correct
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  console.log("Storing answers",  { testId, questionId, userAnswer, partId, correctAnswer, isCorrect });
  try {
    const newAnswer = await saveAnswerToDatabase({
      testId,
      questionId,
      userAnswer,
      partId,
      correctAnswer,
      isCorrect,
    });

    res.status(200).json(newAnswer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


