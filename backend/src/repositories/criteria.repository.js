/**
 * Repository kriteria.
 * Ubah pilihan kolom di file ini bila tabel kriteria Anda menyimpan field yang berbeda.
 */
import { pool } from "../config/postgres.js";
 
export const listCriteriaFromDatabase = async () => {
  const query = `
    SELECT
      k.id,
      k.kode,
      k.nama,
      k.is_benefit,
      k.satuan,
      ph.bobot AS weight
    FROM kriteria k
    LEFT JOIN pembobotan_hasil ph
      ON ph.id_kriteria = k.id
      AND ph.id_pembobotan_kriteria = (
        SELECT id
        FROM pembobotan_kriteria
        ORDER BY created_at DESC
        LIMIT 1
      )
    ORDER BY k.id ASC
  `;
 
  const result = await pool.query(query);
 
  return result.rows.map((row) => ({
    id: row.id,
    code: row.kode,
    name: row.nama,
    weight: row.weight == null ? null : Number(row.weight),
    type: row.tipe ?? "benefit",
    satuan: row.satuan,
    raw: row,
  }));
};
