const multer = require("multer");
const upload = multer(); // Middleware สำหรับ `form-data`

const checkAPIKey = (req, res, next) => {
  const apiKey = req.headers["keyapi"] || req.body.keyapi || req.query.keyapi; // รองรับ Headers, Body และ Query
  const serverApiKey = process.env.BYSHOP_API_KEY;

  console.log("🔑 API Key ที่รับมา:", apiKey);
  console.log("🔑 API Key ที่เซิร์ฟเวอร์โหลดจาก .env:", serverApiKey);

  if (!serverApiKey) {
    console.error("❌ ERROR: BYSHOP_API_KEY ไม่ถูกโหลดจาก .env");
    return res.status(500).json({ status: "error", message: "❌ Server API Key ไม่ถูกต้อง" });
  }

  if (!apiKey || apiKey !== serverApiKey) {
    console.error("❌ ERROR: Unauthorized API Key");
    return res.status(403).json({ status: "error", message: "❌ Unauthorized API Key" });
  }

  next();
};

module.exports = { checkAPIKey, upload }; // เพิ่ม `upload` เพื่อให้ใช้ `form-data`
