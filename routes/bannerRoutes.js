const express = require("express");
const multer = require("multer");
const db = require("../config/db");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/upload-banner", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const imagePath = `/uploads/${req.file.filename}`;
  db.query("UPDATE settings SET banner_image = ? WHERE id = 1", [imagePath], (err) => {
    if (err) {
      return res.status(500).send("Error saving image to database.");
    }
    res.json({ success: true, filePath: imagePath });
  });
});

module.exports = router;
