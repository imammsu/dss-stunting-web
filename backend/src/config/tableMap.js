/**
 * Pusat penyesuaian nama tabel dan kolom.
 * Jika skema Supabase Anda berbeda, prioritaskan edit file ini terlebih dahulu.
 *
 * Contoh asumsi bawaan:
 * - tabel criteria menyimpan bobot dan tipe kriteria
 * - tabel alternatives menyimpan nilai kriteria dalam kolom JSON bernama "values"
 * - tabel profiles bersifat opsional jika Anda ingin menyimpan data profil terpisah dari auth.users
 */
export const TABLES = {
  kriteria: "kriteria",
  alternatifDesa: "alternatif_desa",
  defaultNilaiAlternatif: "default_nilai_alternatif",

  pembobotanKriteria: "pembobotan_kriteria",
  pairwiseComparisonKriteria: "pairwise_comparison_kriteria",
  pembobotanHasil: "pembobotan_hasil",
 
  riwayatRanking: "riwayat_ranking",
  rankingHasil: "ranking_hasil",
  rankingAlternatif: "ranking_alternatif",
};

export const COLUMNS = {
  kriteria: {
    id: "id",
    kode: "kode",
    nama: "nama",
    satuan: "satuan",
    tipe: "tipe",
    createdAt: "created_at",
  },
 
  alternatifDesa: {
    id: "id",
    nama: "nama",
    kecamatan: "kecamatan",
    koordinat: "koordinat",
  },
 
  defaultNilaiAlternatif: {
    id: "id",
    idAlternatifDesa: "id_alternatif_desa",
    idKriteria: "id_kriteria",
    nilai: "nilai",
    createdAt: "created_at",
  },
 
  pembobotanKriteria: {
    id: "id",
    nama: "nama",
    cr: "cr",
    createdAt: "created_at",
  },
 
  pairwiseComparisonKriteria: {
    id: "id",
    idPembobotanKriteria: "id_pembobotan_kriteria",
    kriteria1: "kriteria_1",
    kriteria2: "kriteria_2",
    nilai: "nilai",
    createdAt: "created_at",
  },
 
  pembobotanHasil: {
    id: "id",
    idPembobotanKriteria: "id_pembobotan_kriteria",
    idKriteria: "id_kriteria",
    bobot: "bobot",
    createdAt: "created_at",
  },
 
  riwayatRanking: {
    id: "id",
    namaSesi: "nama_sesi",
    idPembobotanKriteria: "id_pembobotan_kriteria",
    createdAt: "created_at",
  },
 
  rankingHasil: {
    id: "id",
    idAlternatifDesa: "id_alternatif_desa",
    idRiwayatRanking: "id_riwayat_ranking",
    preferensiScore: "preferensi_score",
    status: "status",
    ranking: "ranking",
    createdAt: "created_at",
  },
 
  rankingAlternatif: {
    id: "id",
    idRankingHasil: "id_ranking_hasil",
    idKriteria: "id_kriteria",
    nilai: "nilai",
    createdBy: "created_by",
  },
};
