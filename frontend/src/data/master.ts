import type { BackendCriterion } from "../lib/mappers";

export interface MasterWeights {
  komitmen: number;
  stunting: number;
  prevalensi: number;
  kemiskinan: number;
  remaja: number;
  jarak: number;
  tenagaKerja: number;
  [key: string]: number;
}

export interface WeightFormat {
  id: number;
  name: string;
  kode?: string;
  weights: MasterWeights;
  ahpPreferences?: Record<string, { value: number; side: "left" | "right" | null }>;
  dbId?: string; // Optional field for database ID
}


export interface CriterionDefinition {
  id: string;
  label: string;
  type: "benefit" | "cost";
}

export const criteriaDefinitions: BackendCriterion[] = [
  { id: "komitmen",    label: "Komitmen",     type: "benefit" , satuan: "1-5"},
  { id: "remaja",      label: "Remaja",       type: "cost"    , satuan: "jumlah"},
  { id: "stunting",    label: "Stunting",     type: "benefit" , satuan: "persen"},
  { id: "prevalensi",  label: "Prevalensi",   type: "benefit" , satuan: "persen"},
  { id: "kemiskinan",  label: "Kemiskinan",   type: "benefit" , satuan: "persen"},
  { id: "jarak",       label: "Jarak",        type: "cost"    , satuan: "km"},
  { id: "tenagaKerja", label: "Tenaga Kerja", type: "benefit" , satuan: "jumlah"},
];


export const defaultWeightFormats: WeightFormat[] = [
  {
    id: 1,
    name: "Pembobotan 1 (Default AHP-TOPSIS)",
    weights: {
      komitmen: 0.2,
      stunting: 0.3,
      prevalensi: 0.25,
      kemiskinan: 0.15,
      remaja: 0.05,
      jarak: 0.02,
      tenagaKerja: 0.03,
    },
  },
  {
    id: 2,
    name: "Pembobotan Fokus Kesehatan",
    weights: {
      komitmen: 0.1,
      stunting: 0.4,
      prevalensi: 0.3,
      kemiskinan: 0.1,
      remaja: 0.05,
      jarak: 0.03,
      tenagaKerja: 0.02,
    },
  }
];
