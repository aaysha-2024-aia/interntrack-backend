// backend/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ─────────────────────────────────────────────
    // Attempt to connect to MongoDB using the URI
    // stored in your .env file
    // ─────────────────────────────────────────────
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;