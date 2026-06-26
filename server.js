// backend/server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// Load env
dotenv.config();

// Local modules
const connectDB = require("./config/db");
const { cloudinaryConnect } = require("./config/cloudinary");
const errorHandler = require("./middleware/errorHandler");

// Connect DB + Cloudinary
connectDB();
cloudinaryConnect();

const app = express();

// ─────────────────────────────
// CORS (PRODUCTION READY)
// ─────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

// ─────────────────────────────
// CORE MIDDLEWARE
// ─────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────
// ROUTES
// ─────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/internships", require("./routes/internshipRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/profile", require("./routes/studentProfileRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 InternTrack Pro API Running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handler
app.use(errorHandler);

// ─────────────────────────────
// SERVER START
// ─────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});