import { useState } from "react";
import type { Village } from "../data/villages";
import { getStatusLabel, getStatusColor } from "../data/villages";
import type { WeightFormat } from "../data/master";

interface SidebarProps {
  isLoading: boolean;
  isCalculated: boolean;
  selectedVillage: Village | null;
  onCalculate: (customData?: any[], weightId?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  masterVillages: Village[];
  masterWeights: WeightFormat[];
  onOpenMasterModal: () => void;
}

export default function Sidebar({
  isLoading,
  isCalculated,
  selectedVillage,
  onCalculate,
  isOpen,
  onToggle,
  masterVillages,
  masterWeights,
  onOpenMasterModal,
}: SidebarProps) {
  const [inputType, setInputType] = useState<"upload" | "manual">("upload");
  const [manualDataList, setManualDataList] = useState<any[]>([]);
  const [selectedWeightId, setSelectedWeightId] = useState<string>(masterWeights[0]?.id || "format-1");
  const [duplicateError, setDuplicateError] = useState("");
  const [manualForm, setManualForm] = useState({
    villageId: masterVillages[0]?.id || 1,
    komitmen: masterVillages[0]?.komitmen || 3,
    remaja: masterVillages[0]?.remaja || 15,
    stunting: masterVillages[0]?.stunting || 10,
    prevalensi: masterVillages[0]?.prevalensi || 20,
    kemiskinan: masterVillages[0]?.kemiskinan || 15,
    jarak: masterVillages[0]?.jarak || 2,
    tenagaKerja: masterVillages[0]?.tenagaKerja || 100,
  });

  const handleManualChange = (field: string, value: string | number) => {
    const numValue = Number(value);
    if (field === "villageId") {
      const village = masterVillages.find(v => v.id === numValue);
      if (village) {
        setManualForm({
          villageId: numValue,
          komitmen: village.komitmen ?? 3,
          remaja: village.remaja ?? 15,
          stunting: village.stunting ?? 10,
          prevalensi: village.prevalensi ?? 20,
          kemiskinan: village.kemiskinan ?? 15,
          jarak: village.jarak ?? 2,
          tenagaKerja: village.tenagaKerja ?? 100,
        });
      } else {
        setManualForm((prev) => ({ ...prev, [field]: numValue }));
      }
    } else {
      setManualForm((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleAddData = () => {
    setDuplicateError("");
    const existingIdx = manualDataList.findIndex((item) => item.villageId === manualForm.villageId);
    if (existingIdx !== -1) {
      setDuplicateError("Desa ini sudah ditambahkan (hindari duplikat).");
      return;
    }
    setManualDataList((prev) => [...prev, manualForm]);
  };

  return (
    <aside
      className={`
        fixed lg:relative z-[9999] h-screen bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen
          ? "w-[300px] min-w-[300px] translate-x-0"
          : "w-0 min-w-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 border-r-0"
        }
      `}
    >
      <div className="w-[300px] min-w-[300px] h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">DSS Stunting</h1>
              <p className="text-[11px] text-slate-500 leading-tight">Kabupaten Jember</p>
            </div>
          </div>
          {/* Close button (mobile & desktop) */}
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors lg:hidden"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Input Simulasi */}
        <div className="px-4 py-3 space-y-3">
          <div>
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Input Simulasi</h2>

            {/* Input Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setInputType("upload")}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  inputType === "upload" 
                    ? "bg-white shadow-sm font-medium text-slate-800" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputType("manual")}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                  inputType === "manual" 
                    ? "bg-white shadow-sm font-medium text-slate-800" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Input Manual
              </button>
            </div>

            {/* Form Content */}
            {inputType === "upload" ? (
              <div className="mb-3">
                <button
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white
                  font-medium py-1.5 px-3 rounded-lg transition-colors text-xs shadow-sm flex justify-center items-center gap-1.5"
                >Download Template File</button>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 mt-3">Upload Data Excel</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="block w-full text-xs text-slate-600
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:text-xs file:font-medium
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20 file:cursor-pointer
                      file:transition-colors bg-slate-50
                      border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Format: .xlsx, .xls, .csv</p>
              </div>
            ) : (
              <div className="mb-3 space-y-2.5">
                <button
                  type="button"
                  onClick={onOpenMasterModal}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white
                    font-medium py-1.5 px-3 rounded-lg transition-colors text-xs shadow-sm flex justify-center items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Buka Master Data
                </button>

                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">Format Pembobotan</label>
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-primary transition-colors"
                    value={selectedWeightId}
                    onChange={(e) => setSelectedWeightId(e.target.value)}
                    disabled={isLoading}
                  >
                    {masterWeights.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">Pilih Desa</label>
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-primary transition-colors"
                    value={manualForm.villageId}
                    onChange={(e) => handleManualChange("villageId", Number(e.target.value))}
                    disabled={isLoading}
                  >
                    {masterVillages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.district})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Komitmen (Skala 1-5)">1. Komitmen</label>
                    <input type="number" min="1" max="5" value={manualForm.komitmen} onChange={(e) => handleManualChange("komitmen", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Persentase Remaja usia 15-24 (%)">2. Remaja (%)</label>
                    <input type="number" value={manualForm.remaja} onChange={(e) => handleManualChange("remaja", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Anak Stunting (jiwa)">3. Stunting</label>
                    <input type="number" value={manualForm.stunting} onChange={(e) => handleManualChange("stunting", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Prevalensi Stunting (%)">4. Prevalensi (%)</label>
                    <input type="number" value={manualForm.prevalensi} onChange={(e) => handleManualChange("prevalensi", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Tingkat Kemiskinan (%)">5. Kemiskinan (%)</label>
                    <input type="number" value={manualForm.kemiskinan} onChange={(e) => handleManualChange("kemiskinan", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jarak ke Puskesmas (Km)">6. Jarak (Km)</label>
                    <input type="number" value={manualForm.jarak} onChange={(e) => handleManualChange("jarak", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Tenaga Kerja (orang)">7. Tenaga Kerja (org)</label>
                    <input type="number" value={manualForm.tenagaKerja} onChange={(e) => handleManualChange("tenagaKerja", e.target.value)} disabled={isLoading} className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none" />
                  </div>
                </div>

                {/* Error Message for Duplicates */}
                {duplicateError && (
                  <div className="mt-2 text-[10px] text-red-500 bg-red-50 p-1.5 rounded border border-red-100 text-center font-medium animate-in fade-in slide-in-from-top-1">
                    {duplicateError}
                  </div>
                )}

                {/* Tambah Data Button */}
                <button
                  type="button"
                  onClick={handleAddData}
                  disabled={isLoading}
                  className="w-full mt-3 bg-white border border-primary text-primary hover:bg-primary-50
                    font-medium py-1.5 px-3 rounded-lg transition-colors text-xs
                    disabled:opacity-60 disabled:cursor-not-allowed text-center"
                >
                  + Tambah Data Desa
                </button>

                {/* Manual Data List Summary */}
                {manualDataList.length > 0 && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <h3 className="text-[10px] font-semibold text-slate-500 mb-2">Data Ditambahkan ({manualDataList.length})</h3>
                    <ul className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {manualDataList.map((item, idx) => {
                        const vName = masterVillages.find((v) => v.id === item.villageId)?.name;
                        return (
                          <li key={idx} className="text-[11px] flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded-md">
                            <span className="text-slate-700 truncate">{vName}</span>
                            <button
                              type="button"
                              onClick={() => setManualDataList((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-danger hover:text-red-700 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={() => {
                if (inputType === "manual") {
                  onCalculate(manualDataList, selectedWeightId);
                } else {
                  onCalculate();
                }
              }}
              disabled={isLoading || (inputType === "manual" && manualDataList.length < 2)}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light
                text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm
                disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md
                active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Analisis Prioritas</span>
                </>
              )}
            </button>
          </div>

          {/* Status summary */}
          {isCalculated && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Ringkasan</h3>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="text-center p-1.5 bg-white rounded-md border border-slate-200">
                  <div className="text-base font-bold text-danger">8</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Sangat Prioritas</div>
                </div>
                <div className="text-center p-1.5 bg-white rounded-md border border-slate-200">
                  <div className="text-base font-bold text-warning">12</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Prioritas Sedang</div>
                </div>
                <div className="text-center p-1.5 bg-white rounded-md border border-slate-200">
                  <div className="text-base font-bold text-success">10</div>
                  <div className="text-[9px] text-slate-500 leading-tight">Prioritas Rendah</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mx-4" />

        {/* Detail Panel */}
        <div className="px-4 py-3 flex-1">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Detail Desa</h2>

          {selectedVillage ? (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{selectedVillage.name}</h3>
                  <p className="text-[11px] text-slate-500">Kec. {selectedVillage.district}</p>
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: getStatusColor(selectedVillage.vScore) }}
                >
                  #{selectedVillage.ranking}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">V-Score</span>
                  <span className="text-sm font-bold" style={{ color: getStatusColor(selectedVillage.vScore) }}>
                    {selectedVillage.vScore.toFixed(2)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedVillage.vScore * 100}%`,
                      backgroundColor: getStatusColor(selectedVillage.vScore),
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Status</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(selectedVillage.vScore) + "18",
                      color: getStatusColor(selectedVillage.vScore),
                    }}
                  >
                    {getStatusLabel(selectedVillage.vScore)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Koordinat</span>
                  <span className="text-[11px] font-mono text-slate-600">
                    {selectedVillage.lat.toFixed(3)}, {selectedVillage.lng.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-xl p-5 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
              <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-xs text-slate-400">
                {isCalculated
                  ? "Klik marker pada peta atau baris pada tabel untuk melihat detail desa."
                  : "Jalankan simulasi terlebih dahulu untuk melihat data desa."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <p className="text-[10px] text-slate-400 text-center">
            DSS Stunting v1.0 — Kabupaten Jember © 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
