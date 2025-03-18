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
const gameProductRoutes = require("./routes/gameProductRoutes"); // ✅ เพิ่มเส้นทางสำหรับข้อมูลเกม

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "0.0.0.0"; // รองรับทุก IP ในเครือข่าย
const BYSHOP_API_KEY = process.env.BYSHOP_API_KEY || "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";

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
    origin: ["http://localhost:5173", "http://172.20.12.22:5173"], // อนุญาตให้ใช้จากทั้งสอง host
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
app.use("/api/game-products", gameProductRoutes); // ✅ เส้นทางสำหรับข้อมูลเกม

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

// ✅ **API Proxy ดึงข้อมูลสินค้าเกมจาก ByShop**
app.get("/api/game-products", async (req, res) => {
  try {
    // ส่งคำขอไปยัง ByShop API สำหรับข้อมูลสินค้าเกม
    const response = await axios.get("https://byshop.me/api/bypay?api=game", {
      params: { api: "game" }, // ดึงเฉพาะสินค้าเกม
    });

    if (response.status === 200) {
      // แปลงข้อมูลสินค้าก่อนส่งกลับ
      const gameProducts = response.data.map((product) => ({
        name: product.name,
        img: product.img,
        info: product.info,
        type_code: product.type_code,
        price: product.price,
        discount: product.discount,
        category: product.category,
        format_id: product.format_id,
      }));

      return res.json({
        status: "success",
        gameProducts: gameProducts,
      });
    } else {
      return res.status(400).json({ status: "error", message: "❌ ไม่สามารถดึงข้อมูลสินค้า" });
    }
  } catch (error) {
    console.error("❌ Error fetching game products:", error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าเกม",
      error: error.message,
    });
  }
});

// ✅ **API Proxy ทำรายการสั่งซื้อผ่าน ByShop**
app.post("/api/buy", async (req, res) => {
  try {
    let { id, username_customer } = req.body;
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

// 🔹 เริ่มต้น Server รองรับทั้ง localhost และ 172.20.12.22
app.listen(PORT, HOST, () => {
  console.log(`✅ Server is running on http://localhost:${PORT} and http://${HOST}:${PORT}`);
});
