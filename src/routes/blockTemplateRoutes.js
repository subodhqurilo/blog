import express from "express";
import {
  getAllBlockTemplates,
  getBlockTemplateBySlug,
  createBlockTemplate,
  updateBlockTemplate,
  deleteBlockTemplate,
} from "../controllers/blockTemplateController.js";

import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/* =====================================================
   🌍 PUBLIC ROUTES (BUILDER / FRONTEND)
===================================================== */

/**
 * Get all widgets for builder sidebar
 * GET /api/block-templates
 * Optional query:
 * ?category=content
 * ?type=heading
 * ?search=text
 */
router.get("/", getAllBlockTemplates);

/**
 * Get single widget by slug
 * GET /api/block-templates/:slug
 */
router.get("/:slug", getBlockTemplateBySlug);

/* =====================================================
   🔐 ADMIN ROUTES
===================================================== */

/**
 * Create new widget
 * POST /api/block-templates
 */
router.post(
  "/",
  authenticate,
  authorize("admin"),
  createBlockTemplate
);

/**
 * Update widget
 * PUT /api/block-templates/:id
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateBlockTemplate
);

/**
 * Delete widget (soft delete)
 * DELETE /api/block-templates/:id
 */
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteBlockTemplate
);

export default router;
