require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const axios = require("axios");

const authRoutes = require("./routes/authRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const moneyRoutes = require("./routes/moneyRoutes");

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
app.use("/api/order-history", orderRoutes);
app.use("/api/money", moneyRoutes);

// ✅ **API Proxy ดึงสินค้าจาก ByShop**
app.get("/api/products", async (req, res) => {
  try {
    const response = await axios.get("https://byshop.me/api/product", { timeout: 10000 });
    if (response.data && Array.isArray(response.data)) {
      res.json({ status: "success", products: response.data });
    } else {
      res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" });
  }
});

// ✅ **API Proxy ทำรายการสั่งซื้อผ่าน ByShop**
app.post("/api/buy", async (req, res) => {
  try {
    let { id, username_customer } = req.body;
    if (!id || !username_customer) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุ ID สินค้า และ username_customer" });
    }

    // ✅ ปรับให้ใช้ username_customer ที่ถูกต้อง
    if (username_customer !== "puridet009") {
      console.warn(`⚠️ แก้ไข username_customer: ${username_customer} -> puridet009`);
      username_customer = "puridet009";
    }

    console.log(`🛒 Processing purchase: ID=${id}, Username=${username_customer}, KeyAPI=${BYSHOP_API_KEY}`);

    const response = await axios.post(
      "https://byshop.me/api/buy",
      {
        id,
        keyapi: BYSHOP_API_KEY,
        username_customer,
      },
      { timeout: 10000 }
    );

    console.log("📢 API Response (Buy):", response.data);

    if (response.data.status === "success") {
      res.json(response.data);
    } else {
      res.status(400).json({ status: "error", message: "❌ การสั่งซื้อไม่สำเร็จ", error: response.data });
    }
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ status: "error", message: "❌ เกิดข้อผิดพลาดในการสั่งซื้อสินค้า" });
  }
});

// 🔹 เริ่มต้น Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
