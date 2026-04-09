import { useEffect, useRef } from "react";
import type { Village } from "../data/villages";
import { getStatusColor, getStatusLabel } from "../data/villages";

interface RankingTableProps {
  villages: Village[];
  selectedVillage: Village | null;
  onVillageSelect: (village: Village) => void;
  isCalculated: boolean;
  historyOptions?: { id: string; label: string }[];
  selectedHistoryId?: string;
  onHistorySelect?: (id: string) => void;
}

export default function RankingTable({
  villages,
  selectedVillage,
  onVillageSelect,
  isCalculated,
  historyOptions,
  selectedHistoryId,
  onHistorySelect,
}: RankingTableProps) {
  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  // Hitung ringkasan prioritas
  const sangatPrioritas = villages.filter(v => v.vScore > 0.7).length;
  const prioritasSedang = villages.filter(v => v.vScore > 0.4 && v.vScore <= 0.7).length;
  const prioritasRendah = villages.filter(v => v.vScore <= 0.4).length;

  // Scroll to selected row
  useEffect(() => {
    if (selectedVillage) {
      const row = rowRefs.current.get(selectedVillage.id);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedVillage]);

  if (!isCalculated) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full">
        <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125" />
        </svg>
        <p className="text-sm text-slate-800 font-medium">Tabel Perankingan</p>
        <p className="text-xs text-slate-500 mt-1">Data akan muncul setelah simulasi dijalankan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Perankingan Desa</h2>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Klik baris untuk detail
            </div>
          </div>
          
          <div className="flex gap-1.5 text-center text-[10px]">
            <div className="px-2 py-1 bg-white rounded border border-slate-200 flex flex-col justify-center min-w-[70px]">
              <span className="font-bold text-danger block text-sm leading-tight">{sangatPrioritas}</span>
              <span className="text-slate-500 mt-0.5 whitespace-nowrap">Sangat Prioritas</span>
            </div>
            <div className="px-2 py-1 bg-white rounded border border-slate-200 flex flex-col justify-center min-w-[70px]">
              <span className="font-bold text-warning block text-sm leading-tight">{prioritasSedang}</span>
              <span className="text-slate-500 mt-0.5 whitespace-nowrap">Prioritas Sedang</span>
            </div>
            <div className="px-2 py-1 bg-white rounded border border-slate-200 flex flex-col justify-center min-w-[70px]">
              <span className="font-bold text-success block text-sm leading-tight">{prioritasRendah}</span>
              <span className="text-slate-500 mt-0.5 whitespace-nowrap">Prioritas Rendah</span>
            </div>
          </div>
        </div>

        {/* History Dropdown */}
        {historyOptions && historyOptions.length > 0 && (
          <div className="relative">
            <select
              className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-xs py-2 pl-3 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm font-medium transition-colors hover:border-slate-400"
              value={selectedHistoryId}
              onChange={(e) => onHistorySelect?.(e.target.value)}
            >
              {historyOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-600">
              <svg className="w-4 h-4 font-bold" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Table — fills remaining space */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
            <tr>
              <th className="text-left px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Desa</th>
              <th className="text-left px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Kecamatan</th>
              <th className="text-center px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">V-Score</th>
              <th className="text-center px-2 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {villages.map((village) => {
              const isSelected = selectedVillage?.id === village.id;
              const color = getStatusColor(village.vScore);

              return (
                <tr
                  key={village.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(village.id, el);
                  }}
                  onClick={() => onVillageSelect(village)}
                  className={`cursor-pointer transition-colors duration-150 border-b border-slate-100 last:border-b-0
                    ${isSelected
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-slate-50"
                    }`}
                >
                  <td className="px-4 py-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {village.ranking}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <div>
                      <span className={`font-medium text-xs ${isSelected ? "text-primary" : "text-slate-800"}`}>
                        {village.name}
                      </span>
                      <span className="block text-[10px] text-slate-500 xl:hidden">
                        {village.district}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-xs text-slate-500 hidden xl:table-cell">{village.district}</td>
                  <td className="px-2 py-2 text-center">
                    <span className="font-bold font-mono text-xs" style={{ color }}>
                      {village.vScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{
                        backgroundColor: color + "18",
                        color: color,
                      }}
                    >
                      {getStatusLabel(village.vScore)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
