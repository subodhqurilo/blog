import express from "express";

/* =========================
   CONTROLLER
========================= */
import {
  uploadFile,
  uploadMultipleFiles,
  getMediaList,
  getMediaById,
  deleteMedia,
  deleteMultipleMedia,
} from "../controllers/mediaController.js";

/* =========================
   AUTH
========================= */
import { authenticate, authorize } from "../middlewares/auth.js";

/* =========================
   MULTER
========================= */
import upload from "../middlewares/upload.js";

const router = express.Router();

/* =====================================================
   🔐 ALL MEDIA ROUTES = ADMIN ONLY
===================================================== */
router.use(authenticate);
router.use(authorize("admin"));

/* =========================
   UPLOAD ROUTES
========================= */

/**
 * UPLOAD SINGLE FILE
 * POST /api/upload
 */
router.post(
  "/",
  upload.single("file"),
  uploadFile
);

/**
 * UPLOAD MULTIPLE FILES
 * POST /api/upload/multiple
 */
router.post(
  "/multiple",
  upload.array("files", 10),
  uploadMultipleFiles
);

/* =========================
   FETCH MEDIA
========================= */

/**
 * GET ALL MEDIA (pagination + filters)
 * GET /api/upload
 */
router.get("/", getMediaList);

/**
 * GET SINGLE MEDIA
 * GET /api/upload/:id
 */
router.get("/:id", getMediaById);

/* =========================
   DELETE MEDIA
========================= */

/**
 * DELETE SINGLE MEDIA
 * DELETE /api/upload/:id
 */
router.delete("/:id", deleteMedia);

/**
 * DELETE MULTIPLE MEDIA
 * DELETE /api/upload
 */
router.delete("/", deleteMultipleMedia);

export default router;
