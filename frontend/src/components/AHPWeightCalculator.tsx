import { useState } from "react";
import {
  criteriaDefinitions,
  type MasterWeights,
  type WeightFormat,
} from "../data/master";
import { calculateAhpWeights } from "../lib/decision";

const SCALES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface PreferenceState {
  value: number;
  side: "left" | "right" | null;
}

interface AHPWeightCalculatorProps {
  initialFormat?: WeightFormat | null;
  onSave: (
    name: string,
    weights: MasterWeights,
    preferences: Record<string, PreferenceState>,
    id?: number,
    cr?: number,
  ) => void;
  onCancel: () => void;
}

export default function AHPWeightCalculator({
  initialFormat,
  onSave,
  onCancel,
}: AHPWeightCalculatorProps) {
  const [formatName, setFormatName] = useState(initialFormat?.name || "");
  const criteria = criteriaDefinitions;
  const n = criteria.length;


  let basePreferences: Record<string, PreferenceState> = {};
  if (initialFormat?.ahpPreferences) {
    basePreferences = { ...initialFormat.ahpPreferences };
  } else {
    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        basePreferences[`${i}-${j}`] = { value: 1, side: null };
      }
    }
  }

  const [preferences, setPreferences] = useState(basePreferences);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrefChange = (
    i: number,
    j: number,
    data: Partial<PreferenceState>,
  ) => {
    setPreferences((previous) => ({
      ...previous,
      [`${i}-${j}`]: { ...previous[`${i}-${j}`], ...data },
    }));
    setErrorMsg("");
  };

  const computeAHP = async () => {
    if (!formatName.trim()) {
      setErrorMsg("Harap masukkan nama format.");
      return;
    }

    try {
      setIsSubmitting(true);
      const comparisons = [];

      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          const preference = preferences[`${i}-${j}`];
          const leftCriterion = criteria[i];
          const rightCriterion = criteria[j];

          if (preference.side === "right") {
            comparisons.push({
              left: rightCriterion.id,
              right: leftCriterion.id,
              value: preference.value,
            });
          } else {
            comparisons.push({
              left: leftCriterion.id,
              right: rightCriterion.id,
              value: preference.value,
            });
          }
        }
      }


      const result = await calculateAhpWeights(criteria, comparisons);

      if (!result.consistency.isConsistent) {
        setErrorMsg(
          `Tidak lolos uji konsistensi (CR = ${result.consistency.cr.toFixed(3)}). ${result.consistency.note || "Silakan cek ulang perbandingan Anda."}`,
        );
        return;
      }


      onSave(formatName, result.weights, preferences, initialFormat?.id, result.consistency.cr);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghitung bobot AHP dari backend.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelText = (i: number, j: number, preference: PreferenceState) => {
    if (preference.side === null || preference.value === 1) {
      return "Sama pentingnya. Klik salah satu kriteria jika ada yang lebih dominan.";
    }

    const dominantLabel =
      preference.side === "left" ? criteria[i].label : criteria[j].label;
    const secondaryLabel =
      preference.side === "left" ? criteria[j].label : criteria[i].label;

    if (preference.value >= 8) {
      return `${dominantLabel} mutlak lebih penting dari ${secondaryLabel}`;
    }
    if (preference.value >= 6) {
      return `${dominantLabel} sangat lebih penting dari ${secondaryLabel}`;
    }
    if (preference.value >= 4) {
      return `${dominantLabel} lebih penting dari ${secondaryLabel}`;
    }

    return `${dominantLabel} sedikit lebih penting dari ${secondaryLabel}`;
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[10020] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {initialFormat
              ? "Edit data nilai pembobotan"
              : "Tambah data nilai pembobotan baru"}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
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

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nama format
            </label>
            <input
              type="text"
              value={formatName}
              onChange={(event) => setFormatName(event.target.value)}
              className="w-full text-sm border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-colors focus:bg-primary/5"
              placeholder="Contoh: Pembobotan Sensitif AHP"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Matriks perbandingan
            </h3>
            <div className="space-y-6">
              {Array.from({ length: n }).map((_, i) =>
                Array.from({ length: n }).map((__, j) => {
                  if (j <= i) return null;
                  const preference = preferences[`${i}-${j}`] || { value: 1, side: null };

                  return (
                    <div key={`${i}-${j}`} className="flex flex-col items-center">
                      <div className="flex items-center justify-center gap-4 w-full">
                        <button
                          onClick={() =>
                            handlePrefChange(i, j, {
                              side: "left",
                              value:
                                preference.value === 1 ? 3 : preference.value,
                            })
                          }
                          className={`w-36 py-2 px-2 text-xs font-semibold border-2 rounded-xl text-center transition-all cursor-pointer ${
                            preference.side === "left"
                              ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {criteria[i].label}
                        </button>

                        <div className="flex items-center gap-1 border-2 border-slate-200 rounded-lg p-1 bg-slate-50">
                          {SCALES.map((scale) => {
                            const isDisabled =
                              preference.side === null && scale !== 1;
                            return (
                              <button
                                key={scale}
                                disabled={isDisabled}
                                onClick={() => {
                                  if (scale === 1) {
                                    handlePrefChange(i, j, {
                                      side: null,
                                      value: 1,
                                    });
                                  } else {
                                    handlePrefChange(i, j, { value: scale });
                                  }
                                }}
                                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all cursor-pointer ${
                                  isDisabled ? "opacity-30 cursor-not-allowed" : ""
                                } ${
                                  preference.value === scale && !isDisabled
                                    ? "bg-primary text-white shadow-sm"
                                    : !isDisabled
                                      ? "text-slate-500 hover:bg-slate-200"
                                      : "text-slate-500"
                                }`}
                              >
                                {scale}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() =>
                            handlePrefChange(i, j, {
                              side: "right",
                              value:
                                preference.value === 1 ? 3 : preference.value,
                            })
                          }
                          className={`w-36 py-2 px-2 text-xs font-semibold border-2 rounded-xl text-center transition-all cursor-pointer ${
                            preference.side === "right"
                              ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {criteria[j].label}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium text-center">
                        {labelText(i, j, preference)}
                      </p>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 text-center">
          {errorMsg && (
            <p className="text-red-500 text-xs font-bold mb-4 animate-in fade-in slide-in-from-bottom-2">
              {errorMsg}
            </p>
          )}
          <button
            onClick={computeAHP}
            disabled={isSubmitting}
            className="w-full max-w-sm mx-auto bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white font-bold py-3 px-6 rounded-xl transition-all uppercase tracking-wider text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Menghitung..." : "Hitung Bobot"}
          </button>
        </div>
      </div>
    </div>
  );
}
