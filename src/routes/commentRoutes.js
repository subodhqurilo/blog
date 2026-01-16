import express from "express";

/* ============================
   CONTROLLER
============================ */
import {
  addComment,
  getCommentsByPost,
  editComment,
  deleteComment,
  adminGetAllComments,
  getCommentCountByPost
} from "../controllers/commentController.js";

/* ============================
   AUTH
============================ */
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/* =====================================================
   🌍 PUBLIC ROUTES (BLOG PAGE)
===================================================== */

/**
 * GET COMMENTS FOR A BLOG POST
 * (Nested comments supported)
 *
 * GET /api/comments/:postId
 */
router.get("/:postId", getCommentsByPost);

/**
 * ADD COMMENT (Guest / User)
 *
 * POST /api/comments/:postId
 */
router.post("/:postId", addComment);

/**
 * REPLY TO COMMENT
 *
 * POST /api/comments/reply/:commentId
 */

/**
 * COMMENT COUNT (PUBLIC)
 */
router.get("/count/:postId", getCommentCountByPost);

/* =====================================================
   🔐 PROTECTED ROUTES (USER / ADMIN)
===================================================== */

router.use(authenticate);

/**
 * UPDATE COMMENT
 * (Only owner or admin)
 *
 * PUT /api/comments/:id
 */
router.put("/:id", editComment);

/**
 * DELETE COMMENT (Soft delete)
 * (Owner or admin)
 *
 * DELETE /api/comments/:id
 */
router.delete("/:id", deleteComment);

/* =====================================================
   👑 ADMIN MODERATION
===================================================== */

router.use(authorize("admin"));

/**
 * ADMIN: GET ALL COMMENTS
 *
 * GET /api/comments/admin/all
 */
router.get("/admin/all", adminGetAllComments);

/**
 * ADMIN: TOGGLE DELETE / RESTORE
 *
 * PATCH /api/comments/admin/toggle/:id
 */


export default router;
