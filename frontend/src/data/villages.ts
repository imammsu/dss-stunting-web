export interface Village {
  id: number;
  name: string;
  district: string;
  lat: number;
  lng: number;
  vScore?: number;
  ranking?: number;
  values: Record<string, number | string | null | undefined>;
}

export interface VillageCriteriaValues {
  komitmen: number;
  remaja: number;
  stunting: number;
  prevalensi: number;
  kemiskinan: number;
  jarak: number;
  tenagaKerja: number;
}

export const villagesData: Village[] = [
  { id: 1, name: "Sukorambi", district: "Sukorambi", lat: -8.145, lng: 113.655, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 2, name: "Klungkung", district: "Sukorambi", lat: -8.150, lng: 113.660, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 3, name: "Dukuhmencek", district: "Sukorambi", lat: -8.138, lng: 113.648, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 4, name: "Karangpring", district: "Sukorambi", lat: -8.155, lng: 113.670, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 5, name: "Kemuningsari Lor", district: "Panti", lat: -8.130, lng: 113.630, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 6, name: "Suci", district: "Panti", lat: -8.125, lng: 113.635, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 7, name: "Pakis", district: "Panti", lat: -8.120, lng: 113.620, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 8, name: "Gumukmas", district: "Gumukmas", lat: -8.305, lng: 113.445, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 9, name: "Tembokrejo", district: "Gumukmas", lat: -8.310, lng: 113.450, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 10, name: "Menampu", district: "Gumukmas", lat: -8.315, lng: 113.460, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 11, name: "Rowotamtu", district: "Rambipuji", lat: -8.210, lng: 113.580, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 12, name: "Pecoro", district: "Rambipuji", lat: -8.215, lng: 113.590, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 13, name: "Nogosari", district: "Rambipuji", lat: -8.220, lng: 113.595, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 14, name: "Rambigundam", district: "Rambipuji", lat: -8.205, lng: 113.575, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 15, name: "Paleran", district: "Umbulsari", lat: -8.275, lng: 113.500, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 16, name: "Tanjungrejo", district: "Umbulsari", lat: -8.280, lng: 113.510, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 17, name: "Gadingrejo", district: "Umbulsari", lat: -8.285, lng: 113.515, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 18, name: "Sidomekar", district: "Semboro", lat: -8.190, lng: 113.520, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 19, name: "Pondokrejo", district: "Semboro", lat: -8.195, lng: 113.525, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 20, name: "Sidorejo", district: "Semboro", lat: -8.200, lng: 113.530, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 21, name: "Sumberjambe", district: "Sumberjambe", lat: -8.100, lng: 113.750, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 22, name: "Randuagung", district: "Sumberjambe", lat: -8.095, lng: 113.755, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 23, name: "Pringgondani", district: "Sumberjambe", lat: -8.090, lng: 113.745, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 24, name: "Cakru", district: "Kencong", lat: -8.280, lng: 113.370, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 25, name: "Wonorejo", district: "Kencong", lat: -8.285, lng: 113.375, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 26, name: "Paseban", district: "Kencong", lat: -8.290, lng: 113.380, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 27, name: "Jelbuk", district: "Jelbuk", lat: -8.110, lng: 113.720, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 28, name: "Sucopangepok", district: "Jelbuk", lat: -8.105, lng: 113.725, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 29, name: "Panduman", district: "Jelbuk", lat: -8.115, lng: 113.730, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
  { id: 30, name: "Sukowono", district: "Sukowono", lat: -8.135, lng: 113.770, values: { 1: 2, 2: 11, 3: 6, 4: 16, 5: 11, 6: 2, 7: 60 } },
];

export function getStatusLabel(vScore: number): string {
  if (vScore > 0.7) return "Sangat Prioritas";
  if (vScore >= 0.4) return "Prioritas Sedang";
  return "Prioritas Rendah";
}

export function getStatusColor(vScore: number): string {
  if (vScore > 0.7) return "#D32F2F";
  if (vScore >= 0.4) return "#FBC02D";
  return "#388E3C";
}
