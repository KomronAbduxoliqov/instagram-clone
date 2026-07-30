import { pool } from "./pool.js";

async function runMigration() {
  try {
    await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_reel BOOLEAN DEFAULT FALSE;");
    console.log("Migration successful: added is_reel to posts");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
}

runMigration();
