// ========================================
// FILE: src/config/multer.js
// Multer Configuration for File Uploads
// ========================================

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory path
const uploadDir = path.join(__dirname, "..", "uploads");

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Upload directory created");
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: name-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed image extensions
  const allowedImageTypes = /jpeg|jpg|png|gif|webp|svg/;
  // Allowed video extensions
  const allowedVideoTypes = /mp4|webm|ogg/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if image
  if (
    allowedImageTypes.test(extname.slice(1)) &&
    mimetype.startsWith("image/")
  ) {
    return cb(null, true);
  }

  // Check if video
  if (
    allowedVideoTypes.test(extname.slice(1)) &&
    mimetype.startsWith("video/")
  ) {
    return cb(null, true);
  }

  // Reject file
  cb(new Error("Only images and videos are allowed!"));
};

// Single file upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter,
});

// Multiple files upload middleware
export const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files at once
  },
  fileFilter: fileFilter,
});