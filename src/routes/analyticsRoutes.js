import express from "express";
import {
  getDashboardStats,
  getPostAnalytics,
} from "../controllers/analyticsController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @desc    Get overall dashboard stats (Cards + Graph)
 * @access  Private/Admin
 */
router.get(
  "/dashboard", 
  authenticate, 
  authorize("admin"), 
  getDashboardStats
);

/**
 * @desc    Get detailed analytics for a single blog/page
 * @access  Private/Admin
 */
router.get(
  "/post/:id", 
  authenticate, 
  authorize("admin"), 
  getPostAnalytics
);

export default router;