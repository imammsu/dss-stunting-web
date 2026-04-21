/**
 * Service master data.
 * Silakan sesuaikan mapping output bila frontend Anda ingin bentuk data yang berbeda.
 */
import { listAlternativesFromDatabase, insertAlternatifDesa, insertAlternatifDesaDefaultNilai, updateAlternatifDesa, updateAlternatifDesaDefaultNilai } from "../repositories/alternative.repository.js";
import { listCriteriaFromDatabase } from "../repositories/criteria.repository.js";
import { listPembobotanFromDatabase, insertPembobotanFromDatabase, getPembobotanDetailFromDatabase, updatePembobotanInDatabase } from "../repositories/pembobotan.repository.js";

export const getTopsisReadyCriteria = async () => {
  const rows = await listCriteriaFromDatabase();

  return rows.map((row) => ({
    id: row.code ?? row.id,
    label: row.name ?? row.code ?? row.id,
    weight: row.weight,
    type: row.is_benefit ?? "benefit",
    raw: row.raw,
  }));
};

export const getAlternatives = async () => {
  return listAlternativesFromDatabase();
};

export const getPembobotan = async () => {
  return listPembobotanFromDatabase();
};

export const getMasterBootstrap = async () => {
  const [criteria, alternatives] = await Promise.all([
    getTopsisReadyCriteria(),
    getAlternatives(),
  ]);

  return {
    criteria,
    alternatives,
  };
};

export const createAlternativeDesa = async ({ name, district, lat, lng, values }) => {
  
  const village = await insertAlternatifDesa({ name, kecamatan: district, lat, lng });

  const nilaiRows = Object.entries(values).map(([key, value]) => ({
    id_alternatif_desa: village.id,
    id_kriteria: Number(key),
    nilai: value,
  }));

  await insertAlternatifDesaDefaultNilai(nilaiRows);

  return { id: village.id };
};

export const updateAlternativeDesa = async (id, { name, district, lat, lng, values }) => {
  // Update data desa
  const village = await updateAlternatifDesa(id, { name, kecamatan: district, lat, lng });

  // Mapping nilai
  const nilaiRows = Object.entries(values).map(([key, value]) => ({
    id_alternatif_desa: village.id,
    id_kriteria: Number(key),
    nilai: value,
  }));

  // Delete lama + insert baru
  await updateAlternatifDesaDefaultNilai(village.id, nilaiRows);

  return { id: village.id };
};

export const createPembobotan = async ({ nama, cr, bobotHasil, preferences }) => {
  const criteriaRows = await getTopsisReadyCriteria();
  
  const kriteriaList = [];
  for (const [kode, bobot] of Object.entries(bobotHasil)) {
    const kriteria = criteriaRows.find(c => c.id === kode || c.label.toLowerCase() === kode.toLowerCase());
    if (kriteria && kriteria.raw && kriteria.raw.id) {
      kriteriaList.push({
        id_kriteria: kriteria.raw.id,
        bobot: Number(bobot)
      });
    }
  }

  const pairwiseList = [];
  if (Array.isArray(preferences)) {
    for (const pref of preferences) {
      const k1 = criteriaRows.find(c => c.id === pref.kriteria_1 || c.label.toLowerCase() === pref.kriteria_1.toLowerCase());
      const k2 = criteriaRows.find(c => c.id === pref.kriteria_2 || c.label.toLowerCase() === pref.kriteria_2.toLowerCase());
      
      if (k1 && k1.raw && k1.raw.id && k2 && k2.raw && k2.raw.id) {
        pairwiseList.push({
          kriteria_1: k1.raw.id,
          kriteria_2: k2.raw.id,
          nilai: Number(pref.nilai)
        });
      }
    }
  }

  const result = await insertPembobotanFromDatabase({ nama, cr, kriteriaList, pairwiseList });
  return result;
};

export const getPembobotanDetail = async (id) => {
  return await getPembobotanDetailFromDatabase(id);
};

export const updatePembobotan = async (id, { nama, cr, bobotHasil, preferences }) => {
  const criteriaRows = await getTopsisReadyCriteria();
  
  const kriteriaList = [];
  for (const [kode, bobot] of Object.entries(bobotHasil)) {
    const kriteria = criteriaRows.find(c => c.id === kode || c.label.toLowerCase() === kode.toLowerCase());
    if (kriteria && kriteria.raw && kriteria.raw.id) {
      kriteriaList.push({
        id_kriteria: kriteria.raw.id,
        bobot: Number(bobot)
      });
    }
  }

  const pairwiseList = [];
  if (Array.isArray(preferences)) {
    for (const pref of preferences) {
      const k1 = criteriaRows.find(c => c.id === pref.kriteria_1 || c.label.toLowerCase() === pref.kriteria_1.toLowerCase());
      const k2 = criteriaRows.find(c => c.id === pref.kriteria_2 || c.label.toLowerCase() === pref.kriteria_2.toLowerCase());
      
      if (k1 && k1.raw && k1.raw.id && k2 && k2.raw && k2.raw.id) {
        pairwiseList.push({
          kriteria_1: k1.raw.id,
          kriteria_2: k2.raw.id,
          nilai: Number(pref.nilai)
        });
      }
    }
  }

  const result = await updatePembobotanInDatabase(id, { nama, cr, kriteriaList, pairwiseList });
  return result;
};