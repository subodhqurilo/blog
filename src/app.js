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
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import session from "express-session";
// Import all routes
import pageRoutes from "./routes/pageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import blockTemplateRoutes from "./routes/blockTemplateRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// ========================================
// TRUST PROXY (for deployment behind reverse proxy)
// ========================================
app.set('trust proxy', 1);

// ========================================
// SECURITY MIDDLEWARE
// ========================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading images/videos
  contentSecurityPolicy: false, // Disable for development (enable in production)
}));

// ========================================
// CORS CONFIGURATION
// ========================================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ========================================
// BODY PARSER MIDDLEWARE
// ========================================
app.use(express.json({ 
  limit: "10mb",
  strict: true
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: "10mb",
  parameterLimit: 50000
}));

// ========================================
// LOGGING MIDDLEWARE
// ========================================
if (process.env.NODE_ENV === "development") {
  // Detailed logging in development
  app.use(morgan("dev"));
} else {
  // Standard Apache-style logging in production
  app.use(morgan("combined"));
}

// ========================================
// RATE LIMITING
// ========================================

// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/';
  }
});

// Apply to all API routes
app.use("/api/", generalLimiter);

// Stricter rate limit for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Only 20 uploads per 15 minutes
  message: {
    success: false,
    message: "Upload limit exceeded. Please try again later.",
  },
});

app.use("/api/upload", uploadLimiter);

// Auth rate limiting (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ========================================
// STATIC FILES
// ========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static assets if needed
app.use(express.static(path.join(__dirname, "public")));

// ========================================
// API ROUTES
// ========================================
app.use("/api/pages", pageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/block-templates", blockTemplateRoutes);
app.use("/api", seoRoutes); // Sitemap & RSS at root level

// ========================================
// ROOT & HEALTH CHECK ROUTES
// ========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Blog Builder API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      pages: "/api/pages",
      upload: "/api/upload",
      categories: "/api/categories",
      tags: "/api/tags",
      comments: "/api/comments",
      auth: "/api/auth",
      analytics: "/api/analytics",
      blockTemplates: "/api/block-templates",
      sitemap: "/api/sitemap.xml",
      rss: "/api/rss.xml",
      health: "/health",
    },
    documentation: "https://github.com/yourusername/blog-builder-api",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
  });
});

// API version check
app.get("/api/version", (req, res) => {
  res.json({
    success: true,
    version: "1.0.0",
    apiVersion: "v1",
  });
});

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// Multer-specific error handling
app.use((err, req, res, next) => {
  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum 10MB allowed per file",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 10 files allowed at once",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field in file upload",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Handle custom file validation errors
  if (err.message === "Only images and videos are allowed!") {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only images (jpg, png, gif, webp, svg) and videos (mp4, webm, ogg) are allowed",
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different ${field}`,
    });
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please login again",
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS policy: This origin is not allowed",
    });
  }

  // Generic error handler
  console.error("❌ Server Error:", err);
  console.error("Stack:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

// ========================================
// 404 HANDLER (MUST BE LAST)
// ========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    availableRoutes: "/api for list of available endpoints",
  });
});

// ========================================
// EXPORT APP
// ========================================
export default app;