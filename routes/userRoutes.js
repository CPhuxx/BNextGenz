const express = require("express");
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล
const router = express.Router();

// 🔹 **API ดึงข้อมูลผู้ใช้ทั้งหมด**
router.get("/get-user-data", (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, result) => {
    if (err) {
      console.error("❌ Error fetching user data:", err);
      return res.status(500).json({ status: "error", message: "Error fetching user data", error: err });
    }
    return res.status(200).json({ status: "success", users: result });
  });
});

// 🔹 **API เพิ่มผู้ใช้ใหม่**
router.post("/add-user", (req, res) => {
  const { username, email, credit, role } = req.body;

  if (!username || !email || credit === undefined || !role) {
    return res.status(400).json({ status: "error", message: "❌ กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const query = "INSERT INTO users (username, email, credit, role) VALUES (?, ?, ?, ?)";
  db.query(query, [username, email, credit, role], (err, result) => {
    if (err) {
      console.error("❌ Error adding user:", err);
      return res.status(500).json({ status: "error", message: "Error adding user", error: err });
    }
    return res.status(200).json({ status: "success", message: "✅ User added successfully", result });
  });
});

// 🔹 **API ลบผู้ใช้**
router.delete("/delete-user/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM users WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Error deleting user:", err);
      return res.status(500).json({ status: "error", message: "Error deleting user", error: err });
    }
    return res.status(200).json({ status: "success", message: "✅ User deleted successfully", result });
  });
});

// 🔹 **API เพิ่มสินค้าใหม่**
router.post("/add-product", (req, res) => {
  const { name, description, price, category } = req.body;

  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({ status: "error", message: "❌ กรุณากรอกข้อมูลสินค้าให้ครบถ้วน" });
  }

  const query = "INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)";
  db.query(query, [name, description, price, category], (err, result) => {
    if (err) {
      console.error("❌ Error adding product:", err);
      return res.status(500).json({ status: "error", message: "Error adding product", error: err });
    }
    return res.status(200).json({ status: "success", message: "✅ Product added successfully", result });
  });
});

module.exports = router;
