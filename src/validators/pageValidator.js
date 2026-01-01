import { body, param, validationResult } from "express-validator";

export const validateCreatePage = [
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug can only contain lowercase letters, numbers, and hyphens")
    .isLength({ min: 3, max: 100 })
    .withMessage("Slug must be between 3-100 characters"),
  
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3-200 characters"),
  
  body("blocks")
    .optional()
    .isArray()
    .withMessage("Blocks must be an array"),
];

export const validateUpdatePage = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3-200 characters"),
  
  body("blocks")
    .optional()
    .isArray()
    .withMessage("Blocks must be an array"),
  
  body("metaDescription")
    .optional()
    .isLength({ max: 160 })
    .withMessage("Meta description must be less than 160 characters"),
];

export const validatePageId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid page ID format"),
];

export const validateSlug = [
  param("slug")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Invalid slug format"),
];

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      })),
    });
  }
  
  next();
};