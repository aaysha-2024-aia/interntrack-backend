// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();

// Import controller functions
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

// Import protect middleware
const { protect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// PUBLIC ROUTES (no login required)
// ─────────────────────────────────────────────
router.post("/register", register);   // POST /api/auth/register
router.post("/login", login);         // POST /api/auth/login

// ─────────────────────────────────────────────
// PRIVATE ROUTES (login required)
// protect middleware runs first, then the handler
// ─────────────────────────────────────────────
router.get("/me", protect, getMe);                        // GET  /api/auth/me
router.put("/update-profile", protect, updateProfile);    // PUT  /api/auth/update-profile
router.put("/change-password", protect, changePassword);  // PUT  /api/auth/change-password

module.exports = router;