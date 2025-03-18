const express = require("express");
const axios = require("axios");
const FormData = require("form-data"); // ✅ นำเข้า FormData
const router = express.Router();

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY || "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv"; 

router.post("/", async (req, res) => {
  try {
    let { id, username_customer } = req.body;

    // ✅ ตรวจสอบค่าที่จำเป็น
    if (!id) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า" });
    }

    console.log(`🛒 Processing purchase: ID=${id}, Username=${username_customer}, KeyAPI=${BYSHOP_API_KEY}`);

    // ✅ สร้าง form-data
    const formData = new FormData();
    formData.append("id", id);
    formData.append("keyapi", BYSHOP_API_KEY);

    // ✅ ใส่ username_customer ถ้ามี
    if (username_customer) {
      formData.append("username_customer", username_customer);
    }

    // ✅ ส่ง form-data ไปยัง ByShop API
    const response = await axios.post("https://byshop.me/api/buy", formData, {
      headers: {
        ...formData.getHeaders(), // ✅ ใช้ headers ของ form-data
      },
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
