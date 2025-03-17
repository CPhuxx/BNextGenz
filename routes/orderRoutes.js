const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";

// ✅ **API ดึงประวัติการสั่งซื้อจาก ByShop**
router.post("/history", async (req, res) => {
  const { username, orderid } = req.body;

  // 🔍 ตรวจสอบว่ามีค่า username หรือ orderid หรือไม่
  if (!username && !orderid) {
    return res.status(400).json({ status: "error", message: "❌ กรุณาระบุ username หรือ orderid" });
  }

  try {
    console.log(`📜 Fetching order history for: Username=${username || "N/A"}, OrderID=${orderid || "N/A"}`);

    const requestData = {
      keyapi: BYSHOP_API_KEY,
    };

    // 🔹 ใช้ username_customer หรือ orderid ตามเงื่อนไข
    if (username) {
      requestData.username_customer = username;
    }

    if (orderid) {
      requestData.orderid = orderid;
    }

    // 🔹 เรียก API ของ ByShop
    const response = await axios.post("https://byshop.me/api/history", requestData, { timeout: 10000 });

    console.log("📢 API Response (History):", response.data);

    // 🔹 ตรวจสอบว่ามีข้อมูลจริงหรือไม่
    if (response.data && Array.isArray(response.data)) {
      return res.status(200).json({ status: "success", orders: response.data });
    } else {
      return res.status(400).json({ status: "error", message: "❌ ไม่พบข้อมูลการสั่งซื้อ" });
    }
  } catch (error) {
    console.error("❌ Error fetching order history:", error?.response?.data || error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
