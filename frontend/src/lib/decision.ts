/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Wrapper endpoint AHP dan TOPSIS frontend.
 */
import type { CriterionDefinition, WeightFormat } from "../data/master";
import type { Village } from "../data/villages";
import { requestJson } from "./api";
import { mapValuesToWeights, type BackendCriterion, type BackendPembobotan } from "./mappers";

export interface RiwayatListItem {
  id: number;
  nama_sesi: string;
  created_at: string;
  nama_pembobotan: string | null;
}

export interface RiwayatDetail extends RiwayatListItem {
  villages: Village[];
}

/** Ambil daftar semua sesi riwayat (terbaru di atas). */
export const fetchRiwayatList = () =>
  requestJson<RiwayatListItem[]>("/decision/riwayat", { auth: true });

/** Ambil detail satu sesi riwayat beserta data desa. */
export const fetchRiwayatDetail = (id: number) =>
  requestJson<RiwayatDetail>(`/decision/riwayat/${id}`, { auth: true });

export interface AhpComparison {
  left: string;
  right: string;
  value: number;
}

interface AhpResponse {
  weights: Array<{
    id: string;
    label: string;
    weight: number;
  }>;
  consistency: {
    cr: number;
    isConsistent: boolean;
    note?: string;
  };
}

interface RankedAlternative {
  id: string | number;
  rank: number;
  preferenceValue: number;
}

interface TopsisResponse {
  rankedAlternatives: RankedAlternative[];
}

export interface DecisionAlternativeInput {
  id: string | number;
  name: string;
  values: Record<string, number>;
}

export const calculateAhpWeights = async (
  criteria: BackendCriterion[],
  comparisons: AhpComparison[],
) => {
  const response = await requestJson<AhpResponse>("/decision/ahp/weights", {
    method: "POST",
    auth: true,
    body: {
      criteria: criteria.map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
      })),
      comparisons,
    },
  });

  const weightMap = Object.fromEntries(
    response.weights.map((item) => [item.id, item.weight]),
  );

  return {
    weights: mapValuesToWeights(weightMap),
    consistency: response.consistency,
  };
};

export const rankVillagesWithTopsis = async (
  villages: Village[],
  selectedWeight: BackendPembobotan,
  criteria: BackendCriterion[],
  saveToDb: boolean = false,
  sessionName?: string
) => {
  const alternatives: DecisionAlternativeInput[] = villages.map((village) => ({
    id: village.id,
    name: village.name,
    values: Object.fromEntries(
      criteria.map((criterion) => {
        // Mendukung data statis (properti langsung) maupun data DB (dalam village.values[id_kriteria])
        const dbId = criterion.raw?.id as string | number | undefined;
        const villageAsRecord = village as unknown as Record<string, unknown>;
        const val =
          (villageAsRecord[criterion.id] as number | undefined) ??
          (dbId ? village.values?.[dbId] : undefined) ??
          village.values?.[criterion.id] ??
          0;
        return [criterion.id, Number(val)];
      })
    ),
  }));

  // Buat lookup bobot: id_kriteria (integer DB) -> bobot
  // Ini lebih andal dari string matching nama_kriteria
  const dbIdToBobot: Record<number, number> = {};
  selectedWeight.kriteria.forEach(k => {
    dbIdToBobot[k.id_kriteria] = k.bobot;
  });

  const response = await requestJson<TopsisResponse & { id_riwayat_ranking?: number }>("/decision/topsis/rank", {
    method: "POST",
    auth: true,
    body: {
      save_to_db: saveToDb,
      session_name: sessionName,
      weight_id: selectedWeight.id,
      criteria: criteria.map((criterion) => {
        const dbId = criterion.raw?.id as number | undefined;
        return {
          id: criterion.id,
          label: criterion.label,
          weight: dbId !== undefined ? (dbIdToBobot[dbId] ?? 0) : 0,
          type: criterion.type,
          dbId: dbId,
        };
      }),
      alternatives,
    },
  });



  const rankById = new Map(
    response.rankedAlternatives.map((item) => [String(item.id), item]),
  );

  const rankedVillages = villages
    .map((village) => {
      const ranked = rankById.get(String(village.id));
      return {
        ...village,
        ranking: ranked?.rank ?? 0,
        vScore: ranked?.preferenceValue ?? 0,
      };
    })
    .sort((left, right) => right.vScore - left.vScore)
    .map((village, index) => ({
      ...village,
      ranking: index + 1,
    }));

  return {
    villages: rankedVillages,
    /** ID integer dari tabel riwayat_ranking di DB (ada hanya jika saveToDb = true) */
    dbId: response.id_riwayat_ranking,
  };
};

/** Hapus satu sesi riwayat dari database. */
export const deleteRiwayatApi = (id: number) =>
  requestJson<{ message: string }>(`/decision/riwayat/${id}`, {
    auth: true,
    method: "DELETE",
  });
