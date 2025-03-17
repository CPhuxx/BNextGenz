require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes"); // ✅ เพิ่มเส้นทาง Order History

const app = express();
const PORT = process.env.PORT || 4000;
const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";

// 🔹 ตั้งค่าอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/banners/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 🔹 ตั้งค่า CORS ให้ครอบคลุม
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔹 ตั้งค่า Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", userRoutes);
app.use("/api/admin/upload-banner", upload.single("banner"), bannerRoutes);
app.use("/api/order-history", orderRoutes); // ✅ เพิ่ม API สำหรับดึงประวัติการสั่งซื้อ

// ✅ **API Proxy ดึงสินค้าจาก ByShop**
app.get("/api/products", async (req, res) => {
  console.log("📢 Fetching products from ByShop...");

  try {
    const response = await axios.get("https://byshop.me/api/product", {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("📥 API Response:", response.data);

    if (response.data && Array.isArray(response.data)) {
      res.json({ status: "success", products: response.data });
    } else {
      res.status(400).json({ 
        status: "error", 
        message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้ โปรดตรวจสอบ API",
        error: response.data 
      });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// ✅ **API Proxy ทำรายการสั่งซื้อผ่าน ByShop**
app.post("/api/buy", async (req, res) => {
  try {
    const { id, username } = req.body;

    if (!id || !username) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID และ Username" });
    }

    console.log(`🛒 Processing purchase: ID=${id}, Username=${username}`);

    const response = await axios.post(
      "https://byshop.me/api/buy",
      {
        id,
        keyapi: BYSHOP_API_KEY,
        username,
      },
      { timeout: 10000 }
    );

    console.log("📢 API Response (Buy):", response.data);

    if (response.data && response.data.status === "success") {
      res.json({ status: "success", email: response.data.email, password: response.data.password });
    } else {
      res.status(400).json({ 
        status: "error", 
        message: "❌ การสั่งซื้อไม่สำเร็จ โปรดตรวจสอบ API หรือเครดิต",
        error: response.data 
      });
    }
  } catch (error) {
    console.error("❌ Error purchasing product:", error.response ? error.response.data : error.message);
    res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการสั่งซื้อสินค้า",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// ✅ **Handle Preflight Request (OPTIONS)**
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// 🔹 เริ่มต้น Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
