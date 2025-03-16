const express = require("express");
const db = require("../config/db");  // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// เส้นทาง GET ดึงข้อมูลผู้ใช้ทั้งหมด
router.get("/get-user-data", (req, res) => {
  const query = "SELECT * FROM users";  // ดึงข้อมูลจากตาราง users
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching user data", error: err });
    }
    return res.status(200).json(result);  // ส่งข้อมูลทั้งหมดของผู้ใช้กลับ
  });
});

// เส้นทาง POST เพิ่มผู้ใช้ใหม่
router.post("/add-user", (req, res) => {
  const { username, email, credit, role } = req.body;

  const query = "INSERT INTO users (username, email, credit, role) VALUES (?, ?, ?, ?)";
  db.query(query, [username, email, credit, role], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error adding user", error: err });
    }
    return res.status(200).json({ message: "User added successfully", result });
  });
});

// เส้นทาง DELETE ลบผู้ใช้
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

module.exports = router;
