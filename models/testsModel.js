const pool = require("../dbConfig");
// Model to fetch all readingtests
exports.getAllTests = async () => {
  try {
    const result = await pool.query("SELECT * FROM tests ORDER BY id ASC");
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};

// Model to create a new readingtest
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

exports.getTestType = async (testId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let type = "";
    let difficulty = "";

    if (testId) {
      // Fetch all questions for this part if part ID exists
      const typeRes = await client.query(
        `SELECT type, difficulty
         FROM tests
         WHERE id = $1
         `,
        [testId]
      );
      type = typeRes.rows[0]?.type || "";
      difficulty = typeRes.rows[0]?.difficulty || "";
    }

    await client.query("COMMIT");

    return {
      type: type,
      difficulty: difficulty,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      type: "",
      difficulty: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

exports.getTestPartData = async (testId, partName) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    await client.query("COMMIT");

    return {
      questions: questions,
      readingMaterial: readingMaterial,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      questions: [],
      readingMaterial: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

//Saving User answers
exports.saveAnswerToDatabase = async ({
  testId,
  questionId,
  userAnswer,
  partId,
  correctAnswer,
  isCorrect,
  userId
}) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO results (test_id, question_id, user_answer, correct_answer, is_correct, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at, updated_at`,
      [testId, questionId, userAnswer, correctAnswer, isCorrect, userId]
    );

    return result.rows[0]; // Return the saved answer row
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error("Error saving user answer.");
  } finally {
    client.release();
  }
};

// Save or update the test part data
exports.saveTestPartData = async (
  testId,
  partName,
  questions,
  readingMaterial
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch partId or create new part if not exists
    let partResult = await client.query(
      `SELECT id FROM parts WHERE test_id = $1 AND part_name = $2`,
      [testId, partName]
    );
    let partId = partResult.rows[0]?.id;
    if (!partId) {
      partResult = await client.query(
        `INSERT INTO parts (test_id, part_name) VALUES ($1, $2) RETURNING id`,
        [testId, partName]
      );
      partId = partResult.rows[0].id;
    }

    // Fetch the highest current question number for this part
    const countResult = await client.query(
      `SELECT MAX(question_number) AS max_number FROM questions WHERE test_id = $1 AND part_id = $2`,
      [testId, partId]
    );
    let currentQuestionNumber = countResult.rows[0].max_number || 0;

    // Process each question
    questions.forEach(async (question) => {
      if (question.question.trim() !== "") {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO questions (test_id, part_id, question, answer, question_number) VALUES ($1, $2, $3, $4, $5)`,
            [
              testId,
              partId,
              question.question,
              question.answer,
              currentQuestionNumber,
            ]
          );
        } else {
          await client.query(
            `UPDATE questions SET question = $1, answer = $2, question_number = $3 WHERE id = $4`,
            [
              question.question,
              question.answer,
              currentQuestionNumber,
              question.id,
            ]
          );
        }
      }
    });

    // Insert or update reading material
    await client.query(
      `INSERT INTO reading_materials (test_id, part_id, material) VALUES ($1, $2, $3) ON CONFLICT (test_id, part_id) DO UPDATE SET material = EXCLUDED.material`,
      [testId, partId, readingMaterial]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

exports.saveTestTypeData = async (testId, type, difficulty) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE tests 
       SET type = $2, difficulty = $3 
       WHERE id = $1`,
      [testId, type, difficulty]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

//------------------------------------------------------------------------

exports.getAllwritingTests = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM writing_test ORDER BY id ASC;"
    );
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};

exports.createwritingTest = async (name) => {
  try {
    const result = await pool.query(
      "INSERT INTO writing_test (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0]; // Return the created test
  } catch (error) {
    throw new Error("Error creating test: " + error.message);
  }
};
// Model to create a new writingtest
exports.createwritingTest = async (name) => {
  try {
    const result = await pool.query(
      "INSERT INTO writing_test (name) VALUES ($1) RETURNING *",
      [name]
    );
    return result.rows[0]; // Return the created test
  } catch (error) {
    throw new Error("Error creating test: " + error.message);
  }
};
// Save or update the writingtest part data
exports.savewritingTestPartData = async (
  testId,
  partName,
  questions,
  material
) => {
  console.log("Received data writing:", {
    testId,
    partName,
    questions,
    material,
  });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Fetch partId or create new part if not exists
    let partResult = await client.query(
      `SELECT id FROM writing_parts WHERE test_id = $1 AND partname = $2`,
      [testId, partName]
    );
    console.log("1 run");

    let partId = partResult.rows[0]?.id;
    if (!partId) {
      partResult = await client.query(
        `INSERT INTO writing_parts (test_id, partname) VALUES ($1, $2) RETURNING id`,
        [testId, partName]
      );
      console.log("2 run");
      partId = partResult.rows[0].id;
    }

    // Fetch the highest current question number for this part
    const countResult = await client.query(
      `SELECT MAX(question_num) AS max_number FROM writing_questions WHERE test_id = $1 AND part_id = $2`,
      [testId, partId]
    );
    console.log("3 run");

    let currentQuestionNumber = countResult.rows[0]?.max_number || 0;

    // Process each question
    for (const question of questions) {
      if (question.question.trim() !== "") {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO writing_questions (test_id, part_id, question, question_num) VALUES ($1, $2, $3, $4)`,
            [testId, partId, question.question, currentQuestionNumber]
          );
          console.log("4 run");
        } else {
          await client.query(
            `UPDATE writing_questions SET question = $1, question_num = $2 WHERE id = $3`,
            [question.question, currentQuestionNumber, question.id]
          );
          console.log("5 run");
        }
      }
    }

    // Ensure material is not undefined or null before inserting/updating
    if (material !== undefined && material !== null) {
      const materialExists = await client.query(
        `SELECT id FROM writing_material WHERE test_id = $1 AND part_id = $2`,
        [testId, partId]
      );

      if (materialExists.rows.length > 0) {
        await client.query(
          `UPDATE writing_material SET material = $1 WHERE test_id = $2 AND part_id = $3`,
          [material, testId, partId]
        );
        console.log("6 run (Updated material)");
      } else {
        await client.query(
          `INSERT INTO writing_material (test_id, part_id, material) VALUES ($1, $2, $3)`,
          [testId, partId, material]
        );
        console.log("6 run (Inserted new material)");
      }
    } else {
      console.warn(
        "Skipping material insert/update as material is undefined or null."
      );
    }

    await client.query("COMMIT");

    // ✅ Return a success response
    return { success: true, message: "Data saved successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error saving writing test part data:", error);

    // ❌ Return an error response instead of throwing
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
};

