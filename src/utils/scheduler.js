import cron from "node-cron";
import Page from "../models/page.js";

export const startScheduler = () => {
  // Run every minute to check for scheduled posts
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      
      // Find posts scheduled for now or earlier
      const scheduledPosts = await Page.find({
        status: "draft",
        scheduledAt: { $lte: now, $ne: null },
      });
      
      if (scheduledPosts.length === 0) {
        return;
      }
      
      // Publish all scheduled posts
      for (const post of scheduledPosts) {
        post.status = "published";
        post.publishedAt = now;
        post.scheduledAt = null;
        await post.save();
        
        console.log(`✅ Auto-published: "${post.title}" (ID: ${post._id})`);
      }
    } catch (error) {
      console.error("❌ Scheduler error:", error.message);
    }
  });
  
  console.log("📅 Post scheduler started (checking every minute)");
};

// Graceful shutdown
export const stopScheduler = () => {
  console.log("📅 Post scheduler stopped");
};
