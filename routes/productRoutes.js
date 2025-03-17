const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";

// ✅ **API Proxy ดึงสินค้าจาก ByShop**
router.get("/", async (req, res) => {
  console.log("📢 Fetching products from ByShop...");

  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.get("https://byshop.me/api/product", {
        headers: { "Content-Type": "application/json" },
        params: { keyapi: BYSHOP_API_KEY },
        timeout: 10000,
      });

      if (response.data && response.data.status === "success" && Array.isArray(response.data.products)) {
        console.log("✅ Products fetched successfully!");
        return res.json({ status: "success", products: response.data.products });
      } else {
        console.error("⚠️ Failed to fetch products:", response.data);
        return res.status(400).json({
          status: "error",
          message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้ โปรดตรวจสอบ API",
          error: response.data,
        });
      }
    } catch (error) {
      console.error(`❌ Error fetching products (Attempt ${retryCount + 1}/${maxRetries}):`, error.message);

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

module.exports = router;
