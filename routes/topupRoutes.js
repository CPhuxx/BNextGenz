const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// 📂 ตรวจสอบโฟลเดอร์ uploads
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // กำหนดโฟลเดอร์ที่เก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ตั้งชื่อไฟล์ให้ไม่ซ้ำกัน
  },
});

// ตรวจสอบประเภทของไฟล์
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ อัปโหลดได้เฉพาะไฟล์ PNG, JPEG, JPG เท่านั้น!"), false);
  }
};

// จำกัดขนาดไฟล์ 5MB
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// 📌 เส้นทางสำหรับการเติมเงิน
router.post("/topup", upload.single("slip"), async (req, res) => {
  try {
    const { userId, method } = req.body;
    const slipPath = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !method || !slipPath) {
      return res.status(400).json({ success: false, message: "❌ ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบ" });
    }

    // 🔍 ตรวจสอบว่าผู้ใช้มีอยู่ในระบบหรือไม่
    const userCheckQuery = "SELECT * FROM users WHERE id = ?";
    const [user] = await db.promise().query(userCheckQuery, [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "❌ ไม่พบผู้ใช้ในระบบ" });
    }

    // 📌 บันทึกธุรกรรมลงฐานข้อมูล
    const sql = "INSERT INTO transactions (user_id, method, slip, status) VALUES (?, ?, ?, 'pending')";
    await db.promise().query(sql, [userId, method, slipPath]);

    res.status(200).json({ success: true, message: "✅ รายการเติมเงินถูกบันทึกแล้ว กำลังตรวจสอบ" });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error.message);
    res.status(500).json({ success: false, message: "❌ เกิดข้อผิดพลาดในการทำธุรกรรม" });
  }
});

module.exports = router;
