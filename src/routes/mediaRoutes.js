import express from "express";
import {
  uploadFile,
  uploadMultipleFiles,
  getMediaList,
  getMediaById,
  deleteMedia,
  deleteMultipleMedia,
} from "../controllers/mediaController.js";
import { upload, uploadMultiple } from "../config/multer.js";

const router = express.Router();

// Upload routes
router.post("/upload", upload.single("file"), uploadFile);
router.post("/upload-multiple", uploadMultiple.array("files", 10), uploadMultipleFiles);

// Media management
router.get("/", getMediaList);           // List with filters
router.get("/:id", getMediaById);        // Single media
router.delete("/:id", deleteMedia);      // Delete single
router.post("/delete-multiple", deleteMultipleMedia); // Delete multiple

export default router;