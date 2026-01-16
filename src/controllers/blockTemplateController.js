import BlockTemplate from "../models/blockTemplate.js";

/* =====================================================
   HELPERS
===================================================== */
const buildSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* =====================================================
   GET ALL BLOCK TEMPLATES (PUBLIC – BUILDER SIDEBAR)
   Supports:
   ?category=content
   ?type=heading
   ?search=text
   ?page=1&limit=50
===================================================== */
export const getAllBlockTemplates = async (req, res) => {
  try {
    const {
      category,
      type,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const templates = await BlockTemplate.find(filter)
      .sort({ category: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v");

    const total = await BlockTemplate.countDocuments(filter);

    res.json({
      success: true,
      count: templates.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: templates,
    });
  } catch (error) {
    console.error("Get All Block Templates Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   GET SINGLE BLOCK TEMPLATE (BY SLUG)
===================================================== */
export const getBlockTemplateBySlug = async (req, res) => {
  try {
    const template = await BlockTemplate.findOne({
      slug: req.params.slug,
      isActive: true,
    }).select("-__v");

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Block template not found",
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Get Block Template Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   CREATE BLOCK TEMPLATE (ADMIN)
===================================================== */
export const createBlockTemplate = async (req, res) => {
  try {
    const {
      name,
      slug,
      type,
      category,
      structure,
      controls,
      description,
      previewImage,
      tags,
      isSystem = false,
    } = req.body;

    if (!name || !type || !structure) {
      return res.status(400).json({
        success: false,
        message: "Name, type and structure are required",
      });
    }

    const finalSlug = slug ? buildSlug(slug) : buildSlug(name);

    const exists = await BlockTemplate.exists({ slug: finalSlug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Block template with same slug already exists",
      });
    }

    const template = await BlockTemplate.create({
      name,
      slug: finalSlug,
      type,
      category,
      structure,
      controls: controls || {},
      description,
      previewImage,
      tags: tags || [],
      isSystem,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Block template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Create Block Template Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   UPDATE BLOCK TEMPLATE (ADMIN)
===================================================== */
export const updateBlockTemplate = async (req, res) => {
  try {
    const template = await BlockTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Block template not found",
      });
    }

    if (template.isSystem && req.body.isSystem === false) {
      return res.status(403).json({
        success: false,
        message: "System templates cannot be modified",
      });
    }

    if (req.body.slug) {
      req.body.slug = buildSlug(req.body.slug);
    }

    // 🔥 Version bump
    template.version += 1;

    Object.assign(template, req.body);
    await template.save();

    res.json({
      success: true,
      message: "Block template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Update Block Template Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   DELETE BLOCK TEMPLATE (ADMIN)
   (SOFT DELETE)
===================================================== */
export const deleteBlockTemplate = async (req, res) => {
  try {
    const template = await BlockTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Block template not found",
      });
    }

    if (template.isSystem) {
      return res.status(403).json({
        success: false,
        message: "System templates cannot be deleted",
      });
    }

    template.isActive = false;
    await template.save();

    res.json({
      success: true,
      message: "Block template deleted successfully",
    });
  } catch (error) {
    console.error("Delete Block Template Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
