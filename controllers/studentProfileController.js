const StudentProfile = require("../models/StudentProfile");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinaryUpload");

exports.createProfile = async (req, res) => {
  try {
    const existingProfile = await StudentProfile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: "Profile already exists" });
    }
    const profile = await StudentProfile.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).populate("user", "name email avatar");
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    Object.assign(profile, req.body);
    await profile.save();
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a PDF file" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, message: "Only PDF files are allowed" });
    }
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    if (profile.resume && profile.resume.public_id) {
      await deleteFromCloudinary(profile.resume.public_id, "raw");
    }
    const result = await uploadToCloudinary(req.file.buffer, "internship-tracker/resumes", "raw");
    profile.resume = { public_id: result.public_id, url: result.secure_url, uploadedAt: new Date() };
    await profile.save();
    res.status(200).json({ success: true, message: "Resume uploaded successfully", resume: { url: result.secure_url } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    if (!profile.resume || !profile.resume.public_id) {
      return res.status(400).json({ success: false, message: "No resume found" });
    }
    await deleteFromCloudinary(profile.resume.public_id, "raw");
    profile.resume = { public_id: null, url: null, uploadedAt: null };
    await profile.save();
    res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: "Please provide skills as an array" });
    }
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    profile.skills = skills;
    await profile.save();
    res.status(200).json({ success: true, message: "Skills updated", skills: profile.skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};