exports.getWritingTestType = async (testId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let type = "";
    let difficulty = "";

    if (testId) {
      // Fetch all questions for this part if part ID exists
      const typeRes = await client.query(
        `SELECT type, difficulty
         FROM writing_test
         WHERE id = $1
         `,
        [testId]
      );
      type = typeRes.rows[0]?.type || "";
      difficulty = typeRes.rows[0]?.difficulty || "";
    }

    await client.query("COMMIT");

    return {
      type: type,
      difficulty: difficulty,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      type: "",
      difficulty: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

exports.saveWritingTestTypeData = async (testId, type, difficulty) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE writing_test 
       SET type = $2, difficulty = $3 
       WHERE id = $1`,
      [testId, type, difficulty]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

//-----------------------------------------------------------------------
// Model to fetch Listening all tests
exports.getAllListeningTests = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM listening_tests ORDER BY id ASC;"
    );
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
    await client.query("BEGIN");

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

    await client.query("COMMIT");

    return {
      questions: questions,
      audioUrl: audioUrl,
      imageUrl: imageUrl,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      questions: [],
      audioUrl: "",
      imageUrl: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

// Save or update the test part data
exports.saveListeningTestPartData = async (
  testId,
  partName,
  questions,
  audioUrl,
  imageUrl
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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
      if (question.question.trim() !== "") {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO listening_questions (test_id, part_id, question, answer, question_number) VALUES ($1, $2, $3, $4, $5)`,
            [
              testId,
              partId,
              question.question,
              question.answer,
              currentQuestionNumber,
            ]
          );
        } else {
          await client.query(
            `UPDATE listening_questions SET question = $1, answer = $2, question_number = $3 WHERE id = $4`,
            [
              question.question,
              question.answer,
              currentQuestionNumber,
              question.id,
            ]
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

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

exports.saveListeningAnswerToDatabase = async ({
  testId,
  questionId,
  userAnswer,
  partId,
  correctAnswer,
  isCorrect,
  userId
}) => {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `INSERT INTO listening_results (test_id, question_id, user_answer, correct_answer, is_correct, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at, updated_at`,
      [testId, questionId, userAnswer, correctAnswer, isCorrect, userId]
    );

    return result.rows[0]; // Return the saved answer row
  } catch (error) {
    console.error("Error saving user answer:", error);
    throw new Error("Error saving user answer.");
  } finally {
    client.release();
  }
};

