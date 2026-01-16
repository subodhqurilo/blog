import Like from "../models/like.js";
import Page from "../models/page.js";

/**
 * =====================================================
 * TOGGLE LIKE (LIKE / UNLIKE)
 * =====================================================
 * ✔ Only logged-in user
 * ✔ Same user cannot like twice
 */
export const toggleLike = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login required to like a post",
      });
    }

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

    // Check if already liked
    const existingLike = await Like.findOne({
      post: postId,
      user: userId,
    });

    // UNLIKE
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      return res.json({
        success: true,
        liked: false,
        message: "Post unliked",
      });
    }

    // LIKE
    await Like.create({
      post: postId,
      user: userId,
    });

    res.status(201).json({
      success: true,
      liked: true,
      message: "Post liked",
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * CHECK IF USER LIKED A POST
 * =====================================================
 */
export const checkUserLike = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;

    if (!userId) {
      return res.json({
        success: true,
        liked: false,
      });
    }

    const liked = await Like.exists({
      post: postId,
      user: userId,
    });

    res.json({
      success: true,
      liked: !!liked,
    });
  } catch (error) {
    console.error("Check Like Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * GET LIKE COUNT FOR A POST
 * =====================================================
 */
export const getLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;

    const count = await Like.countDocuments({ post: postId });

    res.json({
      success: true,
      postId,
      likesCount: count,
    });
  } catch (error) {
    console.error("Like Count Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * ADMIN: GET ALL LIKES (ANALYTICS)
 * =====================================================
 */
export const getAllLikes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const likes = await Like.find()
      .populate({
        path: "post",
        select: "title slug",
        options: { lean: true }, // 🔥 IMPORTANT
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(); // 🔥 PREVENTS Page virtual crash

    const total = await Like.countDocuments();

    res.json({
      success: true,
      count: likes.length,
      total,
      data: likes,
    });
  } catch (error) {
    console.error("Get All Likes Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

