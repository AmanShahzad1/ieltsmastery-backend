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

//get user profile data
exports.getUserProfile = async (user_id) => {
  try {
    const query = `
      SELECT * 
      FROM users 
      INNER JOIN user_profiles ON users.id = user_profiles.user_id
      WHERE users.id = $1;
    `;
    const result = await pool.query(query, [user_id]);

    if (result.rows.length === 0) {
      throw new Error("User not found.");
    }
    return result.rows[0]; // Return user details with profile data
  } catch (error) {
    throw new Error("Error fetching user profile: " + error.message);
  }
};

exports.insertUserProfile = async (userId, firstName, lastName, profilePic) => {
  const query = `
    INSERT INTO user_profiles (user_id, first_name, last_name, profile_pic)
    VALUES ($1, $2, $3, $4) RETURNING id, user_id, first_name, last_name, profile_pic;
  `;

  const values = [userId, firstName, lastName, profilePic];
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

