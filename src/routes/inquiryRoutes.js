import express from "express";

/* ============================
   CONTROLLER
============================ */
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  markInquiryAsRead,
  deleteInquiry
} from "../controllers/inquiryController.js";

/* ============================
   AUTH
============================ */
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/* =====================================================
   🌍 PUBLIC ROUTES
===================================================== */

/**
 * CREATE INQUIRY (CONTACT FORM)
 *
 * POST /api/inquiries
 */
router.post("/", createInquiry);

/* =====================================================
   🔐 ADMIN ROUTES
===================================================== */

router.use(authenticate);
router.use(authorize("admin"));

/**
 * GET ALL INQUIRIES (ADMIN)
 *
 * GET /api/inquiries
 */
router.get("/", getAllInquiries);

/**
 * GET SINGLE INQUIRY
 *
 * GET /api/inquiries/:id
 */
router.get("/:id", getInquiryById);

/**
 * MARK INQUIRY AS READ
 *
 * PATCH /api/inquiries/:id/read
 */
router.patch("/:id/read", markInquiryAsRead);

/**
 * REPLY TO INQUIRY
 *
 * POST /api/inquiries/:id/reply
 */

/**
 * DELETE INQUIRY
 *
 * DELETE /api/inquiries/:id
 */
router.delete("/:id", deleteInquiry);

export default router;
