const db = require("../dbConfig"); // Database connection

class PerformanceModel {
  // For Reading/Listening (Objective Tests)
  static async calculateObjectiveTestPerformance(userId, testId, testType) {
    const resultsTable =
      testType === "reading" ? "results" : "listening_results";

    const query = `
      WITH test_stats AS (
        SELECT 
          COUNT(*) as total_questions,
          SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
          CAST(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100 as accuracy
        FROM ${resultsTable}
        WHERE user_id = $1 AND test_id = $2
      )
      INSERT INTO user_performance (
        user_id, test_date, test_type, test_id,
        band_score, total_questions, correct_answers, accuracy
      )
      SELECT 
        $1 as user_id,
        NOW() as test_date,
        $3 as test_type,
        $2 as test_id,
        -- IELTS band score conversion
        CASE 
          WHEN (ts.accuracy >= 90) THEN 9.0
          WHEN (ts.accuracy >= 80) THEN 8.0
          WHEN (ts.accuracy >= 70) THEN 7.0
          WHEN (ts.accuracy >= 60) THEN 6.0
          WHEN (ts.accuracy >= 50) THEN 5.0
          ELSE 4.0
        END as band_score,
        ts.total_questions,
        ts.correct_answers,
        ts.accuracy
      FROM test_stats ts
      RETURNING *;
    `;

    const { rows } = await db.query(query, [userId, testId, testType]);
    return rows[0];
  }

  // For Writing/Speaking (Subjective Tests)
  static async updateSubjectiveTestPerformance(userId, testId, testType) {
    const resultsTable =
      testType === "writing" ? "writing_results" : "speaking_answers";

    const query = `
      WITH test_scores AS (
        SELECT 
          GREATEST(score, 1.0) as average_score
        FROM ${resultsTable}
        WHERE user_id = $1 AND test_id = $2
      )
      INSERT INTO user_performance (
        user_id, test_date, test_type, test_id,
        band_score, total_questions, correct_answers, accuracy
      )
      SELECT 
        $1 as user_id,
        NOW() as test_date,
        $3 as test_type,
        $2 as test_id,
        ts.average_score as band_score,
        NULL as total_questions,
        NULL as correct_answers,
        NULL as accuracy
      FROM test_scores ts
      RETURNING *;
    `;

    const { rows } = await db.query(query, [userId, testId, testType]);
    return rows[0];
  }

  static async getUserPerformance(userId) {
    const query = `
    SELECT 
      test_type,
      COUNT(*) as tests_taken,
      AVG(band_score) as avg_band_score,
      AVG(accuracy) as avg_accuracy,
      MAX(test_date) as last_test_date
    FROM user_performance
    WHERE user_id = $1
    GROUP BY test_type
  `;

    const { rows } = await db.query(query, [userId]);
    return rows;
  }
}

module.exports = PerformanceModel;
