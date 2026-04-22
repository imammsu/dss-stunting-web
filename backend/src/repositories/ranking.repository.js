import { pool } from "../config/postgres.js";

/**
 * Menyimpan seluruh data riwayat ranking, hasil, dan alternatif dalam satu transaksi atomik.
 */
export const saveRankingTransaction = async ({
  nama_sesi,
  id_pembobotan_kriteria,
  user_email,
  rankedAlternatives,
  criteria
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Simpan ke riwayat_ranking
    const insertRiwayatQuery = `
      INSERT INTO riwayat_ranking (nama_sesi, id_pembobotan_kriteria)
      VALUES ($1, $2)
      RETURNING id
    `;
    const riwayatResult = await client.query(insertRiwayatQuery, [
      nama_sesi,
      id_pembobotan_kriteria,
    ]);
    const id_riwayat_ranking = riwayatResult.rows[0].id;

    // Persiapkan query untuk ranking_hasil dan ranking_alternatif
    const insertHasilQuery = `
      INSERT INTO ranking_hasil (id_alternatif_desa, id_riwayat_ranking, preferensi_score, status, ranking)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const insertAlternatifQuery = `
      INSERT INTO ranking_alternatif (id_ranking_hasil, id_kriteria, nilai, created_by)
      VALUES ($1, $2, $3, $4)
    `;

    // 2. Loop per alternatif (desa)
    for (const alternative of rankedAlternatives) {
      // Tentukan status (bisa disesuaikan batasnya)
      let status = "Prioritas Rendah";
      if (alternative.preferenceValue > 0.7) status = "Sangat Prioritas";
      else if (alternative.preferenceValue >= 0.4) status = "Prioritas Sedang";

      // Insert ranking_hasil
      const hasilResult = await client.query(insertHasilQuery, [
        alternative.id,
        id_riwayat_ranking,
        alternative.preferenceValue,
        status,
        alternative.rank,
      ]);
      const id_ranking_hasil = hasilResult.rows[0].id;

      // 3. Loop per kriteria untuk memasukkan nilai mentah
      for (const criterion of criteria) {
        // criterion.dbId adalah integer ID dari tabel kriteria
        if (!criterion.dbId) continue;

        const nilai = alternative.values[criterion.id] ?? 0;

        await client.query(insertAlternatifQuery, [
          id_ranking_hasil,
          criterion.dbId,
          nilai,
          user_email || null,
        ]);
      }
    }

    await client.query("COMMIT");
    return id_riwayat_ranking;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Mengambil daftar semua sesi riwayat perankingan (ringkasan, terbaru di atas).
 */
export const listRiwayatFromDatabase = async () => {
  const query = `
    SELECT rr.id, rr.nama_sesi, rr.created_at, pk.nama AS nama_pembobotan
    FROM riwayat_ranking rr
    LEFT JOIN pembobotan_kriteria pk ON pk.id = rr.id_pembobotan_kriteria
    ORDER BY rr.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Mengambil detail satu sesi riwayat beserta seluruh desa yang diranking.
 */
export const getRiwayatDetailFromDatabase = async (id) => {
  const headerResult = await pool.query(
    `SELECT rr.id, rr.nama_sesi, rr.created_at, pk.nama AS nama_pembobotan
     FROM riwayat_ranking rr
     LEFT JOIN pembobotan_kriteria pk ON pk.id = rr.id_pembobotan_kriteria
     WHERE rr.id = $1`,
    [id]
  );
  if (headerResult.rowCount === 0) return null;

  const detailResult = await pool.query(
    `SELECT rh.ranking, rh.preferensi_score, rh.status,
            a.id AS desa_id, a.nama AS desa_nama, a.kecamatan, a.koordinat
     FROM ranking_hasil rh
     JOIN alternatif_desa a ON a.id = rh.id_alternatif_desa
     WHERE rh.id_riwayat_ranking = $1
     ORDER BY rh.ranking ASC`,
    [id]
  );

  const villages = detailResult.rows.map((row) => {
    const parts = (row.koordinat || "").split(",");
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    return {
      id: row.desa_id,
      name: row.desa_nama,
      district: row.kecamatan,
      lat: isFinite(lat) ? lat : -8.185,
      lng: isFinite(lng) ? lng : 113.668,
      ranking: row.ranking,
      vScore: Number(row.preferensi_score),
      status: row.status,
      values: {},
    };
  });

  return { ...headerResult.rows[0], villages };
};

/**
 * Menghapus satu sesi riwayat beserta seluruh data terkait.
 */
export const deleteRiwayatFromDatabase = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Hapus ranking_alternatif yang merujuk ke ranking_hasil dari riwayat ini
    await client.query(
      `DELETE FROM ranking_alternatif
       WHERE id_ranking_hasil IN (
         SELECT id FROM ranking_hasil WHERE id_riwayat_ranking = $1
       )`,
      [id]
    );

    // 2. Hapus ranking_hasil
    await client.query(
      "DELETE FROM ranking_hasil WHERE id_riwayat_ranking = $1",
      [id]
    );

    // 3. Hapus riwayat_ranking
    const result = await client.query(
      "DELETE FROM riwayat_ranking WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) throw new Error("Riwayat tidak ditemukan.");

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
