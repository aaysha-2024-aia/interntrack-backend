// backend/server.js

// ─────────────────────────────────────────────
// 1. IMPORT DEPENDENCIES
// ─────────────────────────────────────────────
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

// ─────────────────────────────────────────────
// 2. LOAD ENVIRONMENT VARIABLES
// ─────────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────────
// 3. IMPORT LOCAL MODULES
// ─────────────────────────────────────────────
const connectDB = require("./config/db");
const { cloudinaryConnect } = require("./config/cloudinary");
const errorHandler = require("./middleware/errorHandler");

// ─────────────────────────────────────────────
// 4. CONNECT TO MONGODB & CLOUDINARY
// ─────────────────────────────────────────────
connectDB();
cloudinaryConnect();

// ─────────────────────────────────────────────
// 5. INITIALIZE EXPRESS APP
// ─────────────────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// 6. CORE MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────────
// 7. API ROUTES
// ─────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/upload", uploadRoutes);

// Health-check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Smart Internship Tracker API is running!",
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// 8. GLOBAL ERROR HANDLER (must be LAST)
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// 9. START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});