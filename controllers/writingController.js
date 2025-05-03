const pool = require("../dbConfig");
const cloudinary = require("../cloudinary");
const { getAllwritingTests,createwritingTest,savewritingTestPartData, getWritingTestType, saveWritingTestTypeData} = require("../models/testsModel");

// exports.getwritingTests = async (req, res) => {
//     try {
//       const tests = await getAllwritingTests();
//       res.status(200).json(tests); // Return all tests
//     } catch (error) {
//       console.error("Error in getTests:", error);
//       res.status(500).json({ error: "Failed to fetch tests" });
//     }
//   };
exports.getwritingTests = async (req, res) => {
    try {
      const tests = await getAllwritingTests();
      res.status(200).json(tests); // Return all tests
    } catch (error) {
      console.error("Error in getTests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  };
// Controller to handle POST request to create a new  writingtest
// exports.createwritingTestController = async (req, res) => {
//   const { name } = req.body;

//   if (!name) {
//     return res.status(400).json({ error: "Test name is required" });
//   }

//   try {
//     const newTest = await createwritingTest(name);
//     res.status(201).json(newTest); // Return newly created test
//   } catch (error) {
//     console.error("Error in createTestController:", error);
//     res.status(500).json({ error: "Failed to create test" });
//   }
// };
exports.createwritingTestController = async (req, res) => {
    const { name } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: "Test name is required" });
    }
  
    try {
      const newTest = await createwritingTest(name);
      res.status(201).json(newTest); // Return newly created test
    } catch (error) {
      console.error("Error in createTestController:", error);
      res.status(500).json({ error: "Failed to create test" });
    }
  };
exports.getWritingPart = async (req, res) => {
    const { testId, partName } = req.params;
    console.log("🟢 Writing Request received: ", testId, partName);
  
    try {
      const partRes = await pool.query(
        "SELECT id FROM writing_parts WHERE test_id = $1 AND partname = $2",
        [testId, partName]
      );
      
      const partId = partRes.rows[0]?.id;
      let questions = [];
      let material = "";
  
      if (partId) {
        // ✅ Fetch questions
        const questionsRes = await pool.query(
          "SELECT id, question_num, question FROM writing_questions WHERE test_id = $1 AND part_id = $2 ORDER BY question_num",
          [testId, partId]
        );
        questions = questionsRes.rows;
  
        // ✅ Fetch material
        const materialRes = await pool.query(
          "SELECT material FROM writing_material WHERE test_id = $1 AND part_id = $2",
          [testId, partId]
        );
        material = materialRes.rows[0]?.material || "";
      } else {
        console.warn("⚠️ No part found for given testId and partName");
      }
  
      // ✅ Send JSON response
      res.json({ questions, material });
    } catch (error) {
      console.error("❌ Error fetching writing part data:", error);
      res.status(500).json({ error: "Error fetching writing part data", details: error.message });
    }
  };
  
// Save writing part data
// exports.saveWritingPart = async (req, res) => {
//   const { testId, partName } = req.params;
//   const { questions, material } = req.body;

//   try {
//     // Fetch or create part
//     let partRes = await pool.query(
//       "SELECT id FROM writing_parts WHERE test_id = $1 AND partname = $2",
//       [testId, partName]
//     );
//     let partId = partRes.rows[0]?.id;

//     if (!partId) {
//       partRes = await pool.query(
//         "INSERT INTO writing_parts (test_id, partname) VALUES ($1, $2) RETURNING id",
//         [testId, partName]
//       );
//       partId = partRes.rows[0].id;
//     }

//     // Save questions
//     for (const question of questions) {
//       if (question.question.trim() !== "") {
//         await pool.query(
//           "INSERT INTO writing_Questions (test_id, part_id, question_num, question) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET question = $4",
//           [testId, partId, question.question_num || 1, question.question]
//         );
//       }
//     }

//     // Save material
//     await pool.query(
//       "INSERT INTO writing_material (test_id, part_id, material) VALUES ($1, $2, $3) ON CONFLICT (test_id, part_id) DO UPDATE SET material = $3",
//       [testId, partId, material]
//     );

