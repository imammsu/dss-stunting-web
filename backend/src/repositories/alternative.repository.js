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
    ORDER BY a.id DESC
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

export const insertAlternatifDesa = async ({ name, kecamatan, lat, lng }) => {
  const query = `
    INSERT INTO alternatif_desa (nama, kecamatan, koordinat)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const result = await pool.query(query, [name, kecamatan, `${lat},${lng}`]);
  return result.rows[0]; // { id: ... }
};

export const insertAlternatifDesaDefaultNilai = async (nilaiRows) => {
  const query = `
    INSERT INTO default_nilai_alternatif (id_alternatif_desa, id_kriteria, nilai)
    VALUES ($1, $2, $3)
  `;
  for (const row of nilaiRows) {
    await pool.query(query, [row.id_alternatif_desa, row.id_kriteria, row.nilai]);
  }
};
 
export const updateAlternatifDesa = async (id, { name, kecamatan, lat, lng }) => {
  const query = `
    UPDATE alternatif_desa
    SET nama = $1, kecamatan = $2, koordinat = $3
    WHERE id = $4
    RETURNING id
  `;
  const result = await pool.query(query, [name, kecamatan, `${lat},${lng}`, id]);
  if (result.rowCount === 0) throw new Error("Data tidak ditemukan.");
  return result.rows[0];
};

export const findAlternatifDesaByNama = async (nama, kecamatan) => {
  const query = `
    SELECT id FROM alternatif_desa
    WHERE LOWER(nama) = LOWER($1) AND LOWER(kecamatan) = LOWER($2)
    LIMIT 1
  `;
  const result = await pool.query(query, [nama, kecamatan]);
  return result.rows[0] || null;
};

export const deleteAlternatifDesaFromDatabase = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Hapus nilai default dulu (FK)
    await client.query('DELETE FROM default_nilai_alternatif WHERE id_alternatif_desa = $1', [id]);
    // Hapus desa
    const result = await client.query('DELETE FROM alternatif_desa WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) throw new Error("Data tidak ditemukan.");
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateAlternatifDesaDefaultNilai = async (id, nilaiRows) => {
  // Hapus nilai lama dulu, lalu insert yang baru
  await pool.query(
    `DELETE FROM default_nilai_alternatif WHERE id_alternatif_desa = $1`,
    [id]
  );

  const query = `
    INSERT INTO default_nilai_alternatif (id_alternatif_desa, id_kriteria, nilai)
    VALUES ($1, $2, $3)
  `;
  for (const row of nilaiRows) {
    await pool.query(query, [row.id_alternatif_desa, row.id_kriteria, row.nilai]);
  }
};

