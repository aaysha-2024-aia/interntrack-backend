const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  addInternship,
  getInternships,
  getInternship,
  updateInternship,
  deleteInternship,
} = require("../controllers/internshipController");

router.route("/")
  .get(protect, authorize("student", "placement", "admin"), getInternships)
  .post(protect, authorize("student", "placement", "admin"), addInternship);

router.route("/:id")
  .get(protect, authorize("student", "placement", "admin"), getInternship)
  .put(protect, authorize("student", "placement", "admin"), updateInternship)
  .delete(protect, authorize("student", "admin"), deleteInternship);

module.exports = router;