// backend/models/User.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// USER SCHEMA
// Defines the structure of every user document
// stored in MongoDB
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Email must be unique across all users
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },

    // Password is hashed before saving (never stored as plain text)
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },

    // Profile picture — stored as Cloudinary URL
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default: "https://res.cloudinary.com/demo/image/upload/v1/samples/people/smiling-man.jpg",
      },
    },

    // Role-based access control
    role: {
      type: String,
      enum: ["student", "faculty", "placement", "admin"],
      default: "student",
    },

    // Track when user last logged in
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// PRE-SAVE HOOK: Hash password before saving
// Runs every time a user document is saved
// Only hashes if password was modified
// ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  // If password wasn't changed, skip hashing
  if (!this.isModified("password")) return next();

  // Hash the password with salt rounds = 12
  // Higher = more secure but slower
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ─────────────────────────────────────────────
// INSTANCE METHOD: Compare entered password
// with the hashed password in the database
// Usage: await user.comparePassword(enteredPassword)
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);