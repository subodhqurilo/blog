import mongoose from "mongoose";
const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "My Builder Blog" },
  logoUrl: String,
  primaryColor: { type: String, default: "#3b82f6" },
  footerText: String
});
export default mongoose.model("Settings", settingsSchema);