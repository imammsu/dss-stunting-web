export interface MasterWeights {
  komitmen: number;
  stunting: number;
  prevalensi: number;
  kemiskinan: number;
  remaja: number;
  jarak: number;
  tenagaKerja: number;
}

export interface WeightFormat {
  id: string;
  name: string;
  weights: MasterWeights;
  ahpPreferences?: Record<string, { value: number; side: "left" | "right" | null }>;
  dbId?: string; // Optional field for database ID
}

export interface CriterionDefinition {
  id: string;
  label: string;
  type: "benefit" | "cost";
}

export const criteriaDefinitions: CriterionDefinition[] = [
  { id: "komitmen",    label: "Komitmen",     type: "benefit" },
  { id: "remaja",      label: "Remaja",       type: "cost"    },
  { id: "stunting",    label: "Stunting",     type: "benefit" },
  { id: "prevalensi",  label: "Prevalensi",   type: "benefit" },
  { id: "kemiskinan",  label: "Kemiskinan",   type: "benefit" },
  { id: "jarak",       label: "Jarak",        type: "cost"    },
  { id: "tenagaKerja", label: "Tenaga Kerja", type: "benefit" },
];


export const defaultWeightFormats: WeightFormat[] = [
  {
    id: "format-1",
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
    id: "format-2",
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
