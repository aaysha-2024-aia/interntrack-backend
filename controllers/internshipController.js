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
// @desc    Get all internships with Search, Filter, Sort, Pagination
// @route   GET /api/internships
// @access  Private
exports.getInternships = async (req, res) => {
  try {
    // ─────────────────────────────────────────
    // BUILD FILTER OBJECT
    // ─────────────────────────────────────────
    const filter = { user: req.user._id };

    // Filter by status e.g. ?status=Applied
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by priority e.g. ?priority=High
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Filter by location e.g. ?location=Bangalore
    if (req.query.location) {
      filter.location = {
        $regex: req.query.location,
        $options: "i",
      };
    }

    // Filter by company e.g. ?company=Google
    if (req.query.company) {
      filter.company = {
        $regex: req.query.company,
        $options: "i",
      };
    }

    // Search by keyword e.g. ?keyword=developer
    if (req.query.keyword) {
      filter.$or = [
        { company: { $regex: req.query.keyword, $options: "i" } },
        { role: { $regex: req.query.keyword, $options: "i" } },
        { description: { $regex: req.query.keyword, $options: "i" } },
      ];
    }

    // ─────────────────────────────────────────
    // SORTING e.g. ?sort=-createdAt
    // ─────────────────────────────────────────
    const sort = req.query.sort || "-createdAt";

    // ─────────────────────────────────────────
    // PAGINATION e.g. ?page=1&limit=10
    // ─────────────────────────────────────────
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ─────────────────────────────────────────
    // EXECUTE QUERY
    // ─────────────────────────────────────────
    const internships = await Internship.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Internship.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
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