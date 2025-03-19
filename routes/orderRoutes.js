const express = require("express");
const axios = require("axios");
const router = express.Router();
const FormData = require("form-data");

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY;

router.post("/", async (req, res) => {
  try {
    // รับค่าจาก request body
    let { id, user_id, username_customer } = req.body;

    // ตรวจสอบว่า id ถูกส่งมาหรือไม่
    if (!id) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า" });
    }

    // ตรวจสอบว่า user_id หรือ username_customer ต้องมีอย่างน้อยหนึ่งค่า
    if (!user_id && !username_customer) {
      return res.status(400).json({ 
        status: "error", 
        message: "❌ ต้องระบุ user_id หรือ username_customer อย่างน้อยหนึ่งค่า" 
      });
    }

    console.log(`🛒 กำลังประมวลผลการสั่งซื้อ: ID=${id}, User ID=${user_id || "N/A"}, Username=${username_customer || "N/A"}`);

    // สร้าง formData สำหรับส่งไปยัง ByShop API
    const formData = new FormData();
    formData.append("id", id);
    formData.append("keyapi", BYSHOP_API_KEY);

    // ส่ง user_id หรือ username_customer ไปยัง API ByShop (ถ้ามี)
    if (user_id) formData.append("user_id", user_id);
    if (username_customer) formData.append("username_customer", username_customer);

    // ส่งคำขอไปที่ ByShop API
    const response = await axios.post("https://byshop.me/api/buy", formData, {
      headers: { ...formData.getHeaders() },
      timeout: 10000, // ตั้งเวลาหมดเวลา (Timeout)
    });

    console.log("📢 API Response (ซื้อสินค้า):", response.data);

    // ถ้าคำขอสำเร็จ ส่งข้อมูลกลับไปยังผู้ใช้
    if (response.data.status === "success") {
      return res.json(response.data);
    } else {
      // ถ้าการซื้อไม่สำเร็จ ส่งข้อความผิดพลาด
      return res.status(400).json({ status: "error", message: response.data.message || "❌ การสั่งซื้อไม่สำเร็จ" });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    // ถ้าเกิดข้อผิดพลาดในการเรียก API ส่งข้อความผิดพลาดกลับไป
    return res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการสั่งซื้อสินค้า" });
  }
});

module.exports = router;
