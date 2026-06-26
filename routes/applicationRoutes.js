// backend/routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  applyToInternship,
  getMyApplications,
  getApplicationsForInternship,
  updateApplicationStatus,
} = require("../controllers/applicationController");

router.post("/", protect, applyToInternship);
router.get("/my", protect, getMyApplications);
router.get("/internship/:internshipId", protect, getApplicationsForInternship);
router.put("/:id/status", protect, updateApplicationStatus);

module.exports = router;