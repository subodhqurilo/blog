// ========================================
// FILE: src/server.js
// Server Entry Point (Production Ready)
// ========================================

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startScheduler } from "./utils/scheduler.js";
import User from "./models/user.js";
import mongoose from "mongoose";

// ========================================
// ENV VALIDATION (SAFE)
// ========================================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET missing in .env");
  process.exit(1);
}

// ========================================
// CONNECT TO DB & INITIALIZE
// ========================================
const bootstrap = async () => {
  try {
    // 🔌 MongoDB
    await connectDB();

    // ⏰ Scheduler
    if (typeof startScheduler === "function") {
      startScheduler();
      console.log("⏰ Scheduler started");
    }

    // 👑 ADMIN SEEDING
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      if (!process.env.EMAIL_USER || !process.env.ADMIN_INITIAL_PASSWORD) {
        console.warn("⚠️ Admin env missing. Skipping admin seed.");
      } else {
        console.log("🛠️ Creating master admin...");

        await User.create({
          name: "Master Admin",
          email: process.env.EMAIL_USER,
          password: process.env.ADMIN_INITIAL_PASSWORD,
          role: "admin",
          isActive: true,
        });

        console.log("✅ Master Admin created");
        console.log("📧 Email:", process.env.EMAIL_USER);
        console.log("🔑 Password:", process.env.ADMIN_INITIAL_PASSWORD);
        console.log("⚠️ CHANGE PASSWORD AFTER FIRST LOGIN");
      }
    }
  } catch (error) {
    console.error("❌ Bootstrap failed:", error);
    process.exit(1);
  }
};

await bootstrap();

// ========================================
// SERVER CONFIG
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
║   🚀 Blog Builder API Server                               ║
║                                                           ║
║   Environment : ${NODE_ENV.toUpperCase().padEnd(42)}║
║   Port        : ${PORT.toString().padEnd(42)}║
║   URL         : http://localhost:${PORT.toString().padEnd(27)}║
║                                                           ║
║   ❤️  Health     : /health                                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
const shutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} received. Shutting down...`);

  try {
    server.close(async () => {
      await mongoose.connection.close();
      console.log("✅ MongoDB disconnected");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Shutdown error:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  shutdown("uncaughtException");
});

export default server;
