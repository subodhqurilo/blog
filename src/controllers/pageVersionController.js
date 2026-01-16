import Page from "../models/page.js";
import PageVersion from "../models/pageVersion.js";

/**
 * =====================================================
 * INTERNAL: SAVE VERSION (AUTOSAVE)
 * =====================================================
 * 👉 Page update ke time call hota hai
 * 👉 Frontend ko expose nahi hota
 */
export const saveVersion = async (pageId, blocks, userId = null) => {
  try {
    if (!pageId || !Array.isArray(blocks)) return;

    const lastVersion = await PageVersion.findOne({ page: pageId })
      .sort({ versionNumber: -1 })
      .select("versionNumber");

    const nextVersion = lastVersion ? lastVersion.versionNumber + 1 : 1;

    await PageVersion.create({
      page: pageId,
      blocks,
      versionNumber: nextVersion,
      savedBy: userId,
    });
  } catch (error) {
    console.error("Autosave Version Error:", error.message);
  }
};

/**
 * =====================================================
 * GET VERSION HISTORY (ADMIN)
 * =====================================================
 * 👉 Editor ke right sidebar me list ke liye
 */
export const getVersionHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const versions = await PageVersion.find({ page: id })
      .sort({ versionNumber: -1 })
      .select("versionNumber createdAt savedBy");

    res.json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (error) {
    console.error("Get Version History Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * GET SINGLE VERSION (PREVIEW / RESTORE)
 * =====================================================
 */
export const getSingleVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await PageVersion.findById(versionId)
      .populate("savedBy", "name email");

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Version not found",
      });
    }

    res.json({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error("Get Single Version Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * RESTORE VERSION
 * =====================================================
 * 👉 Selected version ko page me wapas load karta hai
 */
export const restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await PageVersion.findById(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Version not found",
      });
    }

    await Page.findByIdAndUpdate(version.page, {
      blocks: version.blocks,
    });

    res.json({
      success: true,
      message: `Version ${version.versionNumber} restored successfully`,
    });
  } catch (error) {
    console.error("Restore Version Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * DELETE SINGLE VERSION
 * =====================================================
 */
export const deleteVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await PageVersion.findByIdAndDelete(versionId);

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Version not found",
      });
    }

    res.json({
      success: true,
      message: "Version deleted successfully",
    });
  } catch (error) {
    console.error("Delete Version Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * DELETE ALL VERSIONS OF A PAGE
 * =====================================================
 * 👉 Page delete hone par optional cleanup
 */
export const deleteAllVersionsOfPage = async (pageId) => {
  try {
    await PageVersion.deleteMany({ page: pageId });
  } catch (error) {
    console.error("Delete All Versions Error:", error.message);
  }
};

export const undoPageVersion = async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    if (page.currentVersion <= 1) {
      return res.status(400).json({
        success: false,
        message: "No more undo steps available",
      });
    }

    const previousVersionNumber = page.currentVersion - 1;

    const previousVersion = await PageVersion.findOne({
      page: pageId,
      versionNumber: previousVersionNumber,
    });

    if (!previousVersion) {
      return res.status(404).json({
        success: false,
        message: "Previous version not found",
      });
    }

    page.blocks = previousVersion.blocks;
    page.currentVersion = previousVersionNumber;
    await page.save();

    res.json({
      success: true,
      message: "Undo successful",
      data: {
        currentVersion: page.currentVersion,
        blocks: page.blocks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const redoPageVersion = async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    const nextVersionNumber = page.currentVersion + 1;

    const nextVersion = await PageVersion.findOne({
      page: pageId,
      versionNumber: nextVersionNumber,
    });

    if (!nextVersion) {
      return res.status(400).json({
        success: false,
        message: "No redo step available",
      });
    }

    page.blocks = nextVersion.blocks;
    page.currentVersion = nextVersionNumber;
    await page.save();

    res.json({
      success: true,
      message: "Redo successful",
      data: {
        currentVersion: page.currentVersion,
        blocks: page.blocks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
