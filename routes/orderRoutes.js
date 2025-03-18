const express = require("express");
const axios = require("axios");
const router = express.Router();
const FormData = require("form-data");

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY;

router.post("/", async (req, res) => {
  try {
    let { id, username_customer } = req.body;

    if (!id || !username_customer) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า และ username_customer" });
    }

    console.log(`🛒 Processing purchase: ID=${id}, Username=${username_customer}`);

    const formData = new FormData();
    formData.append("id", id);
    formData.append("keyapi", BYSHOP_API_KEY);
    formData.append("username_customer", username_customer);

    const response = await axios.post("https://byshop.me/api/buy", formData, {
      headers: { ...formData.getHeaders() },
      timeout: 10000,
    });

    console.log("📢 API Response (Buy):", response.data);

    if (response.data.status === "success") {
      return res.json(response.data);
    } else {
      return res.status(400).json({ status: "error", message: response.data.message || "❌ การสั่งซื้อไม่สำเร็จ" });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการสั่งซื้อสินค้า" });
  }
});

module.exports = router;
