const {createSpeakingTest,getAllSpeakingTests } = require("../models/testsModel");
const pool = require('../dbConfig'); // PostgreSQL connection
const {saveSpeakingTestData,getSpeakingTestData} = require("../models/testsModel");


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
  
  
  
  
