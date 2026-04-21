/**
 * Modul perhitungan AHP.
 * Input utama:
 * - criteria: array string atau object { id, label }
 * - comparisons: array { left, right, value }
 * Nilai "value" mengikuti skala Saaty 1-9.
 */
import { ApiError } from "../../utils/apiError.js";

const RI_VALUES = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

const roundNumber = (value, digits = 6) =>
  Number(Number(value).toFixed(digits));

const normalizeCriteria = (criteria = []) => {
  if (!Array.isArray(criteria) || criteria.length < 2) {
    throw new ApiError(400, "Minimal harus ada 2 kriteria untuk AHP.");
  }

  return criteria.map((criterion, index) => {
    if (typeof criterion === "string") {
      return {
        id: criterion,
        label: criterion,
      };
    }

    if (!criterion?.id) {
      throw new ApiError(400, `Kriteria ke-${index + 1} belum memiliki id.`);
    }

    return {
      id: criterion.id,
      label: criterion.label ?? criterion.id,
    };
  });
};

const buildPairKey = (leftIndex, rightIndex) => `${leftIndex}:${rightIndex}`;

const buildMatrixFromComparisons = (criteria, comparisons = []) => {
  const size = criteria.length;
  const matrix = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 1),
  );
  const indexMap = new Map(criteria.map((criterion, index) => [criterion.id, index]));
  const filledPairs = new Set();

  for (const comparison of comparisons) {
    const leftId = comparison.left ?? comparison.leftId ?? comparison.from;
    const rightId = comparison.right ?? comparison.rightId ?? comparison.to;
    const value = Number(comparison.value);

    if (!indexMap.has(leftId) || !indexMap.has(rightId)) {
      throw new ApiError(
        400,
        `Perbandingan ${leftId} vs ${rightId} mengandung id kriteria yang tidak dikenal.`,
      );
    }

    if (!Number.isFinite(value) || value < 1 || value > 9) {
      throw new ApiError(400, "Nilai perbandingan AHP harus berada pada skala Saaty 1 sampai 9.");
    }

    const leftIndex = indexMap.get(leftId);
    const rightIndex = indexMap.get(rightId);

    if (leftIndex === rightIndex) {
      throw new ApiError(400, "Perbandingan AHP tidak boleh membandingkan kriteria yang sama.");
    }

    matrix[leftIndex][rightIndex] = value;
    matrix[rightIndex][leftIndex] = 1 / value;
    filledPairs.add(buildPairKey(Math.min(leftIndex, rightIndex), Math.max(leftIndex, rightIndex)));
  }

  const missingPairs = [];

  for (let row = 0; row < size; row += 1) {
    for (let column = row + 1; column < size; column += 1) {
      const pairKey = buildPairKey(row, column);

      if (!filledPairs.has(pairKey)) {
        missingPairs.push(`${criteria[row].id} vs ${criteria[column].id}`);
      }
    }
  }

  if (missingPairs.length) {
    throw new ApiError(
      400,
      "Perbandingan AHP belum lengkap untuk semua pasangan kriteria.",
      { missingPairs },
    );
  }

  return matrix;
};

export const calculateAHP = ({
  criteria,
  comparisons,
  maxCr = 0.1,
}) => {
  const normalizedCriteria = normalizeCriteria(criteria);
  const matrix = buildMatrixFromComparisons(normalizedCriteria, comparisons);
  const size = matrix.length;

  const columnSums = Array.from({ length: size }, (_value, column) =>
    matrix.reduce((sum, row) => sum + row[column], 0),
  );

  const normalizedMatrix = matrix.map((row) =>
    row.map((value, column) => value / columnSums[column]),
  );

  const weights = normalizedMatrix.map(
    (row) => row.reduce((sum, value) => sum + value, 0) / size,
  );

  const weightedSumVector = matrix.map((row) =>
    row.reduce((sum, value, column) => sum + value * weights[column], 0),
  );

  const lambdaMax =
    weightedSumVector.reduce((sum, value, index) => sum + value / weights[index], 0) /
    size;
  const ci = size > 2 ? (lambdaMax - size) / (size - 1) : 0;
  const ri = RI_VALUES[size] ?? 1.49;
  const cr = ri === 0 ? 0 : ci / ri;

  let note = "Matriks perbandingan konsisten.";
  
  if (cr > maxCr) {
    note = "Matriks belum konsisten. Tinjau ulang perbandingan yang terlalu ekstrem atau saling bertentangan.";
    
    // Analisis inkonsistensi: cari sel dengan error terbesar (aktual vs ideal)
    let maxDiff = 0;
    let worstI = -1;
    let worstJ = -1;

    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        const actual = matrix[i][j];
        const ideal = weights[i] / weights[j];
        // Error dihitung dari rasio terbesar (karena bisa < 1 atau > 1)
        const diff = Math.max(actual / ideal, ideal / actual);
        
        if (diff > maxDiff) {
          maxDiff = diff;
          worstI = i;
          worstJ = j;
        }
      }
    }

    if (worstI !== -1 && worstJ !== -1) {
      const idealVal = weights[worstI] / weights[worstJ];
      const leftName = normalizedCriteria[worstI].label;
      const rightName = normalizedCriteria[worstJ].label;

      let suggestedValue = roundNumber(idealVal, 0);
      
      if (suggestedValue < 1) {
         suggestedValue = roundNumber(1 / idealVal, 0);
         // Saaty scale max is 9
         suggestedValue = Math.min(suggestedValue, 9);
         note = `Matriks belum konsisten. Saran perbaikan: Tinjau ulang perbandingan antara "${leftName}" dan "${rightName}". Cobalah untuk mengaturnya mendekati skala ${suggestedValue} berpihak pada "${rightName}".`;
      } else {
         suggestedValue = Math.min(suggestedValue, 9);
         note = `Matriks belum konsisten. Saran perbaikan: Tinjau ulang perbandingan antara "${leftName}" dan "${rightName}". Cobalah untuk mengaturnya mendekati skala ${suggestedValue} berpihak pada "${leftName}".`;
      }

      if (suggestedValue === 1) {
         note = `Matriks belum konsisten. Saran perbaikan: Tinjau ulang perbandingan antara "${leftName}" dan "${rightName}". Cobalah untuk mengaturnya menjadi "Sama Penting".`;
      }
    }
  }

  return {
    criteriaCount: size,
    matrix: matrix.map((row) => row.map((value) => roundNumber(value))),
    normalizedMatrix: normalizedMatrix.map((row) =>
      row.map((value) => roundNumber(value)),
    ),
    weights: normalizedCriteria.map((criterion, index) => ({
      id: criterion.id,
      label: criterion.label,
      weight: roundNumber(weights[index]),
    })),
    consistency: {
      lambdaMax: roundNumber(lambdaMax),
      ci: roundNumber(ci),
      cr: roundNumber(cr),
      maxCr: roundNumber(maxCr),
      isConsistent: cr <= maxCr,
      note,
    },
  };
};
