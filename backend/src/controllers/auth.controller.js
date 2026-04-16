/**
 * Controller auth.
 * Endpoint di file ini memakai Supabase Auth bawaan, jadi Anda tidak perlu membuat tabel login sendiri.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getCurrentUserProfile,
  loginUser,
  refreshUserSession,
  registerUser,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "Registrasi berhasil diproses.",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.json({
    success: true,
    message: "Login berhasil.",
    data: result,
  });
});

export const refreshSession = asyncHandler(async (req, res) => {
  const result = await refreshUserSession(req.body);

  res.json({
    success: true,
    message: "Session berhasil diperbarui.",
    data: result,
  });
});

export const me = asyncHandler(async (req, res) => {
  const result = await getCurrentUserProfile(req.accessToken, req.user);

  res.json({
    success: true,
    message: "Profil user berhasil diambil.",
    data: result,
  });
});
