import Category from "../models/category.js";
import Page from "../models/page.js";

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, color } = req.body;
    
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      color,
    });
    
    res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    
    // Get posts in this category
    const posts = await Page.find({ 
      category: category._id,
      status: "published" 
    })
      .select("title slug featuredImage publishedAt views")
      .sort({ publishedAt: -1 });
    
    res.json({
      success: true,
      data: {
        category,
        posts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    
    res.json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    
    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};