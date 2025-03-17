const express = require("express");
const axios = require("axios");
const router = express.Router();

const BYSHOP_API_KEY = "BYShop-m0XNSdX68cilPrX9gcZ81arPPN4NJv";

// ✅ **API ดึงยอดเงินจาก ByShop**
router.post("/money", async (req, res) => {
  try {
    const response = await axios.post(
      "https://byshop.me/api/money",
      { keyapi: BYSHOP_API_KEY },
      { timeout: 10000 }
    );

    if (response.data.status === "success") {
      res.json({ status: "success", money: parseFloat(response.data.money) });
    } else {
      res.status(400).json({ status: "error", message: "ไม่สามารถดึงยอดเงินได้" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "เกิดข้อผิดพลาด", error });
  }
});

module.exports = router;
