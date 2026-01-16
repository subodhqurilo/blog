// ========================================
// FILE: src/models/pageVersion.js
// Page Versioning Model (Autosave + History)
// ========================================

import mongoose from "mongoose";

/**
 * PageVersion
 * Har autosave / manual save par ek snapshot store hota hai
 */
const PageVersionSchema = new mongoose.Schema(
  {
    /* =========================
       PAGE REFERENCE
    ========================= */
    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    /* =========================
       VERSION INFO
    ========================= */
    versionNumber: {
      type: Number,
      required: true,
    },

    /**
     * EXACT blocks snapshot
     * Same structure as Page.blocks
     */
    blocks: {
      type: Array,
      required: true,
    },

    /* =========================
       SAVE TYPE
    ========================= */
    saveType: {
      type: String,
      enum: ["auto", "manual", "publish", "restore"],
      default: "auto",
      index: true,
    },

    /* =========================
       WHO SAVED
    ========================= */
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* =========================
       META
    ========================= */
    note: {
      type: String, // optional note like "Before publish"
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */
PageVersionSchema.index({ page: 1, versionNumber: -1 });
PageVersionSchema.index({ createdAt: -1 });

/* =========================
   STATIC METHODS
========================= */

/**
 * Create new version automatically
 */
PageVersionSchema.statics.createVersion = async function ({
  pageId,
  blocks,
  userId = null,
  saveType = "auto",
  note = "",
}) {
  const lastVersion = await this.findOne({ page: pageId })
    .sort({ versionNumber: -1 })
    .select("versionNumber");

  const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 1;

  return this.create({
    page: pageId,
    versionNumber: nextVersion,
    blocks,
    savedBy: userId,
    saveType,
    note,
  });
};

/**
 * Get version history for a page
 */
PageVersionSchema.statics.getHistory = function (pageId) {
  return this.find({ page: pageId })
    .sort({ versionNumber: -1 })
    .populate("savedBy", "name email role");
};

export default mongoose.model("PageVersion", PageVersionSchema);
