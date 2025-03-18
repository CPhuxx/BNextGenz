const express = require("express");
const axios = require("axios");
const router = express.Router();

// ✅ API ดึงข้อมูลสินค้าเกมจาก ByShop
router.get("/", async (req, res) => {
  try {
    console.log("📢 Fetching game products from ByShop...");

    // ✅ เรียก API จาก ByShop
    const response = await axios.get("https://byshop.me/api/bypay", {
      params: { api: "game" }, // ดึงเฉพาะสินค้าเกม
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      console.log(`✅ Game products fetched successfully! จำนวนสินค้า: ${response.data.length}`);

      return res.json({
        status: "success",
        gameProducts: response.data.map((game) => ({
          name: game.name,
          category: game.category,
          img: game.img,
          img_icon: game.img_icon,
          discount: game.discount,
          denominationData: game.denominationData, // รายละเอียดแพ็คเกจ
          server: game.server,
          format_id: game.format_id,
        })),
      });
    } else {
      console.error("⚠️ Failed to fetch game products:", response.data);
      return res.status(400).json({
        status: "error",
        message: "❌ ไม่สามารถดึงข้อมูลสินค้าเกมได้",
        error: response.data,
      });
    }
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return res.status(500).json({
      status: "error",
      message: "❌ เกิดข้อผิดพลาดในการดึงข้อมูลสินค้าเกม",
      error: error.message,
    });
  }
});

module.exports = router;
