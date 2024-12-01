const db = require("../dbConfig"); // Database connection

// Fetch admin by username
const getAdminByUsername = async (username) => {
  const query = "SELECT * FROM admins WHERE username = $1";
  const values = [username];

  try {
    const { rows } = await db.query(query, values);
    return rows[0]; // Return the first row if found
  } catch (error) {
    console.error("Error fetching admin:", error);
    throw error;
  }
};

module.exports = {
  getAdminByUsername,
};
