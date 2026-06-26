// backend/models/StudentProfile.js

const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  rollNumber: { type: String, trim: true },
  branch: {
    type: String,
    enum: [
      "Computer Science",
      "Information Technology",
      "Electronics",
      "Mechanical",
      "Civil",
      "Other",
    ],
  },
  year: {
    type: Number,
    enum: [1, 2, 3, 4],
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  skills: [String],
  resume: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
    uploadedAt: { type: Date, default: null },
  },
  links: {
    linkedin: { type: String, default: null },
    github: { type: String, default: null },
    portfolio: { type: String, default: null },
  },
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      grade: String,
    },
  ],
  experience: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    },
  ],
  completionScore: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Auto-calculate profile completion score before saving
studentProfileSchema.pre("save", function (next) {
  let score = 0;
  if (this.rollNumber) score += 10;
  if (this.branch) score += 10;
  if (this.year) score += 10;
  if (this.cgpa) score += 10;
  if (this.bio) score += 10;
  if (this.skills.length > 0) score += 15;
  if (this.resume.url) score += 15;
  if (this.links.linkedin) score += 5;
  if (this.links.github) score += 5;
  if (this.education.length > 0) score += 10;
  this.completionScore = score;
  next();
});

module.exports = mongoose.model("StudentProfile", studentProfileSchema);