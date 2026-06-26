// backend/routes/studentProfileRoutes.js

const express = require("express");
const router = express.Router();

const {
  createProfile,
  getMyProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  updateSkills,
} = require("../controllers/studentProfileController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ─────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────
router.post("/", protect, createProfile);        // Create profile
router.get("/me", protect, getMyProfile);        // Get my profile
router.put("/", protect, updateProfile);         // Update profile

// ─────────────────────────────────────────────
// RESUME ROUTES
// ─────────────────────────────────────────────
router.put("/resume", protect, upload.single("resume"), uploadResume);
router.delete("/resume", protect, deleteResume);

// ─────────────────────────────────────────────
// SKILLS ROUTE
// ─────────────────────────────────────────────
router.put("/skills", protect, updateSkills);

module.exports = router;