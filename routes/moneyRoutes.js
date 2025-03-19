const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY;

router.post("/", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ user_id" });
    }

    console.log(`📢 กำลังตรวจสอบยอดเงินของผู้ใช้: ${user_id}`);
    console.log(`🔑 Using BYSHOP_API_KEY: ${BYSHOP_API_KEY}`); // ตรวจสอบว่า API Key มีค่าจริงๆ หรือไม่

    // ตรวจสอบว่า API Key มีค่า
    if (!BYSHOP_API_KEY) {
      return res.status(500).json({ status: "error", message: "❌ API Key ไม่ถูกต้อง หรือไม่ถูกโหลด" });
    }

    // ส่ง API Key ไปกับ request
    const response = await axios.post(
      "https://byshop.me/api/money",
      { keyapi: BYSHOP_API_KEY, user_id: user_id },
      { headers: { "Content-Type": "application/json" }, timeout: 10000 }
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
