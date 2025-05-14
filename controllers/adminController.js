const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getAdminByUsername } = require("../models/adminModel");
const { getUserData } = require("../models/adminModel");
const { deleteUserById } = require("../models/adminModel");
//get all users for user manager
exports.getUserDataController = async (req, res) => {
  console.log("Admin login route initialized");
  try {
    console.log("Fetching user data...");
    const data = await getUserData();  // no arguments
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in getUserDataController:", error);
    res.status(500).json({ error: error.message });
  }
};
//...............................
//delete user by id for user manager 
exports.deleteUserByIdController = async (req, res) => {
  console.log("Delete user route initialized");
  const { id } = req.params;

  try {
    console.log(`Deleting user with id: ${id}`);
    const result = await deleteUserById(id);

    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }

    res.status(200).json({ message: "User deleted successfully", user: result.user });
  } catch (error) {
    console.error("Error in deleteUserByIdController:", error);
    res.status(500).json({ error: error.message });
  }
};
//..................................................



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
