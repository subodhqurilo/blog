import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    // Kis blog/post par comment hai
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
      index: true,
    },

    // Comment kisne kiya (User ya Admin)
    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // guest ke liye null
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },
      role: {
        type: String,
        enum: ["admin", "user", "guest"],
        default: "user",
      },
    },

    // Comment ka actual text
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Reply system (nested comments)
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    // Soft delete (better than hard delete)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },

    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for fast queries
CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ "author.userId": 1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.model("Comment", CommentSchema);
