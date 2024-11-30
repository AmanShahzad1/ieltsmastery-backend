const pool = require("../dbConfig");

exports.insertUser = async (username, emailOrPhone, passwordHash) => {
  const query = `
    INSERT INTO users (username, email_or_phone, password_hash)
    VALUES ($1, $2, $3) RETURNING id, username, email_or_phone;
  `;

  const values = [username, emailOrPhone, passwordHash];
  const { rows } = await pool.query(query, values);

  return rows[0];
};

// Find a user by email or phone
exports.findUserByEmailOrPhone = async (email_or_phone) => {
  const query = "SELECT * FROM users WHERE email_or_phone = $1";
  const values = [email_or_phone];

  try {
    const result = await pool.query(query, values);
    return result.rows[0] || null; // Return the first user or null
  } catch (error) {
    console.error("Error finding user by email or phone:", error);
    throw error;
  }
};


// Function to get user by email or phone number
exports.getUserByEmailOrPhone = async (email_or_phone) => {
  try {
    // Query to check if the user exists by email or phone number
    const query = `
      SELECT * FROM users WHERE email_or_phone = $1
    `;
    const result = await pool.query(query, [email_or_phone]);

    if (result.rows.length > 0) {
      return result.rows[0];  // Return the first user found
    }
    return null;  // No user found
  } catch (error) {
    console.error("Error fetching user by email or phone:", error.message);
    throw error;
  }
};

