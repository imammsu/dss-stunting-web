/**
 * Controller master data.
 * Cocok untuk mengambil data kriteria dan alternatif dari Supabase melalui pooler.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAlternatives,
  getMasterBootstrap,
  getTopsisReadyCriteria,
} from "../services/master.service.js";

export const listCriteria = asyncHandler(async (_req, res) => {
  const result = await getTopsisReadyCriteria();

  res.json({
    success: true,
    message: "Data kriteria berhasil diambil.",
    data: result,
  });
});

export const listAlternatives = asyncHandler(async (_req, res) => {
  const result = await getAlternatives();

  res.json({
    success: true,
    message: "Data alternatif berhasil diambil.",
    data: result,
  });
});

export const bootstrap = asyncHandler(async (_req, res) => {
  const result = await getMasterBootstrap();

  res.json({
    success: true,
    message: "Data bootstrap berhasil diambil.",
    data: result,
  });
});
