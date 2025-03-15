const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// การตั้งค่าการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: "./uploads/banners", // ที่จัดเก็บไฟล์
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext); // ตั้งชื่อไฟล์
  },
});

const upload = multer({ storage });

// API สำหรับอัปโหลด Banner
router.post("/upload-banner", upload.single("banner"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "กรุณาเลือกไฟล์" });
  }

  res.json({
    success: true,
    message: "อัปโหลด Banner สำเร็จ",
    file: req.file,
  });
});

module.exports = router;
