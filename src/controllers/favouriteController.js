import Favourite from "../models/favourite.js";
import Page from "../models/page.js";

/**
 * =====================================================
 * TOGGLE FAVOURITE (ADD / REMOVE)
 * =====================================================
 * ✔ Logged-in user only
 * ✔ 1st click = favourite
 * ✔ 2nd click = unfavourite
 */
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { pageId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    if (!pageId) {
      return res.status(400).json({
        success: false,
        message: "Page ID is required",
      });
    }

    const page = await Page.findById(pageId);
    if (!page || page.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const existing = await Favourite.findOne({
      user: userId,
      page: pageId,
    });

    // 🔁 UNFAVOURITE
    if (existing) {
      await Favourite.findByIdAndDelete(existing._id);

      return res.json({
        success: true,
        favourited: false,
        message: "Removed from favourites",
      });
    }

    // ⭐ FAVOURITE
    await Favourite.create({
      user: userId,
      page: pageId,
    });

    res.status(201).json({
      success: true,
      favourited: true,
      message: "Added to favourites",
    });
  } catch (error) {
    console.error("Toggle Favourite Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * GET USER FAVOURITES (MY SAVED BLOGS)
 * =====================================================
 */
export const getMyFavourites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favourites = await Favourite.find({ user: userId })
      .populate({
        path: "page",
        select: "title slug featuredImage publishedAt",
      })
      .sort({ createdAt: -1 })
      .lean(); // 🔥 IMPORTANT (prevents virtuals)

    res.json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    console.error("Get Favourites Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * =====================================================
 * CHECK IF BLOG IS FAVOURITED
 * =====================================================
 */
export const checkFavourite = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { pageId } = req.params;

    if (!userId) {
      return res.json({ success: true, favourited: false });
    }

    const exists = await Favourite.exists({
      user: userId,
      page: pageId,
    });

    res.json({
      success: true,
      favourited: !!exists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
