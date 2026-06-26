// backend/controllers/dashboardController.js

const Application = require("../models/Application");
const Internship = require("../models/Internship");
const StudentProfile = require("../models/StudentProfile");

// ─────────────────────────────────────────────
// @desc    Get dashboard statistics for
//          logged-in student
// @route   GET /api/dashboard/stats
// @access  Private
// ─────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // ─────────────────────────────────────────
    // 1. APPLICATION COUNTS BY STATUS
    // ─────────────────────────────────────────
    const applicationStats = await Application.aggregate([
      {
        $match: { student: userId }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array to easy-to-use object
    // e.g. { Pending: 3, Accepted: 1, Rejected: 2 }
    const statusMap = {};
    applicationStats.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    // ─────────────────────────────────────────
    // 2. TOTAL COUNTS
    // ─────────────────────────────────────────
    const totalApplications = await Application.countDocuments({
      student: userId,
    });

    const totalInternships = await Internship.countDocuments();

    // ─────────────────────────────────────────
    // 3. RECENT APPLICATIONS (last 5)
    // ─────────────────────────────────────────
    const recentApplications = await Application.find({
      student: userId,
    })
      .sort({ appliedAt: -1 })
      .limit(5)
      .populate("internship", "company role location status");

    // ─────────────────────────────────────────
    // 4. PROFILE COMPLETION SCORE
    // ─────────────────────────────────────────
    const profile = await StudentProfile.findOne({ user: userId });
    const profileScore = profile ? profile.completionScore : 0;

    // ─────────────────────────────────────────
    // 5. ACTIVE INTERNSHIP (if any accepted)
    // ─────────────────────────────────────────
    const activeInternship = await Application.findOne({
      student: userId,
      status: "Accepted",
    }).populate("internship", "company role location startDate endDate");

    // ─────────────────────────────────────────
    // 6. SEND RESPONSE
    // ─────────────────────────────────────────
    res.status(200).json({
      success: true,
      stats: {
        // Application counts
        totalApplications,
       interviewing: statusMap["interviewing"] || 0,
offered: statusMap["offered"] || 0,
accepted: statusMap["accepted"] || 0,
rejected: statusMap["rejected"] || 0,
withdrawn: statusMap["withdrawn"] || 0,
pending: statusMap["pending"] || 0,
reviewing: statusMap["reviewing"] || 0,

        // Internship market
        totalInternshipsAvailable: totalInternships,

        // Profile
        profileCompletionScore: profileScore,

        // Active internship
        activeInternship: activeInternship || null,

        // Recent activity
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };