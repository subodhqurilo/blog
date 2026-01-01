import Media from "../models/media.js";
import cloudinary from "../config/cloudinary.js";

/**
 * 1️⃣ UPLOAD SINGLE FILE TO CLOUDINARY
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Cloudinary khud hi file type detect kar leta hai (image/video/pdf)
    const media = await Media.create({
      filename: req.file.originalname,
      public_id: req.file.filename, // Multer-storage-cloudinary ise filename mein deta hai
      url: req.file.path,           // Cloudinary ka secure URL
      mimeType: req.file.mimetype,
      size: req.file.size,
      type: req.file.mimetype.split('/')[0], // image, video, application etc.
      uploadedBy: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded to Cloudinary successfully",
      data: media,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
};

/**
 * 2️⃣ UPLOAD MULTIPLE FILES
 */
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const mediaPromises = req.files.map((file) => {
      return Media.create({
        filename: file.originalname,
        public_id: file.filename,
        url: file.path,
        mimeType: file.mimetype,
        size: file.size,
        type: file.mimetype.split('/')[0],
        uploadedBy: req.user?.userId,
      });
    });

    const mediaFiles = await Promise.all(mediaPromises);

    res.status(201).json({
      success: true,
      message: `${mediaFiles.length} files uploaded successfully`,
      data: mediaFiles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3️⃣ GET ALL MEDIA (Gallery ke liye)
 */
export const getMediaList = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (search) filter.filename = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: media,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4️⃣ DELETE MEDIA (Cloudinary se bhi aur DB se bhi)
 */
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    // 🔥 Cloudinary se file delete karna (Zaroori step!)
    // Video ke liye resource_type dena padta hai
    const resourceType = media.type === 'video' ? 'video' : 'image';
    await cloudinary.uploader.destroy(media.public_id, { resource_type: resourceType });

    // Database se delete karna
    await Media.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Media deleted from Cloudinary and Database" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};