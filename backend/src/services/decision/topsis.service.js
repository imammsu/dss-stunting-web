/**
 * Modul perhitungan TOPSIS.
 * Input utama:
 * - criteria: array { id, label, weight, type }
 * - alternatives: array { id, name, values: { [criterionId]: number } }
 *
 * Tipe kriteria:
 * - benefit: semakin besar semakin baik
 * - cost: semakin kecil semakin baik
 */
import { ApiError } from "../../utils/apiError.js";

const roundNumber = (value, digits = 6) =>
  Number(Number(value).toFixed(digits));

const normalizeCriteria = (criteria = []) => {
  if (!Array.isArray(criteria) || criteria.length === 0) {
    throw new ApiError(400, "Data kriteria TOPSIS wajib diisi.");
  }

  const totalWeight = criteria.reduce((sum, criterion, index) => {
    const weight = Number(criterion.weight);

    if (!criterion?.id) {
      throw new ApiError(400, `Kriteria ke-${index + 1} belum memiliki id.`);
    }

    if (!Number.isFinite(weight) || weight < 0) {
      throw new ApiError(400, `Bobot kriteria ${criterion.id} tidak valid.`);
    }

    return sum + weight;
  }, 0);

  if (totalWeight <= 0) {
    throw new ApiError(400, "Total bobot kriteria harus lebih besar dari 0.");
  }

  return criteria.map((criterion) => ({
    id: criterion.id,
    label: criterion.label ?? criterion.id,
    type: criterion.type === "cost" ? "cost" : "benefit",
    weight: Number(criterion.weight) / totalWeight,
  }));
};

const normalizeAlternatives = (alternatives = [], criteria) => {
  if (!Array.isArray(alternatives) || alternatives.length === 0) {
    throw new ApiError(400, "Data alternatif TOPSIS wajib diisi.");
  }

  return alternatives.map((alternative, index) => {
    if (!alternative?.id) {
      throw new ApiError(400, `Alternatif ke-${index + 1} belum memiliki id.`);
    }

    if (!alternative?.values || typeof alternative.values !== "object") {
      throw new ApiError(
        400,
        `Alternatif ${alternative.id} belum memiliki object values.`,
      );
    }

    for (const criterion of criteria) {
      const rawValue = alternative.values[criterion.id];
      const numericValue = Number(rawValue);

      if (!Number.isFinite(numericValue)) {
        throw new ApiError(
          400,
          `Nilai untuk kriteria ${criterion.id} pada alternatif ${alternative.id} tidak valid.`,
        );
      }
    }

    return {
      id: alternative.id,
      name: alternative.name ?? alternative.id,
      values: alternative.values,
    };
  });
};

export const rankWithTopsis = ({ criteria, alternatives }) => {
  const normalizedCriteria = normalizeCriteria(criteria);
  const normalizedAlternatives = normalizeAlternatives(
    alternatives,
    normalizedCriteria,
  );

  const divisorByCriterion = Object.fromEntries(
    normalizedCriteria.map((criterion) => {
      const sumOfSquares = normalizedAlternatives.reduce((sum, alternative) => {
        const value = Number(alternative.values[criterion.id]);
        return sum + value ** 2;
      }, 0);

      return [criterion.id, Math.sqrt(sumOfSquares)];
    }),
  );

  const normalizedDecisionMatrix = normalizedAlternatives.map((alternative) => ({
    id: alternative.id,
    name: alternative.name,
    values: Object.fromEntries(
      normalizedCriteria.map((criterion) => {
        const divisor = divisorByCriterion[criterion.id] || 1;
        const rawValue = Number(alternative.values[criterion.id]);
        return [criterion.id, rawValue / divisor];
      }),
    ),
  }));

  const weightedNormalizedMatrix = normalizedDecisionMatrix.map((alternative) => ({
    id: alternative.id,
    name: alternative.name,
    values: Object.fromEntries(
      normalizedCriteria.map((criterion) => {
        return [criterion.id, alternative.values[criterion.id] * criterion.weight];
      }),
    ),
  }));

  const positiveIdealSolution = {};
  const negativeIdealSolution = {};

  for (const criterion of normalizedCriteria) {
    const values = weightedNormalizedMatrix.map(
      (alternative) => alternative.values[criterion.id],
    );

    positiveIdealSolution[criterion.id] =
      criterion.type === "benefit" ? Math.max(...values) : Math.min(...values);
    negativeIdealSolution[criterion.id] =
      criterion.type === "benefit" ? Math.min(...values) : Math.max(...values);
  }

  const rankedAlternatives = weightedNormalizedMatrix
    .map((alternative) => {
      const positiveDistance = Math.sqrt(
        normalizedCriteria.reduce((sum, criterion) => {
          const difference =
            alternative.values[criterion.id] - positiveIdealSolution[criterion.id];
          return sum + difference ** 2;
        }, 0),
      );

      const negativeDistance = Math.sqrt(
        normalizedCriteria.reduce((sum, criterion) => {
          const difference =
            alternative.values[criterion.id] - negativeIdealSolution[criterion.id];
          return sum + difference ** 2;
        }, 0),
      );

      const preferenceValue =
        negativeDistance / (positiveDistance + negativeDistance || 1);

      return {
        id: alternative.id,
        name: alternative.name,
        values: Object.fromEntries(
          Object.entries(alternative.values).map(([key, value]) => [
            key,
            roundNumber(value),
          ]),
        ),
        positiveDistance: roundNumber(positiveDistance),
        negativeDistance: roundNumber(negativeDistance),
        preferenceValue: roundNumber(preferenceValue),
      };
    })
    .sort((left, right) => right.preferenceValue - left.preferenceValue)
    .map((alternative, index) => ({
      ...alternative,
      rank: index + 1,
    }));

  return {
    criteria: normalizedCriteria.map((criterion) => ({
      ...criterion,
      weight: roundNumber(criterion.weight),
    })),
    divisorByCriterion: Object.fromEntries(
      Object.entries(divisorByCriterion).map(([key, value]) => [
        key,
        roundNumber(value),
      ]),
    ),
    normalizedDecisionMatrix: normalizedDecisionMatrix.map((alternative) => ({
      ...alternative,
      values: Object.fromEntries(
        Object.entries(alternative.values).map(([key, value]) => [
          key,
          roundNumber(value),
        ]),
      ),
    })),
    weightedNormalizedMatrix: weightedNormalizedMatrix.map((alternative) => ({
      ...alternative,
      values: Object.fromEntries(
        Object.entries(alternative.values).map(([key, value]) => [
          key,
          roundNumber(value),
        ]),
      ),
    })),
    positiveIdealSolution: Object.fromEntries(
      Object.entries(positiveIdealSolution).map(([key, value]) => [
        key,
        roundNumber(value),
      ]),
    ),
    negativeIdealSolution: Object.fromEntries(
      Object.entries(negativeIdealSolution).map(([key, value]) => [
        key,
        roundNumber(value),
      ]),
    ),
    rankedAlternatives,
  };
};
