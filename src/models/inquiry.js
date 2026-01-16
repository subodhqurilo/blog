// src/models/inquiry.js
import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    message: { type: String, required: true },

    page: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      default: null,
    },

    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
      index: true,
    },

    replied: { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", InquirySchema);
