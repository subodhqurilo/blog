// ========================================
// FILE: src/models/page.js
// FINAL Production-Ready Page Model
// ========================================

import mongoose from "mongoose";

// Component/Block Schema for Drag-Drop Elements
const ComponentSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      // Basic Content
      'heading',
      'paragraph',
      'text',
      'quote',
      'list',
      
      // Media
      'image',
      'video',
      'gallery',
      'audio',
      
      // Interactive
      'button',
      'link',
      'form',
      'accordion',
      'tabs',
      
      // Layout
      'banner',
      'hero',
      'section',
      'columns',
      'spacer',
      'divider',
      'container',
      
      // Advanced
      'code',
      'embed',
      'html',
      'table',
      'map',
      'social',
      'testimonial',
      'pricing',
      'faq',
      'callToAction'
    ]
  },
  props: {
    // ===== HEADING =====
    headingLevel: { type: String, enum: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] },
    headingText: String,
    
    // ===== TEXT/PARAGRAPH =====
    content: String, // HTML content
    text: String, // Plain text
    
    // ===== QUOTE =====
    quoteText: String,
    quoteAuthor: String,
    
    // ===== LIST =====
    listType: { type: String, enum: ['ordered', 'unordered'] },
    listItems: [String],
    
    // ===== IMAGE =====
    src: String,
    alt: String,
    caption: String,
    width: String,
    height: String,
    objectFit: { type: String, enum: ['cover', 'contain', 'fill', 'none'] },
    
    // ===== VIDEO =====
    videoUrl: String,
    videoType: { type: String, enum: ['upload', 'youtube', 'vimeo'] },
    thumbnail: String,
    autoplay: Boolean,
    controls: Boolean,
    loop: Boolean,
    
    // ===== GALLERY =====
    images: [{
      src: String,
      alt: String,
      caption: String
    }],
    galleryLayout: { type: String, enum: ['grid', 'masonry', 'slider'] },
    columns: Number,
    
    // ===== BANNER/HERO =====
    imageUrl: String,
    heading: String,
    subheading: String,
    description: String,
    overlayOpacity: Number,
    
    // ===== BUTTON =====
    buttonText: String,
    buttonUrl: String,
    buttonSize: { type: String, enum: ['small', 'medium', 'large'] },
    buttonVariant: { type: String, enum: ['primary', 'secondary', 'outline', 'ghost'] },
    openInNewTab: Boolean,
    
    // ===== LINK =====
    linkText: String,
    linkUrl: String,
    linkTarget: { type: String, enum: ['_self', '_blank'] },
    
    // ===== FORM =====
    formFields: [{
      type: { type: String, enum: ['text', 'email', 'textarea', 'select', 'checkbox'] },
      label: String,
      placeholder: String,
      required: Boolean,
      options: [String]
    }],
    submitButtonText: String,
    
    // ===== ACCORDION =====
    accordionItems: [{
      title: String,
      content: String,
      isOpen: Boolean
    }],
    
    // ===== TABS =====
    tabs: [{
      title: String,
      content: String
    }],
    
    // ===== COLUMNS =====
    columnCount: Number,
    columnGap: String,
    columns: [{
      content: mongoose.Schema.Types.Mixed
    }],
    
    // ===== SPACER =====
    spacerHeight: String,
    
    // ===== DIVIDER =====
    dividerStyle: { type: String, enum: ['solid', 'dashed', 'dotted'] },
    dividerWidth: String,
    
    // ===== CODE =====
    code: String,
    language: String,
    showLineNumbers: Boolean,
    
    // ===== EMBED =====
    embedCode: String,
    embedUrl: String,
    
    // ===== TABLE =====
    tableHeaders: [String],
    tableRows: [[String]],
    
    // ===== MAP =====
    latitude: Number,
    longitude: Number,
    zoom: Number,
    mapAddress: String,
    
    // ===== SOCIAL =====
    socialPlatform: { type: String, enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] },
    socialUrl: String,
    socialHandle: String,
    
    // ===== TESTIMONIAL =====
    testimonialText: String,
    testimonialAuthor: String,
    testimonialRole: String,
    testimonialImage: String,
    rating: Number,
    
    // ===== PRICING =====
    pricingTitle: String,
    price: String,
    currency: String,
    period: String,
    features: [String],
    highlighted: Boolean,
    
    // ===== FAQ =====
    faqItems: [{
      question: String,
      answer: String
    }],
    
    // ===== CALL TO ACTION =====
    ctaHeading: String,
    ctaDescription: String,
    ctaButtonText: String,
    ctaButtonUrl: String,
    ctaBackgroundImage: String,
    
    // ===== COMMON =====
    alignment: { type: String, enum: ['left', 'center', 'right', 'justify'] },
    animation: { type: String, enum: ['none', 'fade', 'slide', 'zoom'] },
    animationDelay: Number,
  },
  
  styles: {
    // Layout
    display: String,
    position: String,
    width: String,
    maxWidth: String,
    height: String,
    minHeight: String,
    
    // Spacing
    margin: String,
    marginTop: String,
    marginRight: String,
    marginBottom: String,
    marginLeft: String,
    padding: String,
    paddingTop: String,
    paddingRight: String,
    paddingBottom: String,
    paddingLeft: String,
    
    // Colors
    backgroundColor: String,
    color: String,
    borderColor: String,
    
    // Typography
    fontSize: String,
    fontWeight: String,
    fontFamily: String,
    lineHeight: String,
    letterSpacing: String,
    textAlign: String,
    textDecoration: String,
    textTransform: String,
    
    // Border
    border: String,
    borderWidth: String,
    borderStyle: String,
    borderRadius: String,
    
    // Shadow & Effects
    boxShadow: String,
    textShadow: String,
    opacity: Number,
    filter: String,
    
    // Background
    backgroundImage: String,
    backgroundSize: String,
    backgroundPosition: String,
    backgroundRepeat: String,
    
    // Flexbox
    flexDirection: String,
    justifyContent: String,
    alignItems: String,
    gap: String,
    
    // Grid
    gridTemplateColumns: String,
    gridTemplateRows: String,
    gridGap: String,
    
    // Animation
    transition: String,
    transform: String,
    animation: String,
    
    // Custom CSS
    customCSS: String,
  },
  
  order: { 
    type: Number, 
    required: true 
  }
}, { _id: false });

