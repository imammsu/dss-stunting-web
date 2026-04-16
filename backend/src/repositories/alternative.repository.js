import { pool } from "../config/postgres.js";
 
export const listAlternativesFromDatabase = async () => {
  // Ambil semua alternatif beserta nilai tiap kriterianya dalam satu query
  const query = `
    SELECT
      a.id,
      a.nama,
      a.kecamatan,
      a.koordinat,
      d.id_kriteria,
      d.nilai
    FROM alternatif_desa a
    LEFT JOIN default_nilai_alternatif d
      ON d.id_alternatif_desa = a.id
    ORDER BY a.nama ASC
  `;
 
  const result = await pool.query(query);
 
  // Kelompokkan baris per alternatif, gabungkan nilai ke dalam object values
  const alternativesMap = new Map();
 
  for (const row of result.rows) {
    if (!alternativesMap.has(row.id)) {
      alternativesMap.set(row.id, {
        id: row.id,
        name: row.nama,
        kecamatan: row.kecamatan,
        koordinat: row.koordinat,
        values: {},
      });
    }
 
    // Hanya tambahkan jika baris ini punya nilai kriteria (bukan hasil LEFT JOIN kosong)
    if (row.id_kriteria != null && row.nilai != null) {
      alternativesMap.get(row.id).values[row.id_kriteria] = Number(row.nilai);
    }
  }
 
  return Array.from(alternativesMap.values());
};
 

