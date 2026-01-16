import Inquiry from "../models/inquiry.js";
import Page from "../models/page.js";

/**
 * =====================================================
 * CREATE INQUIRY (PUBLIC)
 * =====================================================
 */
export const createInquiry = async (req, res) => {
  try {
    const { name, email, message, page } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email and message are required",
      });
    }

    // Optional page validation
    if (page) {
      const exists = await Page.exists({ _id: page });
      if (!exists) {
        return res.status(400).json({
          success: false,
          message: "Invalid page reference",
        });
      }
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      message,
      page: page || null,
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Create Inquiry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * GET ALL INQUIRIES (ADMIN)
 * =====================================================
 */
export const getAllInquiries = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const inquiries = await Inquiry.find(filter)
      .populate("page", "title slug") // ✅ FIX
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Inquiry.countDocuments(filter);

    res.json({
      success: true,
      count: inquiries.length,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: inquiries,
    });
  } catch (error) {
    console.error("Get Inquiries Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * GET SINGLE INQUIRY (ADMIN)
 * =====================================================
 */
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("page", "title slug") // ✅ FIX
      .lean();

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Get Inquiry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * MARK INQUIRY AS READ
 * =====================================================
 */
export const markInquiryAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    ).lean();

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Inquiry marked as read",
      data: inquiry,
    });
  } catch (error) {
    console.error("Mark Inquiry Read Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * MARK INQUIRY AS REPLIED
 * =====================================================
 */
export const markInquiryReplied = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        replied: true,
        repliedAt: new Date(),
        status: "replied",
      },
      { new: true }
    ).lean();

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Inquiry marked as replied",
      data: inquiry,
    });
  } catch (error) {
    console.error("Mark Inquiry Replied Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * DELETE INQUIRY
 * =====================================================
 */
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Inquiry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * =====================================================
 * BULK DELETE INQUIRIES
 * =====================================================
 */
export const bulkDeleteInquiries = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide inquiry IDs",
      });
    }

    const result = await Inquiry.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} inquiries deleted`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Bulk Delete Inquiry Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
