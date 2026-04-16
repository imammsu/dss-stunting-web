/**
 * Kumpulan client Supabase.
 * - auth client: untuk login/register user biasa
 * - admin client: untuk kebutuhan backend server-to-server
 * - user-scoped client: bila nanti Anda ingin query dengan token user agar RLS tetap berlaku
 */
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const sharedOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

export const supabaseAuthClient = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  sharedOptions,
);

export const supabaseAdminClient = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  sharedOptions,
);

export const createUserScopedSupabaseClient = (accessToken) =>
  createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...sharedOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
