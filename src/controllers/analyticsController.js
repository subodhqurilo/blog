import Page from "../models/page.js";
import Media from "../models/media.js";
import Comment from "../models/comment.js";
import Like from "../models/like.js";
import Inquiry from "../models/inquiry.js";

/**
 * ========================================
 * DASHBOARD OVERVIEW (ADMIN)
 * ========================================
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViewsAgg,
      totalComments,
      totalLikes,
      
      totalEnquiry, // 🔥 NEW
    ] = await Promise.all([
      Page.countDocuments(),
      Page.countDocuments({ status: "published" }),
      Page.countDocuments({ status: "draft" }),

      // Views aggregation
      Page.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } }
      ]),

      // Comments
      Comment.countDocuments({ isDeleted: false }),

      // Likes
      Like.countDocuments(),

      // Media (if you have Media model, else 0)
      0,

      // 🔥 INQUIRIES COUNT
      Inquiry.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalPosts,
        // publishedPosts,
        // draftPosts,
        totalViews: totalViewsAgg[0]?.total || 0,
        totalComments,
        // totalLikes,
        totalEnquiry, // ✅ ADDED
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ========================================
 * MEDIA ANALYTICS ✅ (THIS WAS MISSING)
 * ========================================
 */
export const getMediaAnalytics = async (req, res) => {
  try {
    const [images, videos, totalSizeAgg] = await Promise.all([
      Media.countDocuments({ type: "image" }),
      Media.countDocuments({ type: "video" }),
      Media.aggregate([{ $group: { _id: null, total: { $sum: "$size" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalImages: images,
        totalVideos: videos,
        totalStorageBytes: totalSizeAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Media Analytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ========================================
 * SINGLE POST ANALYTICS
 * ========================================
 */
export const getPostAnalytics = async (req, res) => {
  try {
    const post = await Page.findById(req.params.id)
      .select("title slug views status createdAt publishedAt")
      .lean(); // 🔥 IMPORTANT (no virtuals)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const [likesCount, commentsCount] = await Promise.all([
      Like.countDocuments({ post: post._id }),
      Comment.countDocuments({ post: post._id, isDeleted: false }),
    ]);

    res.json({
      success: true,
      data: {
        ...post,          // ✅ plain JS object
        likesCount,
        commentsCount,
      },
    });
  } catch (error) {
    console.error("Post Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * ========================================
 * TOP POSTS BY VIEWS
 * ========================================
 */
export const getTopPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;

    const posts = await Page.find({ status: "published" })
      .sort({ views: -1 })
      .limit(limit)
      .select("title slug views publishedAt featuredImage")
      .lean(); // 🔥 IMPORTANT (prevents virtuals)

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Top Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentContent = async (req, res) => {
  try {
    const posts = await Page.find()
      .select("title status updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: posts.map(p => ({
        id: p._id,
        title: p.title,
        status: p.status,
        lastUpdated: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Recent Content Error:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error.message,
    });
  }
};

/* =====================================================
   2️⃣ RECENT ACTIVITY (TIMELINE)
===================================================== */
export const getRecentActivity = async (req, res) => {
  try {
    const [likes, comments, inquiries] = await Promise.all([
      Like.find().sort({ createdAt: -1 }).limit(5).lean(),
      Comment.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).lean(),
      Inquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const activity = [];

    likes.forEach(() =>
      activity.push({
        // type: "like",
        message: "New like on your blog",
      })
    );

    comments.forEach(c =>
      activity.push({
        // type: "comment",
        message: `${c.name || "Someone"} commented on your blog`,
      })
    );

    inquiries.forEach(() =>
      activity.push({
        // type: "inquiry",
        message: "You have a new enquiry",
      })
    );

    res.json({
      success: true,
      data: activity.slice(0, 6),
    });
  } catch (error) {
    console.error("Recent Activity Error:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error.message,
    });
  }
};

/* =====================================================
   3️⃣ BLOG ENGAGEMENT (LINE CHART)
===================================================== */
export const getEngagementAnalytics = async (req, res) => {
  try {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const likesAgg = await Like.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    const commentsAgg = await Comment.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    const inquiryAgg = await Inquiry.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } }
    ]);

    const format = (agg) =>
      months.map((_, i) => agg.find(a => a._id === i + 1)?.count || 0);

    res.json({
      success: true,
      data: {
        labels: months,
        like: format(likesAgg),
        comment: format(commentsAgg),
        enquiry: format(inquiryAgg),
      },
    });
  } catch (error) {
    console.error("Engagement Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};