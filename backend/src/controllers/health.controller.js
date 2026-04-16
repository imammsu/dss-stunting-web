/**
 * Controller health check.
 * Dipakai untuk memastikan API dan koneksi database siap dipakai.
 */
import { testDatabaseConnection } from "../config/postgres.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getApiHealth = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: "API backend aktif.",
    data: {
      service: "stunting-dss-backend",
    },
  });
});

export const getDatabaseHealth = asyncHandler(async (_req, res) => {
  const result = await testDatabaseConnection();

  res.json({
    success: true,
    message: "Database Supabase terhubung.",
    data: result,
  });
});
