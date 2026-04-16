import { useEffect, useMemo, useState } from "react";
import type { Village } from "../data/villages";
import type { WeightFormat } from "../data/master";

interface SidebarProps {
  isLoading: boolean;
  onCalculate: (customVillages?: Village[], weightId?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  masterVillages: Village[];
  masterWeights: WeightFormat[];
}

const createDraftFromVillage = (village?: Village): Village => ({
  id: village?.id ?? "temp-village",
  name: village?.name ?? "",
  district: village?.district ?? "",
  lat: village?.lat ?? -8.185,
  lng: village?.lng ?? 113.668,
  vScore: village?.vScore ?? 0,
  ranking: village?.ranking ?? 0,
  komitmen: village?.komitmen ?? 3,
  remaja: village?.remaja ?? 15,
  stunting: village?.stunting ?? 10,
  prevalensi: village?.prevalensi ?? 20,
  kemiskinan: village?.kemiskinan ?? 15,
  jarak: village?.jarak ?? 2,
  tenagaKerja: village?.tenagaKerja ?? 100,
});

export default function Sidebar({
  isLoading,
  onCalculate,
  isOpen,
  onToggle,
  masterVillages,
  masterWeights,
}: SidebarProps) {
  const [inputType, setInputType] = useState<"upload" | "manual">("upload");
  const [manualVillages, setManualVillages] = useState<Village[]>([]);
  const [selectedWeightId, setSelectedWeightId] = useState<string>(
    masterWeights[0]?.id || "",
  );
  const [duplicateError, setDuplicateError] = useState("");
  const [manualDraft, setManualDraft] = useState<Village>(() =>
    createDraftFromVillage(masterVillages[0]),
  );

  useEffect(() => {
    if (!masterWeights.some((weight) => weight.id === selectedWeightId)) {
      setSelectedWeightId(masterWeights[0]?.id || "");
    }
  }, [masterWeights, selectedWeightId]);

  useEffect(() => {
    if (!masterVillages.length) {
      return;
    }

    const selectedVillage = masterVillages.find(
      (village) => String(village.id) === String(manualDraft.id),
    );

    if (!selectedVillage) {
      setManualDraft(createDraftFromVillage(masterVillages[0]));
    }
  }, [manualDraft.id, masterVillages]);

  const manualVillageCountLabel = useMemo(() => manualVillages.length, [manualVillages]);

  const updateDraftField = (field: keyof Village, value: string | number) => {
    const nextValue =
      field === "name" || field === "district" ? value : Number(value);

    setManualDraft((previous) => ({
      ...previous,
      [field]: nextValue,
    }));
  };

  const handleVillageSelection = (selectedId: string) => {
    const village = masterVillages.find(
      (item) => String(item.id) === String(selectedId),
    );

    if (village) {
      setManualDraft(createDraftFromVillage(village));
    }
  };

  const handleAddData = () => {
    setDuplicateError("");

    if (
      manualVillages.some(
        (item) => String(item.id) === String(manualDraft.id),
      )
    ) {
      setDuplicateError("Desa ini sudah ditambahkan. Hindari data duplikat.");
      return;
    }

    setManualVillages((previous) => [
      ...previous,
      {
        ...manualDraft,
      },
    ]);
  };

  return (
    <aside
      className={`
        fixed lg:relative z-[9999] h-screen bg-white border-r border-slate-200 flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${
          isOpen
            ? "w-[300px] min-w-[300px] translate-x-0"
            : "w-0 min-w-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 border-r-0"
        }
      `}
    >
      <div className="w-[300px] min-w-[300px] h-full flex flex-col overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                DSS Stunting
              </h1>
              <p className="text-[11px] text-slate-500 leading-tight">
                Kabupaten Jember
              </p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors lg:hidden"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          <div>
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Input Simulasi
            </h2>

            <div className="mb-3">
              <label className="block text-[10px] font-medium text-slate-700 mb-1">
                Format Pembobotan
              </label>
              <select
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-primary transition-colors"
                value={selectedWeightId}
                onChange={(event) => setSelectedWeightId(event.target.value)}
                disabled={isLoading || !masterWeights.length}
              >
                {masterWeights.map((weight) => (
                  <option key={weight.id} value={weight.id}>
                    {weight.name}
                  </option>
                ))}
              </select>
            </div>

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

            {inputType === "upload" ? (
              <div className="mb-3">
                <button
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-xs shadow-sm flex justify-center items-center gap-1.5"
                  type="button"
                >
                  Download Template File
                </button>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 mt-3">
                  Upload Data Excel
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Parser file belum ditambahkan. Untuk saat ini tombol analisis akan
                  memakai data master yang sedang aktif.
                </p>
              </div>
            ) : (
              <div className="mb-3 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    Pilih Desa
                  </label>
                  <select
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-primary transition-colors"
                    value={String(manualDraft.id)}
                    onChange={(event) => handleVillageSelection(event.target.value)}
                    disabled={isLoading}
                  >
                    {masterVillages.map((village) => (
                      <option key={String(village.id)} value={String(village.id)}>
                        {village.name} ({village.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Komitmen (Skala 1-5)">
                      1. Komitmen
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={manualDraft.komitmen ?? 0}
                      onChange={(event) => updateDraftField("komitmen", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Persentase Remaja usia 15-24 (%)">
                      2. Remaja (%)
                    </label>
                    <input
                      type="number"
                      value={manualDraft.remaja ?? 0}
                      onChange={(event) => updateDraftField("remaja", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Anak Stunting (jiwa)">
                      3. Stunting
                    </label>
                    <input
                      type="number"
                      value={manualDraft.stunting ?? 0}
                      onChange={(event) => updateDraftField("stunting", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Prevalensi Stunting (%)">
                      4. Prevalensi (%)
                    </label>
                    <input
                      type="number"
                      value={manualDraft.prevalensi ?? 0}
                      onChange={(event) => updateDraftField("prevalensi", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Tingkat Kemiskinan (%)">
                      5. Kemiskinan (%)
                    </label>
                    <input
                      type="number"
                      value={manualDraft.kemiskinan ?? 0}
                      onChange={(event) => updateDraftField("kemiskinan", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jarak ke Puskesmas (Km)">
                      6. Jarak (Km)
                    </label>
                    <input
                      type="number"
                      value={manualDraft.jarak ?? 0}
                      onChange={(event) => updateDraftField("jarak", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Tenaga Kerja (orang)">
                      7. Tenaga Kerja (org)
                    </label>
                    <input
                      type="number"
                      value={manualDraft.tenagaKerja ?? 0}
                      onChange={(event) => updateDraftField("tenagaKerja", event.target.value)}
                      disabled={isLoading}
                      className="w-full text-xs font-medium border border-slate-300 rounded-lg px-2 py-1.5 bg-slate-50 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {duplicateError && (
                  <div className="mt-2 text-[10px] text-red-500 bg-red-50 p-1.5 rounded border border-red-100 text-center font-medium animate-in fade-in slide-in-from-top-1">
                    {duplicateError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddData}
                  disabled={isLoading}
                  className="w-full mt-3 bg-white border border-primary text-primary hover:bg-primary-50 font-medium py-1.5 px-3 rounded-lg transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed text-center"
                >
                  + Tambah Data Desa
                </button>

                {manualVillages.length > 0 && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <h3 className="text-[10px] font-semibold text-slate-500 mb-2">
                      Data Ditambahkan ({manualVillageCountLabel})
                    </h3>
                    <ul className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {manualVillages.map((item, index) => (
                        <li
                          key={String(item.id)}
                          className="text-[11px] flex justify-between items-center bg-white border border-slate-100 p-1.5 rounded-md"
                        >
                          <span className="text-slate-700 truncate">{item.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setManualVillages((previous) =>
                                previous.filter((_, currentIndex) => currentIndex !== index),
                              )
                            }
                            className="text-danger hover:text-red-700 transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => {
                if (inputType === "manual") {
                  onCalculate(manualVillages, selectedWeightId);
                } else {
                  onCalculate(undefined, selectedWeightId);
                }
              }}
              disabled={
                isLoading ||
                !masterWeights.length ||
                (inputType === "manual" && manualVillages.length < 2)
              }
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Menghitung...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Analisis Prioritas</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 mx-4" />

        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <p className="text-[10px] text-slate-400 text-center">
            DSS Stunting v1.0 - Kabupaten Jember 2026
          </p>
        </div>
      </div>
    </aside>
  );
}
