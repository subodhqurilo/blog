import mongoose from "mongoose";

/**
 * =====================================================
 * BlockTemplate Model
 * Used for Drag & Drop Widgets
 * (Heading, Text, Button, Form, Layout, etc.)
 * =====================================================
 */
const BlockTemplateSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC INFO
    ========================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    /**
     * Widget Type
     * Frontend ko pata chale kaunsa widget render karna hai
     */
    type: {
      type: String,
      required: true,
      enum: [
        "heading",
        "text",
        "paragraph",
        "icon",
        "image",
        "video",
        "button",
        "form",
        "layout",
        "section",
        "gallery",
        "faq",
        "pricing",
        "testimonial",
        "cta",
      ],
      index: true,
    },

    /**
     * Widget Category (Sidebar grouping)
     */
    category: {
      type: String,
      enum: [
        "header",
        "content",
        "feature",
        "footer",
        "hero",
        "form",
        "cta",
        "blog",
        "layout",
      ],
      index: true,
    },

    /* =========================
       UI PREVIEW (Sidebar)
    ========================= */
    previewImage: {
      type: String, // Cloudinary / URL
    },

    description: {
      type: String,
      trim: true,
    },

    /* =========================
       CORE STRUCTURE (VERY IMPORTANT)
    ========================= */
    structure: {
      type: Object,
      required: true,
      /**
       * EXACT SAME STRUCTURE AS Page.blocks[]
       * Example:
       * {
       *   id,
       *   type,
       *   props,
       *   styles,
       *   order
       * }
       */
    },

    /* =========================
       🔥 CONTROLS (EDITOR SIDEBAR)
       Frontend form yahin se auto-generate hoga
    ========================= */
    controls: {
      type: Object,
      default: {},
      /**
       * Example:
       * {
       *   content: [
       *     { key: "text", label: "Text", type: "text" },
       *     { key: "level", label: "Heading Level", type: "select", options: ["h1","h2","h3"] }
       *   ],
       *   style: [
       *     { key: "color", label: "Text Color", type: "color" },
       *     { key: "align", label: "Alignment", type: "select", options: ["left","center","right"] }
       *   ]
       * }
       */
    },

    /* =========================
       METADATA
    ========================= */
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    version: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isSystem: {
      type: Boolean,
      default: false,
      // true = default widgets (delete nahi honge)
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */
BlockTemplateSchema.index({ category: 1, isActive: 1 });
BlockTemplateSchema.index({ type: 1 });
BlockTemplateSchema.index({ name: "text", description: "text" });

/* =========================
   HOOKS
========================= */
BlockTemplateSchema.pre("save", function (next) {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().trim();
  }
  next();
});

export default mongoose.model("BlockTemplate", BlockTemplateSchema);
