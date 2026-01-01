// ========================================
// FILE: src/controllers/pageController.js
// Complete Page/Blog Controller with All Operations
// ========================================

import Page from "../models/page.js";

// ========================================
// CREATE BLOG (DRAFT)
// ========================================
export const createPage = async (req, res) => {
  try {
    const { 
      slug, 
      title = "", 
      blocks = [], 
      metaDescription,
      metaTitle,
      metaKeywords,
      ogImage,
      featuredImage,
      category, 
      tags 
    } = req.body;

    // Validate required fields
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Create new page
    const page = await Page.create({
      slug,
      title,
      blocks,
      metaDescription,
      metaTitle,
      metaKeywords,
      ogImage,
      featuredImage,
      category,
      tags,
      status: "draft",
      author: req.user?.userId // If auth is enabled
    });

    // Populate relations
    await page.populate('category', 'name slug color');
    await page.populate('tags', 'name slug');

    res.status(201).json({
      success: true,
      message: "Blog created successfully (draft)",
      data: page,
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists. Please use a different slug",
      });
    }

    console.error("Create Page Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// UPDATE BLOG (AUTO-SAVE / EDIT)
// ========================================
export const updatePage = async (req, res) => {
  try {
    const { 
      blocks, 
      title, 
      metaDescription,
      metaTitle,
      metaKeywords,
      ogImage,
      featuredImage, 
      category, 
      tags,
      slug
    } = req.body;

    // Build update object dynamically
    const updateData = {};
    if (blocks !== undefined) updateData.blocks = blocks;
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords;
    if (ogImage !== undefined) updateData.ogImage = ogImage;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;

    // Update page
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .populate('author', 'name email');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: page,
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
      });
    }

    console.error("Update Page Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET BLOG BY ID (FOR EDITING)
// ========================================
export const getBlogById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id)
      .populate('category', 'name slug color description image')
      .populate('tags', 'name slug')
      .populate('author', 'name email avatar');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// LIST BLOGS (ADMIN DASHBOARD)
// With Filters, Search & Pagination
// ========================================
export const listBlogs = async (req, res) => {
  try {
    const { 
      status, 
      category,
      tags,
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      author
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (author) filter.author = author;
    
    // Tags filter (can filter by multiple tags)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    // Search in title, slug, and meta description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Query with all filters
    const blogs = await Page.find(filter)
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .populate('author', 'name email')
      .select("title slug status createdAt updatedAt publishedAt scheduledAt views featuredImage category tags author")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    // Total count for pagination
    const total = await Page.countDocuments(filter);

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: blogs,
    });
  } catch (error) {
    console.error("List Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// PUBLISH BLOG
// ========================================
export const publishPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Use model's publish method
    await page.publish();

    // Clear scheduled date if it was scheduled
    if (page.scheduledAt) {
      page.scheduledAt = null;
      await page.save();
    }

    // Populate relations
    await page.populate('category', 'name slug');
    await page.populate('tags', 'name slug');

    res.json({
      success: true,
      message: "Blog published successfully",
      data: page,
    });
  } catch (error) {
    console.error("Publish Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// UNPUBLISH BLOG (MOVE TO DRAFT)
// ========================================
export const unpublishPage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { 
        status: "draft",
        publishedAt: null
      },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: "Blog moved to draft successfully",
      data: page,
    });
  } catch (error) {
    console.error("Unpublish Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// DELETE BLOG
// ========================================
export const deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // TODO: Delete associated uploaded images if needed
    // This would require tracking which images are used in blocks

    res.json({
      success: true,
      message: "Blog deleted successfully",
      data: { 
        id: req.params.id,
        title: page.title,
        slug: page.slug
      },
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET PUBLIC BLOG (BY SLUG)
// For Frontend Display - Increments Views
// ========================================
export const getPublicBlog = async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate('category', 'name slug color description')
      .populate('tags', 'name slug')
      .populate('author', 'name email avatar');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published",
      });
    }

    // Increment view count asynchronously (don't wait)
    page.incrementViews().catch(err => 
      console.error('View increment error:', err)
    );

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Get Public Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET ALL PUBLISHED BLOGS (PUBLIC LIST)
// For Frontend Blog Listing Page
// ========================================
export const getPublishedBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      category,
      tags,
      search,
      sortBy = 'publishedAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = { status: 'published' };
    
    if (category) filter.category = category;
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { metaDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const blogs = await Page.find(filter)
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .populate('author', 'name avatar')
      .select("title slug metaDescription publishedAt featuredImage views category tags author")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Page.countDocuments(filter);

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: blogs,
    });
  } catch (error) {
    console.error("Get Published Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// DUPLICATE BLOG
// ========================================
export const duplicatePage = async (req, res) => {
  try {
    const originalPage = await Page.findById(req.params.id);

    if (!originalPage) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Create duplicate with unique slug
    const timestamp = Date.now();
    const duplicate = await Page.create({
      slug: `${originalPage.slug}-copy-${timestamp}`,
      title: `${originalPage.title} (Copy)`,
      blocks: originalPage.blocks,
      metaDescription: originalPage.metaDescription,
      metaTitle: originalPage.metaTitle,
      metaKeywords: originalPage.metaKeywords,
      featuredImage: originalPage.featuredImage,
      ogImage: originalPage.ogImage,
      category: originalPage.category,
      tags: originalPage.tags,
      status: 'draft',
      author: req.user?.userId || originalPage.author
    });

    // Populate relations
    await duplicate.populate('category', 'name slug');
    await duplicate.populate('tags', 'name slug');

    res.status(201).json({
      success: true,
      message: "Blog duplicated successfully",
      data: duplicate,
    });
  } catch (error) {
    console.error("Duplicate Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET RELATED POSTS
// Based on Category and Tags
// ========================================
export const getRelatedPosts = async (req, res) => {
  try {
    const currentPost = await Page.findById(req.params.id)
      .select("category tags");
    
    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    
    // Find posts with same category or shared tags
    const relatedPosts = await Page.find({
      _id: { $ne: currentPost._id },
      status: "published",
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } },
      ],
    })
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .select("title slug featuredImage publishedAt views category tags")
      .sort({ publishedAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      count: relatedPosts.length,
      data: relatedPosts,
    });
  } catch (error) {
    console.error("Get Related Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// SCHEDULE POST FOR FUTURE PUBLISHING
// ========================================
export const schedulePage = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    
    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date and time is required",
      });
    }

    const scheduledDate = new Date(scheduledAt);
    
    // Validate future date
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      });
    }

    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { 
        scheduledAt: scheduledDate,
        status: "draft" // Keep as draft until scheduled time
      },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('tags', 'name slug');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.json({
      success: true,
      message: `Blog scheduled for ${scheduledDate.toLocaleString()}`,
      data: page,
    });
  } catch (error) {
    console.error("Schedule Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// BULK DELETE BLOGS
// ========================================
export const bulkDeletePages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid blog IDs",
      });
    }

    const result = await Page.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} blogs deleted successfully`,
      data: { deletedCount: result.deletedCount },
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
// GET POPULAR POSTS (MOST VIEWED)
// ========================================
export const getPopularPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const popularPosts = await Page.getPopularPosts(parseInt(limit));

    res.json({
      success: true,
      count: popularPosts.length,
      data: popularPosts,
    });
  } catch (error) {
    console.error("Get Popular Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================================
// GET RECENT POSTS
// ========================================
export const getRecentPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const recentPosts = await Page.getRecentPosts(parseInt(limit));

    res.json({
      success: true,
      count: recentPosts.length,
      data: recentPosts,
    });
  } catch (error) {
    console.error("Get Recent Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};