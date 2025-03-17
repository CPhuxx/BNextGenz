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
const orderRoutes = require("./routes/orderRoutes");
const moneyRoutes = require("./routes/moneyRoutes");

const app = express();
const PORT = process.env.PORT || 4000;
const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY;

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

// ✅ **API เช็คยอดเงินจากบัญชีธนาคาร (ByShop)**
app.post("/api/bank-transactions", async (req, res) => {
  try {
    const { account } = req.body;
    if (!account) {
      return res.status(400).json({ status: "error", message: "❌ ต้องระบุหมายเลขบัญชี" });
    }

    const response = await axios.post("https://byshop.me/api/line_bank", {
      keyapi: BYSHOP_API_KEY,
      account,
    });

    console.log("📢 API Response (Bank Transactions):", response.data);

    if (response.data.status === "success") {
      res.json({
        status: "success",
        transactions: response.data.data,
      });
    } else {
      res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลธุรกรรมได้" });
    }
  } catch (error) {
    console.error("❌ Error fetching bank transactions:", error.response ? error.response.data : error.message);
    res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลธุรกรรม",
      error: error.response ? error.response.data : error.message,
    });
  }
});

// ✅ **API Proxy ดึงสินค้าจาก ByShop**
app.get("/api/products", async (req, res) => {
  console.log("📢 Fetching products from ByShop...");

  try {
    const response = await axios.get("https://byshop.me/api/product", {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    if (response.data && Array.isArray(response.data)) {
      res.json({ status: "success", products: response.data });
    } else {
      res.status(400).json({
        status: "error",
        message: "❌ ไม่สามารถดึงข้อมูลสินค้าได้",
        error: response.data,
      });
    }
  } catch (error) {
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

    console.log(`🛒 Checking balance before purchase: ID=${id}, Username=${username}`);

    // ✅ 1. ดึงยอดเงินจาก ByShop
    const moneyResponse = await axios.post(
      "https://byshop.me/api/money",
      { keyapi: BYSHOP_API_KEY },
      { timeout: 10000 }
    );

    if (moneyResponse.data.status !== "success") {
      return res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงยอดเงินได้" });
    }

    const userBalance = parseFloat(moneyResponse.data.money);
    console.log(`💰 User balance: ${userBalance}`);

    // ✅ 2. ดึงราคาสินค้า
    const productsResponse = await axios.get("https://byshop.me/api/product", { timeout: 10000 });
    const product = productsResponse.data.find((p) => p.id === id);

    if (!product) {
      return res.status(400).json({ status: "error", message: "❌ ไม่พบสินค้า" });
    }

    const productPrice = parseFloat(product.price);
    console.log(`🛍️ Product price: ${productPrice}`);

    // ✅ 3. เช็คว่าเครดิตพอหรือไม่
    if (userBalance < productPrice) {
      return res.status(400).json({ status: "error", message: "❌ เครดิตไม่พอ กรุณาเติมเงินก่อน" });
    }

    // ✅ 4. ทำรายการสั่งซื้อ
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

    if (response.data.status === "success") {
      res.json({ status: "success", email: response.data.email, password: response.data.password });
    } else {
      res.status(400).json({ status: "error", message: "❌ การสั่งซื้อไม่สำเร็จ", error: response.data });
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
