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

export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL ulanishi muvaffaqiyatli:", result.rows[0].now);
  } catch (err) {
    console.error("PostgreSQL ulanishida xatolik:", err);
    process.exit(1);
  }
}
