const bcrypt = require("bcrypt");
const { insertUser } = require("../models/userModel");

exports.registerUser = async (req, res) => {
  const { username, emailOrPhone, password } = req.body;

  if (!username || !emailOrPhone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await insertUser(username, emailOrPhone, hashedPassword);

    res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error registering user." });
  }
};
