import Media from "../models/media.js";
import fs from "fs";
import path from "path";

/**
 * UPLOAD SINGLE FILE
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    const fileType = file.mimetype.startsWith("image/") ? "image" : "video";

    const media = await Media.create({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      type: fileType,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: media,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};

/**
 * UPLOAD MULTIPLE FILES
 */
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const mediaPromises = req.files.map((file) => {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      return Media.create({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        type: fileType,
      });
    });

    const mediaFiles = await Promise.all(mediaPromises);

    res.status(201).json({
      success: true,
      message: `${mediaFiles.length} files uploaded successfully`,
      data: mediaFiles,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};

/**
 * GET ALL MEDIA (WITH FILTERS & PAGINATION)
 */
export const getMediaList = async (req, res) => {
  try {
    const {
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (search) filter.originalName = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const media = await Media.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      count: media.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: media,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET SINGLE MEDIA BY ID
 */
export const getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.json({
      success: true,
      data: media,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE MEDIA
 */
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // Delete file from disk - FIX: src/uploads path
    const filePath = path.join(process.cwd(), "src", "uploads", media.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Media deleted successfully",
      data: { id: req.params.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE MULTIPLE MEDIA
 */
export const deleteMultipleMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid media IDs",
      });
    }

    const mediaFiles = await Media.find({ _id: { $in: ids } });

    mediaFiles.forEach((media) => {
      const filePath = path.join(process.cwd(), "src", "uploads", media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Media.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${mediaFiles.length} media files deleted`,
      data: { deletedCount: mediaFiles.length },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};