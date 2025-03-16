const express = require("express");
const router = express.Router();

// This route handles the upload of the banner image
router.post("/", (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const filePath = `http://localhost:4000/uploads/banners/${req.file.filename}`; // Generate URL for the uploaded file
  return res.status(200).json({ success: true, filePath: filePath });
});

module.exports = router;
