// backend/routes/uploadRoutes.js

const express = require("express");
const router = express.Router();

const {
  uploadAvatar,
  uploadResume,
  deleteResume,
} = require("../controllers/uploadController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ─────────────────────────────────────────────
// AVATAR UPLOAD
// PUT /api/upload/avatar
// Field name must be "avatar" in form-data
// ─────────────────────────────────────────────
router.put(
  "/avatar",
  protect,
  upload.single("avatar"), // "avatar" = form-data field name
  uploadAvatar
);

// ─────────────────────────────────────────────
// RESUME UPLOAD
// PUT /api/upload/resume/:internshipId
// Field name must be "resume" in form-data
// ─────────────────────────────────────────────
router.put(
  "/resume/:internshipId",
  protect,
  upload.single("resume"), // "resume" = form-data field name
  uploadResume
);

// ─────────────────────────────────────────────
// DELETE RESUME
// DELETE /api/upload/resume/:internshipId
// ─────────────────────────────────────────────
router.delete("/resume/:internshipId", protect, deleteResume);

module.exports = router;