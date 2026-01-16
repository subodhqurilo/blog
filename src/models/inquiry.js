import mongoose from "mongoose";

/**
 * Inquiry Model
 * Used for Contact Forms / Page Forms / CTA Forms
 */
const InquirySchema = new mongoose.Schema(
  {
    /* =========================
       USER DETAILS
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    /* =========================
       MESSAGE / FORM DATA
    ========================= */
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    /**
     * Extra dynamic fields
     * (Form builder se aane wale fields)
     */
    formData: {
      type: Object,
      default: {},
    },

    /* =========================
       PAGE / BLOG REFERENCE
    ========================= */
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
      index: true,
    },

    pageSlug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    /* =========================
       ADMIN MANAGEMENT
    ========================= */
    status: {
      type: String,
      enum: ["unread", "read", "replied", "closed"],
      default: "unread",
      index: true,
    },

    replied: {
      type: Boolean,
      default: false,
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    adminNote: {
      type: String,
      default: null,
    },

    /* =========================
       META / TRACKING
    ========================= */
    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* =========================
   INDEXES
========================= */
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ email: 1 });

export default mongoose.model("Inquiry", InquirySchema);