// Main Page Schema
const PageSchema = new mongoose.Schema(
  {
    // ===== BASIC INFORMATION =====
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      index: true  // ✅ Added explicit index
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    
    // ===== SEO FIELDS =====
    metaDescription: {
      type: String,
      maxlength: 160
    },
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaKeywords: [String],
    ogImage: String,
    
    // ===== CONTENT =====
    blocks: [ComponentSchema],
    
    // ===== PUBLISHING STATUS =====
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true  // ✅ Added index
    },
    publishedAt: {
      type: Date,
      index: true  // ✅ Added index
    },
    scheduledAt: {  // ✅ NEW: For scheduling posts
      type: Date,
      default: null
    },
    
    // ===== MEDIA =====
    featuredImage: String,
    
    // ===== ANALYTICS =====
    views: {
      type: Number,
      default: 0
    },
    
    // ===== TAXONOMY =====
    // ✅ FIXED: Changed from String to ObjectId for proper relations
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    }],
    
    // ===== AUTHOR =====
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true  // Automatically adds createdAt & updatedAt
  }
);

// ========================================
// INDEXES for Better Query Performance
// ========================================
PageSchema.index({ status: 1, publishedAt: -1 });  // For published posts listing
PageSchema.index({ category: 1, status: 1 });  // ✅ NEW: Compound index for category filtering
PageSchema.index({ tags: 1 });  // For tag filtering
PageSchema.index({ title: 'text', metaDescription: 'text' });  // ✅ NEW: Full-text search
PageSchema.index({ views: -1 });  // ✅ NEW: For popular posts

