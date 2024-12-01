const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getAdminByUsername } = require("../models/adminModel");

// Admin login controller
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Validate input fields
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch admin by username
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found. Please check the username." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials. Please check your password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // Token valid for 2 hours
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "An internal error occurred. Please try again later." });
  }
};
