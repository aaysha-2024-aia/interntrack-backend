// backend/controllers/uploadController.js

const User = require("../models/User");
const Internship = require("../models/Internship");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinaryUpload");

// ─────────────────────────────────────────────
// @desc    Upload / Update user avatar
// @route   PUT /api/upload/avatar
// @access  Private
// ─────────────────────────────────────────────
const uploadAvatar = async (req, res, next) => {
  try {
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image file",
      });
    }

    const user = await User.findById(req.user._id);

    // ─────────────────────────────────────────
    // Delete old avatar from Cloudinary
    // if user already has one (not the default)
    // ─────────────────────────────────────────
    if (user.avatar && user.avatar.public_id) {
      await deleteFromCloudinary(user.avatar.public_id, "image");
    }

    // ─────────────────────────────────────────
    // Upload new avatar to Cloudinary
    // Store in "internship-tracker/avatars" folder
    // ─────────────────────────────────────────
    const result = await uploadToCloudinary(
      req.file.buffer,
      "internship-tracker/avatars",
      "image"
    );

    // Update user avatar in database
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Upload resume for an internship
// @route   PUT /api/upload/resume/:internshipId
// @access  Private
// ─────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF file",
      });
    }

    // Only allow PDFs for resume
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        success: false,
        message: "Only PDF files are allowed for resume",
      });
    }

    const internship = await Internship.findById(req.params.internshipId);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    // Make sure user owns this internship
    if (internship.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this internship",
      });
    }

    // ─────────────────────────────────────────
    // Delete old resume from Cloudinary if exists
    // ─────────────────────────────────────────
    if (internship.resume && internship.resume.public_id) {
      await deleteFromCloudinary(internship.resume.public_id, "raw");
    }

    // ─────────────────────────────────────────
    // Upload new resume PDF to Cloudinary
    // Store in "internship-tracker/resumes" folder
    // resource_type "raw" is used for PDFs
    // ─────────────────────────────────────────
    const result = await uploadToCloudinary(
      req.file.buffer,
      "internship-tracker/resumes",
      "raw"
    );

    // Update internship resume in database
    internship.resume = {
      public_id: result.public_id,
      url: result.secure_url,
    };
    await internship.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete resume from an internship
// @route   DELETE /api/upload/resume/:internshipId
// @access  Private
// ─────────────────────────────────────────────
const deleteResume = async (req, res, next) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    if (internship.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete from Cloudinary
    if (internship.resume && internship.resume.public_id) {
      await deleteFromCloudinary(internship.resume.public_id, "raw");
    }

    // Remove resume from database
    internship.resume = { public_id: null, url: null };
    await internship.save();

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAvatar, uploadResume, deleteResume };