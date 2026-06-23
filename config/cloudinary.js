// backend/config/cloudinary.js

const cloudinary = require("cloudinary").v2;

// ─────────────────────────────────────────────
// Configure Cloudinary with credentials from .env
// This must be called once at app startup (in server.js)
// ─────────────────────────────────────────────
const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log("✅ Cloudinary Connected Successfully");
  } catch (error) {
    console.error("❌ Cloudinary Connection Error:", error.message);
  }
};

// Export both the configured instance and the connect function
module.exports = { cloudinary, cloudinaryConnect };