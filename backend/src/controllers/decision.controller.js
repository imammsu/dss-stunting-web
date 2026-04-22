/**
 * Controller DSS.
 * Semua endpoint di sini bisa dipakai untuk perhitungan langsung dari body request
 * atau dari data yang disimpan di database Supabase.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  evaluateDecision,
  rankDecisionFromDatabase,
  getRiwayatList,
  getRiwayatDetail,
  deleteRiwayat,
} from "../services/decision.service.js";
import { calculateAHP } from "../services/decision/ahp.service.js";
import { rankWithTopsis, saveTopsisRanking } from "../services/decision/topsis.service.js";

export const ahpWeights = asyncHandler(async (req, res) => {
  const result = calculateAHP(req.body);

  res.json({
    success: true,
    message: "Bobot AHP berhasil dihitung.",
    data: result,
  });
});

export const topsisRank = asyncHandler(async (req, res) => {
  const { save_to_db, session_name, weight_id, ...inputData } = req.body;

  let result;
  if (save_to_db) {
    const user_email = req.user?.email || null;
    result = await saveTopsisRanking(inputData, {
      nama_sesi: session_name,
      id_pembobotan_kriteria: weight_id,
      user_email
    });
  } else {
    result = rankWithTopsis(inputData);
  }

  res.json({
    success: true,
    message: save_to_db ? "Perankingan TOPSIS berhasil dihitung dan disimpan." : "Perankingan TOPSIS berhasil dihitung.",
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

export const listRiwayat = asyncHandler(async (_req, res) => {
  const result = await getRiwayatList();
  res.json({ success: true, message: "Daftar riwayat berhasil diambil.", data: result });
});

export const detailRiwayat = asyncHandler(async (req, res) => {
  const result = await getRiwayatDetail(Number(req.params.id));
  res.json({ success: true, message: "Detail riwayat berhasil diambil.", data: result });
});

export const hapusRiwayat = asyncHandler(async (req, res) => {
  try {
    await deleteRiwayat(Number(req.params.id));
    res.status(200).json({ success: true, message: "Riwayat berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
