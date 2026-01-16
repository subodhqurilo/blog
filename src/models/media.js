import mongoose from "mongoose";

/**
 * Media Model
 * Used for storing uploaded images / videos
 */
const MediaSchema = new mongoose.Schema(
  {
    /* =========================
       FILE BASIC INFO
    ========================= */
    filename: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
    },

    /* =========================
       FILE DETAILS
    ========================= */
    mimeType: {
      type: String,
      required: true,
      index: true,
    },

    size: {
      type: Number, // bytes
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
      index: true,
    },

    /* =========================
       OPTIONAL METADATA
    ========================= */
    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    duration: {
      type: Number, // seconds (video only)
      default: null,
    },

    /* =========================
       USAGE TRACKING
    ========================= */
    usedInPages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Page",
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================
       UPLOADED BY
    ========================= */
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* =========================
   INDEXES
========================= */
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ originalName: "text" });
MediaSchema.index({ isDeleted: 1 });

/* =========================
   VIRTUALS
========================= */

// File size in KB
MediaSchema.virtual("sizeKB").get(function () {
  return Math.round(this.size / 1024);
});

// File size in MB
MediaSchema.virtual("sizeMB").get(function () {
  return +(this.size / (1024 * 1024)).toFixed(2);
});

// Enable virtuals
MediaSchema.set("toJSON", { virtuals: true });
MediaSchema.set("toObject", { virtuals: true });

export default mongoose.model("Media", MediaSchema);
