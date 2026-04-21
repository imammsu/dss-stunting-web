/**
 * Helper pemetaan data backend ke model frontend.
 * Bila nama field Supabase Anda berbeda, file ini biasanya cukup disesuaikan bersama tableMap backend.
 */
import type { MasterWeights, WeightFormat } from "../data/master";
import type { Village, VillageCriteriaValues } from "../data/villages";

export interface BackendCriterion {
  id: string;
  label: string;
  satuan: string;
  weight?: number | null;
  type?: "benefit" | "cost";
  raw?: Record<string, unknown>;
}

export interface BackendAlternative {
  id: number;
  name: string;
  kecamatan: string;
  lat?: number | null;
  lng?: number | null;
  koordinat?: string | null; 
  values: Record<string, number | string | null | undefined>;
  raw?: Record<string, unknown>;
}

export interface BackendBootstrap {
  criteria: BackendCriterion[];
  alternatives: BackendAlternative[];
}

export interface BackendPembobotan {
  id: number;
  pembobotan_nama: string;
  cr: number;
  created_at: string;
  kriteria: Array<{
    id_kriteria: number;
    nama_kriteria: string;
    bobot: number;
  }>;
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const mapValuesToWeights = (values: Record<string, number>): MasterWeights => ({
  komitmen: toNumber(values.komitmen),
  remaja: toNumber(values.remaja),
  stunting: toNumber(values.stunting),
  prevalensi: toNumber(values.prevalensi),
  kemiskinan: toNumber(values.kemiskinan),
  jarak: toNumber(values.jarak),
  tenagaKerja: toNumber(values.tenagaKerja),
});

// export const mapCriteriaToWeightFormat = (
//   criteria: BackendCriterion[],
// ): WeightFormat | null => {
//   const weightMap = Object.fromEntries(
//     criteria.map((criterion) => [criterion.id, toNumber(criterion.weight, 0)]),
//   );

//   const totalWeight = Object.values(weightMap).reduce((sum, value) => sum + value, 0);

//   if (totalWeight <= 0) {
//     return null;
//   }

//   return {
//     id: "database-default",
//     name: "Bobot dari Database Supabase",
//     weights: mapValuesToWeights(weightMap),
//   };
// };

export const mapCriteriaToWeightFormats = (
  criteria: BackendCriterion[],
): WeightFormat[] => {
  return criteria
    .filter((criterion) => criterion.raw && Object.keys(criterion.raw).length > 0)
    .map((criterion, index) => ({
      id: index + 1,
      name: criterion.label,
      kode: criterion.id,
      weights: mapValuesToWeights(criterion.raw as Record<string, number>),
    }));
};

export const mapAlternativeToVillage = (
  alternative: BackendAlternative,
  // ranking = 0,
): Village => {
  const raw = alternative.raw ?? {};
  const values = alternative.values ?? {};
  const lat =
    alternative.lat ??
    toNumber(raw.lat ?? raw.latitude, -8.185);
  const lng =
    alternative.lng ??
    toNumber(raw.lng ?? raw.longitude, 113.668);

  return {
    id: alternative.id,
    name: alternative.name,
    district:
      alternative.kecamatan ??
      String(raw.district ?? raw.kecamatan ?? "Belum diatur"),
    lat: toNumber(lat, -8.185),
    lng: toNumber(lng, 113.668),
    // vScore: toNumber(raw.preferenceValue ?? raw.v_score ?? 0),
    // ranking: toNumber(raw.rank ?? ranking, ranking),
    // komitmen: toNumber(values.komitmen),
    // remaja: toNumber(values.remaja),
    // stunting: toNumber(values.stunting),
    // prevalensi: toNumber(values.prevalensi),
    // kemiskinan: toNumber(values.kemiskinan),
    // jarak: toNumber(values.jarak),
    // tenagaKerja: toNumber(values.tenagaKerja),
    values: alternative.values,
  };
};

export const mapAlternativeToVillages = (
  alternatives: BackendAlternative,
): Village => {
  const [parsedLat, parsedLng] = alternatives.koordinat
    ?.split(",")
    .map((coord) => parseFloat(coord.trim())) ?? [-8.185, 113.668];

  return {
    id: alternatives.id,
    name: alternatives.name,
    district: alternatives.kecamatan,
    lat: isFinite(parsedLat) ? parsedLat : -8.185,
    lng: isFinite(parsedLng) ? parsedLng : 113.668,
    values: alternatives.values,
  };
};

// export const mapVillageValues = (village: Village): VillageCriteriaValues => ({
//   komitmen: toNumber(village.komitmen),
//   remaja: toNumber(village.remaja),
//   stunting: toNumber(village.stunting),
//   prevalensi: toNumber(village.prevalensi),
//   kemiskinan: toNumber(village.kemiskinan),
//   jarak: toNumber(village.jarak),
//   tenagaKerja: toNumber(village.tenagaKerja),
// });
