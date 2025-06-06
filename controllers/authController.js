const bcrypt = require("bcrypt");
const { insertUserProfile,insertUser, getUserByEmailOrPhone, findUserByEmailOrPhone } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const{getUserProfile }=require("../models/userModel");


//get user profile data
exports.get_Profile = async (req, res) => {
  try {
    const { user_id } = req.params; // Extract user_id from request parameters

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const userProfile = await getUserProfile(user_id);
    res.status(200).json(userProfile); // Return user profile data
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};
//create user profile
exports.registerUserProfile = async (req, res) => {
  const { user_id, first_name, last_name, profile_pic } = req.body;

  // Validate required fields
  if (!user_id || !first_name || !last_name) {
    return res.status(400).json({ message: "User ID, First Name, and Last Name are required." });
  }

  try {
    // Insert profile details into user_profiles
    const newProfile = await insertUserProfile(user_id, first_name, last_name, profile_pic);

    res.status(201).json({ message: "User profile created successfully!", profile: newProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user profile." });
  }
};




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

  if (!email_or_phone) {
    return res.status(400).json({ message: "Email or phone is required." });
  }

  try {
    // Find user by email or phone number
    const user = await getUserByEmailOrPhone(email_or_phone);

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // If the user is a Google OAuth user, they won't have a password
    if (!user.password_hash) {
      return res.status(400).json({ message: "Please use Google OAuth to log in." });
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


exports.generateToken = function(user) {
  return jwt.sign(
    {
       userId: user.id,        // Required by your dashboard
      username: user.username || user.displayName, // Fallback to displayName for OAuth
      email: user.email  
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
