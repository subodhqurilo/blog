import express from "express";
import {
  getBlockTemplates,
  getBlockTemplate,
} from "../controllers/blockTemplateController.js";

const router = express.Router();

router.get("/", getBlockTemplates);               // Get all block templates
router.get("/:type", getBlockTemplate);           // Get specific block template

export default router;

