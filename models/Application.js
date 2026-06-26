// backend/models/Application.js

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  status: {
    type: String,
    enum: [
  "pending",
  "reviewing",
  "shortlisted",
  "interviewing",
  "offered",
  "accepted",
  "rejected",
  "withdrawn",
],
default: "pending",
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
  },
  resumeUrl: {
    type: String,
    default: null,
  },
  timeline: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      note: String,
    },
  ],
  interview: {
    scheduledAt: { type: Date, default: null },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Phone"],
      default: "Online",
    },
    link: { type: String, default: null },
    notes: { type: String, default: null },
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// One student can apply to one internship only once
applicationSchema.index(
  { student: 1, internship: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);