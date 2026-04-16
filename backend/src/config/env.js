/**
 * Loader environment variables.
 * Tambahkan env baru di file ini jika backend Anda butuh variabel tambahan.
 */
import dotenv from "dotenv";

dotenv.config();

const readEnv = (key, fallback = "") => process.env[key] ?? fallback;

const requireEnv = (key) => {
  const value = readEnv(key);

  if (!value) {
    throw new Error(`Environment variable ${key} belum diisi.`);
  }

  return value;
};

export const env = {
  nodeEnv: readEnv("NODE_ENV", "development"),
  port: Number(readEnv("PORT", "4000")),
  corsOrigin: readEnv("CORS_ORIGIN", "http://localhost:5173"),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseDbUrl: requireEnv("SUPABASE_DB_URL"),
};
