require("dotenv").config();
const axios = require("axios");
const db = require("./db");

// ✅ ตรวจสอบสลิปผ่าน EasySlip API
exports.verifySlip = async (req, res) => {
  const { transactionId } = req.params;

  db.query("SELECT * FROM transactions WHERE id = ?", [transactionId], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบธุรกรรมนี้" });
    }

    const transaction = results[0];

    if (!transaction.slip) {
      return res.status(400).json({ success: false, message: "ไม่มีสลิปให้ตรวจสอบ" });
    }

    const slipUrl = `http://localhost:4001${transaction.slip}`;

    try {
      const response = await axios.post(process.env.EASYSLIP_API_URL, {
        api_key: process.env.EASYSLIP_API_KEY,
        slip_url: slipUrl,
        amount: transaction.amount,
      });

      if (response.data.success === true) {
        db.query("UPDATE users SET credit = credit + ? WHERE id = ?", [transaction.amount, transaction.user_id]);
        db.query("UPDATE transactions SET status = 'approved' WHERE id = ?", [transactionId]);
        return res.json({ success: true, message: "✅ สลิปถูกต้อง! เครดิตเพิ่มให้ผู้ใช้แล้ว" });
      } else {
        db.query("UPDATE transactions SET status = 'rejected' WHERE id = ?", [transactionId]);
        return res.json({ success: false, message: "❌ สลิปไม่ถูกต้อง! กรุณาตรวจสอบใหม่" });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการตรวจสอบสลิป:", error);
      res.status(500).json({ success: false, message: "❌ ไม่สามารถตรวจสอบสลิปได้ในขณะนี้" });
    }
  });
};
