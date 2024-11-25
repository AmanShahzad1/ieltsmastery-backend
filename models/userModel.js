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
