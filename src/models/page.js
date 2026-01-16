// ========================================
// FILE: src/models/page.js
// FINAL Production-Ready Page Model
// (NO CATEGORY, NO TAGS)
// ========================================

import mongoose from "mongoose";

/* ======================================================
   COMPONENT / BLOCK SCHEMA (Drag & Drop Builder)
====================================================== */
const ComponentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        // Basic
        "heading",
        "paragraph",
        "text",
        "quote",
        "list",

        // Media
        "image",
        "video",
        "gallery",
        "audio",

        // Layout
        "hero",
        "section",
        "container",
        "columns",
        "spacer",
        "divider",

        // Interactive
        "button",
        "link",
        "form",
        "accordion",
        "tabs",

        // Advanced
        "code",
        "embed",
        "table",
        "faq",
        "testimonial",
        "pricing",
        "callToAction",
      ],
    },

    props: {
      type: Object,
      default: {},
    },

    styles: {
      type: Object,
      default: {},
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ======================================================
   MAIN PAGE SCHEMA
====================================================== */
const PageSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       SEO
    ========================= */
    metaTitle: {
      type: String,
      maxlength: 60,
    },

    metaDescription: {
      type: String,
      maxlength: 160,
    },

    metaKeywords: [String],

    ogImage: {
      type: String,
    },

    /* =========================
       CONTENT
    ========================= */
    blocks: {
      type: [ComponentSchema],
      default: [],
    },
currentVersion: {
  type: Number,
  default: 0,
},
    featuredImage: {
      type: String,
    },

    /* =========================
       STATUS & SCHEDULING
    ========================= */
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      index: true,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    /* =========================
       ANALYTICS
    ========================= */
    views: {
      type: Number,
      default: 0,
      index: true,
    },

    /* =========================
       AUTHOR
    ========================= */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* =========================
       SOFT DELETE
    ========================= */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   INDEXES
====================================================== */
PageSchema.index({ status: 1, publishedAt: -1 });
PageSchema.index({ title: "text", metaDescription: "text" });
PageSchema.index({ views: -1 });

/* ======================================================
   INSTANCE METHODS
====================================================== */

// Publish page
PageSchema.methods.publish = function () {
  this.status = "published";
  this.publishedAt = new Date();
  this.scheduledAt = null;
  return this.save();
};

// Increment views (safe for analytics)
PageSchema.methods.incrementViews = function () {
  return this.updateOne(
    { $inc: { views: 1 } },
    { timestamps: false }
  );
};

// Check published
PageSchema.methods.isPublished = function () {
  return this.status === "published";
};

/* ======================================================
   STATIC METHODS
====================================================== */

// Popular posts
PageSchema.statics.getPopularPosts = function (limit = 5) {
  return this.find({ status: "published", isDeleted: false })
    .sort({ views: -1 })
    .limit(limit)
    .select("title slug views publishedAt featuredImage");
};

// Recent posts
PageSchema.statics.getRecentPosts = function (limit = 5) {
  return this.find({ status: "published", isDeleted: false })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select("title slug publishedAt featuredImage");
};

// Full-text search
PageSchema.statics.searchPosts = function (query, limit = 10) {
  return this.find(
    {
      $text: { $search: query },
      status: "published",
      isDeleted: false,
    },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .select("title slug metaDescription featuredImage");
};

/* ======================================================
   VIRTUALS
====================================================== */

// Page URL
PageSchema.virtual("url").get(function () {
  return `/blog/${this.slug}`;
});

// Reading time
PageSchema.virtual("readingTime").get(function () {
  let words = 0;

  this.blocks.forEach((block) => {
    if (block.props?.content) {
      const text = block.props.content.replace(/<[^>]+>/g, "");
      words += text.split(/\s+/).length;
    }
    if (block.props?.text) {
      words += block.props.text.split(/\s+/).length;
    }
    if (block.props?.headingText) {
      words += block.props.headingText.split(/\s+/).length;
    }
  });

  return Math.max(1, Math.ceil(words / 200));
});

// Enable virtuals
PageSchema.set("toJSON", { virtuals: true });
PageSchema.set("toObject", { virtuals: true });

/* ======================================================
   HOOKS
====================================================== */

// Clean slug
PageSchema.pre("save", function (next) {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().trim();
  }
  next();
});

// Auto set publish date
PageSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default mongoose.model("Page", PageSchema);
