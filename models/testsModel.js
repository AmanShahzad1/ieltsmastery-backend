const pool = require("../dbConfig");
// Model to fetch all tests
exports.getAllTests = async () => {
  try {
    const result = await pool.query("SELECT * FROM tests");
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};






// Model to create a new test
exports.createTest = async (name) => {
  try {
    const result = await pool.query(
      "INSERT INTO tests (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0]; // Return the created test
  } catch (error) {
    throw new Error("Error creating test: " + error.message);
  }
};



// // Fetching a test by ID, including its parts, questions, and reading materials
// exports.fetchTestData = async (testId) => {
//     try {
//       const testQuery = `
//         SELECT id, name FROM tests WHERE id = $1;
//       `;
//       const testResult = await pool.query(testQuery, [testId]);
  
//       if (testResult.rows.length === 0) return null; // No test found
  
//       const test = testResult.rows[0];
  
//       // Fetching parts of the test
//       const partsQuery = `
//         SELECT id, part_name FROM parts WHERE test_id = $1;
//       `;
//       const partsResult = await pool.query(partsQuery, [testId]);
  
//       const parts = partsResult.rows;
  
//       // Fetching questions for each part
//       const questionsQuery = `
//         SELECT question, answer, question_number FROM questions WHERE test_id = $1 ORDER BY question_number;
//       `;
//       const questionsResult = await pool.query(questionsQuery, [testId]);
  
//       const questions = questionsResult.rows;
  
//       // Fetching reading materials for each part
//       const readingMaterialsQuery = `
//         SELECT material, part_id FROM reading_materials WHERE test_id = $1;
//       `;
//       const readingMaterialsResult = await pool.query(readingMaterialsQuery, [testId]);
  
//       const readingMaterials = readingMaterialsResult.rows;
  
//       return {
//         id: test.id,
//         name: test.name,
//         parts,
//         questions,
//         readingMaterials,
//       };
//     } catch (error) {
//       console.error("Error fetching test data:", error);
//       throw error;
//     }
//   };
  
//   // Save test data: create a new test, its parts, questions, and reading materials
//   exports.saveTestData = async (testData) => {
//     const { name, parts, questions, readingMaterials } = testData;
//     const client = await pool.connect();
//     try {
//       await client.query("BEGIN");
  
//       // Insert into tests table
//       const testQuery = `
//         INSERT INTO tests (name) VALUES ($1) RETURNING id;
//       `;
//       const testResult = await client.query(testQuery, [name]);
//       const testId = testResult.rows[0].id;
  
//       // Insert parts for the test
//       const partPromises = parts.map((partName) => {
//         const partQuery = `
//           INSERT INTO parts (test_id, part_name) VALUES ($1, $2) RETURNING id;
//         `;
//         return client.query(partQuery, [testId, partName]);
//       });
//       const partResults = await Promise.all(partPromises);
//       const partIds = partResults.map((result) => result.rows[0].id);
  
//       // Insert questions for the test
//       const questionPromises = questions.map((questionData, index) => {
//         const { question, answer } = questionData;
//         const questionQuery = `
//           INSERT INTO questions (test_id, question, answer, question_number) VALUES ($1, $2, $3, $4);
//         `;
//         return client.query(questionQuery, [testId, question, answer, index + 1]);
//       });
//       await Promise.all(questionPromises);
  
//       // Insert reading materials for the test
//       const materialPromises = readingMaterials.map((material, index) => {
//         const materialQuery = `
//           INSERT INTO reading_materials (test_id, part_id, material) VALUES ($1, $2, $3);
//         `;
//         return client.query(materialQuery, [testId, partIds[index], material]);
//       });
//       await Promise.all(materialPromises);
  
//       await client.query("COMMIT");
  
//       return { id: testId, name };
//     } catch (error) {
//       await client.query("ROLLBACK");
//       console.error("Error saving test data:", error);
//       throw error;
//     } finally {
//       client.release();
//     }
//   };
  
//   // Update test data: update questions, answers, and reading materials
//   exports.updateTestData = async (testData) => {
//     const { testId, name, parts, questions, readingMaterials } = testData;
//     const client = await pool.connect();
//     try {
//       await client.query("BEGIN");
  
//       // Update the test name
//       const testQuery = `
//         UPDATE tests SET name = $1 WHERE id = $2;
//       `;
//       await client.query(testQuery, [name, testId]);
  
//       // Delete existing parts, questions, and reading materials before updating
//       await client.query("DELETE FROM parts WHERE test_id = $1", [testId]);
//       await client.query("DELETE FROM questions WHERE test_id = $1", [testId]);
//       await client.query("DELETE FROM reading_materials WHERE test_id = $1", [testId]);
  
//       // Insert the updated parts
//       const partPromises = parts.map((partName) => {
//         const partQuery = `
//           INSERT INTO parts (test_id, part_name) VALUES ($1, $2) RETURNING id;
//         `;
//         return client.query(partQuery, [testId, partName]);
//       });
//       const partResults = await Promise.all(partPromises);
//       const partIds = partResults.map((result) => result.rows[0].id);
  
//       // Insert updated questions
//       const questionPromises = questions.map((questionData, index) => {
//         const { question, answer } = questionData;
//         const questionQuery = `
//           INSERT INTO questions (test_id, question, answer, question_number) VALUES ($1, $2, $3, $4);
//         `;
//         return client.query(questionQuery, [testId, question, answer, index + 1]);
//       });
//       await Promise.all(questionPromises);
  
//       // Insert updated reading materials
//       const materialPromises = readingMaterials.map((material, index) => {
//         const materialQuery = `
//           INSERT INTO reading_materials (test_id, part_id, material) VALUES ($1, $2, $3);
//         `;
//         return client.query(materialQuery, [testId, partIds[index], material]);
//       });
//       await Promise.all(materialPromises);
  
//       await client.query("COMMIT");
  
//       return { id: testId, name };
//     } catch (error) {
//       await client.query("ROLLBACK");
//       console.error("Error updating test data:", error);
//       throw error;
//     } finally {
//       client.release();
//     }

//   };
  

exports.getTestPartData = async (testId, partName) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch the part ID first
    const partRes = await client.query(
      `SELECT id FROM parts WHERE test_id = $1 AND part_name = $2`,
      [testId, partName]
    );
    const partId = partRes.rows[0]?.id;

    let questions = [];
    let readingMaterial = "";

    if (partId) {
      // Fetch all questions for this part if part ID exists
      const questionsRes = await client.query(
        `SELECT id, question, answer, question_number
         FROM questions
         WHERE test_id = $1 AND part_id = $2
         ORDER BY question_number`,
        [testId, partId]
      );
      questions = questionsRes.rows;

      // Fetch the reading material for this part
      const materialRes = await client.query(
        `SELECT material
         FROM reading_materials
         WHERE test_id = $1 AND part_id = $2`,
        [testId, partId]
      );
      readingMaterial = materialRes.rows[0]?.material || "";
    }

    await client.query('COMMIT');

    return {
      questions: questions,
      readingMaterial: readingMaterial
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fetching data for test part:", error);
    return {
      questions: [],
      readingMaterial: ""
    };  // Return empty defaults in case of error
  } finally {
    client.release();
  }
};


// Save or update the test part data
exports.saveTestPartData = async (testId, partName, questions, readingMaterial) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch partId or create new part if not exists
    let partResult = await client.query(`SELECT id FROM parts WHERE test_id = $1 AND part_name = $2`, [testId, partName]);
    let partId = partResult.rows[0]?.id;
    if (!partId) {
      partResult = await client.query(`INSERT INTO parts (test_id, part_name) VALUES ($1, $2) RETURNING id`, [testId, partName]);
      partId = partResult.rows[0].id;
    }

    // Fetch the highest current question number for this part
    const countResult = await client.query(`SELECT MAX(question_number) AS max_number FROM questions WHERE test_id = $1 AND part_id = $2`, [testId, partId]);
    let currentQuestionNumber = countResult.rows[0].max_number || 0;

    // Process each question
    questions.forEach(async (question) => {
      if (question.question.trim() !== '') {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO questions (test_id, part_id, question, answer, question_number) VALUES ($1, $2, $3, $4, $5)`,
            [testId, partId, question.question, question.answer, currentQuestionNumber]
          );
        } else {
          await client.query(`UPDATE questions SET question = $1, answer = $2, question_number = $3 WHERE id = $4`, [question.question, question.answer, currentQuestionNumber, question.id]);
        }
      }
    });

    // Insert or update reading material
    await client.query(
      `INSERT INTO reading_materials (test_id, part_id, material) VALUES ($1, $2, $3) ON CONFLICT (test_id, part_id) DO UPDATE SET material = EXCLUDED.material`,
      [testId, partId, readingMaterial]
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};


//Saving User answers
exports.saveAnswerToDatabase = async ({ testId, questionId, userAnswer, partId, correctAnswer, isCorrect }) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO results (test_id, question_id, user_answer, correct_answer, is_correct)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at, updated_at`,
      [testId, questionId, userAnswer, correctAnswer, isCorrect]
    );
    
    return result.rows[0];  // Return the saved answer row
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error("Error saving user answer.");
  } finally {
    client.release();
  }
};
//Speaking 
exports.createSpeakingTest = async (name) => {
  try {
    const result = await pool.query(
      "INSERT INTO speaking_test (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0]; // Return the created test
  } catch (error) {
    throw new Error("Error creating test: " + error.message);
  }
};
//  fetch speaking  tests
exports.getAllSpeakingTests = async () => {
  try {
    const result = await pool.query("SELECT * FROM speaking_test");
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};






//-----------------------------------------------------------------------
// Model to fetch Listening all tests
exports.getAllListeningTests = async () => {
  try {
    const result = await pool.query("SELECT * FROM listening_tests");
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};

// Model to create a new test
exports.createListeningTest = async (name) => {
  try {
    const result = await pool.query(
      "INSERT INTO listening_tests (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0]; // Return the created test
  } catch (error) {
    throw new Error("Error creating test: " + error.message);
  }
};


//Listening Part
exports.getListeningPartData = async (testId, partName) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch the part ID first
    const partRes = await client.query(
      `SELECT id FROM listening_parts WHERE test_id = $1 AND part_name = $2`,
      [testId, partName]
    );
    const partId = partRes.rows[0]?.id;

    let questions = [];
    let audioUrl = "";
    let imageUrl = "";

    if (partId) {
      // Fetch all questions for this part if part ID exists
      const questionsRes = await client.query(
        `SELECT id, question, answer, question_number
         FROM listening_questions
         WHERE test_id = $1 AND part_id = $2
         ORDER BY question_number`,
        [testId, partId]
      );
      questions = questionsRes.rows;

      // Fetch the reading material for this part
      const materialRes = await client.query(
        `SELECT audio_url, image_url
         FROM listening_materials
         WHERE test_id = $1 AND part_id = $2`,
        [testId, partId]
      );
      if (materialRes.rows.length > 0) {
        audioUrl = materialRes.rows[0].audio_url || "";
        imageUrl = materialRes.rows[0].image_url || "";
      }
    }

    await client.query('COMMIT');

    return {
      questions: questions,
      audioUrl: audioUrl,
      imageUrl: imageUrl
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fetching data for test part:", error);
    return {
      questions: [],
      audioUrl: "",
      imageUrl: ""
    };  // Return empty defaults in case of error
  } finally {
    client.release();
  }
};
//save speaking test

exports.saveSpeakingTestData = async (testId, questions) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log("In database function");

    // Fetch existing speaking questions for this test
    const existingQuestionsResult = await client.query(
      `SELECT id FROM speaking_questions WHERE test_id = $1`, 
      [testId]
    );
    const existingQuestionIds = existingQuestionsResult.rows.map(row => row.id);

    // Insert or update questions
    for (const [index, question] of questions.entries()) {
      if (question.question.trim() !== '') {
        if (!question.id) {
          // Insert new question
          await client.query(
            `INSERT INTO speaking_questions (test_id, questions) VALUES ($1, $2)`,
            [testId, JSON.stringify({ question: question.question, answer: question.answer })]
          );
        } else {
          // Update existing question
          await client.query(
            `UPDATE speaking_questions SET questions = $1 WHERE id = $2`, 
            [JSON.stringify({ question: question.question, answer: question.answer }), question.id]
          );
          // Remove the ID from existing list (to track deletions)
          const indexToRemove = existingQuestionIds.indexOf(question.id);
          if (indexToRemove !== -1) existingQuestionIds.splice(indexToRemove, 1);
        }
      }
    }
    // Delete removed questions
    if (existingQuestionIds.length > 0) {
      await client.query(
        `DELETE FROM speaking_questions WHERE id = ANY($1)`, 
        [existingQuestionIds]
      );
    }

    console.log("Questions inserted/updated");
    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error saving speaking test data: ${error.message}`);
  } finally {
    client.release();
  }
};
   //fetch speaking
   exports.getSpeakingTestData = async (testId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Fetch all speaking questions for the test
      const questionsRes = await client.query(
        `SELECT id, questions FROM speaking_questions WHERE test_id = $1`,
        [testId]
      );
  
      let questions = [];
      if (questionsRes.rows.length > 0) {
        questions = questionsRes.rows.map(row => row.questions); // Extract JSONB questions
      }
  
      await client.query('COMMIT');
  
      return { questions };
  
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error fetching speaking test data:", error);
      return { questions: [] }; // Return empty in case of error
    } finally {
      client.release();
    }
  };

// Save or update the test part data
exports.saveListeningTestPartData = async (testId, partName, questions, audioUrl, imageUrl) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log("In database function");

    // Fetch partId or create new part if not exists
    let partResult = await client.query(
      `SELECT id FROM listening_parts WHERE test_id = $1 AND part_name = $2`, 
      [testId, partName]
    );
    let partId = partResult.rows[0]?.id;
    if (!partId) {
      partResult = await client.query(
        `INSERT INTO listening_parts (test_id, part_name) VALUES ($1, $2) RETURNING id`, 
        [testId, partName]
      );
      partId = partResult.rows[0].id;
    }
    console.log("Id Found", partId);

    // Fetch the highest current question number for this part
    const countResult = await client.query(
      `SELECT MAX(question_number) AS max_number FROM listening_questions WHERE test_id = $1 AND part_id = $2`, 
      [testId, partId]
    );
    let currentQuestionNumber = countResult.rows[0].max_number || 0;

    // Process each question
    questions.forEach(async (question) => {
      if (question.question.trim() !== '') {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO listening_questions (test_id, part_id, question, answer, question_number) VALUES ($1, $2, $3, $4, $5)`,
            [testId, partId, question.question, question.answer, currentQuestionNumber]
          );
        } else {
          await client.query(
            `UPDATE listening_questions SET question = $1, answer = $2, question_number = $3 WHERE id = $4`, 
            [question.question, question.answer, currentQuestionNumber, question.id]
          );
        }
      }
    });
    console.log("question_inserted");
    console.log(testId, partId, audioUrl, imageUrl);

    // Fetch existing listening material data
    const existingMaterialResult = await client.query(
      `SELECT audio_url, image_url FROM listening_materials WHERE test_id = $1 AND part_id = $2`, 
      [testId, partId]
    );
    const existingMaterial = existingMaterialResult.rows[0];

    // Use existing values if incoming values are null or empty
    const finalAudioUrl = audioUrl || existingMaterial?.audio_url;
    const finalImageUrl = imageUrl || existingMaterial?.image_url;

    // Insert or update listening material
    await client.query(
      `INSERT INTO listening_materials (test_id, part_id, audio_url, image_url) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (test_id, part_id) 
       DO UPDATE SET audio_url = EXCLUDED.audio_url, image_url = EXCLUDED.image_url`,
      [testId, partId, finalAudioUrl, finalImageUrl]
    );
    console.log("material_inserted");

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

exports.saveListeningAnswerToDatabase = async ({ testId, questionId, userAnswer, partId, correctAnswer, isCorrect }) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO listening_results (test_id, question_id, user_answer, correct_answer, is_correct)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at, updated_at`,
      [testId, questionId, userAnswer, correctAnswer, isCorrect]
    );
    
    return result.rows[0];  // Return the saved answer row
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error("Error saving user answer.");
  } finally {
    client.release();
  }
};

