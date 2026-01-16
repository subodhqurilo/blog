import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    /* =========================
       USER LINK
    ========================= */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user = 1 settings
      index: true,
    },

    /* =========================
       GENERAL SETTINGS
    ========================= */
    language: {
      type: String,
      default: "en",
      enum: ["en", "hi", "fr", "de"],
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
    },

    /* =========================
       COMMENT SETTINGS
    ========================= */
    commentsEnabled: {
      type: Boolean,
      default: true,
    },

    autoApproveComments: {
      type: Boolean,
      default: true,
    },

    /* =========================
       SYSTEM SETTINGS
    ========================= */

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Settings", SettingsSchema);
