import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Kutilmagan xatolik PostgreSQL pool'ida:", err);
  process.exit(-1);
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL ulanishi muvaffaqiyatli:", result.rows[0].now);

    try {
      await pool.query("SELECT 1 FROM users LIMIT 1");
    } catch (e: any) {
      if (e.code === '42P01') {
        console.log("Jadvallar topilmadi. schema.sql fayli orqali yangi jadvallar yaratilmoqda...");
        const schemaPath = path.join(process.cwd(), "src", "db", "schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf8");
        await pool.query(schema);
        console.log("Jadvallar muvaffaqiyatli yaratildi!");
      }
    }
  } catch (err) {
    console.error("PostgreSQL ulanishida xatolik:", err);
    process.exit(1);
  }
}
