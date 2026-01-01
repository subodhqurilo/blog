import express from "express";
import { 
  login, 
  requestAdminOTP, 
  verifyOTP,           // 🔥 Naya function
  resetAdminPassword,
  getAdminProfile 
} from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Public Routes
router.post("/login", login);
router.post("/request-otp", requestAdminOTP);
router.post("/verify-otp", verifyOTP); // 🔥 Step 2: Sirf OTP check karne ke liye
router.post("/reset-password", resetAdminPassword); // 🔥 Step 3: Password set karne ke liye

// Protected Routes
router.get("/me", authenticate, authorize("admin"), getAdminProfile);

export default router;