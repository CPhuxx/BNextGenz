const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// กำหนดการจัดเก็บไฟล์
const storage = multer.diskStorage({
  destination: "./uploads/", // ที่จัดเก็บไฟล์
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // ตั้งชื่อไฟล์
  },
});

const upload = multer({ storage });

// เส้นทางสำหรับการเติมเงิน
router.post("/topup", upload.single("slip"), (req, res) => {
  const { userId, method } = req.body;
  const slipPath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!userId || !method || !slipPath) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }

  const sql = "INSERT INTO transactions (user_id, method, slip, status) VALUES (?, ?, ?, 'pending')";
  db.query(sql, [userId, method, slipPath], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการทำธุรกรรม" });
    }
    res.status(200).json({ success: true, message: "รายการเติมเงินถูกบันทึกแล้ว กำลังตรวจสอบ" });
  });
});

module.exports = router;
