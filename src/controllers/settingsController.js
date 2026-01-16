import User from "../models/user.js";
import bcrypt from "bcryptjs";

/**
 * =====================================
 * GET PROFILE + SETTINGS
 * =====================================
 * GET /api/settings/profile
 */
export const getProfileSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email avatar role settings")
      .lean(); // ✅ prevents mongoose virtual errors

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ DEFAULT FALLBACK (old users safe)
    user.settings = {
      language: user.settings?.language || "en",
      timezone: user.settings?.timezone || "Asia/Kolkata",
      dateFormat: user.settings?.dateFormat || "DD/MM/YYYY",
    };

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get Profile Settings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * UPDATE PROFILE + SETTINGS
 * (FORM-DATA SUPPORTED)
 * =====================================
 * PUT /api/settings/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      language,
      timezone,
      dateFormat,
    } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (language) updateData["settings.language"] = language;
    if (timezone) updateData["settings.timezone"] = timezone;
    if (dateFormat) updateData["settings.dateFormat"] = dateFormat;

    // ✅ Avatar (Cloudinary OR local multer)
    if (req.file) {
      updateData.avatar =
        req.file.path || `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * UPLOAD PROFILE PICTURE (OPTIONAL)
 * =====================================
 * POST /api/settings/profile-picture
 */
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const avatar =
      req.file.path || `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { avatar },
      { new: true }
    ).select("avatar");

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================
 * CHANGE PASSWORD (FIGMA SCREEN)
 * =====================================
 * PUT /api/settings/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
