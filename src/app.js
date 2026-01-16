// ========================================
// FILE: src/app.js
// Express Application Configuration
// ========================================

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// ================= ROUTES =================
import pageRoutes from "./routes/pageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import blockTemplateRoutes from "./routes/blockTemplateRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import pageVersionRoutes from "./routes/pageVersionRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";

// ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();

// ========================================
// TRUST PROXY (Render / Nginx / Cloud)
// ========================================
app.set("trust proxy", 1);

// ========================================
// SECURITY
// ========================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// ========================================
// 🔥 CORS (FULL OPEN - DEVELOPMENT)
// ========================================
app.use(
  cors({
    origin: "*",
    methods: "*",
    allowedHeaders: "*",
  })
);

// ========================================
// PARSERS
// ========================================
app.use(cookieParser());

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ========================================
// LOGGING
// ========================================
app.use(morgan("dev"));

// ========================================
// RATE LIMITING
// ========================================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ========================================
// STATIC FILES
// ========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// ========================================
// API ROUTES
// ========================================
app.use("/api/auth", authRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/page-versions", pageVersionRoutes);
app.use("/api/block-templates", blockTemplateRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/favourites", favouriteRoutes);

// SEO (root level)
app.use("/api", seoRoutes);

// ========================================
// ROOT
// ========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Blog Builder API is running",
    version: "1.0.0",
  });
});

// ========================================
// HEALTH CHECK
// ========================================
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  // Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  console.error("❌ ERROR:", err);

res.status(err.status || 500).json({
  success: false,
  data: [],
  errors: [],
  message: err.message || "Internal server error",
});

});

// ========================================
// 404 HANDLER
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// EXPORT
// ========================================
export default app;
