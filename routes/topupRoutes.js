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

router.post("/topup", upload.single("slip"), (req, res) => {
  const { userId, method } = req.body;
  const slipPath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!userId || !method || !slipPath) {
    return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
  }
  db.query("INSERT INTO transactions (user_id, method, slip, status) VALUES (?, ?, ?, 'pending')", [userId, method, slipPath], (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการทำธุรกรรม" });
    }
    res.json({ success: true, message: "รายการเติมเงินถูกบันทึกแล้ว กำลังตรวจสอบ" });
  });
});

module.exports = router; // ✅ แก้ให้ export router เท่านั้น
