// backend/middleware/uploadMiddleware.js

const multer = require("multer");

// ─────────────────────────────────────────────
// MULTER STORAGE — use memory storage
// Files are kept in memory as Buffer objects
// before being uploaded to Cloudinary
// We don't save anything to local disk
// ─────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─────────────────────────────────────────────
// FILE FILTER
// Only allow specific file types
// ─────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const allowedDocTypes = ["application/pdf"];
  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, WEBP images and PDF files are allowed."),
      false // Reject file
    );
  }
};

// ─────────────────────────────────────────────
// MULTER INSTANCE
// Max file size: 5MB
// ─────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
});

module.exports = upload;