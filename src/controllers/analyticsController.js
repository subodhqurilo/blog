import Page from "../models/page.js";
import Media from "../models/media.js";
import Comment from "../models/comment.js";

/**
 * DASHBOARD OVERVIEW STATS
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      totalViews,
      totalMedia,
      pendingComments
    ] = await Promise.all([
      Page.countDocuments(),
      Page.countDocuments({ status: "published" }),
      Page.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Media.countDocuments(),
      Comment.countDocuments({ status: "pending" })
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        totalViews: totalViews[0]?.total || 0,
        totalMedia,
        pendingComments,
        enquiries: 0 // Future model integration
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * SINGLE POST ANALYTICS
 */
export const getPostAnalytics = async (req, res) => {
  try {
    const post = await Page.findById(req.params.id)
      .select("title slug views status createdAt publishedAt")
      .populate("category", "name")
      .populate("author", "name");

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};