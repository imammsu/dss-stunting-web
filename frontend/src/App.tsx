/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useMemo, useState } from "react";
import Login from "./components/Login";
import MapView from "./components/MapView";
import MasterDataModal from "./components/MasterDataModal";
import RankingTable from "./components/RankingTable";
import Register from "./components/Register";
import Sidebar from "./components/Sidebar";
import {
  criteriaDefinitions,
  defaultWeightFormats,
  type WeightFormat,
} from "./data/master";
import { villagesData, type Village } from "./data/villages";
import { getStoredSession } from "./lib/api";
import {
  getCurrentUser,
  loginWithPassword,
  logoutFromApp,
  registerWithPassword,
} from "./lib/auth";
import { rankVillagesWithTopsis, fetchRiwayatList, fetchRiwayatDetail, deleteRiwayatApi, type RiwayatListItem } from "./lib/decision";
import {
  fetchBootstrapData,
  fetchPembobotan,
} from "./lib/master";
import {
  mapAlternativeToVillages,
  type BackendCriterion,
  type BackendPembobotan,
} from "./lib/mappers";

interface HistoryRecord {
  id: string;
  label: string;
  results: Village[];
}

interface AppNotice {
  type: "success" | "error" | "info";
  message: string;
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const buildAnalysisLabel = (date = new Date()) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `Analisis ${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const createHistoryRecord = (results: Village[], customLabel?: string, customId?: string): HistoryRecord => ({
  id: customId ?? `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: customLabel || buildAnalysisLabel(),
  results,
});

