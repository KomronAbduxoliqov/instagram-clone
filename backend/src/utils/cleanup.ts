import cron from "node-cron";
import { pool } from "../db/pool.js";

export function startCleanupJobs() {
  // Har soatda muddati tugagan storieslarni tekshiramiz (media_url'ni saqlab qolamiz kerak bo'lsa)
  cron.schedule("0 * * * *", async () => {
    try {
      const result = await pool.query(
        "DELETE FROM stories WHERE expires_at < NOW() RETURNING id"
      );
      if (result.rows.length > 0) {
        console.log(`${result.rows.length} ta muddati tugagan story tozalandi.`);
      }
    } catch (err) {
      console.error("Story tozalash cron xatolik:", err);
    }
  });

  console.log("Cron joblar ishga tushdi (har soatda stories tozalanadi).");
}
