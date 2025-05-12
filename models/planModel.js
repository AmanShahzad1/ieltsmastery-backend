const pool = require("../dbConfig");

 

exports.findByDifficulty = async (difficulty) => {
    try {
      const result = await pool.query("SELECT * FROM plans WHERE level = $1", [difficulty]);
      return result.rows[0]; // Return the list of tests
    } catch (error) {
      throw new Error("Error fetching tests: " + error.message);
    }
  };