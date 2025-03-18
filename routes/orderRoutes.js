const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv"; // ✅ กำหนด API Key

// ✅ API สั่งซื้อสินค้า
router.post("/", async (req, res) => {
  try {
    const { id, username_customer } = req.body;

    // ✅ ตรวจสอบค่าที่จำเป็น
    if (!id || !username_customer) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า และ username_customer" });
    }

    console.log(`🛒 Processing purchase: ID=${id}, Username=${username_customer}`);

    // ✅ ส่งคำขอไปยัง ByShop API
    const response = await axios.post(
      "https://byshop.me/api/buy",
      {
        id,
        keyapi: BYSHOP_API_KEY,
        username_customer, // ✅ ใช้ username_customer ตาม ByShop
      },
      { timeout: 10000 }
    );

    console.log("📢 API Response (Buy):", response.data);

    // ✅ ตรวจสอบว่าการสั่งซื้อสำเร็จหรือไม่
    if (response.data.status === "success") {
      return res.json({
        status: "success",
        message: response.data.message,
        orderid: response.data.orderid,
        img: response.data.img,
        name: response.data.name,
        info: response.data.info,
        price: response.data.price,
        time: response.data.time,
      });
    } else {
      console.error("⚠️ Purchase failed:", response.data);
      return res.status(400).json({ status: "error", message: response.data.message || "❌ การสั่งซื้อไม่สำเร็จ" });
    }
  } catch (error) {
    console.error("❌ Error purchasing product:", error?.response?.data || error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ API",
      error: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
