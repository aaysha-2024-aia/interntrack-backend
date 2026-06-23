const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  addInternship,
  getInternships,
  getInternship,
  updateInternship,
  deleteInternship,
} = require("../controllers/internshipController");

router.route("/").get(protect, getInternships).post(protect, addInternship);

router
  .route("/:id")
  .get(protect, getInternship)
  .put(protect, updateInternship)
  .delete(protect, deleteInternship);

module.exports = router;