/**
 * Service auth berbasis Supabase Auth.
 * Jika Anda ingin menambahkan profile table atau role custom, paling mudah mulai dari file ini.
 */
import { ApiError } from "../utils/apiError.js";
import { supabaseAuthClient } from "../config/supabase.js";

const sanitizeSession = (payload) => ({
  user: payload.user,
  session: payload.session,
});

export const registerUser = async ({ email, password, metadata = {} }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email dan password wajib diisi.");
  }

  const { data, error } = await supabaseAuthClient.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    throw new ApiError(400, error.message);
  }

  return sanitizeSession(data);
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, "Email dan password wajib diisi.");
  }

  const { data, error } = await supabaseAuthClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new ApiError(401, error.message);
  }

  return sanitizeSession(data);
};

export const refreshUserSession = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new ApiError(400, "refreshToken wajib diisi.");
  }

  const { data, error } = await supabaseAuthClient.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw new ApiError(401, error.message);
  }

  return sanitizeSession(data);
};

export const getCurrentUserProfile = async (_accessToken, user) => {
  return {
    user,
  };
};
