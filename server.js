require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const authRoutes = require("./routes/authRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const moneyRoutes = require("./routes/moneyRoutes");
const gameProductRoutes = require("./routes/gameProductRoutes");

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0";
const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY || "";

console.log("🔑 BYSHOP_API_KEY Loaded:", BYSHOP_API_KEY || "❌ ไม่พบ API Key!");

// ✅ ตั้งค่า `multer` เพื่อรองรับ `form-data`
const upload = multer();

// ✅ ตั้งค่า `cors` และ `body-parser`
app.use(
  cors({
    origin: ["http://localhost:5173", "http://172.20.12.22:5173"],
    credentials: true,
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.any()); // ✅ รองรับ `form-data`

// ✅ ตั้งค่า Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/admin/upload-banner", upload.single("banner"), bannerRoutes);
app.use("/api/order-history", orderRoutes);
app.use("/api/money", moneyRoutes);
app.use("/api/game-products", gameProductRoutes);

// ✅ **ดึงสินค้าจาก ByShop**
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get("https://byshop.me/api/product", { timeout: 10000 });
    if (response.data && Array.isArray(response.data)) {
      return res.json({ status: "success", products: response.data });
    } else {
      return res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้" });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
  }
});

// ✅ **อัพเดตราคาสินค้าใน ByShop**
app.post("/api/update-price", async (req, res) => {
  const { appId, price } = req.body;

  if (!appId || isNaN(price) || price <= 0) {
    return res.status(400).json({ status: "error", message: "❌ ข้อมูลไม่ถูกต้อง" });
  }

  console.log(`📢 อัพเดตราคาสินค้า ID: ${appId} เป็นราคา: ${price}`);

  try {
    const response = await axios.post("https://byshop.me/api/product/update", {
      keyapi: BYSHOP_API_KEY, 
      id: appId,
      price: price,
    });

    console.log("📥 API Response สำหรับอัพเดตราคา:", response.data);

    if (response.data.status === "success") {
      return res.json({ status: "success", message: "✅ ราคาสินค้าถูกอัพเดต" });
    } else {
      return res.status(400).json({ status: "error", message: "❌ ไม่สามารถอัพเดตราคาได้" });
    }
  } catch (error) {
    console.error("❌ Error updating product price:", error.message);
    return res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการอัพเดตราคา" });
  }
});

// ✅ **สั่งซื้อสินค้าผ่าน ByShop**
app.post("/api/buy", async (req, res) => {
  try {
    let { id, user_id } = req.body;
    if (!id || !user_id) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า และ user_id" });
    }

    console.log(`🛒 Processing purchase: ID=${id}, User ID=${user_id}`);

    const formData = new FormData();
    formData.append("id", id);
    formData.append("keyapi", BYSHOP_API_KEY);
    formData.append("user_id", user_id);

    const response = await axios.post("https://byshop.me/api/buy", formData, {
      headers: { ...formData.getHeaders() },
      timeout: 10000,
    });

    console.log("📥 API Response:", response.data);

    if (response.data.status === "success") {
      return res.json(response.data);
    } else {
      return res.status(400).json({ status: "error", message: response.data.message || "❌ การสั่งซื้อไม่สำเร็จ" });
    }
  } catch (error) {
    console.error("❌ Error processing order:", error.response ? error.response.data : error.message);
    return res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการสั่งซื้อสินค้า" });
  }
});

// ✅ **ดึงข้อมูลเครดิตของผู้ใช้จาก ByShop**
app.post("/api/money", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ user_id" });
    }

    console.log(`📢 กำลังตรวจสอบยอดเงินของผู้ใช้: ${user_id}`);
    console.log(`🔑 ใช้ BYSHOP_API_KEY: ${BYSHOP_API_KEY}`);

    if (!BYSHOP_API_KEY) {
      return res.status(500).json({ status: "error", message: "❌ API Key ไม่ถูกต้อง หรือไม่ถูกโหลด" });
    }

    const formData = new FormData();
    formData.append("keyapi", BYSHOP_API_KEY);
    formData.append("user_id", user_id);

    const response = await axios.post("https://byshop.me/api/money", formData, {
      headers: { ...formData.getHeaders() },
      timeout: 10000,
    });

    console.log("📥 API Response:", response.data);

    if (response.data.status === "success") {
      return res.json({ status: "success", money: response.data.money });
    } else {
      return res.status(400).json({ status: "error", message: response.data.message });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    return res.status(500).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลเครดิตได้" });
  }
});

// ✅ เริ่มต้นเซิร์ฟเวอร์
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
