// backend/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────
// HELPER: Generate JWT Token
// Called after register and login
// ─────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Payload: user's MongoDB _id
    process.env.JWT_SECRET, // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE || "7d" } // Expiry
  );
};

// ─────────────────────────────────────────────
// HELPER: Send token response
// Sends user data + token in a consistent format
// ─────────────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
};

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please login instead.",
      });
    }

    // 3. Create new user (password is hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // 4. Send back token + user data
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

// ─────────────────────────────────────────────
// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. Find user and explicitly include password field
    // (password has select:false in schema so we must add it back)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare entered password with hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 5. Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Update user profile (name, email)
// @route   PUT /api/auth/update-profile
// @access  Private
// ─────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Build update object with only provided fields
    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,           // Return updated document
        runValidators: true, // Run schema validators on update
      }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user with password included
    const user = await User.findById(req.user.id).select("+password");

    // Check current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};