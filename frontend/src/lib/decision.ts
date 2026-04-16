/**
 * Wrapper endpoint AHP dan TOPSIS frontend.
 */
import type { CriterionDefinition, WeightFormat } from "../data/master";
import type { Village } from "../data/villages";
import { requestJson } from "./api";
import { mapValuesToWeights } from "./mappers";

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
  criteria: CriterionDefinition[],
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
  selectedWeight: WeightFormat,
  criteria: CriterionDefinition[],
) => {
  const alternatives: DecisionAlternativeInput[] = villages.map((village) => ({
    id: village.id,
    name: village.name,
    values: {
      komitmen: village.komitmen ?? 0,
      remaja: village.remaja ?? 0,
      stunting: village.stunting ?? 0,
      prevalensi: village.prevalensi ?? 0,
      kemiskinan: village.kemiskinan ?? 0,
      jarak: village.jarak ?? 0,
      tenagaKerja: village.tenagaKerja ?? 0,
    },
  }));

  const response = await requestJson<TopsisResponse>("/decision/topsis/rank", {
    method: "POST",
    auth: true,
    body: {
      criteria: criteria.map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
        weight: selectedWeight.weights[criterion.id],
        type: criterion.type,
      })),
      alternatives,
    },
  });

  const rankById = new Map(
    response.rankedAlternatives.map((item) => [String(item.id), item]),
  );

  return villages
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
};
