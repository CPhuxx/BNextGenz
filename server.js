require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const db = require("./config/db"); // Database configuration
const authRoutes = require("./routes/authRoutes"); // Import authentication routes
const bannerRoutes = require("./routes/bannerRoutes"); // Import banner routes
const userRoutes = require("./routes/userRoutes"); // Import user routes

const app = express();
const PORT = process.env.PORT || 4000;

// Set up file upload storage using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banners/"); // File will be stored in 'uploads/banners' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique filename
  },
});

const upload = multer({ storage: storage });

// Middleware Setup
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Allow frontend to access backend
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);  // Authentication routes
app.use("/api/admin", userRoutes);  // User management routes (GET, POST, DELETE)
app.use("/api/admin/upload-banner", upload.single("banner"), bannerRoutes);  // Banner upload route

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
