import express from "express";
import { autoSavePage } from "../controllers/autosaveController.js";

const router = express.Router();

router.put("/:id", autoSavePage);

export default router;
