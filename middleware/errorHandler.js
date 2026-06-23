// backend/middleware/errorHandler.js

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER MIDDLEWARE
//
// Express recognizes a middleware with 4 parameters
// (err, req, res, next) as an error handler.
// It must be registered LAST in server.js.
// ─────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  // Use the error's own status code, or default to 500 (Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // ─────────────────────────────────────────────
  // HANDLE SPECIFIC MONGOOSE ERROR TYPES
  // ─────────────────────────────────────────────

  // CastError: Invalid MongoDB ObjectId
  // e.g., /api/internships/not-a-valid-id
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found (invalid ID format)";
  }

  // Duplicate key error: e.g., registering with an existing email
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0]; // Which field is duplicate
    message = `${field} already exists. Please use a different ${field}.`;
  }

  // Validation error: required fields missing, etc.
  if (err.name === "ValidationError") {
    statusCode = 400;
    // Collect all validation messages into one string
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // JWT token errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // ─────────────────────────────────────────────
  // SEND ERROR RESPONSE
  // ─────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    message,
    // Show stack trace only in development (never in production)
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;