/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import type { Village } from "../data/villages";
import type { WeightFormat } from "../data/master";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { BackendPembobotan } from "@/lib/mappers";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { downloadCsvTemplate, uploadCsvForValidation } from "@/lib/csv";

interface SidebarProps {
  isLoading: boolean;
  onCalculate: (customVillages?: Village[], weightId?: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  masterVillages: Village[];
  masterWeights: WeightFormat[];
  masterPembobotan: BackendPembobotan[];
}

const createDraftFromVillage = (village?: Village): Village => ({
  id: village?.id ?? -1,
  name: village?.name ?? "",
  district: village?.district ?? "",
  lat: village?.lat ?? -8.185,
  lng: village?.lng ?? 113.668,
  values: village?.values ?? {},
});


/// Start Here
export default function Sidebar({
  isLoading,
  onCalculate,
  isOpen,
  onToggle,
  masterVillages,
  masterWeights,
  masterPembobotan,
}: SidebarProps) {
  const [inputType, setInputType] = useState<"upload" | "manual">("manual");
  const [manualVillages, setManualVillages] = useState<Village[]>([]);
  const [selectedWeightId, setSelectedWeightId] = useState<number>(
    masterPembobotan[0]?.id || 0,
  );
  const [selectedVillageId, setSelectedVillageId] = useState<number>(() => {
    const saved = localStorage.getItem("selectedVillageId");
    return saved ? Number(saved) : -1;
  });
  const [duplicateError, setDuplicateError] = useState("");
  const [manualDraft, setManualDraft] = useState<Village>(() =>
    createDraftFromVillage(),
  );
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");

  useEffect(() => {
    if (!masterWeights.some((weight) => weight.id === selectedWeightId)) {
      setSelectedWeightId(masterWeights[0]?.id || 0);
    }
  }, [masterWeights, selectedWeightId]);

  useEffect(() => {
    if (selectedVillageId === -1) {
      localStorage.removeItem("selectedVillageId");
    } else {
      localStorage.setItem("selectedVillageId", String(selectedVillageId));
    }
  }, [selectedVillageId]);

  useEffect(() => {
    if (!masterVillages.length) {
      return;
    }

    const selectedVillage = masterVillages.find(
      (village) => String(village.id) === String(selectedVillageId),
    );

    if (selectedVillage) {
      setManualDraft(createDraftFromVillage(selectedVillage)); // ← auto populate draft
    } else {
      setSelectedVillageId(-1);
      setManualDraft(createDraftFromVillage());
    }
  }, [manualDraft.id, masterVillages]);

  const manualVillageCountLabel = useMemo(() => manualVillages.length, [manualVillages]);

  const updateDraftField = (key: string, value: string) => {

    setManualDraft((previous) => ({
      ...previous,
      values: {
        ...previous.values,
        [key]: value === "" ? undefined : Number(value),
      },
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
        fixed lg:relative z-[10] h-screen bg-white border-r border-slate-200 flex flex-col
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
            <div className="flex flex-row items-center gap-2">
              <div className="aspect-square">
                <img src="/favicon.png" className="max-w-8 " />
              </div>
              <div className="h-fit">
                <h1 className="text-sm font-bold text-slate-800 leading-tight">
                  DSS Stunting
                </h1>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Kabupaten Jember
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors lg:hidden cursor-pointer"
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


            <div className="h-[1px] bg-slate-300 mb-3"></div>
          
            <div className="mb-3 ">
              <label className="block text-[10px] font-medium text-slate-700 mb-1">
                Pilih Format Pembobotan <span className="text-destructive">*</span>
              </label>
              {/* <select
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 outline-none focus:border-primary transition-colors"
                value={selectedWeightId}
                onChange={(event) => setSelectedWeightId(Number(event.target.value))}
                disabled={isLoading || !masterWeights.length}
              >
                {masterWeights.map((weight) => (
                  <option key={weight.id} value={weight.id}>
                    {weight.name}
                  </option>
                ))}
              </select> */}
              <Select
                value={String(selectedWeightId)}
                onValueChange={(value) => setSelectedWeightId(Number(value))}
                disabled={isLoading || !masterPembobotan.length}
                >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Pilih Format Pembobotan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Format Pembobotan</SelectLabel>
                    {masterPembobotan.map((weight) => (
                      <SelectItem key={weight.id} value={String(weight.id)}>
                        {weight.pembobotan_nama}
                      </SelectItem>
                    ))}
                    
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <label className="block text-[10px] font-medium text-slate-700 mb-1">
                Pilih Mode Penilaian
              </label>  
            <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setInputType("manual")}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors cursor-pointer ${
                  inputType === "manual"
                    ? "bg-white shadow-sm font-medium text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Input Manual
              </button>
              <button
                type="button"
                onClick={() => setInputType("upload")}
                className={`flex-1 text-xs py-1.5 rounded-md transition-colors cursor-pointer ${
                  inputType === "upload"
                    ? "bg-white shadow-sm font-medium text-slate-800"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload File
              </button>
            </div>

            {inputType === "upload" ? (
              <div className="mb-3">
                <button
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-xs shadow-sm flex justify-center items-center gap-1.5 cursor-pointer"
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadCsvTemplate();
                    } catch (error: any) {
                      alert(error.message || "Gagal mengunduh template.");
                    }
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Template CSV
                </button>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 mt-3">
                  Upload Data CSV
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    className="block w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer file:transition-colors bg-slate-50 border border-slate-300 rounded-lg cursor-pointer"
                    disabled={isLoading || csvLoading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCsvErrors([]);
                      setCsvFileName(file.name);
                      setCsvLoading(true);
                      try {
                        const text = await file.text();
                        const result = await uploadCsvForValidation(text);
                        if (result.errors && result.errors.length > 0) {
                          setCsvErrors(result.errors);
                        } else {
                          setManualVillages(result.villages);
                          setCsvErrors([]);
                          setCsvFileName("");
                        }
                      } catch (error: any) {
                        setCsvErrors([error.message || "Gagal memvalidasi file CSV."]);
                      } finally {
                        setCsvLoading(false);
                        // Reset file input
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
                {csvLoading && (
                  <p className="mt-1.5 text-[10px] text-primary font-medium animate-pulse">
                    Memvalidasi file CSV...
                  </p>
                )}
                {csvErrors.length > 0 && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2 max-h-[120px] overflow-y-auto">
                    <p className="text-[10px] font-semibold text-red-700 mb-1">Validasi gagal:</p>
                    <ul className="space-y-0.5">
                      {csvErrors.map((err, i) => (
                        <li key={i} className="text-[10px] text-red-600">• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!csvLoading && csvErrors.length === 0 && manualVillages.length > 0 && csvFileName === "" && (
                  <p className="mt-1.5 text-[10px] text-green-600 font-medium">
                    ✓ {manualVillages.length} data desa berhasil dimuat dari CSV.
                  </p>
                )}
                <p className="mt-1 text-[10px] text-slate-400">
                  File CSV harus sesuai template. Semua desa harus terdaftar di Master Data.
                </p>
              </div>
            ) : (
              <div className="mb-3 space-y-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-slate-700 mb-1">
                    Pilih Desa <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={selectedVillageId === -1 ? undefined : String(selectedVillageId)}
                    onValueChange={(value) => {
                      setSelectedVillageId(Number(value));
                      handleVillageSelection(value);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Pilih Desa"></SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Desa</SelectLabel>
                        {masterVillages.map((village) => (
                          <SelectItem
                            key={String(village.id)} value={String(village.id)}
                          >
                            {village.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <label className="block text-[10px] font-medium text-slate-700 mt-3 mb-3">
                    Masukkan Nilai Kriteria Desa
                  </label>
                <div className="">
                  {}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          1. Komitmen (1-5) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["1"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("1", e.target.value)} type="number" min={1} max={5} >
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          2. Remaja (%) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["2"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("2", e.target.value)} type="number" min={0} max={100} >
                        </Input>
                      </Field>
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          3. Stunting (org) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["3"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("3", e.target.value)} type="number" min={0} >
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          4. Prevalensi Stunting (%) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["4"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("4", e.target.value)} type="number" min={0} >
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          5. Tingkat kemiskinan (%) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["5"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("5", e.target.value)} type="number" min={0} >
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          6. Jarak Fasilitas (km) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["6"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("6", e.target.value)} type="number" min={0} >
                        </Input>
                      </Field>
                      
                    </div>
                    <div className="col-span-2">
                      <Field className="gap-2">
                        <FieldLabel className="block text-[10px] font-medium text-slate-700 ">
                          7. Tenaga kerja Medis (org) <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Input value={manualDraft.values["7"] ?? ""} required className="w-full text-xs" disabled={isLoading} onChange={(e) => updateDraftField("7", e.target.value)} type="number" min={0} >
                        </Input>
                      </Field>
                    </div>
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
                  className="w-full mt-3 bg-white border border-primary text-primary hover:bg-primary-50 font-medium py-1.5 px-3 rounded-lg transition-colors text-xs disabled:opacity-60 disabled:cursor-not-allowed text-center cursor-pointer"
                >
                  + Tambah ke data analisis
                </button>

                {manualVillages.length > 0 && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2">
                    <h3 className="text-[10px] font-semibold text-slate-500 mb-2">
                      Alternatif Desa Siap Analisis ({manualVillageCountLabel})
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
                            className="text-danger hover:text-red-700 transition-colors cursor-pointer"
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
                if (inputType === "manual" || (inputType === "upload" && manualVillages.length > 0)) {
                  onCalculate(manualVillages, selectedWeightId);
                  setManualVillages([]);
                } else {
                  onCalculate(undefined, selectedWeightId);
                }
              }}
              disabled={
                isLoading ||
                !masterWeights.length ||
                ((inputType === "manual" || inputType === "upload") && manualVillages.length < 2)
              }
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
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

        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 w-full text-center">
          <p className="text-[10px] text-slate-400 text-center">
            DSS Stunting v1.0 - Kabupaten Jember 2026
          </p>
        </div>
      </div>
    </aside>
  );
}