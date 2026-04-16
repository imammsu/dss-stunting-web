/**
 * Service orkestrasi DSS.
 * File ini menggabungkan AHP dan TOPSIS agar frontend cukup memanggil satu endpoint jika diperlukan.
 */
import { getMasterBootstrap } from "./master.service.js";
import { ApiError } from "../utils/apiError.js";
import { calculateAHP } from "./decision/ahp.service.js";
import { rankWithTopsis } from "./decision/topsis.service.js";

export const evaluateDecision = ({ criteria, comparisons, alternatives, maxCr }) => {
  const ahpResult = calculateAHP({
    criteria,
    comparisons,
    maxCr,
  });

  const criteriaById = new Map(
    criteria.map((criterion) => {
      const normalizedCriterion =
        typeof criterion === "string"
          ? { id: criterion, label: criterion, type: "benefit" }
          : criterion;

      return [normalizedCriterion.id, normalizedCriterion];
    }),
  );

  const weightedCriteria = ahpResult.weights.map((weightItem) => {
    const sourceCriterion = criteriaById.get(weightItem.id) ?? {
      id: weightItem.id,
      label: weightItem.label,
      type: "benefit",
    };

    return {
      id: weightItem.id,
      label: weightItem.label,
      weight: weightItem.weight,
      type: sourceCriterion.type ?? "benefit",
    };
  });

  const topsisResult = rankWithTopsis({
    criteria: weightedCriteria,
    alternatives,
  });

  return {
    ahp: ahpResult,
    topsis: topsisResult,
  };
};

export const rankDecisionFromDatabase = async () => {
  const bootstrap = await getMasterBootstrap();

  if (!bootstrap.criteria.length) {
    throw new ApiError(400, "Tabel kriteria kosong.");
  }
  
  if (!bootstrap.alternatives.length) {
    throw new ApiError(400, "Tabel alternatif kosong.");
  }

  const missingWeights = bootstrap.criteria.filter(
    (criterion) => criterion.weight == null || Number.isNaN(criterion.weight),
  );

  if (missingWeights.length) {
    throw new ApiError(
      400,
      "Beberapa kriteria belum memiliki bobot. Simpan bobot AHP ke tabel kriteria terlebih dahulu.",
      {
        missingCriteria: missingWeights.map((criterion) => criterion.id),
      },
    );
  }

  return rankWithTopsis({
    criteria: bootstrap.criteria,
    alternatives: bootstrap.alternatives,
  });
};
