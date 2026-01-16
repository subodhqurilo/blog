// ========================================
// FILE: src/controllers/pageController.js
// COMPLETE PAGE / BLOG CONTROLLER (FINAL)
// ========================================

import Page from "../models/page.js";
import Like from "../models/like.js";
import Comment from "../models/comment.js";
import { saveVersion } from "./pageVersionController.js";

/* =====================================================
   CREATE PAGE (DRAFT)
   POST /api/pages
===================================================== */
export const createPage = async (req, res) => {
  try {
    const {
      slug,
      title,
      blocks = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      featuredImage,
    } = req.body;

    if (!slug || !title) {
      return res.status(400).json({
        success: false,
        message: "Slug and Title are required",
      });
    }

    const page = await Page.create({
      slug,
      title,
      blocks,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      featuredImage,
      status: "draft",
      author: req.user?.userId || null,
    });

    res.status(201).json({
      success: true,
      message: "Page created (Draft)",
      data: page,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPDATE PAGE (AUTO SAVE / EDIT)
   PUT /api/pages/:id
===================================================== */
export const updatePage = async (req, res) => {
  try {
    const pageId = req.params.id;

    const updateData = {};
    const allowedFields = [
      "slug",
      "title",
      "blocks",
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "ogImage",
      "featuredImage",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const page = await Page.findByIdAndUpdate(
      pageId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // 🔥 Save version snapshot (autosave)
    if (req.body.blocks) {
      await saveVersion(page._id, page.blocks, req.user?.userId || null);
    }

    res.json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET PAGE BY ID (ADMIN EDIT)
   GET /api/pages/:id
===================================================== */
export const getBlogById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate(
      "author",
      "name email avatar"
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   LIST PAGES (ADMIN)
   GET /api/pages
===================================================== */
export const listBlogs = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    const pages = await Page.find(filter)
      .populate("author", "name email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Page.countDocuments(filter);

    res.json({
      success: true,
      count: pages.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   PUBLISH PAGE
   PUT /api/pages/:id/publish
===================================================== */
export const publishPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await page.publish();

    res.json({
      success: true,
      message: "Page published successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UNPUBLISH PAGE
===================================================== */
export const unpublishPage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { status: "draft", publishedAt: null },
      { new: true }
    );

    res.json({
      success: true,
      message: "Page moved to draft",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE PAGE
===================================================== */
export const deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await Comment.deleteMany({ post: page._id });
    await Like.deleteMany({ post: page._id });

    res.json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   PUBLIC BLOG (VIEW + COUNTS)
   GET /api/pages/public/:slug
===================================================== */
export const getPublicBlog = async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      status: "published",
    }).populate("author", "name avatar");

    if (!page) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Blog not found",
      });
    }

    const cookieKey = `viewed_${page._id}`;
    if (!req.cookies?.[cookieKey] && page.incrementViews) {
      await page.incrementViews();
      res.cookie(cookieKey, true, { maxAge: 3600000, httpOnly: true });
    }

    const likesCount =
      typeof Like?.countDocuments === "function"
        ? await Like.countDocuments({ post: page._id })
        : 0;

    const commentsCount =
      typeof Comment?.countDocuments === "function"
        ? await Comment.countDocuments({ post: page._id, isDeleted: false })
        : 0;

    res.json({
      success: true,
      data: {
        ...page.toObject(),
        likesCount,
        commentsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

/* =====================================================
   PUBLIC BLOG LIST
===================================================== */
export const getPublishedBlogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Page.find({ status: "published" })
      .select("title slug featuredImage publishedAt views")
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // 🔥 VERY IMPORTANT

    // 🔒 Hard safety
    const safeBlogs = Array.isArray(blogs) ? blogs : [];

    return res.status(200).json({
      success: true,
      count: safeBlogs.length,
      data: safeBlogs,
    });

  } catch (error) {
    console.error("getPublishedBlogs error:", error);

    // 🔥 NEVER send failing structure to public list
    return res.status(200).json({
      success: true,
      count: 0,
      data: [], // always array
    });
  }
};



/* =====================================================
   DUPLICATE PAGE
===================================================== */
export const duplicatePage = async (req, res) => {
  try {
    const original = await Page.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const copy = await Page.create({
      ...original.toObject(),
      _id: undefined,
      slug: `${original.slug}-copy-${Date.now()}`,
      title: `${original.title} (Copy)`,
      status: "draft",
      views: 0,
    });

    res.status(201).json({
      success: true,
      message: "Page duplicated",
      data: copy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const bulkDeletePages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of page IDs",
      });
    }

    const result = await Page.deleteMany({
      _id: { $in: ids },
    });

    res.json({
      success: true,
      message: `${result.deletedCount} pages deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// ========================================
// SCHEDULE PAGE (FUTURE PUBLISH)
// ========================================
export const schedulePage = async (req, res) => {
  try {
    const { scheduledAt } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt is required",
      });
    }

    const scheduleDate = new Date(scheduledAt);

    if (scheduleDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      });
    }

    const page = await Page.findByIdAndUpdate(
      req.params.id,
      {
        scheduledAt: scheduleDate,
        status: "draft",
      },
      { new: true }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.json({
      success: true,
      message: "Page scheduled successfully",
      data: page,
    });
  } catch (error) {
    console.error("Schedule Page Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getPopularPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const posts = await Page.find({ status: "published" })
      .sort({ views: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: error.message,
    });
  }
};
export const getRecentPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const posts = await Page.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: error.message,
    });
  }
};
export const getAdminPostsGrid = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      status = "all",
      search = "",
    } = req.query;

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    // 🔥 MAIN QUERY (lean = NO virtual crash)
    const posts = await Page.find(filter)
      .select(
        "title slug featuredImage status views createdAt updatedAt publishedAt"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 🔥 Attach counts safely
    const postIds = posts.map(p => p._id);

    const [likes, comments, favourites] = await Promise.all([
      Like.aggregate([
        { $match: { post: { $in: postIds } } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),
      Comment.aggregate([
        { $match: { post: { $in: postIds }, isDeleted: false } },
        { $group: { _id: "$post", count: { $sum: 1 } } },
      ]),
      Favourite.aggregate([
        { $match: { page: { $in: postIds } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
      ]),
    ]);

    const mapCount = (arr) =>
      arr.reduce((acc, i) => {
        acc[i._id.toString()] = i.count;
        return acc;
      }, {});

    const likeMap = mapCount(likes);
    const commentMap = mapCount(comments);
    const favMap = mapCount(favourites);

    const data = posts.map(post => ({
      ...post,
      likesCount: likeMap[post._id] || 0,
      commentsCount: commentMap[post._id] || 0,
      favouritesCount: favMap[post._id] || 0,
    }));

    const total = await Page.countDocuments(filter);

    res.json({
      success: true,
      page: Number(page),
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Admin Posts Grid Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};