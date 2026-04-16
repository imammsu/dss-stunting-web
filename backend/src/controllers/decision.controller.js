/**
 * Controller DSS.
 * Semua endpoint di sini bisa dipakai untuk perhitungan langsung dari body request
 * atau dari data yang disimpan di database Supabase.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  evaluateDecision,
  rankDecisionFromDatabase,
} from "../services/decision.service.js";
import { calculateAHP } from "../services/decision/ahp.service.js";
import { rankWithTopsis } from "../services/decision/topsis.service.js";

export const ahpWeights = asyncHandler(async (req, res) => {
  const result = calculateAHP(req.body);

  res.json({
    success: true,
    message: "Bobot AHP berhasil dihitung.",
    data: result,
  });
});

export const topsisRank = asyncHandler(async (req, res) => {
  const result = rankWithTopsis(req.body);

  res.json({
    success: true,
    message: "Perankingan TOPSIS berhasil dihitung.",
    data: result,
  });
});

export const evaluate = asyncHandler(async (req, res) => {
  const result = evaluateDecision(req.body);

  res.json({
    success: true,
    message: "AHP dan TOPSIS berhasil dihitung.",
    data: result,
  });
});

export const rankFromDatabase = asyncHandler(async (_req, res) => {
  const result = await rankDecisionFromDatabase();

  res.json({
    success: true,
    message: "Perankingan TOPSIS dari database berhasil dihitung.",
    data: result,
  });
});
