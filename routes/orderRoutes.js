const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv"; // ✅ กำหนด keyapi ที่นี่

// ✅ **API สั่งซื้อสินค้า**
router.post("/buy", async (req, res) => {
  const { id, username } = req.body;

  // 🔍 ตรวจสอบค่าที่จำเป็น
  if (!id || !username) {
    return res.status(400).json({ status: "error", message: "❌ กรุณาระบุ ID สินค้าและ Username" });
  }

  try {
    console.log(`🛒 Processing purchase: ID=${id}, Username=${username}`);

    const response = await axios.post(
      "https://byshop.me/api/buy",
      {
        id,
        keyapi: BYSHOP_API_KEY, // ✅ เพิ่ม keyapi ที่นี่
        username_customer: username, // ✅ ใช้ username_customer ตาม API
      },
      { timeout: 10000 }
    );

    console.log("📢 API Response (Buy):", response.data);

    if (response.data.status === "success") {
      res.json({
        status: "success",
        orderid: response.data.orderid,
        img: response.data.img,
        name: response.data.name,
        info: response.data.info,
        price: response.data.price,
        time: response.data.time,
      });
    } else {
      console.error("⚠️ Purchase failed:", response.data);
      res.status(400).json({ status: "error", message: "❌ การสั่งซื้อไม่สำเร็จ", error: response.data });
    }
  } catch (error) {
    console.error("❌ Error purchasing product:", error?.response?.data || error.message);
    res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ API",
      error: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
