// backend/middleware/uploadMiddleware.js

const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDF and images
  const allowedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "application/pdf",
    "application/octet-stream", // some PDFs come as this
  ];

  if (
    allowedTypes.includes(file.mimetype) ||
    file.originalname.endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP images and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;