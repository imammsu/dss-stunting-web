# Backend Express + Supabase

Backend ini dibuat terpisah dari frontend Vite agar lebih mudah dirawat.

## Fitur

- Express JS dengan struktur modular
- Login, register, refresh session, dan endpoint `me` memakai Supabase Auth
- Koneksi database Supabase lewat `pg` dan shared pooler / transaction pooler
- Endpoint master data yang mudah disesuaikan ke tabel Supabase Anda
- Perhitungan AHP
- Perankingan TOPSIS
- Endpoint gabungan AHP + TOPSIS

## Langkah Menjalankan

1. Salin `backend/.env.example` menjadi `backend/.env`
2. Isi semua variabel Supabase
3. Jalankan `npm install` di folder `backend`
4. Jalankan `npm run dev` di folder `backend`

## File Yang Paling Perlu Anda Sesuaikan

- `src/config/tableMap.js`
  Tempat utama untuk mengganti nama tabel dan kolom sesuai database Anda.
- `src/repositories/alternative.repository.js`
  Sesuaikan jika tabel alternatif Anda tidak menyimpan nilai kriteria dalam kolom JSON.
- `src/repositories/criteria.repository.js`
  Sesuaikan jika struktur kriteria Anda berbeda dari contoh bawaan.

## Endpoint Penting

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/master/criteria`
- `GET /api/master/alternatives`
- `GET /api/master/bootstrap`
- `POST /api/decision/ahp/weights`
- `POST /api/decision/topsis/rank`
- `POST /api/decision/evaluate`
- `POST /api/decision/rank-from-database`

## Contoh Body AHP

```json
{
  "criteria": [
    { "id": "komitmen", "label": "Komitmen", "type": "benefit" },
    { "id": "remaja", "label": "Remaja", "type": "benefit" },
    { "id": "jarak", "label": "Jarak", "type": "cost" }
  ],
  "comparisons": [
    { "left": "komitmen", "right": "remaja", "value": 3 },
    { "left": "komitmen", "right": "jarak", "value": 5 },
    { "left": "remaja", "right": "jarak", "value": 2 }
  ]
}
```

## Contoh Body TOPSIS

```json
{
  "criteria": [
    { "id": "komitmen", "label": "Komitmen", "weight": 0.5, "type": "benefit" },
    { "id": "remaja", "label": "Remaja", "weight": 0.3, "type": "benefit" },
    { "id": "jarak", "label": "Jarak", "weight": 0.2, "type": "cost" }
  ],
  "alternatives": [
    {
      "id": "desa-a",
      "name": "Desa A",
      "values": { "komitmen": 80, "remaja": 70, "jarak": 12 }
    },
    {
      "id": "desa-b",
      "name": "Desa B",
      "values": { "komitmen": 75, "remaja": 90, "jarak": 8 }
    }
  ]
}
```
