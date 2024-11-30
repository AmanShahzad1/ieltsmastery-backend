const bcrypt = require("bcrypt");
const { insertUser, getUserByEmailOrPhone, findUserByEmailOrPhone } = require("../models/userModel");
const jwt = require("jsonwebtoken");


exports.registerUser = async (req, res) => {
  const { username, email_or_phone: emailOrPhone, password } = req.body;

  // Validate required fields
  if (!username || !emailOrPhone || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate email or phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^0?[1-9]\d{9,14}$/;

  if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone)) {
    return res.status(400).json({ message: "Invalid email or phone number format." });
  }

  // Validate password
  if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[@$!%*?&#]/.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.",
    });
  }

  try {
    // Check for duplicate email or phone
    const existingUser = await findUserByEmailOrPhone(emailOrPhone);
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already in use." });
    }

   
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    const newUser = await insertUser(username, emailOrPhone, hashedPassword);

    res.status(201).json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error(error);

    // Handle specific database errors
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Duplicate entry. Please use a different email or username." });
    }

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