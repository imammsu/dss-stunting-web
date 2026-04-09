import { useState } from "react";
import type { MasterWeights, WeightFormat } from "../data/master";

const CRITERIA = [
  { id: "komitmen", label: "Komitmen" },
  { id: "remaja", label: "Remaja" },
  { id: "stunting", label: "Stunting" },
  { id: "prevalensi", label: "Prevalensi" },
  { id: "kemiskinan", label: "Kemiskinan" },
  { id: "jarak", label: "Jarak" },
  { id: "tenagaKerja", label: "Tenaga Kerja" },
];

const SCALES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface AHPWeightCalculatorProps {
  initialFormat?: WeightFormat | null;
  onSave: (name: string, weights: MasterWeights, preferences: Record<string, { value: number; side: "left" | "right" | null }>, id?: string) => void;
  onCancel: () => void;
}

export default function AHPWeightCalculator({ initialFormat, onSave, onCancel }: AHPWeightCalculatorProps) {
  const [formatName, setFormatName] = useState(initialFormat?.name || "");
  const n = CRITERIA.length;
  
  // Initialize preferences for all n(n-1)/2 pairs
  let basePreferences: Record<string, { value: number; side: "left" | "right" | null }> = {};
  if (initialFormat?.ahpPreferences) {
    basePreferences = { ...initialFormat.ahpPreferences };
  } else {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        basePreferences[`${i}-${j}`] = { value: 1, side: null };
      }
    }
  }
  
  const [preferences, setPreferences] = useState(basePreferences);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePrefChange = (
    i: number, 
    j: number, 
    data: Partial<{ value: number; side: "left" | "right" | null }>
  ) => {
    setPreferences(prev => ({
      ...prev,
      [`${i}-${j}`]: { ...prev[`${i}-${j}`], ...data }
    }));
    setErrorMsg(""); // Clear error on change
  };

  const computeAHP = () => {
    if (!formatName.trim()) {
      setErrorMsg("Harap masukkan nama format.");
      return;
    }

    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(1));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pref = preferences[`${i}-${j}`];
        if (pref.side === "right") {
          matrix[j][i] = pref.value;
          matrix[i][j] = 1 / pref.value;
        } else {
          matrix[i][j] = pref.value;
          matrix[j][i] = 1 / pref.value;
        }
      }
    }

    const colSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSums[j] += matrix[i][j];
      }
    }

    const weights = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let rowSum = 0;
      for (let j = 0; j < n; j++) {
        rowSum += matrix[i][j] / colSums[j];
      }
      weights[i] = rowSum / n;
    }

    let lambdaMax = 0;
    for (let i = 0; i < n; i++) {
      let wsv = 0;
      for (let j = 0; j < n; j++) {
        wsv += matrix[i][j] * weights[j];
      }
      lambdaMax += wsv / weights[i];
    }
    lambdaMax /= n;

    const ci = (lambdaMax - n) / (n - 1);
    const ri = 1.32; // RI for n=7
    const cr = ci / ri;

    if (cr > 0.1) {
      setErrorMsg(`Tidak lolos Uji konsistensi (CR = ${cr.toFixed(2)} > 0.1). Saran perbaikan: Cek kembali perbandingan yang memiliki nilai ekstrim (misal 9 atau 8) dan pastikan logika transititas terpenuhi (misal: jika A > B, dan B > C, maka A harus > C). Hindari nilai saling bertentangan.`);
      return;
    }

    // Pass and save
    const compiledWeights: MasterWeights = {
      komitmen: Number(weights[0].toFixed(3)),
      remaja: Number(weights[1].toFixed(3)),
      stunting: Number(weights[2].toFixed(3)),
      prevalensi: Number(weights[3].toFixed(3)),
      kemiskinan: Number(weights[4].toFixed(3)),
      jarak: Number(weights[5].toFixed(3)),
      tenagaKerja: Number(weights[6].toFixed(3)),
    };

    onSave(formatName, compiledWeights, preferences, initialFormat?.id);
  };

  const labelText = (i: number, j: number, pref: {value: number; side: "left"|"right"|null}) => {
    if (pref.side === null || pref.value === 1) return "Sama pentingnya (Klik salah satu kriteria jika ada yang lebih penting)";
    const dom = pref.side === "left" ? CRITERIA[i].label : CRITERIA[j].label;
    const sub = pref.side === "left" ? CRITERIA[j].label : CRITERIA[i].label;
    
    if (pref.value >= 8) return `${dom} mutlak lebih penting dari ${sub}`;
    if (pref.value >= 6) return `${dom} sangat lebih penting dari ${sub}`;
    if (pref.value >= 4) return `${dom} lebih penting dari ${sub}`;
    return `${dom} sedikit lebih penting dari ${sub}`;
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[10020] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">{initialFormat ? "Edit data nilai pembobotan" : "Tambah data nilai pembobotan baru"}</h2>
          <button 
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama format</label>
            <input 
              type="text" 
              value={formatName}
              onChange={(e) => setFormatName(e.target.value)}
              className="w-full text-sm border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary outline-none transition-colors focus:bg-primary/5" 
              placeholder="Cth: Pembobotan Sensitif AHP"
            />
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Matriks perbandingan</h3>
            <div className="space-y-6">
              {Array.from({length: n}).map((_, i) => 
                Array.from({length: n}).map((_, j) => {
                  if (j <= i) return null;
                  const pref = preferences[`${i}-${j}`];
                  
                  return (
                    <div key={`${i}-${j}`} className="flex flex-col items-center">
                      <div className="flex items-center justify-center gap-4 w-full">
                        {/* Left Criteria */}
                        <button
                          onClick={() => handlePrefChange(i, j, { side: "left", value: pref.value === 1 ? 3 : pref.value })}
                          className={`w-36 py-2 px-2 text-xs font-semibold border-2 rounded-xl text-center transition-all ${
                            pref.side === "left"
                              ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {CRITERIA[i].label}
                        </button>

                        {/* Scales 1 to 9 */}
                        <div className="flex items-center gap-1 border-2 border-slate-200 rounded-lg p-1 bg-slate-50">
                          {SCALES.map((scale) => {
                            const isDisabled = pref.side === null && scale !== 1;
                            return (
                              <button
                                key={scale}
                                disabled={isDisabled}
                                onClick={() => {
                                  if (scale === 1) {
                                    handlePrefChange(i, j, { side: null, value: 1 });
                                  } else {
                                    handlePrefChange(i, j, { value: scale });
                                  }
                                }}
                                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all ${
                                  isDisabled ? "opacity-30 cursor-not-allowed" : ""
                                } ${
                                  pref.value === scale && !isDisabled
                                    ? "bg-primary text-white shadow-sm"
                                    : !isDisabled ? "text-slate-500 hover:bg-slate-200" : "text-slate-500"
                                }`}
                              >
                                {scale}
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Criteria */}
                        <button
                          onClick={() => handlePrefChange(i, j, { side: "right", value: pref.value === 1 ? 3 : pref.value })}
                          className={`w-36 py-2 px-2 text-xs font-semibold border-2 rounded-xl text-center transition-all ${
                            pref.side === "right"
                              ? "border-primary bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                              : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {CRITERIA[j].label}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        {labelText(i, j, pref)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 text-center">
          {errorMsg && (
            <p className="text-red-500 text-xs font-bold mb-4 animate-in fade-in slide-in-from-bottom-2">
              {errorMsg}
            </p>
          )}
          <button 
            onClick={computeAHP}
            className="w-full max-w-sm mx-auto bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white font-bold py-3 px-6 rounded-xl transition-all uppercase tracking-wider text-sm shadow-md"
          >
            HITUNG BOBOT
          </button>
        </div>

      </div>
    </div>
  );
}
