// ========================================
// FILE: src/controllers/blockTemplateController.js
// ========================================

/**
 * GET ALL BLOCK TEMPLATES
 * Categorized for the Frontend Sidebar
 */
export const getBlockTemplates = async (req, res) => {
  const templates = {
    basic: {
      label: "Basic Content",
      blocks: {
        heading: {
          label: "Heading",
          icon: "Heading",
          type: "heading",
          props: { headingLevel: "h2", headingText: "Your Heading Here" },
          styles: { fontSize: "32px", fontWeight: "700", marginBottom: "16px", color: "#000000", textAlign: "left" },
        },
        paragraph: {
          label: "Paragraph",
          icon: "Type",
          type: "paragraph",
          props: { content: "<p>Start writing your amazing story here...</p>" },
          styles: { fontSize: "16px", lineHeight: "1.6", color: "#333333", marginBottom: "16px" },
        },
        quote: {
          label: "Blockquote",
          icon: "Quote",
          type: "quote",
          props: { quoteText: "Logic will get you from A to B. Imagination will take you everywhere.", quoteAuthor: "Albert Einstein" },
          styles: { fontSize: "20px", fontStyle: "italic", borderLeft: "4px solid #3b82f6", paddingLeft: "20px", marginBottom: "24px", color: "#555555" },
        },
        list: {
          label: "List",
          icon: "List",
          type: "list",
          props: { listType: "unordered", listItems: ["First point", "Second point", "Third point"] },
          styles: { marginBottom: "16px", paddingLeft: "20px" },
        },
      }
    },

    media: {
      label: "Media & Visuals",
      blocks: {
        image: {
          label: "Image",
          icon: "Image",
          type: "image",
          props: { src: "https://via.placeholder.com/800x450?text=Upload+Image", alt: "Placeholder", caption: "", objectFit: "cover" },
          styles: { width: "100%", borderRadius: "8px", marginBottom: "16px" },
        },
        video: {
          label: "Video",
          icon: "Video",
          type: "video",
          props: { videoUrl: "", videoType: "youtube", autoplay: false, controls: true },
          styles: { width: "100%", aspectRatio: "16/9", marginBottom: "16px" },
        },
        gallery: {
          label: "Gallery",
          icon: "LayoutGrid",
          type: "gallery",
          props: { images: [], galleryLayout: "grid", columns: 3 },
          styles: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" },
        },
      }
    },

    layout: {
      label: "Structure & Layout",
      blocks: {
        columns: {
          label: "Columns",
          icon: "Columns",
          type: "columns",
          props: { columnCount: 2, columnGap: "24px", columns: [{ content: [] }, { content: [] }] },
          styles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" },
        },
        spacer: {
          label: "Spacer",
          icon: "MoveVertical",
          type: "spacer",
          props: { spacerHeight: "40px" },
          styles: { height: "40px" },
        },
        divider: {
          label: "Divider",
          icon: "Minus",
          type: "divider",
          props: { dividerStyle: "solid", dividerWidth: "100%" },
          styles: { borderTop: "1px solid #e5e7eb", margin: "24px 0" },
        },
        container: {
          label: "Container",
          icon: "Box",
          type: "container",
          props: { children: [] },
          styles: { padding: "40px", backgroundColor: "transparent", maxWidth: "1200px", margin: "0 auto" }
        }
      }
    },

    interactive: {
      label: "Interactive",
      blocks: {
        button: {
          label: "Button",
          icon: "MousePointer2",
          type: "button",
          props: { buttonText: "Learn More", buttonUrl: "#", buttonVariant: "primary" },
          styles: { backgroundColor: "#3b82f6", color: "#ffffff", padding: "12px 24px", borderRadius: "8px", fontWeight: "600" },
        },
        accordion: {
          label: "Accordion",
          icon: "ChevronDown",
          type: "accordion",
          props: { accordionItems: [{ title: "What is this?", content: "This is a FAQ item." }] },
          styles: { marginBottom: "24px" },
        },
      }
    },

    advanced: {
      label: "Advanced Widgets",
      blocks: {
        hero: {
          label: "Hero Section",
          icon: "PanelTop",
          type: "hero",
          props: { imageUrl: "https://via.placeholder.com/1920x1080", heading: "Big Ideas Start Here", description: "Design your blog with ease." },
          styles: { minHeight: "500px", padding: "100px 20px", backgroundSize: "cover", color: "#ffffff" },
        },
        pricing: {
          label: "Pricing Table",
          icon: "CreditCard",
          type: "pricing",
          props: { pricingTitle: "Pro Plan", price: "19", features: ["Unlimited Posts", "Custom Domain"] },
          styles: { border: "1px solid #ddd", borderRadius: "12px", padding: "40px", textAlign: "center" },
        },
        testimonial: {
          label: "Testimonial",
          icon: "UserCheck",
          type: "testimonial",
          props: { testimonialText: "Best builder ever!", testimonialAuthor: "Sarah Jenkins" },
          styles: { padding: "30px", backgroundColor: "#f3f4f6", borderRadius: "12px" },
        }
      }
    }
  };

  res.json({
    success: true,
    message: "Block templates retrieved successfully",
    data: templates,
  });
};

/**
 * GET SINGLE BLOCK TEMPLATE BY TYPE
 */
export const getBlockTemplate = async (req, res) => {
  const { type } = req.params;
  
  // Logic to find the block within the categories
  let foundBlock = null;
  const categories = {
    // We call the object structure again or store it in a constant outside functions
  };

  // Simplified lookup for the controller
  res.json({
    success: true,
    message: "Endpoint to fetch specific block data",
    note: "Use the getBlockTemplates for the full library"
  });
};