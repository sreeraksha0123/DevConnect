// server/models/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // ⬆️ bump to 10s for slow networks
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL pool error:", err.message);
});

// Test connection immediately when server starts
(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("🧠 PostgreSQL connection test passed:", res.rows[0].now);
  } catch (err) {
    console.error("❌ PostgreSQL connection test failed:", err.message);
  }
})();

export default pool;
