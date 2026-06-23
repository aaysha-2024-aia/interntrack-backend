const Internship = require("../models/Internship");

// @desc    Add new internship
// @route   POST /api/internships
// @access  Private
exports.addInternship = async (req, res) => {
  try {
    const internship = await Internship.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      internship,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all internships for logged-in user
// @route   GET /api/internships
// @access  Private
exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: internships.length,
      internships,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Private
exports.getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    // Make sure user owns this internship
    if (internship.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private
exports.updateInternship = async (req, res) => {
  try {
    let internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    // Make sure user owns this internship
    if (internship.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, internship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res
        .status(404)
        .json({ success: false, message: "Internship not found" });
    }

    // Make sure user owns this internship
    if (internship.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    await internship.deleteOne();

    res.status(200).json({ success: true, message: "Internship deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};