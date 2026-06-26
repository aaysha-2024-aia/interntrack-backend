const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only students and admins can access dashboard stats
router.get("/stats", protect, authorize("student", "admin"), getDashboardStats);

module.exports = router;