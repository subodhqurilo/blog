import express from "express";
import {
  getVersionHistory,
  getSingleVersion,
  restoreVersion,
  deleteVersion,
    undoPageVersion,
redoPageVersion
} from "../controllers/pageVersionController.js";

import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * VERSION HISTORY (sidebar list)
 */
router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getVersionHistory
);

/**
 * SINGLE VERSION (preview)
 */
router.get(
  "/single/:versionId",
  authenticate,
  authorize("admin"),
  getSingleVersion
);

/**
 * RESTORE VERSION
 */
router.post(
  "/restore/:versionId",
  authenticate,
  authorize("admin"),
  restoreVersion
);


router.post("/undo/:pageId", authenticate, authorize("admin"), undoPageVersion);
router.post("/redo/:pageId", authenticate, authorize("admin"), redoPageVersion);

/**
 * DELETE VERSION
 */

router.delete(
  "/:versionId",
  authenticate,
  authorize("admin"),
  deleteVersion
);

export default router;
