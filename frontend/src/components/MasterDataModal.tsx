import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Village } from "../data/villages";
import type { WeightFormat } from "../data/master";
import { criteriaDefinitions } from "../data/master";
import type { BackendPembobotan } from "../lib/mappers";
import AHPWeightCalculator from "./AHPWeightCalculator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { submitAlternativeDesa, updateAlternativeDesa, submitPembobotan, fetchPembobotan, fetchPembobotanDetail, updatePembobotanApi } from "@/lib/master";

interface MasterDataModalProps {
  villages: Village[];
  setVillages: Dispatch<SetStateAction<Village[]>>;
  weights: WeightFormat[];
  setWeights: Dispatch<SetStateAction<WeightFormat[]>>;
  pembobotan: BackendPembobotan[];
  setPembobotan: Dispatch<SetStateAction<BackendPembobotan[]>>;
  onClose: () => void;
}

export default function MasterDataModal({
  villages,
  setVillages,
  weights,
  setWeights,
  pembobotan,
  setPembobotan,
  onClose,
}: MasterDataModalProps) {
  const [activeTab, setActiveTab] = useState<"desa" | "pembobotan">("desa");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [isVillageModalOpen, setIsVillageModalOpen] = useState(false);
  const [ahpState, setAhpState] = useState<{
    isOpen: boolean;
    format: WeightFormat | null;
  }>({ isOpen: false, format: null });

  const filteredVillages = useMemo(() => {
    return villages.filter(
      (village) =>
        village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        village.district.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, villages]);

  const handleDeleteVillage = (id: Village["id"]) => {
    setVillages((previous) =>
      previous.filter((village) => String(village.id) !== String(id)),
    );
  };

  const openAddVillage = () => {
    setEditingVillage({
      id: -1,
      name: "",
      district: "",
      lat: -8.15,
      lng: 113.66,
      values: {},
    });
    setIsVillageModalOpen(true);
  };

  const openEditVillage = (village: Village) => {
    setEditingVillage(village);
    setIsVillageModalOpen(true);
  };

  const saveVillage = async () => {
  if (!editingVillage) return;

    try {
      const isNew = editingVillage.id === -1;

      const result = isNew
        ? await submitAlternativeDesa(editingVillage)       // POST
        : await updateAlternativeDesa(editingVillage);      // PUT

      setVillages((previous) => {
        const existingIndex = previous.findIndex(
          (v) => String(v.id) === String(editingVillage.id),
        );
        const savedVillage = { ...editingVillage, id: result.id };

        if (existingIndex !== -1) {
          const next = [...previous];
          next[existingIndex] = savedVillage;
          return next;
        }
        return [savedVillage, ...previous];
      });

      setIsVillageModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Gagal menyimpan data. Coba lagi.");
    }
  };

  // const handleDeleteWeight = (id: string) => {
  //   setWeights((previous) => previous.filter((weight) => weight.id !== id));
  // };

  const handleAddWeight = () => {
    setAhpState({ isOpen: true, format: null });
  };

  const handleEditWeight = async (pembobotan: BackendPembobotan) => {
    try {
      const response = await fetchPembobotanDetail(pembobotan.id);
      const pairwiseList = response || [];

      const preferences: Record<string, { value: number; side: "left" | "right" | null }> = {};
      
      const n = criteriaDefinitions.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          preferences[`${i}-${j}`] = { value: 1, side: null };
        }
      }

      const idToNama: Record<number, string> = {};
      pembobotan.kriteria.forEach(k => {
        idToNama[k.id_kriteria] = k.nama_kriteria;
      });

      const idToIndex: Record<string, number> = {};
      criteriaDefinitions.forEach((c, index) => {
        idToIndex[c.id.toLowerCase()] = index;
        idToIndex[c.label.toLowerCase()] = index;
      });

      pairwiseList.forEach(pair => {
        const code1 = (pair.k1_kode || idToNama[pair.kriteria_1] || "").toLowerCase();
        const code2 = (pair.k2_kode || idToNama[pair.kriteria_2] || "").toLowerCase();

        const index1 = idToIndex[code1];
        const index2 = idToIndex[code2];

        if (index1 !== undefined && index2 !== undefined) {
           const i = Math.min(index1, index2);
           const j = Math.max(index1, index2);
           
           let side: "left" | "right" | null = null;
           if (pair.nilai > 1) {
             side = index1 === i ? "left" : "right";
           }

           preferences[`${i}-${j}`] = { value: pair.nilai, side };
        }
      });

      // Construct dummy WeightFormat to pass to AHPWeightCalculator
      const dummyWeights: any = {};
      pembobotan.kriteria.forEach(k => {
        // Not perfectly mapped to MasterWeights keys but that's okay, 
        // AHPWeightCalculator re-calculates them anyway.
      });

      const format: WeightFormat = {
        id: pembobotan.id,
        name: pembobotan.pembobotan_nama,
        weights: dummyWeights,
        ahpPreferences: preferences,
      };

      setAhpState({ isOpen: true, format });
    } catch (error) {
      console.error("Gagal mengambil detail pembobotan:", error);
      alert("Gagal memuat data matriks. Coba lagi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[30] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Master Data</h2>
            <p className="text-xs text-slate-500 mt-1">
              Perubahan pada modal ini memengaruhi simulasi frontend aktif.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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

        <div className="p-6 flex-1 overflow-auto bg-white">
          {activeTab === "desa" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                  onClick={openAddVillage}
                  className="bg-white border border-slate-600 text-slate-700 hover:bg-slate-50 text-sm font-medium py-1.5 px-4 rounded-lg shadow-sm transition-all"
                >
                  Tambah alternatif desa baru
                </button>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="text-sm text-slate-500 whitespace-nowrap hidden md:inline">
                    Show 10 Entries
                  </span>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full sm:w-64 text-sm border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    <svg
                      className="w-4 h-4 text-slate-400 absolute right-2.5 top-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List alternatif desa</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">No</TableHead>
                        <TableHead>Desa</TableHead>
                        <TableHead>Kecamatan</TableHead>
                        <TableHead className="text-right">Latitute</TableHead>
                        <TableHead className="text-right">Longitude</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVillages.slice(0, 10).map((village, index) => (
                        <TableRow key={String(village.id)}>
                          <TableCell className="text-right">{index + 1}</TableCell>
                          <TableCell className="font-medium">{village.name}</TableCell>
                          <TableCell>{village.district}</TableCell>
                          <TableCell className="text-right">{village.lat.toFixed(4)}</TableCell>
                          <TableCell className="text-right">{village.lng.toFixed(4)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontalIcon />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditVillage(village)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => handleDeleteVillage(village.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredVillages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            Data desa tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>
                  Showing {Math.min(filteredVillages.length, 10)} of {filteredVillages.length} entries
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleAddWeight}
                  className="bg-white border border-slate-600 text-slate-700 hover:bg-slate-50 text-sm font-medium py-1.5 px-4 rounded-lg shadow-sm transition-all"
                >
                  Tambah format pembobotan baru
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableCaption>List format pembobotan</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right text-xs">No</TableHead>
                        <TableHead>Nama bobot</TableHead>
                        {weights.map((weight) => (
                          <TableHead key={weight.id} className="text-center text-xs">
                            {weight.kode}
                          </TableHead>
                        ))}
                        <TableHead className="text-right text-xs">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pembobotan.map((item, idx) => (
                        <TableRow key={String(item.id)}>
                          <TableCell className="text-right">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.pembobotan_nama}</TableCell>
                          {weights.map((weight) => {
                            const matchingKriteria = item.kriteria.find(k => k.id_kriteria === weight.id);
                            return (
                              <TableCell key={weight.id} className="text-right">
                                {matchingKriteria ? matchingKriteria.bobot.toFixed(3) : '-'}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontalIcon />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditWeight(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant="destructive" onClick={() => handleDeleteWeight(item.id)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>

                      ))}
                      
                      {filteredVillages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            Data desa tidak ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {/* <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-16">
                          No
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600">
                          Nama Bobot
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Komitmen
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Remaja
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Stunting
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Prevalensi
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Miskin
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Jarak
                        </th>
                        <th className="px-2 py-3 font-semibold text-slate-600 text-center text-xs">
                          Pekerja
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 text-right w-24">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pembobotan.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-slate-700 max-w-[120px] truncate">
                            {item.pembobotan_nama}
                          </td>
                          {weights.map((weight) => {
                            const matchingKriteria = item.kriteria.find(k => k.id_kriteria === weight.id);
                            return (
                              <td key={weight.id} className="px-2 py-3 text-center text-slate-600 font-mono text-[10px]">
                                {matchingKriteria ? matchingKriteria.bobot.toFixed(3) : '-'}
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEditWeight(weight)}
                              className="text-slate-400 hover:text-slate-800 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteWeight(weight.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pembobotan.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                            Data pembobotan tidak ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table> */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isVillageModalOpen && editingVillage && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-[32] flex items-center justify-center p-4 rounded-2xl">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <h3 className="border-b pb-4 text-sm font-bold text-slate-800 mb-4 flex-shrink-0">
              {editingVillage.id === -1 ? "Edit Desa" : "Tambah Desa"}
            </h3>
            <form onSubmit={(e) => {e.preventDefault(); saveVillage()}} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-4 overflow-y-auto flex-1 pr-1">
                <div>
                  <Field className="gap-2">
                    <FieldLabel className="block text-xs font-medium text-slate-700 ">
                      Desa <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input placeholder="Contoh: Sukamakmur" value={editingVillage.name} required className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, name: e.target.value})} type="text" >
                    </Input>
                  </Field>
                </div>
                <div>
                  <Field className="gap-2">
                    <FieldLabel className="block text-xs font-medium text-slate-700 ">
                      Kecamatan <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input placeholder="Contoh: Sukorambi" value={editingVillage.district} required className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, district: e.target.value})} type="text" >
                    </Input>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Field className="gap-2">
                      <FieldLabel className="block text-xs font-medium text-slate-700 ">
                        Latitude <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input placeholder="Contoh: -0,1234" value={editingVillage.lat} required className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, lat: Number(e.target.value)})} type="number" step="0.0001">
                      </Input>
                    </Field>
                    
                  </div>
                  <div>
                    <Field className="gap-2">
                      <FieldLabel className="block text-xs font-medium text-slate-700 ">
                        Longitude <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input placeholder="Contoh: 107,1234" value={editingVillage.lng} required className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, lng: Number(e.target.value)})} type="number" step="0.0001">
                      </Input>
                    </Field>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <h4 className="text-xs font-bold text-slate-800 mb-3">
                    Nilai Kriteria Default
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Komitmen derah (1-5)
                        </FieldLabel>
                        <Input placeholder="1-5" value={String(editingVillage.values["1"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [1]: Number(e.target.value)}})} type="number" min={1} max={5}>
                        </Input>
                      </Field>
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Jumlah remaja (%)
                        </FieldLabel>
                        <Input placeholder="300" value={String(editingVillage.values["2"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [2]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Stunting (anak)
                        </FieldLabel>
                        <Input placeholder="100" value={String(editingVillage.values["3"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [3]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Prevalensi (%)
                        </FieldLabel>
                        <Input placeholder="100" value={String(editingVillage.values["4"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [4]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Tingkat kemiskinan (%)
                        </FieldLabel>
                        <Input placeholder="20" value={String(editingVillage.values["5"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [5]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                      
                    </div>
                    <div>
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Jarak layanan kesehatan terdekat (km)
                        </FieldLabel>
                        <Input placeholder="2" value={String(editingVillage.values["6"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [6]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                      
                    </div>
                    <div className="col-span-2">
                      <Field className="gap-2">
                        <FieldLabel className="block text-xs font-medium text-slate-700 ">
                          Tenaga kerja (org)
                        </FieldLabel>
                        <Input placeholder="30" value={String(editingVillage.values["7"])} className="w-full text-xs" onChange={(e) => setEditingVillage({...editingVillage, values: {...editingVillage.values, [7]: Number(e.target.value)}})} type="number">
                        </Input>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsVillageModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {ahpState.isOpen && (
        <AHPWeightCalculator
          initialFormat={ahpState.format}
          onSave={async (name, weightsResult, preferences, idToUpdate, cr = 0) => {
            try {
              const pairwiseArray = [];
              for (const [key, pref] of Object.entries(preferences)) {
                const [i, j] = key.split("-").map(Number);
                const k1 = criteriaDefinitions[i].id;
                const k2 = criteriaDefinitions[j].id;
                
                if (pref.side === "right") {
                  pairwiseArray.push({ kriteria_1: k2, kriteria_2: k1, nilai: pref.value });
                } else {
                  pairwiseArray.push({ kriteria_1: k1, kriteria_2: k2, nilai: pref.value });
                }
              }

              let newId = idToUpdate;
              if (typeof idToUpdate === "number") {
                await updatePembobotanApi(idToUpdate, {
                  nama: name,
                  cr,
                  bobotHasil: weightsResult as Record<string, number>,
                  preferences: pairwiseArray,
                });
              } else {
                const response = await submitPembobotan({
                  nama: name,
                  cr,
                  bobotHasil: weightsResult as Record<string, number>,
                  preferences: pairwiseArray,
                });
                newId = response.id;
              }
              
              const payload: WeightFormat = {
                id: newId,
                name,
                weights: weightsResult,
                ahpPreferences: preferences,
              };

              if (typeof idToUpdate === "number") {
                // Asumsi: Jika kita ngedit dan backend belum support edit pembobotan,
                // ini tetap insert baru dan ID-nya berubah. Untuk amannya, kita push data dengan ID baru.
                setWeights((previous) => {
                  const existingIndex = previous.findIndex(
                    (weight) => weight.id === idToUpdate,
                  );

                  if (existingIndex > -1) {
                    const next = [...previous];
                    next[existingIndex] = payload;
                    return next;
                  }

                  return previous;
                });
              } else {
                setWeights((previous) => [...previous, payload]);
              }

              setAhpState({ isOpen: false, format: null });
              setActiveTab("pembobotan");
              
              // Refresh seluruh data dari Supabase
              const updatedPembobotan = await fetchPembobotan();
              setPembobotan(updatedPembobotan);
            } catch (error) {
              console.error("Gagal menyimpan pembobotan:", error);
              alert("Gagal menyimpan data pembobotan AHP ke database.");
            }
          }}
          onCancel={() => setAhpState({ isOpen: false, format: null })}
        />
      )}
    </div>
  );
}
