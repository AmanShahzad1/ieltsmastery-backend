const {createSpeakingTest,getAllSpeakingTests } = require("../models/testsModel");
const pool = require('../dbConfig'); // PostgreSQL connection
const {saveSpeakingTestData,getSpeakingTestData, getSpeakingTestType, saveSpeakingTestTypeData} = require("../models/testsModel");


exports.getSpeakingTests = async (req, res) => {
  //debugger;
     try {
       const tests = await getAllSpeakingTests();
       res.status(200).json(tests); // Return all tests
     } catch (error) {
       console.error("Error in getTests:", error);
       res.status(500).json({ error: "Failed to fetch tests" });
     }
   };
exports.createSpeakingTestController = async (req, res) => {
     const { name } = req.body;
  //debugger;
     if (!name) {
       return res.status(400).json({ error: "Test name is required" });
     }
  
     try {
       const newTest = await createSpeakingTest(name);
       res.status(201).json(newTest); // Return newly created test
     } catch (error) {
       console.error("Error in createTestController:", error);
       res.status(500).json({ error: "Failed to create test" });
     }
   };

   ///save speaking test
exports.saveSpeakingTest = async (req, res) => {
    const { testId, partName } = req.params;
    const { questions } = req.body;
  
    console.log("Received data:", { testId, partName, questions });
  
    try {
      const response = await saveSpeakingTestData(testId, partName, questions);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  //speaking test data
exports.getSpeakingDataTest = async (req, res) => {
    const { testId, partName } = req.params;
    console.log("Request received for Speaking Test: ", testId, partName);
  
    try {
      const data = await getSpeakingTestData(testId, partName);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in getSpeakingDataTest:", error);
      res.status(500).json({ error: error.message });
    }
  };

  exports.saveSpeakingAnswer = async (req, res) => {

    const { testId, questionId, userAnswer, score, feedback, userId } = req.body;
    console.log("In backend")
    console.log("Received", testId, questionId, userAnswer, score, feedback, userId);
    try {
      const newAnswer = await pool.query(
        "INSERT INTO speaking_answers (test_id, question_id, user_answer, score, feedback, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [testId, questionId, userAnswer, score, feedback, userId]
      );
      res.status(200).json(newAnswer.rows[0]);
    } catch (error) {
      res.status(500).json({ error: "Error saving speaking answer" });
    }
  };
  

// Plan Gen
exports.fetchSpeakingTestType = async (req, res) => {
  const { testId } = req.params;
  console.log("Request received type123: ", testId);
  try {
    const data = await getSpeakingTestType(testId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveSpeakingTestType = async (req, res) => {
  const { testId, type, difficulty } = req.body;
  console.log("Received data:", { testId, difficulty});
  try {
    const response = await saveSpeakingTestTypeData(testId, difficulty);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  
  
  
