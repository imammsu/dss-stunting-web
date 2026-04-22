/**
 * Controller master data.
 * Cocok untuk mengambil data kriteria dan alternatif dari Supabase melalui pooler.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getAlternatives,
  getMasterBootstrap,
  getPembobotan,
  getTopsisReadyCriteria,
  createAlternativeDesa,
  updateAlternativeDesa,
  createPembobotan,
  getPembobotanDetail,
  updatePembobotan,
  deleteAlternativeDesaService,
  deletePembobotanService,
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

export const listPembobotan = asyncHandler(async (_req, res) => {
  const result = await getPembobotan();

  res.json({
    success: true,
    message: "Data pembobotan berhasil diambil.",
    data: result,
  });
});


export const buatDesa = asyncHandler (async(_req, res) => {
  try {
    const result = await createAlternativeDesa(_req.body);
    res.status(201).json({
      success: true,
      message: "Data berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

export const updateDesa = asyncHandler(async (_req, res) => {
  try {
    const { id } = _req.params;
    const result = await updateAlternativeDesa(id, _req.body);
    res.status(200).json({ success: true, message: "Data berhasil diupdate.", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const buatPembobotan = asyncHandler(async (_req, res) => {
  try {
    const result = await createPembobotan(_req.body);
    res.status(201).json({
      success: true,
      message: "Data pembobotan berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

export const detailPembobotan = asyncHandler(async (_req, res) => {
  try {
    const { id } = _req.params;
    const result = await getPembobotanDetail(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const ubahPembobotan = asyncHandler(async (_req, res) => {
  try {
    const { id } = _req.params;
    const result = await updatePembobotan(id, _req.body);
    res.status(200).json({ success: true, message: "Data berhasil diupdate.", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const hapusDesa = asyncHandler(async (_req, res) => {
  try {
    const { id } = _req.params;
    await deleteAlternativeDesaService(id);
    res.status(200).json({ success: true, message: "Data desa berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export const hapusPembobotan = asyncHandler(async (_req, res) => {
  try {
    const { id } = _req.params;
    await deletePembobotanService(id);
    res.status(200).json({ success: true, message: "Data pembobotan berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});