// ========================================
// INSTANCE METHODS
// ========================================

// Publish a page
PageSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Increment view count
PageSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// ✅ NEW: Check if page is published
PageSchema.methods.isPublished = function() {
  return this.status === 'published';
};

// ✅ NEW: Check if page is scheduled
PageSchema.methods.isScheduled = function() {
  return this.scheduledAt && this.scheduledAt > new Date();
};

// ========================================
// STATIC METHODS (for common queries)
// ========================================

// ✅ NEW: Get popular posts
PageSchema.statics.getPopularPosts = function(limit = 5) {
  return this.find({ status: 'published' })
    .sort({ views: -1 })
    .limit(limit)
    .select('title slug views publishedAt featuredImage')
    .populate('category', 'name slug color');
};

// ✅ NEW: Get recent posts
PageSchema.statics.getRecentPosts = function(limit = 5) {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('title slug publishedAt featuredImage')
    .populate('category', 'name slug color');
};

// ✅ NEW: Search posts by text
PageSchema.statics.searchPosts = function(query, limit = 10) {
  return this.find(
    { 
      $text: { $search: query },
      status: 'published'
    },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .limit(limit)
  .select('title slug metaDescription publishedAt featuredImage')
  .populate('category', 'name slug');
};

// ✅ NEW: Get posts by category
PageSchema.statics.getPostsByCategory = function(categoryId, limit = 10) {
  return this.find({ 
    category: categoryId, 
    status: 'published' 
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug publishedAt featuredImage views');
};

// ✅ NEW: Get posts by tag
PageSchema.statics.getPostsByTag = function(tagId, limit = 10) {
  return this.find({ 
    tags: tagId, 
    status: 'published' 
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug publishedAt featuredImage views');
};

// ========================================
// VIRTUALS (computed properties)
// ========================================

// ✅ NEW: Virtual for full URL
PageSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// ✅ NEW: Virtual for reading time estimation
PageSchema.virtual('readingTime').get(function() {
  let wordCount = 0;
  
  // Count words in all text-based blocks
  this.blocks.forEach(block => {
    if (block.props?.content) {
      // Strip HTML tags and count words
      const text = block.props.content.replace(/<[^>]*>/g, '');
      wordCount += text.split(/\s+/).filter(word => word.length > 0).length;
    }
    if (block.props?.text) {
      wordCount += block.props.text.split(/\s+/).filter(word => word.length > 0).length;
    }
    if (block.props?.headingText) {
      wordCount += block.props.headingText.split(/\s+/).length;
    }
    if (block.props?.quoteText) {
      wordCount += block.props.quoteText.split(/\s+/).length;
    }
  });
  
  // Average reading speed: 200 words per minute
  const minutes = Math.ceil(wordCount / 200);
  return minutes || 1;  // Minimum 1 minute
});

// ✅ NEW: Virtual for excerpt (first 150 characters)
PageSchema.virtual('excerpt').get(function() {
  if (this.metaDescription) {
    return this.metaDescription;
  }
  
  // Extract from first text block
  for (const block of this.blocks) {
    if (block.props?.content) {
      const text = block.props.content.replace(/<[^>]*>/g, '');
      if (text.length > 0) {
        return text.substring(0, 150) + (text.length > 150 ? '...' : '');
      }
    }
  }
  
  return '';
});

// Enable virtuals in JSON output
PageSchema.set('toJSON', { virtuals: true });
PageSchema.set('toObject', { virtuals: true });

// ========================================
// PRE-SAVE HOOKS
// ========================================

// ✅ NEW: Auto-clean slug before saving
PageSchema.pre('save', function(next) {
  if (this.slug) {
    this.slug = this.slug.toLowerCase().trim();
  }
  next();
});

// ✅ NEW: Auto-set publishedAt when status changes to published
PageSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// ✅ NEW: Clear scheduledAt when manually published
PageSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && this.scheduledAt) {
    this.scheduledAt = null;
  }
  next();
});

export default mongoose.model("Page", PageSchema);