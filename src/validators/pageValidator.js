import { body, param, query, validationResult } from "express-validator";

/* =====================================================
   CREATE PAGE VALIDATION
===================================================== */
export const validateCreatePage = [
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens")
    .isLength({ min: 3, max: 100 })
    .withMessage("Slug must be between 3–100 characters"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3–200 characters"),

  body("blocks")
    .optional()
    .isArray()
    .withMessage("Blocks must be an array"),

  /* ===== SEO ===== */
  body("metaDescription")
    .optional()
    .isLength({ max: 160 })
    .withMessage("Meta description must be less than 160 characters"),

  body("metaTitle")
    .optional()
    .isLength({ max: 60 })
    .withMessage("Meta title must be less than 60 characters"),

  body("metaKeywords")
    .optional()
    .isArray()
    .withMessage("Meta keywords must be an array"),

  body("ogImage")
    .optional()
    .isString()
    .withMessage("OG image must be a string"),

  body("featuredImage")
    .optional()
    .isString()
    .withMessage("Featured image must be a string"),
];

/* =====================================================
   UPDATE PAGE VALIDATION
===================================================== */
export const validateUpdatePage = [
  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens")
    .isLength({ min: 3, max: 100 })
    .withMessage("Slug must be between 3–100 characters"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3–200 characters"),

  body("blocks")
    .optional()
    .isArray()
    .withMessage("Blocks must be an array"),

  body("metaDescription")
    .optional()
    .isLength({ max: 160 })
    .withMessage("Meta description must be less than 160 characters"),

  body("metaTitle")
    .optional()
    .isLength({ max: 60 })
    .withMessage("Meta title must be less than 60 characters"),

  body("metaKeywords")
    .optional()
    .isArray()
    .withMessage("Meta keywords must be an array"),

  body("ogImage")
    .optional()
    .isString()
    .withMessage("OG image must be a string"),

  body("featuredImage")
    .optional()
    .isString()
    .withMessage("Featured image must be a string"),
];

/* =====================================================
   PAGE ID VALIDATION
===================================================== */
export const validatePageId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid page ID format"),
];

/* =====================================================
   SLUG VALIDATION (PUBLIC ROUTES)
===================================================== */
export const validateSlug = [
  param("slug")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Invalid slug format"),
];

/* =====================================================
   PAGINATION & QUERY VALIDATION
===================================================== */
export const validateListQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Invalid status value"),

  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string"),
];

/* =====================================================
   COMMON VALIDATION HANDLER
===================================================== */
export const handleValidation = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array();

    return res.status(400).json({
      success: false,
      data: [],
      errors: errors.map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
      message: errors[0]?.msg || "Validation failed",
    });
  }

  next();
};

