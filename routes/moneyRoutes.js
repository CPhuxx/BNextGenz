const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY; // ✅ ใช้ API Key จาก .env

router.post("/", async (req, res) => {
  try {
    console.log("📢 Checking balance with API Key:", BYSHOP_API_KEY);

    const response = await axios.post(
      "https://byshop.me/api/money",
      { keyapi: BYSHOP_API_KEY },
      { timeout: 10000 }
    );

    console.log("📥 API Response:", response.data);

    if (response.data.status === "success") {
      return res.json({ status: "success", money: response.data.money });
    } else {
      return res.status(400).json({ status: "error", message: response.data.message });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ ไม่สามารถดึงข้อมูลเครดิตได้",
      error: error.response ? error.response.data : error.message,
    });
  }
});

module.exports = router;
