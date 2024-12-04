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
