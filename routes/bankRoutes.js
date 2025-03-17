const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY; // ✅ ใช้ API Key จาก .env

// ✅ API ดึงข้อมูลธุรกรรมจาก ByShop
router.post("/", async (req, res) => {
  try {
    const { account } = req.body;

    if (!account) {
      return res.status(400).json({ status: "error", message: "❌ กรุณาระบุเลขบัญชี" });
    }

    console.log("📢 Checking transactions for account:", account);

    const response = await axios.post(
      `https://byshop.me/api/line_bank?account=${account}`,
      { keyapi: BYSHOP_API_KEY },
      { timeout: 10000 }
    );

    console.log("📥 API Response:", response.data);

    if (response.data.status === "success") {
      return res.json({ status: "success", data: response.data.data });
    } else {
      return res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลธุรกรรมได้" });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม",
      error: error.response ? error.response.data : error.message,
    });
  }
});

module.exports = router;
