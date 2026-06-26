const Application = require("../models/Application");

exports.applyToInternship = async (req, res) => {
  try {
    const { internshipId, coverLetter, resumeUrl } = req.body;
    const exists = await Application.findOne({
      student: req.user._id,
      internship: internshipId,
    });
    if (exists) return res.status(400).json({ message: "Already applied" });

    const app = await Application.create({
      student: req.user._id,
      internship: internshipId,
      coverLetter,
      resumeUrl,
      status: "pending",
      timeline: [{ status: "pending", note: "Application submitted" }],
    });

    res.status(201).json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user._id })
      .populate("internship", "company role location stipend description")
      .sort({ appliedAt: -1 });

    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getApplicationsForInternship = async (req, res) => {
  try {
    const apps = await Application.find({
      internship: req.params.internshipId,
    }).populate("student", "name email");

    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });

    app.status = status;
    app.timeline.push({ status, note: note || `Status changed to ${status}` });
    await app.save();

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};