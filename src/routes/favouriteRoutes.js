import express from "express";
import {
  toggleFavourite,
  getMyFavourites,
  checkFavourite,
} from "../controllers/favouriteController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Toggle favourite / unfavourite
router.post("/toggle", authenticate, toggleFavourite);

// Get logged-in user's favourites
router.get("/my", authenticate, getMyFavourites);

// Check if blog is favourited
router.get("/check/:pageId", authenticate, checkFavourite);

export default router;
