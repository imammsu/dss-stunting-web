import { useState, useMemo } from "react";
import type { Village } from "../data/villages";
import type { WeightFormat } from "../data/master";
import AHPWeightCalculator from "./AHPWeightCalculator";

interface MasterDataModalProps {
  villages: Village[];
  setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
  weights: WeightFormat[];
  setWeights: React.Dispatch<React.SetStateAction<WeightFormat[]>>;
  onClose: () => void;
}

export default function MasterDataModal({
  villages,
  setVillages,
  weights,
  setWeights,
  onClose
}: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<"desa" | "pembobotan">("desa");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVillages = useMemo(() => {
    return villages.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.district.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [villages, searchTerm]);

  const handleDeleteVillage = (id: number) => {
    setVillages(prev => prev.filter(v => v.id !== id));
  };

  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [isVillageModalOpen, setIsVillageModalOpen] = useState(false);

  const openAddVillage = () => {
    const newId = (villages.length ? Math.max(...villages.map(v => v.id)) : 0) + 1;
    setEditingVillage({
      id: newId,
      name: "",
      district: "",
      lat: -8.150,
      lng: 113.660,
      vScore: 0,
      ranking: 0,
      komitmen: 3,
      remaja: 15,
      stunting: 10,
      prevalensi: 20,
      kemiskinan: 15,
      jarak: 2,
      tenagaKerja: 100
    });
    setIsVillageModalOpen(true);
  };

  const openEditVillage = (village: Village) => {
    setEditingVillage(village);
    setIsVillageModalOpen(true);
  };

  const saveVillage = () => {
    if (!editingVillage) return;
    setVillages(prev => {
      const idx = prev.findIndex(v => v.id === editingVillage.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = editingVillage;
        return next;
      }
      return [editingVillage, ...prev];
    });
    setIsVillageModalOpen(false);
  };

  const handleDeleteWeight = (id: string) => {
    setWeights(prev => prev.filter(w => w.id !== id));
  };

  const [ahpState, setAhpState] = useState<{isOpen: boolean; format: WeightFormat | null}>({isOpen: false, format: null});

  const handleAddWeight = () => {
    setAhpState({isOpen: true, format: null});
  };

  const handleEditWeight = (w: WeightFormat) => {
    setAhpState({isOpen: true, format: w});
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Master Data</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-200 bg-slate-50">
          <button
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "desa" 
                ? "border-primary text-primary" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("desa")}
          >
            Desa (Alternatif)
          </button>
          <button
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "pembobotan" 
                ? "border-primary text-primary" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setActiveTab("pembobotan")}
          >
            Nilai Pembobotan
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto bg-white">
          {activeTab === "desa" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button 
                  onClick={openAddVillage}
                  className="bg-white border border-slate-600 text-slate-700 hover:bg-slate-50 text-sm font-medium py-1.5 px-4 rounded-lg shadow-sm transition-all"
                >
                  Tambah data baru
                </button>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="text-sm text-slate-500 whitespace-nowrap hidden md:inline">Show 10 Entries</span>
                  <div className="relative w-full sm:w-auto">
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 text-sm border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute right-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-16">No</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Desa</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Kecamatan</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Koordinat (Lat, Lng)</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredVillages.slice(0, 10).map((village, idx) => (
                        <tr key={village.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{village.name}</td>
                          <td className="px-4 py-3 text-slate-600">{village.district}</td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{village.lat.toFixed(4)}, {village.lng.toFixed(4)}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => openEditVillage(village)} className="text-slate-400 hover:text-slate-800 transition-colors" title="Edit">
                              {/* Edit icon SVG */}
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteVillage(village.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                              {/* Delete icon SVG */}
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredVillages.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            Data desa tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>Showing {Math.min(filteredVillages.length, 10)} of {filteredVillages.length} entries</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <button 
                  onClick={handleAddWeight}
                  className="bg-white border border-slate-600 text-slate-700 hover:bg-slate-50 text-sm font-medium py-1.5 px-4 rounded-lg shadow-sm transition-all"
                >
                  Tambah format baru
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-16">No</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Nama Bobot</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Komitmen</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Remaja</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Stunting</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Prevalensi</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Miskin</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Jarak</th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">Pekerja</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {weights.map((w, idx) => (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-700 max-w-[120px] truncate" title={w.name}>{w.name}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.komitmen.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.remaja.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.stunting.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.prevalensi.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.kemiskinan.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.jarak.toFixed(3)}</td>
                          <td className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">{w.weights.tenagaKerja.toFixed(3)}</td>
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => handleEditWeight(w)} className="text-slate-400 hover:text-slate-800 transition-colors" title="Edit">
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteWeight(w.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {weights.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                            Data pembobotan tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isVillageModalOpen && editingVillage && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[10010] flex items-center justify-center p-4 rounded-2xl">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex-shrink-0">{editingVillage.name ? "Edit Desa" : "Tambah Desa"}</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Nama Desa</label>
                <input type="text" value={editingVillage.name} onChange={(e) => setEditingVillage({...editingVillage, name: e.target.value})} className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors" placeholder="Cth: Sukamakmur" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Kecamatan</label>
                <input type="text" value={editingVillage.district} onChange={(e) => setEditingVillage({...editingVillage, district: e.target.value})} className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors" placeholder="Cth: Sukorambi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Latitude</label>
                  <input type="number" step="0.0001" value={editingVillage.lat} onChange={(e) => setEditingVillage({...editingVillage, lat: parseFloat(e.target.value) || 0})} className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Longitude</label>
                  <input type="number" step="0.0001" value={editingVillage.lng} onChange={(e) => setEditingVillage({...editingVillage, lng: parseFloat(e.target.value) || 0})} className="w-full text-xs border border-slate-300 rounded-md px-3 py-2 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-colors" />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Nilai Kriteria Default</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Komitmen (Skala 1-5)">1. Komitmen</label>
                    <input type="number" min="1" max="5" value={editingVillage.komitmen ?? 3} onChange={(e) => setEditingVillage({...editingVillage, komitmen: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Persentase Remaja usia 15-24 (%)">2. Remaja (%)</label>
                    <input type="number" value={editingVillage.remaja ?? 15} onChange={(e) => setEditingVillage({...editingVillage, remaja: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Anak Stunting (jiwa)">3. Stunting</label>
                    <input type="number" value={editingVillage.stunting ?? 10} onChange={(e) => setEditingVillage({...editingVillage, stunting: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Prevalensi Stunting (%)">4. Prevalensi (%)</label>
                    <input type="number" value={editingVillage.prevalensi ?? 20} onChange={(e) => setEditingVillage({...editingVillage, prevalensi: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Tingkat Kemiskinan (%)">5. Kemiskinan (%)</label>
                    <input type="number" value={editingVillage.kemiskinan ?? 15} onChange={(e) => setEditingVillage({...editingVillage, kemiskinan: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jarak ke Puskesmas (Km)">6. Jarak (Km)</label>
                    <input type="number" value={editingVillage.jarak ?? 2} onChange={(e) => setEditingVillage({...editingVillage, jarak: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-700 mb-1" title="Jumlah Tenaga Kerja (orang)">7. Tenaga Kerja (org)</label>
                    <input type="number" value={editingVillage.tenagaKerja ?? 100} onChange={(e) => setEditingVillage({...editingVillage, tenagaKerja: Number(e.target.value)})} className="w-full text-xs font-medium border border-slate-300 rounded-md px-2 py-1.5 bg-slate-50 focus:bg-white focus:border-primary outline-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setIsVillageModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200">Batal</button>
              <button onClick={saveVillage} className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm">Simpan Data</button>
            </div>
          </div>
        </div>
      )}

      {/* AHP Weight Calculator Modal */}
      {ahpState.isOpen && (
        <AHPWeightCalculator
          initialFormat={ahpState.format}
          onSave={(name, weights, preferences, idToUpdate) => {
            const payload: WeightFormat = { 
              id: idToUpdate || `format-${Date.now()}`, 
              name, 
              weights,
              ahpPreferences: preferences
            };
            if (idToUpdate) {
              setWeights(prev => {
                const idx = prev.findIndex(w => w.id === idToUpdate);
                if (idx > -1) {
                   const next = [...prev];
                   next[idx] = payload;
                   return next;
                }
                return prev;
              });
            } else {
              setWeights(prev => [...prev, payload]);
            }
            setAhpState({isOpen: false, format: null});
            setActiveTab("pembobotan");
          }}
          onCancel={() => setAhpState({isOpen: false, format: null})}
        />
      )}
    </div>
  );
}
