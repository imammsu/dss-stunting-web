/**
 * Helper pemetaan data backend ke model frontend.
 * Bila nama field Supabase Anda berbeda, file ini biasanya cukup disesuaikan bersama tableMap backend.
 */
import type { MasterWeights, WeightFormat } from "../data/master";
import type { Village, VillageCriteriaValues } from "../data/villages";

export interface BackendCriterion {
  id: string;
  label: string;
  weight?: number | null;
  type?: "benefit" | "cost";
  raw?: Record<string, unknown>;
}

export interface BackendAlternative {
  id: string | number;
  name: string;
  district?: string | null;
  lat?: number | null;
  lng?: number | null;
  values: Record<string, number | string | null | undefined>;
  raw?: Record<string, unknown>;
}

export interface BackendBootstrap {
  criteria: BackendCriterion[];
  alternatives: BackendAlternative[];
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

export const mapCriteriaToWeightFormat = (
  criteria: BackendCriterion[],
): WeightFormat | null => {
  const weightMap = Object.fromEntries(
    criteria.map((criterion) => [criterion.id, toNumber(criterion.weight, 0)]),
  );

  const totalWeight = Object.values(weightMap).reduce((sum, value) => sum + value, 0);

  if (totalWeight <= 0) {
    return null;
  }

  return {
    id: "database-default",
    name: "Bobot dari Database Supabase",
    weights: mapValuesToWeights(weightMap),
  };
};

export const mapAlternativeToVillage = (
  alternative: BackendAlternative,
  ranking = 0,
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
      alternative.district ??
      String(raw.district ?? raw.kecamatan ?? "Belum diatur"),
    lat: toNumber(lat, -8.185),
    lng: toNumber(lng, 113.668),
    vScore: toNumber(raw.preferenceValue ?? raw.v_score ?? 0),
    ranking: toNumber(raw.rank ?? ranking, ranking),
    komitmen: toNumber(values.komitmen),
    remaja: toNumber(values.remaja),
    stunting: toNumber(values.stunting),
    prevalensi: toNumber(values.prevalensi),
    kemiskinan: toNumber(values.kemiskinan),
    jarak: toNumber(values.jarak),
    tenagaKerja: toNumber(values.tenagaKerja),
  };
};

export const mapVillageValues = (village: Village): VillageCriteriaValues => ({
  komitmen: toNumber(village.komitmen),
  remaja: toNumber(village.remaja),
  stunting: toNumber(village.stunting),
  prevalensi: toNumber(village.prevalensi),
  kemiskinan: toNumber(village.kemiskinan),
  jarak: toNumber(village.jarak),
  tenagaKerja: toNumber(village.tenagaKerja),
});
