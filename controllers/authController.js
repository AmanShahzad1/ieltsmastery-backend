const bcrypt = require("bcrypt");
const { insertUser } = require("../models/userModel");
const { getUserByEmailOrPhone } = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { username, email_or_phone: emailOrPhone, password } = req.body;

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


//Login authentication implementation
exports.loginUser = async (req, res) => {
  const { email_or_phone, password } = req.body;

  if (!email_or_phone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find user by email or phone number
    const user = await getUserByEmailOrPhone(email_or_phone);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.status(200).json({
      message: "Login successful!",
      token, // Send token to client
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error logging in." });
  }
};