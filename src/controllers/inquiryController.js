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
    res.status(500).json({ success: false, message: error.message });
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
      search,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { message: new RegExp(search, "i") },
      ];
    }

    const inquiries = await Inquiry.find(filter)
      .populate("page", "title slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Inquiry.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: inquiries.map((i) => ({
        id: i._id,
        name: i.name,
        email: i.email,
        message: i.message,
        blog: i.page
          ? { title: i.page.title, }
          : null,
        status: i.status,
        date: i.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





/**
 * =====================================================
 * GET SINGLE INQUIRY (ADMIN)
 * =====================================================
 */
export const getInquiryById = async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate("page", "title slug")
    .lean();

  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: "Inquiry not found",
    });
  }

  res.json({
    success: true,
    data: {
      id: inquiry._id,
      name: inquiry.name,
      email: inquiry.email,
      initials: inquiry.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      blog: inquiry.page
        ? { title: inquiry.page.title, slug: inquiry.page.slug }
        : null,
      message: inquiry.message,
      date: inquiry.createdAt,
      status: inquiry.status,
      replyMail: `mailto:${inquiry.email}`,
    },
  });
};



/**
 * =========================================
 * MARK AS READ (ON CLICK)
 * =========================================
 */
export const markInquiryAsRead = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: "read" },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * =========================================
 * DELETE INQUIRY
 * =========================================
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
      message: "Inquiry deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
