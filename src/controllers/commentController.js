import Comment from "../models/comment.js";
import Page from "../models/page.js";

export const createComment = async (req, res) => {
  try {
    const { postId, author, content, parentComment } = req.body;
    
    // Verify post exists
    const post = await Page.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    const comment = await Comment.create({
      post: postId,
      author,
      content,
      parentComment,
    });
    
    res.status(201).json({
      success: true,
      message: "Comment submitted for approval",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      status: "approved",
      parentComment: null, // Only top-level comments
    })
      .populate({
        path: "parentComment",
        populate: { path: "author" },
      })
      .sort({ createdAt: -1 });
    
    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentComment: comment._id,
          status: "approved",
        }).sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies,
        };
      })
    );
    
    res.json({
      success: true,
      count: commentsWithReplies.length,
      data: commentsWithReplies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    
    res.json({
      success: true,
      message: "Comment approved",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    // Delete comment and its replies
    await Comment.deleteMany({
      $or: [
        { _id: req.params.id },
        { parentComment: req.params.id },
      ],
    });
    
    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};