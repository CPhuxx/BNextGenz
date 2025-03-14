const express = require("express");
const db = require("./db");

const router = express.Router();

router.get("/:userId/credit", (req, res) => {
  const { userId } = req.params;

  db.query("SELECT credit FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดกับฐานข้อมูล" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบผู้ใช้" });
    }
    res.json({ success: true, credit: results[0].credit });
  });
});

module.exports = router;
