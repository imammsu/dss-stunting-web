export interface Village {
  id: number;
  name: string;
  district: string;
  lat: number;
  lng: number;
  vScore: number;
  ranking: number;
  komitmen?: number;
  remaja?: number;
  stunting?: number;
  prevalensi?: number;
  kemiskinan?: number;
  jarak?: number;
  tenagaKerja?: number;
}

export const villagesData: Village[] = [
  { id: 1, name: "Sukorambi", district: "Sukorambi", lat: -8.145, lng: 113.655, vScore: 0.92, ranking: 1 , komitmen: 2, remaja: 11, stunting: 6, prevalensi: 16, kemiskinan: 11, jarak: 2, tenagaKerja: 60 },
  { id: 2, name: "Klungkung", district: "Sukorambi", lat: -8.150, lng: 113.660, vScore: 0.88, ranking: 2 , komitmen: 3, remaja: 12, stunting: 7, prevalensi: 17, kemiskinan: 12, jarak: 3, tenagaKerja: 70 },
  { id: 3, name: "Dukuhmencek", district: "Sukorambi", lat: -8.138, lng: 113.648, vScore: 0.85, ranking: 3 , komitmen: 4, remaja: 13, stunting: 8, prevalensi: 18, kemiskinan: 13, jarak: 4, tenagaKerja: 80 },
  { id: 4, name: "Karangpring", district: "Sukorambi", lat: -8.155, lng: 113.670, vScore: 0.82, ranking: 4 , komitmen: 5, remaja: 14, stunting: 9, prevalensi: 19, kemiskinan: 14, jarak: 5, tenagaKerja: 90 },
  { id: 5, name: "Kemuningsari Lor", district: "Panti", lat: -8.130, lng: 113.630, vScore: 0.79, ranking: 5 , komitmen: 1, remaja: 15, stunting: 10, prevalensi: 20, kemiskinan: 15, jarak: 6, tenagaKerja: 100 },
  { id: 6, name: "Suci", district: "Panti", lat: -8.125, lng: 113.635, vScore: 0.76, ranking: 6 , komitmen: 2, remaja: 16, stunting: 11, prevalensi: 21, kemiskinan: 16, jarak: 7, tenagaKerja: 110 },
  { id: 7, name: "Pakis", district: "Panti", lat: -8.120, lng: 113.620, vScore: 0.73, ranking: 7 , komitmen: 3, remaja: 17, stunting: 12, prevalensi: 22, kemiskinan: 17, jarak: 8, tenagaKerja: 120 },
  { id: 8, name: "Gumukmas", district: "Gumukmas", lat: -8.305, lng: 113.445, vScore: 0.71, ranking: 8 , komitmen: 4, remaja: 18, stunting: 13, prevalensi: 23, kemiskinan: 18, jarak: 9, tenagaKerja: 130 },
  { id: 9, name: "Tembokrejo", district: "Gumukmas", lat: -8.310, lng: 113.450, vScore: 0.68, ranking: 9 , komitmen: 5, remaja: 19, stunting: 14, prevalensi: 24, kemiskinan: 19, jarak: 10, tenagaKerja: 140 },
  { id: 10, name: "Menampu", district: "Gumukmas", lat: -8.315, lng: 113.460, vScore: 0.65, ranking: 10 , komitmen: 1, remaja: 20, stunting: 15, prevalensi: 15, kemiskinan: 20, jarak: 1, tenagaKerja: 150 },
  { id: 11, name: "Rowotamtu", district: "Rambipuji", lat: -8.210, lng: 113.580, vScore: 0.63, ranking: 11 , komitmen: 2, remaja: 21, stunting: 16, prevalensi: 16, kemiskinan: 21, jarak: 2, tenagaKerja: 160 },
  { id: 12, name: "Pecoro", district: "Rambipuji", lat: -8.215, lng: 113.590, vScore: 0.60, ranking: 12 , komitmen: 3, remaja: 22, stunting: 17, prevalensi: 17, kemiskinan: 22, jarak: 3, tenagaKerja: 170 },
  { id: 13, name: "Nogosari", district: "Rambipuji", lat: -8.220, lng: 113.595, vScore: 0.57, ranking: 13 , komitmen: 4, remaja: 23, stunting: 18, prevalensi: 18, kemiskinan: 23, jarak: 4, tenagaKerja: 180 },
  { id: 14, name: "Rambigundam", district: "Rambipuji", lat: -8.205, lng: 113.575, vScore: 0.55, ranking: 14 , komitmen: 5, remaja: 24, stunting: 19, prevalensi: 19, kemiskinan: 24, jarak: 5, tenagaKerja: 190 },
  { id: 15, name: "Paleran", district: "Umbulsari", lat: -8.275, lng: 113.500, vScore: 0.52, ranking: 15 , komitmen: 1, remaja: 10, stunting: 20, prevalensi: 20, kemiskinan: 10, jarak: 6, tenagaKerja: 200 },
  { id: 16, name: "Tanjungrejo", district: "Umbulsari", lat: -8.280, lng: 113.510, vScore: 0.50, ranking: 16 , komitmen: 2, remaja: 11, stunting: 21, prevalensi: 21, kemiskinan: 11, jarak: 7, tenagaKerja: 210 },
  { id: 17, name: "Gadingrejo", district: "Umbulsari", lat: -8.285, lng: 113.515, vScore: 0.48, ranking: 17 , komitmen: 3, remaja: 12, stunting: 22, prevalensi: 22, kemiskinan: 12, jarak: 8, tenagaKerja: 220 },
  { id: 18, name: "Sidomekar", district: "Semboro", lat: -8.190, lng: 113.520, vScore: 0.46, ranking: 18 , komitmen: 4, remaja: 13, stunting: 23, prevalensi: 23, kemiskinan: 13, jarak: 9, tenagaKerja: 230 },
  { id: 19, name: "Pondokrejo", district: "Semboro", lat: -8.195, lng: 113.525, vScore: 0.44, ranking: 19 , komitmen: 5, remaja: 14, stunting: 24, prevalensi: 24, kemiskinan: 14, jarak: 10, tenagaKerja: 240 },
  { id: 20, name: "Sidorejo", district: "Semboro", lat: -8.200, lng: 113.530, vScore: 0.42, ranking: 20 , komitmen: 1, remaja: 15, stunting: 5, prevalensi: 15, kemiskinan: 15, jarak: 1, tenagaKerja: 250 },
  { id: 21, name: "Sumberjambe", district: "Sumberjambe", lat: -8.100, lng: 113.750, vScore: 0.39, ranking: 21 , komitmen: 2, remaja: 16, stunting: 6, prevalensi: 16, kemiskinan: 16, jarak: 2, tenagaKerja: 260 },
  { id: 22, name: "Randuagung", district: "Sumberjambe", lat: -8.095, lng: 113.755, vScore: 0.36, ranking: 22 , komitmen: 3, remaja: 17, stunting: 7, prevalensi: 17, kemiskinan: 17, jarak: 3, tenagaKerja: 270 },
  { id: 23, name: "Pringgondani", district: "Sumberjambe", lat: -8.090, lng: 113.745, vScore: 0.33, ranking: 23 , komitmen: 4, remaja: 18, stunting: 8, prevalensi: 18, kemiskinan: 18, jarak: 4, tenagaKerja: 280 },
  { id: 24, name: "Cakru", district: "Kencong", lat: -8.280, lng: 113.370, vScore: 0.30, ranking: 24 , komitmen: 5, remaja: 19, stunting: 9, prevalensi: 19, kemiskinan: 19, jarak: 5, tenagaKerja: 290 },
  { id: 25, name: "Wonorejo", district: "Kencong", lat: -8.285, lng: 113.375, vScore: 0.27, ranking: 25 , komitmen: 1, remaja: 20, stunting: 10, prevalensi: 20, kemiskinan: 20, jarak: 6, tenagaKerja: 300 },
  { id: 26, name: "Paseban", district: "Kencong", lat: -8.290, lng: 113.380, vScore: 0.24, ranking: 26 , komitmen: 2, remaja: 21, stunting: 11, prevalensi: 21, kemiskinan: 21, jarak: 7, tenagaKerja: 310 },
  { id: 27, name: "Jelbuk", district: "Jelbuk", lat: -8.110, lng: 113.720, vScore: 0.21, ranking: 27 , komitmen: 3, remaja: 22, stunting: 12, prevalensi: 22, kemiskinan: 22, jarak: 8, tenagaKerja: 320 },
  { id: 28, name: "Sucopangepok", district: "Jelbuk", lat: -8.105, lng: 113.725, vScore: 0.18, ranking: 28 , komitmen: 4, remaja: 23, stunting: 13, prevalensi: 23, kemiskinan: 23, jarak: 9, tenagaKerja: 330 },
  { id: 29, name: "Panduman", district: "Jelbuk", lat: -8.115, lng: 113.730, vScore: 0.15, ranking: 29 , komitmen: 5, remaja: 24, stunting: 14, prevalensi: 24, kemiskinan: 24, jarak: 10, tenagaKerja: 340 },
  { id: 30, name: "Sukowono", district: "Sukowono", lat: -8.135, lng: 113.770, vScore: 0.12, ranking: 30 , komitmen: 1, remaja: 10, stunting: 15, prevalensi: 15, kemiskinan: 10, jarak: 1, tenagaKerja: 350 },
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
