import express from "express";
import {
  toggleLike,
  checkUserLike,
  getLikeCount,
  getAllLikes,
} from "../controllers/likeController.js";

import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * LIKE / UNLIKE (LOGIN REQUIRED)
 */
router.post("/", authenticate, toggleLike);

/**
 * CHECK IF USER LIKED A POST
 */
router.get("/check/:postId", authenticate, checkUserLike);

/**
 * GET LIKE COUNT (PUBLIC)
 */
router.get("/count/:postId", getLikeCount);

/**
 * ADMIN: GET ALL LIKES
 */
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllLikes
);

export default router;
