const express = require("express");
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// เพิ่มผู้ใช้ใหม่
router.post("/add-user", (req, res) => {
  const { username, email, credit, role } = req.body;
  console.log("Received data:", { username, email, credit, role });

  // ตรวจสอบข้อมูล
  if (!username || !email || !credit || !role) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const query = "INSERT INTO users (username, email, credit, role) VALUES (?, ?, ?, ?)";
  db.query(query, [username, email, credit, role], (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "ไม่สามารถเพิ่มผู้ใช้ได้", error: err });
    }
    return res.status(200).json({
      message: "เพิ่มผู้ใช้สำเร็จ",
      user: { username, email, credit, role }, // ส่งข้อมูลกลับ
    });
  });
});

// ลบผู้ใช้
router.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;
  
  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting user", error: err });
    }
    return res.status(200).json({ message: "User deleted successfully", result });
  });
});

// ดึงข้อมูลผู้ใช้
router.get("/get-user-data", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching user data", error: err });
    }
    return res.status(200).json(result);
  });
});

module.exports = router;