//     res.status(200).json({ success: true });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to save writing part data" });
//   }
// };
exports.getWritingPart = async (req, res) => {
    const { testId, partName } = req.params;
    console.log("🟢 Writing Request received: ", testId, partName);
  
    try {
      const partRes = await pool.query(
        "SELECT id FROM writing_parts WHERE test_id = $1 AND partname = $2",
        [testId, partName]
      );
  
      const partId = partRes.rows[0]?.id;
      let questions = [];
      let material = "";
  
      if (partId) {
        // Fetch questions
        const questionsRes = await pool.query(
          "SELECT id, question_num, question FROM writing_questions WHERE test_id = $1 AND part_id = $2 ORDER BY question_num",
          [testId, partId]
        );
        questions = questionsRes.rows;
  
        // Fetch material (image URL)
        const materialRes = await pool.query(
          "SELECT material FROM writing_material WHERE test_id = $1 AND part_id = $2",
          [testId, partId]
        );
        material = materialRes.rows[0]?.material || ""; // Image URL is stored in the `material` column
      } else {
        console.warn("⚠️ No part found for given testId and partName");
      }
  
      // Send JSON response
      res.json({ questions, material });
    } catch (error) {
      console.error("❌ Error fetching writing part data:", error);
      res.status(500).json({ error: "Error fetching writing part data", details: error.message });
    }
  };
  
// Controller to save writingtest part data
// exports.savewritingTestPart = async (req, res) => {
//   const { testId, partName } = req.params; // Extract from URL parameters
//   const { questions, material } = req.body; // Extract from request body
//   console.log("Received data writing:", { testId, partName, questions, material });
//   try {
//     const response = await savewritingTestPartData(testId, partName, questions, material);
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// Controller to save writing test part data
exports.savewritingTestPart = async (req, res) => {
    const { testId, partName } = req.params; // Extract from URL parameters
    const { questions, material } = req.body; // Extract from request body
    console.log("Received data writing:", { testId, partName, questions, material });
  
    try {
      // Call the model function to save the data
      const response = await savewritingTestPartData(testId, partName, questions, material);
      res.status(200).json(response); // Send success response
    } catch (error) {
      res.status(500).json({ error: error.message }); // Send error response
    }
  };
// Upload image for writing test
// exports.uploadImage = async (req, res) => {
//   try {
//     const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
//     res.json({ imageUrl: result.secure_url });
//   } catch (error) {
//     res.status(500).json({ message: "Image upload failed", error });
//   }
// };
// Upload image for writing test
exports.uploadImage = async (req, res) => {
    try {
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
      const imageUrl = result.secure_url; // Get the image URL from Cloudinary
  
      // Return the image URL to the frontend
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Image upload failed", error });
    }
  };

// Save writing test results
// exports.saveWritingAnswer = async (req, res) => {
//   const { testId, questionId, userAnswer, partId, score } = req.body;
//   try {
//     const newAnswer = await pool.query(
//       "INSERT INTO writing_results (test_id, question_id, user_answer, part_id, score) VALUES ($1, $2, $3, $4, $5) RETURNING *",
//       [testId, questionId, userAnswer, partId, score]
//     );
//     res.status(200).json(newAnswer.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: "Error saving writing answer" });
//   }
// };
// Save writing test results
exports.saveWritingAnswer = async (req, res) => {

  const { testId, questionId, userAnswer, partId, score } = req.body;
  console.log("In backend")
  console.log("Received", testId, questionId, userAnswer, partId, score);
  try {
    const newAnswer = await pool.query(
      "INSERT INTO writing_results (test_id, question_id, user_answer, score) VALUES ($1, $2, $3, $4) RETURNING *",
      [testId, questionId, userAnswer, score]
    );
    res.status(200).json(newAnswer.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error saving writing answer" });
  }
};

// Save writing test results
exports.saveWritingLLMResponse = async (req, res) => {

  const { testId, questionId, feedback, partId, score } = req.body;
  console.log("In backend")
  console.log("Received", testId, questionId, feedback, partId, score);
  try {
    const newAnswer = await pool.query(
      "INSERT INTO writing_llm (test_id, question_id, feedback, score) VALUES ($1, $2, $3, $4) RETURNING *",
      [testId, questionId, feedback, score]
    );
    res.status(200).json(newAnswer.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error saving writing LLM response" });
  }
};

// Plan Gen
exports.fetchWritingTestType = async (req, res) => {
  const { testId } = req.params;
  console.log("Request received type123: ", testId);
  try {
    const data = await getWritingTestType(testId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveWritingTestType = async (req, res) => {
  const { testId, type, difficulty } = req.body;
  console.log("Received data:", { testId, type, difficulty});
  try {
    const response = await saveWritingTestTypeData(testId, type, difficulty);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};