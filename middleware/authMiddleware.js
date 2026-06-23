// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─────────────────────────────────────────────
// PROTECT MIDDLEWARE
// Add this to any route that requires login
// Usage: router.get("/profile", protect, getProfile)
// ─────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // ─────────────────────────────────────────────
  // 1. Check if token exists in Authorization header
  // Frontend sends: Authorization: Bearer <token>
  // ─────────────────────────────────────────────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Extract token
  }

  // If no token found, deny access
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in to continue.",
    });
  }

  try {
    // ─────────────────────────────────────────────
    // 2. Verify the token using our JWT secret
    // This throws an error if token is invalid/expired
    // ─────────────────────────────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ─────────────────────────────────────────────
    // 3. Find the user from the token's payload
    // Attach user to req so controllers can use it
    // ─────────────────────────────────────────────
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    next(); // User is authenticated, proceed to route
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

// ─────────────────────────────────────────────
// ADMIN MIDDLEWARE
// Use after protect to restrict to admins only
// Usage: router.get("/admin", protect, adminOnly, handler)
// ─────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
};

module.exports = { protect, adminOnly };