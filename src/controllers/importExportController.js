import Page from "../models/page.js";
import fs from "fs";
import path from "path";

export const exportPosts = async (req, res) => {
  try {
    const posts = await Page.find()
      .populate("category")
      .populate("tags");
    
    const exportData = {
      exportDate: new Date(),
      version: "1.0",
      posts: posts,
    };
    
    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const importPosts = async (req, res) => {
  try {
    const { posts } = req.body;
    
    if (!Array.isArray(posts)) {
      return res.status(400).json({
        success: false,
        message: "Invalid import data",
      });
    }
    
    const imported = [];
    const errors = [];
    
    for (const postData of posts) {
      try {
        // Remove _id to create new documents
        const { _id, ...cleanData } = postData;
        const post = await Page.create(cleanData);
        imported.push(post.slug);
      } catch (error) {
        errors.push({
          slug: postData.slug,
          error: error.message,
        });
      }
    }
    
    res.json({
      success: true,
      message: `Imported ${imported.length} posts`,
      data: {
        imported,
        errors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};