import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true
    },
    author: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      website: {
        type: String,
        trim: true
      },
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "spam"],
      default: "pending",
      index: true
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  { 
    timestamps: true 
  }
);

// Compound index for efficient queries
CommentSchema.index({ post: 1, status: 1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.model("Comment", CommentSchema);
