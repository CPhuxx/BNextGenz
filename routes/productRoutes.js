const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY; // ✅ โหลด API Key จาก .env

// ✅ ตรวจสอบว่า API Key ถูกโหลดมาจาก .env หรือไม่
if (!BYSHOP_API_KEY) {
  console.error("❌ ERROR: BYSHOP_API_KEY is missing! ตรวจสอบ .env");
} else {
  console.log("✅ BYSHOP_API_KEY Loaded Successfully:", BYSHOP_API_KEY);
}

// ✅ **API Proxy ดึงสินค้าจาก ByShop**
router.get("/", async (req, res) => {
  console.log("📢 กำลังดึงข้อมูลสินค้าจาก ByShop...");

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get("https://byshop.me/api/product", {
        headers: { "Content-Type": "application/json" },
        params: { keyapi: BYSHOP_API_KEY }, // ✅ ส่ง API Key ผ่าน params
        timeout: 10000,
      });

      console.log("📥 API Response:", response.data);

      if (response.data && response.data.status === "success" && Array.isArray(response.data.products)) {
        console.log("✅ ดึงข้อมูลสินค้าได้สำเร็จ!");
        return res.json({ status: "success", products: response.data.products });
      } else {
        console.error("⚠️ ไม่สามารถดึงข้อมูลสินค้าได้:", response.data);
        return res.status(400).json({
          status: "error",
          message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้ โปรดตรวจสอบ API",
          error: response.data,
        });
      }
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าครั้งที่ ${retryCount + 1}/${maxRetries}:`, error.message);

      retryCount++;
      if (retryCount >= maxRetries) {
        return res.status(500).json({
          status: "error",
          message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า (API อาจล่ม)",
          error: error?.response?.data || error.message,
        });
      }

      // 🔁 **Retry ถ้า Fetch ไม่ได้ (รอ 5 วินาที)**
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
});

// ✅ **API สำหรับอัพเดตราคาสินค้า**
router.post("/update-price", async (req, res) => {
  const { appId, price } = req.body;

  // ตรวจสอบข้อมูลที่ส่งมาว่ามีความถูกต้อง
  if (!appId || isNaN(price) || price <= 0) {
    return res.status(400).json({ status: "error", message: "ข้อมูลไม่ถูกต้อง" });
  }

  console.log(`📢 กำลังอัพเดตราคาสินค้า ID: ${appId} เป็นราคา: ${price}`);

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post("https://byshop.me/api/product/update", {
        keyapi: BYSHOP_API_KEY,  // ส่ง API Key ผ่าน body
        id: appId,
        price: price,
      });

      console.log("📥 API Response สำหรับการอัพเดตราคา:", response.data);

      if (response.data.status === "success") {
        console.log("✅ อัพเดตราคาสินค้าได้สำเร็จ!");
        return res.json({ status: "success", message: "ราคาสินค้าถูกอัพเดต" });
      } else {
        console.error("⚠️ การอัพเดตราคาไม่สำเร็จ:", response.data);
        return res.status(400).json({
          status: "error",
          message: "❌ ไม่สามารถอัพเดตราคาได้ โปรดตรวจสอบ API",
          error: response.data,
        });
      }
    } catch (error) {
      console.error(`❌ เกิดข้อผิดพลาดในการอัพเดตราคาครั้งที่ ${retryCount + 1}/${maxRetries}:`, error.message);

      retryCount++;
      if (retryCount >= maxRetries) {
        return res.status(500).json({
          status: "error",
          message: "❌ เกิดข้อผิดพลาดในการอัพเดตราคา (API อาจล่ม)",
          error: error?.response?.data || error.message,
        });
      }

      // 🔁 **Retry ถ้า API อัพเดตไม่ได้ (รอ 5 วินาที)**
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
});

module.exports = router;
