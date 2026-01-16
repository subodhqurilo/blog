// ========================================
// FILE: src/utils/scheduler.js
// SAFE SCHEDULER (NO CRASH)
// ========================================

import cron from "node-cron";

export const startScheduler = () => {
  try {
    // run every minute (example)
    cron.schedule("* * * * *", async () => {
      try {
        // 👇 yaha apna task likho
        console.log("⏰ Scheduler running safely");

        // example async task
        // await someAsyncTask();

      } catch (err) {
        // ❗ scheduler error should NEVER crash server
        console.error("❌ Scheduler error:", err.message);
      }
    });
  } catch (err) {
    console.error("❌ Scheduler init failed:", err.message);
  }
};
