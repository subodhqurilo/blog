import Tag from "../models/tag.js";

export const createTag = async (req, res) => {
  try {
    const { name, slug } = req.body;
    const tag = await Tag.create({ name, slug });
    res.status(201).json({ success: true, data: tag });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Tag exists" });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({ success: true, data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    await Tag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Tag removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};