const seedResults = [...villagesData]
  // .sort((left, right) => right.vScore - left.vScore)
  .map((village, index) => ({
    ...village,
    ranking: index + 1,
  }));

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<"login" | "register" | "app">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisCount, setAnalysisCount] = useState(seedResults.length);
  const [masterVillages, setMasterVillages] = useState<Village[]>(villagesData);
  const [masterCriteria, setMasterCriteria] = useState<BackendCriterion[]>(criteriaDefinitions);
  const [masterPembobotan, setMasterPembobotan] = useState<BackendPembobotan[]>([]);
  const [masterWeights, setMasterWeights] = useState<WeightFormat[]>(defaultWeightFormats);
  const [isMasterModalOpen, setMasterModalOpen] = useState(false);
  const [dataSourceLabel, setDataSourceLabel] = useState("Belum dimuat");
  /** Daftar sesi riwayat dari DB — digunakan untuk dropdown di RankingTable */
  const [riwayatList, setRiwayatList] = useState<RiwayatListItem[]>([]);
  /** true saat sedang fetch detail sesi lama dari DB */
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const pushNotice = useCallback((message: string, type: AppNotice["type"] = "info") => {
    setNotice({ message, type });
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const villages = useMemo(() => {
    const selectedHistory = history.find((item) => item.id === selectedHistoryId);
    return selectedHistory ? selectedHistory.results : [];
  }, [history, selectedHistoryId]);

  useEffect(() => {
    if (
      selectedVillage &&
      !villages.some((village) => String(village.id) === String(selectedVillage.id))
    ) {
      setSelectedVillage(null);
    }
  }, [selectedVillage, villages]);

  const applyFallbackData = useCallback((message?: string) => {
    const fallbackRecord = createHistoryRecord(seedResults, "Mode data lokal frontend");
    setMasterVillages(villagesData);
    setMasterWeights(defaultWeightFormats);
    setHistory([fallbackRecord]);
    setSelectedHistoryId(fallbackRecord.id);
    setIsCalculated(true);
    setDataSourceLabel("Fallback data lokal frontend");
    if (message) {
      pushNotice(message, "info");
    }
  }, [pushNotice]);

  const loadBootstrap = useCallback(async (showSuccessMessage = false) => {
    try {
      const bootstrap = await fetchBootstrapData();
      const villagesFromBackend = bootstrap.alternatives.map((alternative) =>
        mapAlternativeToVillages(alternative),
      );

      if (!villagesFromBackend.length) {
        applyFallbackData("Backend aktif, tetapi tabel alternatif masih kosong. Menggunakan data lokal sementara.");
        return;
      }

      const pembobotan = await fetchPembobotan();
      setMasterVillages(villagesFromBackend);
      setMasterCriteria(bootstrap.criteria);
      setDataSourceLabel("Supabase melalui backend Express");
      setMasterPembobotan(pembobotan);

      // Auto-load riwayat terbaru dari DB
      try {
        const riwayat = await fetchRiwayatList();
        setRiwayatList(riwayat);
        if (riwayat.length > 0) {
          const latest = riwayat[0];
          const detail = await fetchRiwayatDetail(latest.id);
          const record: HistoryRecord = {
            id: String(latest.id),
            label: latest.nama_sesi,
            results: detail.villages,
          };
          setHistory([record]);
          setSelectedHistoryId(record.id);
          setIsCalculated(true);
        }
      } catch {
        // Belum ada riwayat — biarkan kosong, bukan error fatal
      }

      if (showSuccessMessage) {
        pushNotice("Data backend berhasil dimuat.", "success");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? `${error.message} Menggunakan data lokal sementara.`
          : "Gagal memuat data backend. Menggunakan data lokal sementara.";
      applyFallbackData(message);
    }
  }, [applyFallbackData, pushNotice]);

  useEffect(() => {
    const initializeSession = async () => {
      const storedSession = getStoredSession();

      if (!storedSession) {
        setIsAuthBootstrapping(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        setUserName(String(user.user_metadata?.full_name || ""));
        setUserEmail(user.email || storedSession.user?.email || "");
        setIsAuthenticated(true);
        setCurrentRoute("app");
        await loadBootstrap();
      } catch (_error) {
        logoutFromApp();
        setIsAuthenticated(false);
        setCurrentRoute("login");
        pushNotice("Session sebelumnya sudah tidak valid. Silakan login lagi.", "info");
      } finally {
        setIsAuthBootstrapping(false);
      }
    };

    void initializeSession();
  }, [loadBootstrap, pushNotice]);

  const handleCalculate = useCallback(
    async (customVillages?: Village[], weightId?: number) => {
      // masterPembobotan adalah sumber kebenaran — ID-nya = id_pembobotan_kriteria di DB
      const activeWeight =
        masterPembobotan.find((p) => p.id === weightId) || masterPembobotan[0];

      const villagesToAnalyze =
        customVillages && customVillages.length > 0 ? customVillages : masterVillages;

      if (!activeWeight) {
        pushNotice("Belum ada format pembobotan yang tersedia.", "error");
        return;
      }

      if (villagesToAnalyze.length < 2) {
        pushNotice("Minimal dibutuhkan 2 desa untuk dilakukan ranking.", "error");
        return;
      }

      try {
        setIsLoading(true);
        setAnalysisCount(villagesToAnalyze.length);
        setSelectedVillage(null);

        const sessionName = `${activeWeight.pembobotan_nama} - ${new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;

        const result = await rankVillagesWithTopsis(
          villagesToAnalyze,
          activeWeight,
          masterCriteria,
          true,
          sessionName,
        );

        // Gunakan DB ID (integer) sebagai ID record agar handleHistorySelect
        // bisa memanggil fetchRiwayatDetail(Number(id)) tanpa NaN
        const recordId = result.dbId ? String(result.dbId) : `hist-${Date.now()}`;
        const newRecord = createHistoryRecord(result.villages, sessionName, recordId);

        setHistory((previous) => [newRecord, ...previous]);
        setSelectedHistoryId(newRecord.id);
        setIsCalculated(true);
        // Update dropdown dengan DB ID yang benar
        if (result.dbId) {
          setRiwayatList((prev) => [{
            id: result.dbId!,
            nama_sesi: sessionName,
            created_at: new Date().toISOString(),
            nama_pembobotan: null,
          }, ...prev]);
        }
        pushNotice("Perankingan TOPSIS berhasil dihitung dan disimpan.", "success");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Perhitungan TOPSIS gagal dijalankan.";
        pushNotice(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [masterVillages, masterCriteria, masterPembobotan, pushNotice],
  );

  const handleVillageSelect = useCallback((village: Village) => {
    setSelectedVillage(village);
  }, []);

  /** Dipanggil saat user memilih sesi riwayat dari dropdown */
  const handleHistorySelect = useCallback(async (id: string) => {
    // Gunakan cache jika sudah ada
    const cached = history.find((h) => h.id === id);
    if (cached) {
      setSelectedHistoryId(id);
      setSelectedVillage(null);
      return;
    }
    // Fetch dari DB
    try {
      setIsLoadingHistory(true);
      const detail = await fetchRiwayatDetail(Number(id));
      const record: HistoryRecord = {
        id,
        label: detail.nama_sesi,
        results: detail.villages,
      };
      setHistory((prev) => [...prev, record]);
      setSelectedHistoryId(id);
      setSelectedVillage(null);
    } catch {
      pushNotice("Gagal memuat detail riwayat.", "error");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [history, pushNotice]);

  const handleDeleteRiwayat = useCallback(async (id: string) => {
    try {
      await deleteRiwayatApi(Number(id));
      // Hapus dari riwayatList
      setRiwayatList((prev) => prev.filter((r) => String(r.id) !== id));
      // Hapus dari history cache
      setHistory((prev) => prev.filter((h) => h.id !== id));
      // Pilih riwayat lain jika yang dihapus sedang dipilih
      if (selectedHistoryId === id) {
        const remaining = riwayatList.filter((r) => String(r.id) !== id);
        if (remaining.length > 0) {
          setSelectedHistoryId(String(remaining[0].id));
        } else {
          setSelectedHistoryId("");
          setIsCalculated(false);
        }
      }
      pushNotice("Riwayat berhasil dihapus.", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus riwayat.";
      pushNotice(message, "error");
    }
  }, [riwayatList, selectedHistoryId, pushNotice]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const session = await loginWithPassword(email, password);
      setUserName(String(session.user?.user_metadata?.full_name || ""));
      setUserEmail(session.user?.email || email);
      setIsAuthenticated(true);
      setCurrentRoute("app");
      await loadBootstrap(true);
    },
    [loadBootstrap],
  );

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    await registerWithPassword(name, email, password);
  }, []);

  const handleLogout = useCallback(() => {
    logoutFromApp();
    setIsAuthenticated(false);
    setCurrentRoute("login");
    setHistory([]);
    setSelectedHistoryId("");
    setSelectedVillage(null);
    setIsCalculated(false);
    setUserName("");
    setUserEmail("");
    pushNotice("Anda sudah logout dari aplikasi.", "info");
  }, [pushNotice]);

  if (isAuthBootstrapping) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-800">Memeriksa sesi login...</p>
          <p className="text-xs text-slate-500">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (currentRoute === "login") {
      return (
        <Login
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentRoute("register")}
        />
      );
    }

    return (
      <Register
        onRegister={handleRegister}
        onNavigateToLogin={() => setCurrentRoute("login")}
      />
    );
  }

  const rankedVillages = villages.map(v => ({
    ...v,
    vScore: v.vScore ?? 0,
    ranking: v.ranking ?? 0,
  }));


  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-[10] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isLoading={isLoading}
        onCalculate={handleCalculate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
        masterVillages={masterVillages}
        masterWeights={masterWeights}
        masterPembobotan={masterPembobotan}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/60 shadow-sm flex-shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen((value) => !value)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">
                Sistem Pendukung Keputusan - Intervensi Stunting
              </h1>
              <p className="text-[11px] text-slate-500 truncate">
                Prioritas desa, auth Supabase, dan perhitungan AHP-TOPSIS via backend Express
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden xl:block text-right mr-2">
              <p className="text-[11px] font-semibold text-slate-700">
                {userName || userEmail || "User aktif"}
              </p>
              <p className="text-[10px] text-slate-500">{dataSourceLabel}</p>
            </div>
            <button
              onClick={() => setMasterModalOpen(true)}
              className="text-[11px] font-bold px-3 py-1.5 bg-primary text-white hover:bg-primary-light rounded-lg transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Master Data
            </button>
            <button
              onClick={handleLogout}
              className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {notice && (
          <div className="px-3 pt-3 flex-shrink-0">
            <div
              className={`rounded-xl border px-4 py-2.5 text-sm shadow-sm ${notice.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : notice.type === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-sky-50 border-sky-200 text-sky-700"
                }`}
            >
              {notice.message}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 overflow-hidden min-h-0">
          <div className="flex-1 min-h-[250px] lg:min-h-0 lg:min-w-0">
            <MapView
              villages={villages}
              selectedVillage={selectedVillage}
              onVillageSelect={handleVillageSelect}
              isCalculated={isCalculated}
            />
          </div>

          <div className="lg:w-[440px] xl:w-[500px] flex-shrink-0 min-h-[200px] lg:min-h-0 overflow-hidden">
            <RankingTable
              villages={rankedVillages}
              selectedVillage={selectedVillage}
              onVillageSelect={handleVillageSelect}
              isCalculated={isCalculated}
              historyOptions={riwayatList.map((r) => ({ id: String(r.id), label: r.nama_sesi }))}
              selectedHistoryId={selectedHistoryId}
              onHistorySelect={handleHistorySelect}
              onDeleteHistory={handleDeleteRiwayat}
              isLoadingHistory={isLoadingHistory}
            />
          </div>
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-800">Menghitung Prioritas...</p>
            <p className="text-xs text-slate-500">
              Menganalisis {analysisCount} desa melalui backend
            </p>
          </div>
        </div>
      )}

      {isMasterModalOpen && (
        <MasterDataModal
          villages={masterVillages}
          setVillages={setMasterVillages}
          weights={masterWeights}
          setWeights={setMasterWeights}
          pembobotan={masterPembobotan}
          setPembobotan={setMasterPembobotan}
          onClose={() => setMasterModalOpen(false)}
        />
      )}
    </div>
  );
}
