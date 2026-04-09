import { useState, useCallback, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import RankingTable from "./components/RankingTable";
import { villagesData } from "./data/villages";
import type { Village } from "./data/villages";
import MasterDataModal from "./components/MasterDataModal";
import { defaultWeightFormats } from "./data/master";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<"login" | "register" | "app">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initialHistory = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(15, 30, 0, 0);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(9, 15, 0, 0);

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const pad = (n: number) => n.toString().padStart(2, '0');
    
    const formatTime = (d: Date) => `Analisis ${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    return [
      {
        id: "hist-1",
        label: formatTime(yesterday),
        results: [...villagesData],
      },
      {
        id: "hist-2",
        label: formatTime(twoDaysAgo),
        results: [...villagesData].map(v => ({...v, vScore: v.vScore * 0.85})).sort((a,b) => b.vScore - a.vScore).map((v, i) => ({...v, ranking: i + 1})),
      }
    ];
  }, []);

  const [history, setHistory] = useState(initialHistory);
  const [selectedHistoryId, setSelectedHistoryId] = useState(initialHistory[0].id);

  const villages = useMemo(() => {
    const selected = history.find(h => h.id === selectedHistoryId);
    return selected ? selected.results : [];
  }, [history, selectedHistoryId]);

  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculated, setIsCalculated] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [masterVillages, setMasterVillages] = useState<Village[]>(villagesData);
  const [masterWeights, setMasterWeights] = useState(defaultWeightFormats);
  const [isMasterModalOpen, setMasterModalOpen] = useState(false);

  const handleCalculate = useCallback((customData?: any[], weightId?: string) => {
    setIsLoading(true);
    setSelectedVillage(null);

    setTimeout(() => {
      let finalVillages = [...masterVillages];

      const activeWeightFormat = masterWeights.find(w => w.id === weightId) || masterWeights[0];
      const ws = activeWeightFormat.weights;

      if (customData && customData.length > 0) {
        // Create a map for quick lookup
        const customDataMap = new Map();
        customData.forEach(item => customDataMap.set(item.villageId, item));

        finalVillages = customData.map((data) => {
          const baseVillage = masterVillages.find(v => v.id === data.villageId)! || masterVillages[0];
          // Calculate mock score
          const rawScore = (
            data.komitmen * ws.komitmen +
            data.stunting * ws.stunting +
            data.prevalensi * ws.prevalensi +
            data.kemiskinan * ws.kemiskinan +
            (100 - data.remaja) * ws.remaja +
            data.jarak * ws.jarak + 
            data.tenagaKerja * ws.tenagaKerja
          );
          // normalize to 0-1 loosely
          const mockScore = Math.min(1, Math.max(0, rawScore / 100)); // just a mock calculation

          return {
            ...baseVillage,
            vScore: mockScore,
            // You can also add form fields to baseVillage if you want them reflected,
            // but for now we just change the score to show map updates.
          };
        });

        // re-rank
        finalVillages.sort((a, b) => b.vScore - a.vScore);
        finalVillages = finalVillages.map((v, i) => ({ ...v, ranking: i + 1 }));
      } else {
        // Original simulation
        finalVillages = [...masterVillages];
      }

      // Add to history
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const pad = (n: number) => n.toString().padStart(2, '0');
      const label = `Analisis ${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      
      const newHistoryId = `hist-${Date.now()}`;
      
      const newRecord = {
        id: newHistoryId,
        label,
        results: finalVillages
      };

      setHistory(prev => [newRecord, ...prev]);
      setSelectedHistoryId(newHistoryId);
      setIsCalculated(true);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleVillageSelect = useCallback((village: Village) => {
    setSelectedVillage(village);
  }, []);

  if (!isAuthenticated) {
    if (currentRoute === "login") {
      return (
        <Login 
          onLogin={() => {
            setIsAuthenticated(true);
            setCurrentRoute("app");
          }} 
          onNavigateToRegister={() => setCurrentRoute("register")} 
        />
      );
    }
    
    if (currentRoute === "register") {
      return (
        <Register 
          onNavigateToLogin={() => setCurrentRoute("login")} 
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-['Inter',sans-serif] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-[9998] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isLoading={isLoading}
        isCalculated={isCalculated}
        selectedVillage={selectedVillage}
        onCalculate={handleCalculate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        masterVillages={masterVillages}
        masterWeights={masterWeights}
        onOpenMasterModal={() => setMasterModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/60 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                Sistem Pendukung Keputusan — Intervensi Stunting
              </h1>
              <p className="text-[11px] text-slate-500">
                Prioritas Desa di Kabupaten Jember, Jawa Timur
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setCurrentRoute("login");
              }} 
              className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors ml-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area: Map + Table side by side on lg, stacked on sm */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden min-h-0">
          {/* Map Panel */}
          <div className="flex-1 min-h-[250px] lg:min-h-0 lg:min-w-0">
            <MapView
              villages={villages}
              selectedVillage={selectedVillage}
              onVillageSelect={handleVillageSelect}
              isCalculated={isCalculated}
            />
          </div>

          {/* Table Panel */}
          <div className="lg:w-[440px] xl:w-[500px] flex-shrink-0 min-h-[200px] lg:min-h-0 overflow-hidden">
            <RankingTable
              villages={villages}
              selectedVillage={selectedVillage}
              onVillageSelect={handleVillageSelect}
              isCalculated={isCalculated}
              historyOptions={history}
              selectedHistoryId={selectedHistoryId}
              onHistorySelect={setSelectedHistoryId}
            />
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-800">Menghitung Prioritas...</p>
            <p className="text-xs text-slate-500">Menganalisis data 30 desa</p>
          </div>
        </div>
      )}

      {/* Master Data Modal Overlay */}
      {isMasterModalOpen && (
        <MasterDataModal
          villages={masterVillages}
          setVillages={setMasterVillages}
          weights={masterWeights}
          setWeights={setMasterWeights}
          onClose={() => setMasterModalOpen(false)}
        />
      )}
    </div>
  );
}
