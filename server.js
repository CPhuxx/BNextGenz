require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./config/db"); // Database configuration
const authRoutes = require("./routes/authRoutes"); // Import authentication routes
const app = express();

const PORT = process.env.PORT || 4000;

// Middleware Setup
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Allow frontend to access backend
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
