
import express from "express";
import {
  generateSitemap,
  generateRSSFeed,
} from "../controllers/seoController.js";

const router = express.Router();

router.get("/sitemap.xml", generateSitemap);      // Generate sitemap
router.get("/rss.xml", generateRSSFeed);          // Generate RSS feed

export default router;
