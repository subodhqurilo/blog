import Page from "../models/page.js";

export const publishScheduledPosts = async () => {
  try {
    const now = new Date();

    const pages = await Page.find({
      status: "draft",
      scheduledAt: { $lte: now, $ne: null }, // 🔥 IMPORTANT
    }).limit(20); // safety limit

    if (!pages.length) return;

    for (const page of pages) {
      await page.publish();          // model method
      page.scheduledAt = null;       // 🔥 clear schedule
      await page.save();

      console.log(`✅ Published scheduled post: ${page.slug}`);
    }
  } catch (error) {
    console.error("❌ Scheduled publish error:", error.message);
  }
};
