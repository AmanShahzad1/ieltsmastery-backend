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

//.................................................
//fetch all users
const getUserData = async () => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    console.log("In get user data function");

    const usersRes = await client.query(
      `SELECT id, username, email_or_phone
       FROM users
       ORDER BY id`
    );

    const users = usersRes.rows;

    await client.query('COMMIT');

    return {
      users: users,
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error fetching data from users table:", error);
    return {
      users: [],
    };
  } finally {
    client.release();
  }
};
//..................................................
//delete users
const deleteUserById = async (id) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // First delete dependent rows
    await client.query(`DELETE FROM start_answers WHERE u_id = $1`, [id]);

    // Then delete the user
    const deleteRes = await client.query(
      `DELETE FROM users WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    if (deleteRes.rowCount === 0) {
      return { success: false, message: "User not found." };
    }

    return { success: true, user: deleteRes.rows[0] };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting user:", error);
    return { success: false, message: error.message };
  } finally {
    client.release();
  }
};

//..................................................
module.exports = {
  getAdminByUsername,getUserData,deleteUserById
};
