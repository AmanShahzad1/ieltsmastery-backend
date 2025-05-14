const pool = require("../dbConfig");
const cloudinary = require("../cloudinary");
const { getAllTests, createTest, getTestPartData, saveTestPartData, saveAnswerToDatabase, getTestType, saveTestTypeData } = require("../models/testsModel");
const { getstartingTestData, addstartingAnswer } = require("../models/testsModel");

// Starting test data (unchanged)
exports.getstartingDataTest = async (req, res) => {
  console.log("Request received for starting test data Test Data");
  try {
    console.log("Fetching starting test data...");
    const data = await getstartingTestData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getstartingDataTest:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add starting test answer (unchanged)
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

// Get all tests (unchanged)
exports.getTests = async (req, res) => {
  try {
    const tests = await getAllTests();
    res.status(200).json(tests);
  } catch (error) {
    console.error("Error in getTests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

// Create test (unchanged)
exports.createTestController = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Test name is required" });
  }

  try {
    const newTest = await createTest(name);
    res.status(201).json(newTest);
  } catch (error) {
    console.error("Error in createTestController:", error);
    res.status(500).json({ error: "Failed to create test" });
  }
};

// Enhanced to fetch reading image
// In testcontroller.js
exports.fetchTestPartData = async (req, res) => {
  const { testId, partName } = req.params;

  try {
    const partRes = await pool.query(
      "SELECT id FROM parts WHERE test_id = $1 AND part_name = $2",
      [testId, partName]
    );

    const partId = partRes.rows[0]?.id;
    let questions = [];
    let material = "";
    let readingimage = "";

    if (partId) {
      // Fetch questions
      const questionsRes = await pool.query(
        "SELECT id, question_number, question, answer FROM questions WHERE test_id = $1 AND part_id = $2 ORDER BY question_number",
        [testId, partId]
      );
      questions = questionsRes.rows;

      // Fetch reading material and image
      const materialRes = await pool.query(
        "SELECT material, readingimage FROM reading_materials WHERE test_id = $1 AND part_id = $2",
        [testId, partId]
      );
      
      // Return both material text and image URL
      material = materialRes.rows[0]?.material || "";
      readingimage = materialRes.rows[0]?.readingimage || "";
    }
    
    res.json({ 
      questions, 
      material, // Keep as 'material' for backward compatibility
      readingimage 
    });
  } catch (error) {
    console.error("Error fetching reading part data:", error);
    res.status(500).json({ 
      error: "Error fetching reading part data", 
      details: error.message 
    });
  }
};
// Enhanced to handle image uploads
exports.saveTestPart = async (req, res) => {
  const { testId, partName, questions, readingMaterial, readingimage } = req.body;
  console.log("🟢 Saving reading part with image:", { readingimage });

  try {
    const response = await saveTestPartData(
      testId, 
      partName, 
      questions, 
      readingMaterial,
      readingimage // Pass the image URL to the model
    );
    
    res.status(200).json({
      success: true,
      readingimage: response.readingimage || readingimage
    });
  } catch (error) {
    console.error("❌ Error saving reading part:", error);
    res.status(500).json({ 
      success: false,
      error: "Error saving reading part",
      details: error.message 
    });
  }
};

// New controller for reading image upload
exports.uploadReadingImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, { 
      resource_type: "image",
      folder: "ielts-reading-images" // Add folder for organization
    });

    res.json({ 
      success: true,
      readingimage: result.secure_url 
    });
  } catch (error) {
    console.error("Image upload failed:", error);
    res.status(500).json({ 
      success: false,
      message: "Image upload failed", 
      error: error.message 
    });
  }
};
// New controller for deleting reading image
exports.deleteReadingImage = async (req, res) => {
  const { testId, partName } = req.body;

  try {
    // First find the part ID
    const partRes = await pool.query(
      "SELECT id FROM reading_parts WHERE test_id = $1 AND partname = $2",
      [testId, partName]
    );

    if (!partRes.rows[0]) {
      return res.status(404).json({ error: "Part not found" });
    }

    const partId = partRes.rows[0].id;

    // Update the record to remove the image
    await pool.query(
      "UPDATE reading_materials SET readingimage = NULL WHERE test_id = $1 AND part_id = $2 RETURNING *",
      [testId, partId]
    );

    res.json({ 
      success: true,
      message: "Reading image deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting reading image:", error);
    res.status(500).json({ 
      success: false,
      error: "Error deleting reading image",
      details: error.message 
    });
  }
};

// Existing controllers (unchanged)
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

exports.saveUserAnswer = async (req, res) => {
  const { testId, questionId, userAnswer, partId, correctAnswer } = req.body;
  
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  console.log("Storing answers", { testId, questionId, userAnswer, partId, correctAnswer, isCorrect });
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