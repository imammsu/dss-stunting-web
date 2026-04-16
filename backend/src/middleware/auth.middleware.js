/**
 * Middleware validasi access token Supabase.
 * Semua route yang butuh user login bisa memakai middleware ini.
 */
import { ApiError } from "../utils/apiError.js";
import { supabaseAuthClient } from "../config/supabase.js";

export const authMiddleware = async (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token tidak ditemukan.");
    }

    const accessToken = authorizationHeader.replace("Bearer ", "").trim();
    const { data, error } = await supabaseAuthClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new ApiError(401, "Access token tidak valid atau sudah kedaluwarsa.");
    }

    req.accessToken = accessToken;
    req.user = data.user;
    next();
  } catch (error) {
    next(error);
  }
};
