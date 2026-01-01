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
import User from "./models/user.js"; // 🔥 Admin seeding ke liye model import kiya

// ========================================
// CONNECT TO MONGODB & INITIALIZE
// ========================================
connectDB().then(async () => {
  // Start post scheduler
  startScheduler();

  // 🔥 INITIAL ADMIN SEEDING logic
  // Isse check hoga ki agar admin nahi hai, toh ek default admin ban jaye
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("🛠️  No admin found. Creating initial master admin...");
      await User.create({
        name: "Master Admin",
        email: process.env.EMAIL_USER, // .env wala email use hoga
        password: "admin123",  // Pehli baar login ke liye ye use karein
        role: "admin",
        isActive: true
      });
      console.log("✅ Master Admin created successfully!");
      console.log("📧 Admin Email:", process.env.EMAIL_USER);
      console.log("🔑 Initial Password: admin123password");
    }
  } catch (seedError) {
    console.error("❌ Admin seeding failed:", seedError);
  }

}).catch((error) => {
  console.error("❌ Failed to connect to MongoDB:", error);
  process.exit(1);
});

// ========================================
// SERVER CONFIGURATION
// ========================================
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
// GRACEFUL SHUTDOWN HANDLERS
// ========================================

process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    import("mongoose").then((mongoose) => {
      mongoose.default.connection.close(false, () => {
        console.log("✅ MongoDB closed. 👋");
        process.exit(0);
      });
    });
  });
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT received. 👋");
  server.close(() => process.exit(0));
});

export default server;