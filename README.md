# Stunting DSS Monorepo

Repo ini sekarang dipisah menjadi dua aplikasi:

- `frontend/`: React + Vite
- `backend/`: Express + Supabase Auth + Supabase Postgres Shared Pooler

## Alur Aplikasi Saat Ini

- Login dan register dilakukan dari frontend ke backend
- Backend meneruskan auth ke Supabase Auth
- Frontend mengambil data master dari backend setelah login
- Perhitungan AHP dilakukan lewat endpoint backend
- Perhitungan TOPSIS dan ranking dilakukan lewat endpoint backend
- Jika data master Supabase belum siap, frontend akan fallback ke data lokal agar UI tetap bisa dipakai

## Yang Perlu Anda Ubah

### 1. Konfigurasi environment backend

Buat file `backend/.env` dari `backend/.env.example`, lalu isi:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `CORS_ORIGIN`

Catatan penting:

- `SUPABASE_DB_URL` harus memakai connection string `Shared Pooler` / `Transaction Pooler` dari dashboard Supabase
- untuk local development frontend Vite, biasanya `CORS_ORIGIN=http://localhost:5173`

### 2. Konfigurasi environment frontend

Buat file `frontend/.env` dari `frontend/.env.example`.

Default lokal:

- `VITE_API_BASE_URL=/api`
- `VITE_API_PROXY_TARGET=http://localhost:4000`

Jika frontend dan backend nanti dipisah domain saat deploy, Anda bisa ganti `VITE_API_BASE_URL` ke URL backend penuh, misalnya:

```env
VITE_API_BASE_URL=https://api-domain-anda.com/api
```

### 3. Sesuaikan nama tabel dan kolom Supabase

File utama yang harus Anda cek:

- [`backend/src/config/tableMap.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/config/tableMap.js)
- [`backend/src/repositories/alternative.repository.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/repositories/alternative.repository.js)
- [`backend/src/repositories/criteria.repository.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/repositories/criteria.repository.js)

Asumsi default backend saat ini:

### Tabel `criteria`

Minimal kolom yang diharapkan:

- `id`
- `code`
- `name`
- `weight`
- `type`

Contoh isi `code` yang cocok dengan frontend:

- `komitmen`
- `remaja`
- `stunting`
- `prevalensi`
- `kemiskinan`
- `jarak`
- `tenagaKerja`

### Tabel `alternatives`

Minimal kolom yang disarankan:

- `id`
- `name`
- `district`
- `lat`
- `lng`
- `values`

Kolom `values` idealnya bertipe `jsonb` dengan isi seperti ini:

```json
{
  "komitmen": 4,
  "remaja": 15,
  "stunting": 22,
  "prevalensi": 18,
  "kemiskinan": 16,
  "jarak": 7,
  "tenagaKerja": 95
}
```

Jika Anda tidak memakai kolom JSON `values` dan nilai kriteria disimpan langsung sebagai kolom biasa, backend tetap bisa disesuaikan lewat file repository alternatif.

### 4. Sesuaikan tipe kriteria benefit/cost

Saat ini frontend memakai mapping berikut di [`frontend/src/data/master.ts`](/c:/Users/Lenovo/Downloads/stunting-dss/frontend/src/data/master.ts):

- `komitmen`: `benefit`
- `remaja`: `cost`
- `stunting`: `benefit`
- `prevalensi`: `benefit`
- `kemiskinan`: `benefit`
- `jarak`: `benefit`
- `tenagaKerja`: `benefit`

Kalau definisi bisnis Anda berbeda, ubah di file itu.

### 5. Auth Supabase

Frontend tidak login langsung ke Supabase SDK browser.
Frontend login ke backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

Berarti yang perlu Anda aktifkan di Supabase adalah:

- Email auth di menu Authentication
- pengaturan email confirmation sesuai kebutuhan Anda

Jika email confirmation aktif, perilaku login/register akan mengikuti policy Supabase Anda.

## Menjalankan Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Endpoint Backend Yang Dipakai Frontend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/master/bootstrap`
- `POST /api/decision/ahp/weights`
- `POST /api/decision/topsis/rank`

## Catatan Penting

- Modal `Master Data` di frontend saat ini mengubah state frontend aktif, belum menyimpan CRUD ke database Supabase
- jika Anda ingin data desa dan pembobotan bisa diedit lalu tersimpan permanen ke Supabase, langkah berikutnya adalah menambahkan endpoint CRUD di backend
- frontend sekarang sudah benar-benar terhubung ke backend untuk auth, bootstrap data, AHP, dan TOPSIS

## File Yang Paling Sering Anda Sentuh Nanti

- [`backend/src/config/tableMap.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/config/tableMap.js)
- [`backend/src/repositories/alternative.repository.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/repositories/alternative.repository.js)
- [`backend/src/repositories/criteria.repository.js`](/c:/Users/Lenovo/Downloads/stunting-dss/backend/src/repositories/criteria.repository.js)
- [`frontend/src/data/master.ts`](/c:/Users/Lenovo/Downloads/stunting-dss/frontend/src/data/master.ts)
- [`frontend/src/lib/mappers.ts`](/c:/Users/Lenovo/Downloads/stunting-dss/frontend/src/lib/mappers.ts)
- [`frontend/src/lib/api.ts`](/c:/Users/Lenovo/Downloads/stunting-dss/frontend/src/lib/api.ts)
