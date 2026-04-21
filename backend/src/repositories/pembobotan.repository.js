import { pool } from "../config/postgres.js";

export const listPembobotanFromDatabase = async () => {
    const query = `
    select pk.id as pembobotan_id, pk.nama as pembobotan_nama, pk.cr, pk.created_at, ph.id_kriteria, k.nama as kriteria_nama, ph.bobot from pembobotan_kriteria pk
left join pembobotan_hasil ph on ph.id_pembobotan_kriteria = pk.id
left join kriteria k on k.id = ph.id_kriteria
ORDER BY pk.id DESC, ph.id_kriteria ASC
    `;

    const result = await pool.query(query);

    // Group hasil berdasarkan pembobotan_id
    const grouped = {};
    result.rows.forEach((row) => {
        if (!grouped[row.pembobotan_id]) {
            grouped[row.pembobotan_id] = {
                id: row.pembobotan_id,
                pembobotan_nama: row.pembobotan_nama,
                cr: row.cr,
                created_at: row.created_at,
                kriteria: [],
            };
        }
        
        if (row.id_kriteria) {
            grouped[row.pembobotan_id].kriteria.push({
                id_kriteria: row.id_kriteria,
                nama_kriteria: row.kriteria_nama,
                bobot: Number(row.bobot),
            });
        }
    });

    return Object.values(grouped);
};

export const insertPembobotanFromDatabase = async ({ nama, cr, kriteriaList, pairwiseList }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert ke pembobotan_kriteria
    const resultHeader = await client.query(
      'INSERT INTO pembobotan_kriteria (nama, cr) VALUES ($1, $2) RETURNING id',
      [nama, cr]
    );
    const idPembobotan = resultHeader.rows[0].id;

    // 2. Insert ke pembobotan_hasil
    if (kriteriaList && kriteriaList.length > 0) {
      const hasilValues = [];
      const hasilParams = [];
      let paramIndex = 1;
      
      kriteriaList.forEach(item => {
        hasilValues.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        hasilParams.push(idPembobotan, item.id_kriteria, item.bobot);
      });
      
      await client.query(
        `INSERT INTO pembobotan_hasil (id_pembobotan_kriteria, id_kriteria, bobot) VALUES ${hasilValues.join(', ')}`,
        hasilParams
      );
    }

    // 3. Insert ke pairwise_comparison_kriteria
    if (pairwiseList && pairwiseList.length > 0) {
      const pairwiseValues = [];
      const pairwiseParams = [];
      let paramIndex = 1;

      pairwiseList.forEach(item => {
        pairwiseValues.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        pairwiseParams.push(idPembobotan, item.kriteria_1, item.kriteria_2, item.nilai);
      });

      await client.query(
        `INSERT INTO pairwise_comparison_kriteria (id_pembobotan_kriteria, kriteria_1, kriteria_2, nilai) VALUES ${pairwiseValues.join(', ')}`,
        pairwiseParams
      );
    }

    await client.query('COMMIT');
    return { id: idPembobotan };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getPembobotanDetailFromDatabase = async (id) => {
  const query = `
    SELECT p.*, k1.kode as k1_kode, k2.kode as k2_kode
    FROM pairwise_comparison_kriteria p
    LEFT JOIN kriteria k1 ON p.kriteria_1 = k1.id
    LEFT JOIN kriteria k2 ON p.kriteria_2 = k2.id
    WHERE p.id_pembobotan_kriteria = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const updatePembobotanInDatabase = async (id, { nama, cr, kriteriaList, pairwiseList }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Update pembobotan_kriteria
    await client.query(
      'UPDATE pembobotan_kriteria SET nama = $1, cr = $2 WHERE id = $3',
      [nama, cr, id]
    );

    // 2. Delete existing
    await client.query('DELETE FROM pembobotan_hasil WHERE id_pembobotan_kriteria = $1', [id]);
    await client.query('DELETE FROM pairwise_comparison_kriteria WHERE id_pembobotan_kriteria = $1', [id]);

    // 3. Insert ke pembobotan_hasil
    if (kriteriaList && kriteriaList.length > 0) {
      const hasilValues = [];
      const hasilParams = [];
      let paramIndex = 1;
      
      kriteriaList.forEach(item => {
        hasilValues.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        hasilParams.push(id, item.id_kriteria, item.bobot);
      });
      
      await client.query(
        `INSERT INTO pembobotan_hasil (id_pembobotan_kriteria, id_kriteria, bobot) VALUES ${hasilValues.join(', ')}`,
        hasilParams
      );
    }

    // 4. Insert ke pairwise_comparison_kriteria
    if (pairwiseList && pairwiseList.length > 0) {
      const pairwiseValues = [];
      const pairwiseParams = [];
      let paramIndex = 1;

      pairwiseList.forEach(item => {
        pairwiseValues.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
        pairwiseParams.push(id, item.kriteria_1, item.kriteria_2, item.nilai);
      });

      await client.query(
        `INSERT INTO pairwise_comparison_kriteria (id_pembobotan_kriteria, kriteria_1, kriteria_2, nilai) VALUES ${pairwiseValues.join(', ')}`,
        pairwiseParams
      );
    }

    await client.query('COMMIT');
    return { id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};