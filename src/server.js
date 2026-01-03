// ========================================
// FILE: src/server.js
// Server Entry Point
// ========================================

import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startScheduler } from "./utils/scheduler.js";
import User from "./models/user.js";

// ========================================
// CONNECT TO MONGODB & INITIALIZE
// ========================================
connectDB()
  .then(async () => {
    // Start post scheduler
    startScheduler();

    // 🔥 INITIAL ADMIN SEEDING
    try {
      const adminExists = await User.findOne({ role: "admin" });

      if (!adminExists) {
        console.log("🛠️  No admin found. Creating initial master admin...");

        await User.create({
          name: "Master Admin",
          email: process.env.EMAIL_USER,
          password: "admin123", // change after first login
          role: "admin",
          isActive: true,
        });

        console.log("✅ Master Admin created successfully!");
        console.log("📧 Admin Email:", process.env.EMAIL_USER);
        console.log("🔑 Initial Password: admin123");
      }
    } catch (seedError) {
      console.error("❌ Admin seeding failed:", seedError);
    }
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  });

// ========================================
// SERVER CONFIGURATION
// ========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ========================================
// START SERVER
// ========================================
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║    🚀 Blog Builder API Server                             ║
║                                                           ║
║    Environment: ${NODE_ENV.toUpperCase().padEnd(43)}║
║    Port: ${PORT.toString().padEnd(48)}║
║    URL: http://localhost:${PORT.toString().padEnd(34)}║
║                                                           ║
║    📚 Documentation: http://localhost:${PORT}/             ║
║    ❤️  Health Check: http://localhost:${PORT}/health       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  console.log("📡 Server is ready to accept connections");
  console.log("⏰ Current time:", new Date().toLocaleString());
});

// ========================================
// GRACEFUL SHUTDOWN HANDLERS (Mongoose v7+)
// ========================================

const shutdown = async (signal) => {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);

  try {
    // Stop accepting new connections
    server.close(async () => {
      const mongoose = (await import("mongoose")).default;

      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");

      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
};

// Handle kill signals from Render / Docker / PM2
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown("uncaughtException");
});

export default server;
