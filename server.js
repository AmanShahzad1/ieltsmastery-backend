const express = require("express");
const cors = require("cors");
require("dotenv").config();


const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const testsRoutes = require("./routes/tests");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// Admin routes
app.use("/api/admin", adminRoutes);
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// })

// Use the tests routes
app.use("/api/tests", testsRoutes);



// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
