
const { getAllTests, createTest, getTestPartData,saveTestPartData, saveAnswerToDatabase, getTestType, saveTestTypeData} = require("../models/testsModel");
const {getstartingTestData,addstartingAnswer} = require("../models/testsModel");

//starting test data
exports.getstartingDataTest = async (req, res) => {
  console.log("Request received for starting test data Test Data");
  try {
    console.log("Fetching starting test data...");
    const data = await getstartingTestData();  // no arguments
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getstartingDataTest:", error);
    res.status(500).json({ error: error.message });
  }
}; 
//add starting test answer
exports.addstartingTestAnswer = async (req, res) => {
  console.log("Request received to save starting test answer");
  const { uId, questionId, answer } = req.body;
  try {
    console.log("Saving starting test answer...");
    const result = await addstartingAnswer(uId, questionId, answer);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getstartingDataTest:", error);
    res.status(500).json({ error: error.message });
  }
};



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
  console.log("Request received part: ", testId, partName);
  try {
    const data = await getTestPartData(testId, partName);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.fetchTestType = async (req, res) => {
  const { testId } = req.params;
  console.log("Request received type123: ", testId);
  try {
    const data = await getTestType(testId);
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
exports.saveTestType = async (req, res) => {
  const { testId, type, difficulty } = req.body;
  console.log("Received data:", { testId, type, difficulty});
  try {
    const response = await saveTestTypeData(testId, type, difficulty);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// In your controller.js file
exports.saveUserAnswer = async (req, res) => {
  const { testId, questionId, userAnswer, partId, correctAnswer, userId} = req.body;
  
  // Check if the answer is correct
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  console.log("Storing answers",  { testId, questionId, userAnswer, partId, correctAnswer, isCorrect, userId });
  try {
    const newAnswer = await saveAnswerToDatabase({
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


