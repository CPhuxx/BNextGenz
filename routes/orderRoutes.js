const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";
const USERNAME = "puridet009"; // ใช้ username ที่กำหนด

// ✅ **API Proxy ทำรายการสั่งซื้อผ่าน ByShop**
router.post("/buy", async (req, res) => {
  const { id } = req.body;

  // 🔍 ตรวจสอบค่าที่จำเป็น
  if (!id) {
    return res.status(400).json({ status: "error", message: "❌ กรุณาระบุ ID สินค้า" });
  }

  try {
    console.log(`🛒 Processing purchase: ID=${id}, Username=${USERNAME}`);

    const response = await axios.post(
      "https://byshop.me/api/buy",
      {
        id,
        keyapi: BYSHOP_API_KEY,
        username: USERNAME,
      },
      { timeout: 10000 } // ⏳ ตั้งค่า Timeout 10 วินาที
    );

    console.log("📢 API Response (Buy):", response.data); // ✅ Debug Response

    if (response.data.status === "success") {
      res.json({
        status: "success",
        email: response.data.email,
        password: response.data.password,
      });
    } else {
      console.error("⚠️ Purchase failed:", response.data);
      res.status(400).json({ status: "error", message: "การสั่งซื้อไม่สำเร็จ", error: response.data });
    }
  } catch (error) {
    console.error("❌ Error purchasing product:", error?.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อ API",
      error: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
