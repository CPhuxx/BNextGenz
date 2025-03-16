// orderRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // เชื่อมต่อฐานข้อมูล

// API สำหรับบันทึกการสั่งซื้อ
router.post("/add-order", (req, res) => {
  const { user_id, product_id, quantity, total_price } = req.body;

  const query = "INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)";
  
  db.query(query, [user_id, product_id, quantity, total_price], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error saving order", error: err });
    }
    return res.status(200).json({ message: "Order placed successfully" });
  });
});

module.exports = router;
