import { pool } from "./pool.js";

async function runMigration() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS highlights (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(50) NOT NULL,
          cover_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS highlight_items (
          id SERIAL PRIMARY KEY,
          highlight_id INTEGER NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
          media_url TEXT NOT NULL,
          media_type VARCHAR(10) DEFAULT 'image',
          created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Migration successful: added highlights tables");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
}

runMigration();
