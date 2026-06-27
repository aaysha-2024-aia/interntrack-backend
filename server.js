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

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "https://interntrack-frontend-six.vercel.app",
    "https://interntrack-frontend-git-main-aaysha-2024-aias-projects.vercel.app",
    "https://interntrack-frontend-1nba0lkw6-aaysha-2024-aias-projects.vercel.app",
    "https://interntrack-frontend-ki8uwx9tm-aaysha-2024-aias-projects.vercel.app"
  ],
  credentials: true
}));
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

// ─────────────────────────────
// ROOT ROUTE
// ─────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 InternTrack Pro API Running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ─────────────────────────────
// HEALTH CHECK (IMPORTANT FOR RAILWAY/RENDER)
// ─────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InternTrack Pro API Healthy 🚀",
    uptime: process.uptime(),
  });
});

// ─────────────────────────────
// ERROR HANDLER
// ─────────────────────────────
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