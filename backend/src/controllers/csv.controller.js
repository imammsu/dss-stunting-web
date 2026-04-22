/**
 * Controller CSV.
 * Download template dan upload/validasi data CSV.
 */
import { asyncHandler } from "../utils/asyncHandler.js";
import { listAlternativesFromDatabase } from "../repositories/alternative.repository.js";

const CSV_HEADERS = [
  "Nama Desa",
  "Kecamatan",
  "Komitmen (1-5)",
  "Remaja (%)",
  "Jumlah Stunting",
  "Prevalensi Stunting (%)",
  "Tingkat Kemiskinan (%)",
  "Jarak Fasilitas (km)",
  "Tenaga Medis",
];

export const downloadTemplate = asyncHandler(async (_req, res) => {
  const csvContent = CSV_HEADERS.join(",") + "\n";

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="template_data_stunting.csv"');
  res.send(csvContent);
});

export const uploadAndValidateCsv = asyncHandler(async (req, res) => {
  try {
    const { csvContent } = req.body;

    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({
        success: false,
        message: "Konten CSV tidak ditemukan. Pastikan Anda mengirimkan field 'csvContent'.",
      });
    }

    // Parse CSV
    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: "File CSV harus memiliki minimal 1 baris header dan 1 baris data.",
      });
    }

    // Validasi header
    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim());

    if (headers.length !== CSV_HEADERS.length) {
      return res.status(400).json({
        success: false,
        message: `Format CSV tidak sesuai template. Jumlah kolom harus ${CSV_HEADERS.length}, tapi ditemukan ${headers.length} kolom. Pastikan menggunakan template yang benar.`,
      });
    }

    // Cek nama kolom header
    for (let i = 0; i < CSV_HEADERS.length; i++) {
      if (headers[i].toLowerCase() !== CSV_HEADERS[i].toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: `Kolom ke-${i + 1} harus '${CSV_HEADERS[i]}', tapi ditemukan '${headers[i]}'. Pastikan menggunakan template yang benar.`,
        });
      }
    }

    // Ambil daftar desa dari database untuk validasi
    const dbAlternatives = await listAlternativesFromDatabase();

    const errors = [];
    const parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const rowNum = i + 1; // Baris ke- (1-indexed, termasuk header)

      if (cols.length !== CSV_HEADERS.length) {
        errors.push(`Baris ${rowNum}: Jumlah kolom tidak sesuai (ditemukan ${cols.length}, seharusnya ${CSV_HEADERS.length}).`);
        continue;
      }

      const nama = cols[0];
      const kecamatan = cols[1];

      if (!nama || !kecamatan) {
        errors.push(`Baris ${rowNum}: Nama Desa dan Kecamatan wajib diisi.`);
        continue;
      }

      // Cek apakah desa ada di database
      const matchedDesa = dbAlternatives.find(
        (alt) =>
          alt.name.toLowerCase() === nama.toLowerCase() &&
          alt.kecamatan.toLowerCase() === kecamatan.toLowerCase()
      );

      if (!matchedDesa) {
        errors.push(
          `Baris ${rowNum}: Desa '${nama}' di kecamatan '${kecamatan}' tidak ditemukan di database. Pastikan desa sudah terdaftar di Master Data.`
        );
        continue;
      }

      // Validasi nilai kriteria (harus numerik)
      const values = {};
      const criteriaKeys = ["1", "2", "3", "4", "5", "6", "7"];
      let hasValueError = false;

      for (let j = 2; j < cols.length; j++) {
        const val = Number(cols[j]);
        if (isNaN(val)) {
          errors.push(`Baris ${rowNum}: Kolom '${CSV_HEADERS[j]}' harus berupa angka, tapi ditemukan '${cols[j]}'.`);
          hasValueError = true;
          break;
        }
        values[criteriaKeys[j - 2]] = val;
      }

      if (hasValueError) continue;

      parsedRows.push({
        id: matchedDesa.id,
        name: matchedDesa.name,
        district: matchedDesa.kecamatan,
        lat: matchedDesa.koordinat
          ? parseFloat(matchedDesa.koordinat.split(",")[0])
          : -8.185,
        lng: matchedDesa.koordinat
          ? parseFloat(matchedDesa.koordinat.split(",")[1])
          : 113.668,
        values,
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validasi CSV gagal. Perbaiki error berikut:",
        details: { errors, validRowCount: parsedRows.length },
      });
    }

    res.json({
      success: true,
      message: `${parsedRows.length} baris data berhasil divalidasi.`,
      data: parsedRows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
