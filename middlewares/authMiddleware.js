const checkAPIKey = (req, res, next) => {
    const apiKey = req.headers["keyapi"] || req.body.keyapi; // รองรับทั้ง Headers และ Body
  
    if (!apiKey || apiKey !== process.env.BYSHOP_API_KEY) {
      return res.status(403).json({ status: "error", message: "❌ Unauthorized API Key" });
    }
  
    next();
  };
  
  module.exports = checkAPIKey;
  