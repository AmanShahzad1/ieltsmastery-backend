const cloudinary = require('../cloudinary');
const pool = require('../dbConfig'); // PostgreSQL connection
const { getListeningPartData, createListeningTest, getAllListeningTests, saveListeningTestPartData} = require("../models/testsModel");



// // Upload Audio File
// exports.uploadAudio = async (req, res) => {
//     try {
//         console.log("Audio Received")
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             resource_type: "video" // Audio is treated as video in Cloudinary
//         });

//         res.json({ audioUrl: result.secure_url });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Upload Image File
// exports.uploadImage = async (req, res) => {
//     try {
//         const result = await cloudinary.uploader.upload(req.file.path);
//         res.json({ imageUrl: result.secure_url });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Add Listening Material to Database
// exports.addListeningMaterial = async (req, res) => {
//     const { test_id, part_id, audio_url, image_url } = req.body;

//     try {
//         const result = await pool.query(
//             "INSERT INTO listening_materials (test_id, part_id, audio_url, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
//             [test_id, part_id, audio_url, image_url]
//         );

//         res.json(result.rows[0]);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // ✅ Fetch Listening Test Data (GET request)
// exports.getListeningData = async (req, res) => {
//     const { testId, partId } = req.params;
  
//     try {
//       const result = await pool.query(
//         "SELECT * FROM listening_materials WHERE test_id = $1 AND part_name = $2",
//         [testId, partId]
//       );
  
//       const questionsResult = await pool.query(
//         "SELECT * FROM listening_questions WHERE test_id = $1 AND part_name = $2",
//         [testId, partId]
//       );
  
//       res.json({
//         audioUrl: result.rows[0]?.audio_url || null,
//         imageUrls: result.rows.map(row => row.image_url),
//         questions: questionsResult.rows || []
//       });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
//   // ✅ Save Listening Test Data (POST request)
//   exports.saveListeningData = async (req, res) => {
//     const { testId, partId } = req.params;
//     const { questions } = req.body;
//     const audioUrl = req.body.audioUrl || null;
//     const imageUrls = req.body.imageUrls ? JSON.parse(req.body.imageUrls) : [];
  
//     try {
//       // Save audio & image URLs in listening_materials table
//       if (audioUrl || imageUrls.length > 0) {
//         await pool.query(
//           "INSERT INTO listening_materials (test_id, part_id, audio_url, image_url) VALUES ($1, $2, $3, unnest($4::text[]))",
//           [testId, partId, audioUrl, imageUrls]
//         );
//       }
  
//       // Save questions in listening_questions table
//       for (const question of questions) {
//         await pool.query(
//           "INSERT INTO listening_questions (test_id, part_id, question, answer) VALUES ($1, $2, $3, $4)",
//           [testId, partId, question.question, question.answer]
//         );
//       }
  
//       res.json({ success: true, message: "Listening Test Data Saved!" });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };


//   // Controller to handle GET request to fetch all tests
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
  // try {
  //   const { testId, partName } = req.params;
  //   const { questions, audioUrl, imageUrls } = req.body;
  //   await ListeningMaterial.upsert({ test_id: testId, part_name: partName, audio_url: audioUrl, image_url: JSON.stringify(imageUrls) });
  //   await ListeningQuestion.destroy({ where: { test_id: testId, part_name: partName } });
  //   await ListeningQuestion.bulkCreate(questions.map(q => ({ ...q, test_id: testId, part_name: partName })));
  //   res.json({ success: true, message: "Data saved successfully" });
  // } catch (error) {
  //   res.status(500).json({ message: "Error saving data", error });
  // }
  const { testId, partName } = req.params;
  const { questions, audioUrl, imageUrls } = req.body;
    console.log("Received data:", { testId, partName, questions, audioUrl, imageUrls });
    try {
      const response = await saveListeningTestPartData(testId, partName, questions, audioUrl, imageUrls);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.uploadAudio = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "video" });
    res.json({ audioUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Audio upload failed", error });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    const imageUrls = await Promise.all(req.files.map(file => cloudinary.uploader.upload(file.path).then(res => res.secure_url)));
    res.json({ imageUrls });
  } catch (error) {
    res.status(500).json({ message: "Image upload failed", error });
  }
};
