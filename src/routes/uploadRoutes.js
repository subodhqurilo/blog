import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  uploadFile,
  uploadMultipleFiles,
} from "../controllers/mediaController.js";

import { authenticate, authorize } from "../middlewares/auth.js";

/* ======================================
   SETUP
====================================== */
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================================
   MULTER CONFIG
====================================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "src/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

/* FILE FILTER */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/ogg",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only images and videos are allowed!"),
      false
    );
  }
  cb(null, true);
};

/* MULTER INSTANCE */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10,
  },
});

/* ======================================
   ROUTES
====================================== */

/**
 * 📤 UPLOAD SINGLE FILE
 * POST /api/upload/single
 */
router.post(
  "/single",
  authenticate,
  authorize("admin"),
  upload.single("file"),
  uploadFile
);

/**
 * 📤 UPLOAD MULTIPLE FILES
 * POST /api/upload/multiple
 */
router.post(
  "/multiple",
  authenticate,
  authorize("admin"),
  upload.array("files", 10),
  uploadMultipleFiles
);

export default router;
