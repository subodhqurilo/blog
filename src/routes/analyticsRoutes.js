import express from "express";
import {
  getDashboardStats,
  getPostAnalytics,
  getTopPosts,
  getMediaAnalytics,
    getRecentContent,
  getRecentActivity,
  getEngagementAnalytics,
 // ✅ now exists
} from "../controllers/analyticsController.js";

import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  getDashboardStats
);

router.get(
  "/post/:id",
  authenticate,
  authorize("admin"),
  getPostAnalytics
);

router.get(
  "/top-posts",
  authenticate,
  authorize("admin"),
  getTopPosts
);
router.get(
  "/recent-content",
  authenticate,
  authorize("admin"),
  getRecentContent
);

/**
 * RECENT ACTIVITY (TIMELINE)
 */
router.get(
  "/recent-activity",
  authenticate,
  authorize("admin"),
  getRecentActivity
);

/**
 * BLOG ENGAGEMENT (CHART)
 */
router.get(
  "/engagement",
  authenticate,
  authorize("admin"),
  getEngagementAnalytics
);

router.get(
  "/media",
  authenticate,
  authorize("admin"),
  getMediaAnalytics
);

export default router;
