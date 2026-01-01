import mongoose from "mongoose";

const BlockTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Hero Section Blue"
  category: { type: String, enum: ["header", "content", "feature", "footer"] },
  previewImage: { type: String }, // Screenshot of the block
  structure: { type: Object, required: true }, // Pure block ka JSON logic
}, { timestamps: true });

export default mongoose.model("BlockTemplate", BlockTemplateSchema);