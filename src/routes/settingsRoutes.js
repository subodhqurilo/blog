import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { uploadSingle } from "../middlewares/upload.js";
import {
  getProfileSettings,
  updateProfile,
  changePassword,
} from "../controllers/settingsController.js";

const router = express.Router();

/**
 * GET PROFILE SETTINGS
 */
router.get("/profile", authenticate, getProfileSettings);

/**
 * UPDATE PROFILE (FORM-DATA)
 * name, email, avatar(file), language, timezone, etc
 */
router.put(
  "/profile",
  authenticate,
  uploadSingle, // 👈 form-data file middleware
  updateProfile
);

/**
 * CHANGE PASSWORD
 */
router.put("/change-password", authenticate, changePassword);

export default router;
