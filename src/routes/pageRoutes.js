import express from "express";
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
} from "../controllers/pageController.js";
import {
  validateCreatePage,
  validateUpdatePage,
  validatePageId,
  handleValidation,
} from "../validators/pageValidator.js";

const router = express.Router();

// Public routes
router.get("/public", getPublishedBlogs);
router.get("/public/:slug", getPublicBlog);

// Admin routes with validation
router.get("/", listBlogs);
router.post("/", validateCreatePage, handleValidation, createPage);
router.get("/:id", validatePageId, handleValidation, getBlogById);
router.put("/:id", validatePageId, validateUpdatePage, handleValidation, updatePage);
router.delete("/:id", validatePageId, handleValidation, deletePage);
router.post("/:id/publish", validatePageId, handleValidation, publishPage);
router.post("/:id/unpublish", validatePageId, handleValidation, unpublishPage);
router.post("/:id/duplicate", validatePageId, handleValidation, duplicatePage);

export default router;