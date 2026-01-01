import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { timestamps: true }
);

MediaSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Media", MediaSchema);