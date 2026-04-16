/**
 * Koneksi PostgreSQL ke Supabase melalui shared pooler / transaction pooler.
 * Jika Anda ingin mengganti ukuran pool atau timeout, ubah pengaturan di file ini.
 */
import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.supabaseDbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const testDatabaseConnection = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        NOW() AS server_time,
        CURRENT_DATABASE() AS database_name
    `);

    return result.rows[0];
  } finally {
    client.release();
  }
};
