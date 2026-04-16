/**
 * Service master data.
 * Silakan sesuaikan mapping output bila frontend Anda ingin bentuk data yang berbeda.
 */
import { listAlternativesFromDatabase } from "../repositories/alternative.repository.js";
import { listCriteriaFromDatabase } from "../repositories/criteria.repository.js";

export const getTopsisReadyCriteria = async () => {
  const rows = await listCriteriaFromDatabase();

  return rows.map((row) => ({
    id: row.code ?? row.id,
    label: row.name ?? row.code ?? row.id,
    weight: row.weight,
    type: row.type ?? "benefit",
    raw: row.raw,
  }));
};

export const getAlternatives = async () => {
  return listAlternativesFromDatabase();
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