exports.getListeningTestType = async (testId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let difficulty = "";

    if (testId) {
      // Fetch all questions for this part if part ID exists
      const typeRes = await client.query(
        `SELECT difficulty
         FROM listening_tests
         WHERE id = $1
         `,
        [testId]
      );
      difficulty = typeRes.rows[0]?.difficulty || "";
    }

    await client.query("COMMIT");

    return {
      difficulty: difficulty,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      difficulty: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

exports.saveListeningTestTypeData = async (testId, difficulty) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE listening_tests 
       SET difficulty = $2
       WHERE id = $1`,
      [testId, difficulty]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

//-------------------------------------------------------------------------------------
//save speaking test
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
    const result = await pool.query("SELECT * FROM speaking_test ORDER BY id ASC");
    return result.rows; // Return the list of tests
  } catch (error) {
    throw new Error("Error fetching tests: " + error.message);
  }
};

exports.saveSpeakingTestData = async (testId, partName, questions) => {
  // Save or update the test part data
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("In database function");
    console.log(testId, partName, questions);

    // Fetch partId or create new part if not exists
    let partResult = await client.query(
      `SELECT id FROM speaking_parts WHERE test_id = $1 AND part_name = $2`,
      [testId, partName]
    );
    let partId = partResult.rows[0]?.id;
    if (!partId) {
      partResult = await client.query(
        `INSERT INTO speaking_parts (test_id, part_name) VALUES ($1, $2) RETURNING id`,
        [testId, partName]
      );
      partId = partResult.rows[0].id;
    }
    console.log("Id Found", partId);

    // Fetch the highest current question number for this part
    const countResult = await client.query(
      `SELECT MAX(question_number) AS max_number FROM speaking_questions WHERE test_id = $1 AND part_id = $2`,
      [testId, partId]
    );
    let currentQuestionNumber = countResult.rows[0].max_number || 0;

    // Process each question
    questions.forEach(async (question) => {
      if (question.question.trim() !== "") {
        currentQuestionNumber++; // Increment question number
        if (!question.id) {
          await client.query(
            `INSERT INTO speaking_questions (test_id, part_id, question, question_number) VALUES ($1, $2, $3, $4)`,
            [testId, partId, question.question, currentQuestionNumber]
          );
        } else {
          await client.query(
            `UPDATE speaking_questions SET question = $1, question_number = $3 WHERE id = $4`,
            [question.question, currentQuestionNumber, question.id]
          );
        }
      }
    });
    console.log("question_inserted");

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

exports.getSpeakingTestData = async (testId, partName) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch the part ID first
    const partRes = await client.query(
      `SELECT id FROM speaking_parts WHERE test_id = $1 AND part_name = $2`,
      [testId, partName]
    );
    const partId = partRes.rows[0]?.id;

    let questions = [];

    if (partId) {
      // Fetch all questions for this part if part ID exists
      const questionsRes = await client.query(
        `SELECT id, question, question_number
             FROM speaking_questions
             WHERE test_id = $1 AND part_id = $2
             ORDER BY question_number`,
        [testId, partId]
      );
      questions = questionsRes.rows;
    }

    await client.query("COMMIT");

    return {
      questions: questions,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      questions: [],
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

exports.getSpeakingTestType = async (testId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let difficulty = "";

    if (testId) {
      // Fetch all questions for this part if part ID exists
      const typeRes = await client.query(
        `SELECT difficulty
             FROM speaking_test
             WHERE id = $1
             `,
        [testId]
      );
      difficulty = typeRes.rows[0]?.difficulty || "";
    }

    await client.query("COMMIT");

    return {
      difficulty: difficulty,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data for test part:", error);
    return {
      difficulty: "",
    }; // Return empty defaults in case of error
  } finally {
    client.release();
  }
};

exports.saveSpeakingTestTypeData = async (testId, difficulty) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE speaking_test
           SET difficulty = $2
           WHERE id = $1`,
      [testId, difficulty]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw new Error(`Error saving data: ${error.message}`);
  } finally {
    client.release();
  }
};

//----------------------------------------------------------------------------------------------------
//starting test data
exports.getstartingTestData = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("In starting test data function");
    const questionsRes = await client.query(
      `SELECT question_id, question, option1, option2, option3, option4
       FROM start_questions
       ORDER BY question_id`
    );

    const questions = questionsRes.rows;

    await client.query("COMMIT");

    return {
      questions: questions,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error fetching data from start_question table:", error);
    return {
      questions: [],
    };
  } finally {
    client.release();
  }
};
//add starting test Answers
exports.addstartingAnswer = async (uId, questionId, answer) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO start_answers (u_id, question_id, answer)
       VALUES ($1, $2, $3)`,
      [uId, questionId, answer]
    );

    await client.query("COMMIT");

    return { message: "Answer saved successfully." };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting answer into start_answer table:", error);
    return { error: error.message };
  } finally {
    client.release();
  }
};
