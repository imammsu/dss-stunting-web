/**
 * Entry point server.
 * Di sini server dijalankan dan koneksi database diuji saat startup agar error lebih cepat terlihat.
 */
import app from "./app.js";
import { env } from "./config/env.js";
import { pool, testDatabaseConnection } from "./config/postgres.js";

const startServer = async () => {
  try {
    const databaseInfo = await testDatabaseConnection();
    console.log(
      `[database] terhubung ke ${databaseInfo.database_name} pada ${databaseInfo.server_time}`,
    );
  } catch (error) {
    console.warn("[database] gagal warm-up:", error.message);
  }

  app.listen(env.port, () => {
    console.log(`[server] backend berjalan di http://localhost:${env.port}`);
  });
};

const gracefulShutdown = async (signal) => {
  console.log(`[server] menerima ${signal}, menutup koneksi...`);
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

startServer();
