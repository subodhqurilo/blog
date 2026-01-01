import express from "express";
import {
  uploadFile,
  uploadMultipleFiles,
  getMediaList,
  getMediaById,
  deleteMedia,
  deleteMultipleMedia,
} from "../controllers/uploadController.js"; // ✅ FIX: uploadController not mediaController
import { upload, uploadMultiple } from "../config/multer.js";

const router = express.Router();

// Upload routes
router.post("/single", upload.single("file"), uploadFile);
router.post("/multiple", uploadMultiple.array("files", 10), uploadMultipleFiles);

// Media management
router.get("/", getMediaList);
router.get("/:id", getMediaById);
router.delete("/:id", deleteMedia);
router.post("/delete-multiple", deleteMultipleMedia);

export default router;