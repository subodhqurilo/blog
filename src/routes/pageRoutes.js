import express from "express";

/* ============================
   CONTROLLERS
============================ */
import {
  createPage,
  updatePage,
  getBlogById,
  listBlogs,
  publishPage,
  unpublishPage,
  deletePage,
  getPublicBlog,
  getPublishedBlogs,
  duplicatePage,
  getPopularPosts,
  getRecentPosts,
  schedulePage,
  bulkDeletePages,
  getAdminPostsGrid
} from "../controllers/pageController.js";

/* ============================
   AUTH MIDDLEWARE
============================ */
import { authenticate, authorize } from "../middlewares/auth.js";

/* ============================
   VALIDATORS (OPTIONAL)
   Agar use nahi kar rahe ho
   toh hata sakte ho
============================ */
import {
  validateCreatePage,
  validateUpdatePage,
  validatePageId,
  handleValidation,
} from "../validators/pageValidator.js";

const router = express.Router();

/* =====================================================
   🌍 PUBLIC ROUTES (NO AUTH REQUIRED)
===================================================== */
router.get("/", listBlogs);

/**
 * Get all published blogs (listing page)
 * GET /api/pages/public/list
 */
router.get("/public/list", getPublishedBlogs);

/**
 * Get single published blog by slug
 * GET /api/pages/public/:slug
 */
router.get("/public/:slug", getPublicBlog);

/**
 * Get popular posts
 * GET /api/pages/public/popular
 */
router.get("/public-popular", getPopularPosts);

/**
 * Get recent posts
 * GET /api/pages/public/recent
 */
router.get("/public-recent", getRecentPosts);


/* =====================================================
   🔐 ADMIN ROUTES (AUTH REQUIRED)
===================================================== */

router.use(authenticate, authorize("admin"));

/**
 * List all blogs (admin dashboard)
 * GET /api/pages
 */

/**
 * Create new blog (draft)
 * POST /api/pages
 */
router.post(
  "/",
  validateCreatePage,
  handleValidation,
  createPage
);

/**
 * Get blog by ID (for editor)
 * GET /api/pages/:id
 */
router.get(
  "/:id",
  validatePageId,
  handleValidation,
  getBlogById
);

/**
 * Update blog (autosave / edit)
 * PUT /api/pages/:id
 */
router.put(
  "/:id",
  validatePageId,
  validateUpdatePage,
  handleValidation,
  updatePage
);

/**
 * Delete blog
 * DELETE /api/pages/:id
 */
router.delete(
  "/:id",
  validatePageId,
  handleValidation,
  deletePage
);

/**
 * Publish blog
 * PUT /api/pages/:id/publish
 */
router.put(
  "/:id/publish",
  validatePageId,
  handleValidation,
  publishPage
);

/**
 * Unpublish blog (move to draft)
 * PUT /api/pages/:id/unpublish
 */
router.put(
  "/:id/unpublish",
  validatePageId,
  handleValidation,
  unpublishPage
);

/**
 * Schedule blog
 * PUT /api/pages/:id/schedule
 */
router.put(
  "/:id/schedule",
  validatePageId,
  handleValidation,
  schedulePage
);

/**
 * Duplicate blog
 * POST /api/pages/:id/duplicate
 */
router.post(
  "/:id/duplicate",
  validatePageId,
  handleValidation,
  duplicatePage
);
router.get(
  "/posts",
  authenticate,
  authorize("admin"),
  getAdminPostsGrid
);
/**
 * Bulk delete blogs
 * POST /api/pages/bulk-delete
 */
router.post("/bulk-delete", bulkDeletePages);

export default router;
