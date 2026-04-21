/**
 * Supabase client configuration for Vite frontend.
 * Uses environment variables from .env
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
}

/**
 * Main Supabase client for frontend use.
 * Uses anonymous key for client-side operations.
 * Row Level Security (RLS) will be enforced on the database level.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Export types for use throughout the app
 */
export type { User } from "@supabase/supabase-js";
