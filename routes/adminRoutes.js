const express = require("express");
const { loginAdmin } = require("../controllers/adminController");
const { getUserDataController } = require("../controllers/adminController");
const { deleteUserByIdController } = require("../controllers/adminController");

const router = express.Router();

// Admin login route
router.post("/login", loginAdmin);
router.get("/all_users", getUserDataController);
router.delete("/delete_user/:id", deleteUserByIdController);
module.exports = router;
