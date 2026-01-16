import Comment from "../models/comment.js";
import Page from "../models/page.js";

/**
 * =====================================================
 * ADD COMMENT (USER / ADMIN / GUEST)
 * =====================================================
 */
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentComment = null, name, email } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const page = await Page.findById(postId);
    if (!page || page.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Post not found or not published",
      });
    }

    let author;

    // ✅ LOGGED-IN USER
    if (req.user) {
      author = {
        userId: req.user.userId,
        name: req.user.name || "User",
        email: req.user.email || "",
        role: req.user.role || "user",
      };
    } 
    // ✅ GUEST USER (NO NAME / EMAIL REQUIRED)
    else {
      author = {
        userId: null,
        name: name || "Guest",
        email: email || "guest@anonymous.com",
        role: "guest",
      };
    }

    const comment = await Comment.create({
      post: postId,
      author,
      content,
      parentComment,
    });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * =====================================================
 * GET COMMENTS BY POST (PUBLIC)
 * =====================================================
 */
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      post: postId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Build nested structure
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    res.json({
      success: true,
      count: roots.length,
      data: roots,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * EDIT COMMENT
 * =====================================================
 * ✔ User: own comment
 * ✔ Admin: any comment
 */
export const editComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner =
      req.user &&
      comment.author.userId &&
      comment.author.userId.toString() === req.user.userId;

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this comment",
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Edit Comment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * DELETE COMMENT (SOFT DELETE)
 * =====================================================
 * ✔ User: own comment
 * ✔ Admin: any comment
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner =
      req.user &&
      comment.author.userId &&
      comment.author.userId.toString() === req.user.userId;

    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    comment.isDeleted = true;
    await comment.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * ADMIN: GET ALL COMMENTS (DASHBOARD)
 * =====================================================
 */
export const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find()
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments();

    res.json({
      success: true,
      count: comments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: comments,
    });
  } catch (error) {
    console.error("Admin Comments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const adminGetAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find()
      .populate("post", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments();

    res.json({
      success: true,
      count: comments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: comments,
    });
  } catch (error) {
    console.error("Admin Comments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCommentCountByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const page = await Page.findById(postId);
    if (!page || page.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Post not found or not published",
      });
    }

    const count = await Comment.countDocuments({
      post: postId,
      isDeleted: false,
    });

    res.json({
      success: true,
      postId,
      commentsCount: count,
    });
  } catch (error) {
    console.error("Comment Count Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};