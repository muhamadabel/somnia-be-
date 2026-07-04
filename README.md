# 🌙 Somnia — Backend API

**REST API standalone** untuk aplikasi **Somnia — Penganalisis Jurnal Mimpi**: business logic, database, autentikasi, dan subsistem AI. Dibangun dengan Next.js Route Handlers.

Repo ini **berjalan sendiri** sebagai backend, dan dipanggil oleh frontend terpisah (repo [`somnia-fe`](https://github.com/muhamadabel/somnia-fe)) lewat HTTP.

- 🔑 **Auth:** token — `POST /api/auth/login` mengembalikan `token`; kirim di header `Authorization: Bearer <token>` pada request berikutnya.
- 🌐 **CORS:** set env `FRONTEND_URL` ke domain frontend agar diizinkan (mis. `https://somnia.hallojanu.xyz`).
- 📦 **Menjalankan:** `npm install && npm run setup && npm run build && npm start` (default port 3000). Sama seperti [DEPLOY.md di somnia-fe](https://github.com/muhamadabel/somnia-fe/blob/main/DEPLOY.md), plus set `FRONTEND_URL`.

> Arsitektur: frontend & backend adalah **dua aplikasi terpisah**. Backend ini menyajikan `/api/*`; frontend `somnia-fe` menyajikan tampilan dan memanggil API ini via `NEXT_PUBLIC_API_URL`.

---

## 📂 Isi repo

```
app/api/            30 API route handler (kontrak API — docs/07)
  auth/             register · login · logout · session
  dreams/           CRUD mimpi · analisis AI · visualisasi AI · arsip · gambar
  conversations/    Teman AI (chat sadar-riwayat)
  community/        post · komentar · reaksi · laporan konten
  reports/ symbols/ user/ notifications/ admin/ files/ health/
lib/
  db.ts             Prisma client (singleton)
  auth.ts           sesi cookie · pseudonim komunitas · audit log
  api.ts            envelope respons · error handling · rate limit · paginasi
  validation.ts     skema Zod tiap mutasi
  constants.ts      emosi/mood/simbol + label Indonesia
  services/         analysis · reports · trends · storage
  ai/               subsistem AI (provider-agnostic)
    index.ts        pemilihan provider + pembangun konteks riwayat
    llm-shared.ts   prompt + parsing bersama semua provider LLM
    pollinations.ts provider AI GRATIS tanpa key (default: Teman AI)
    image.ts        gambar AI gratis (Pollinations Flux)
    anthropic.ts    provider Claude (jika ANTHROPIC_API_KEY diisi)
    local.ts        mesin lokal offline (fallback + analisis)
    art.ts          seni SVG prosedural (fallback gambar)
    lexicon.ts      kamus bilingual emosi/simbol/tema
middleware.ts       gate sesi untuk rute terproteksi
prisma/
  schema.prisma     19 model (docs/08)
  seed.ts           data demo (akun + jurnal + komunitas)
docs/               dokumen spesifikasi lengkap (00–16)
```

## 🧱 Stack

- **API:** Next.js 15 Route Handlers (App Router) · TypeScript
- **Database:** Prisma ORM — **SQLite** (lokal/demo) → **PostgreSQL/Supabase** (produksi)
- **Auth:** sesi cookie httpOnly + bcrypt
- **Validasi:** Zod
- **AI (gratis tanpa key):** Pollinations (Teman AI + gambar Flux), Claude (opsional), mesin lokal (fallback)

---

## ▶️ Menjalankan / deploy di server sendiri

Untuk **menjalankan** aplikasi (di laptop/komputer yang dijadikan server), pakai repo lengkap `somnia-fe` — ada **panduan langkah demi langkah** di sana:

👉 **https://github.com/muhamadabel/somnia-fe/blob/main/DEPLOY.md**

Aplikasinya **mandiri** (SQLite + penyimpanan lokal + AI gratis), jadi di server dengan disk permanen tinggal `npm install → npm run setup → npm run build → npm start`. **Tidak wajib** pakai Supabase/PostgreSQL — SQLite sudah cukup untuk server sendiri.

---

## 🟢 (Opsional) Pakai PostgreSQL / Supabase

SQLite sudah cukup untuk 1 server. Bagian ini **hanya kalau** ingin database "server-grade" (PostgreSQL lokal atau **Supabase**). Cukup **2 baris** yang diubah di schema + env — model datanya sudah kompatibel PostgreSQL.

### 1. Buat project Supabase
- Masuk ke https://supabase.com → **New project**. Catat **Database Password** yang kamu buat.
- Tunggu project selesai dibuat.

### 2. Ambil connection string
Di dashboard Supabase → **Project Settings → Database → Connection string** (pilih tab **URI**). Supabase memberi dua koneksi — kita butuh keduanya:

- **Pooled** (Transaction pooler, port **6543**) → untuk aplikasi (runtime).
- **Direct/Session** (port **5432**) → untuk migrasi Prisma (`db push`).

### 3. Ubah provider Prisma ke PostgreSQL
Buka `prisma/schema.prisma`, ganti blok `datasource db`:

```prisma
// SEBELUM (SQLite)
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// SESUDAH (PostgreSQL / Supabase)
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // koneksi pooled (6543, pgbouncer)
  directUrl = env("DIRECT_URL")     // koneksi direct (5432) untuk migrasi
}
```

### 4. Set environment variable (`.env`)
```bash
# Pooled — untuk aplikasi (perhatikan ?pgbouncer=true)
DATABASE_URL="postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct — untuk prisma db push / migrate
DIRECT_URL="postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres"

# Wajib diisi (string acak)
SESSION_SECRET="ganti-dengan-string-acak-yang-panjang"

# AI gratis default (biarkan kosong = pakai Pollinations gratis)
ANTHROPIC_API_KEY=""
```
Ganti `<ref>`, `<PASSWORD>`, `<region>` sesuai punyamu dari Supabase.

### 5. Buat tabel + isi data demo
```bash
npm install
npx prisma generate
npx prisma db push     # membuat 19 tabel di Supabase
npx prisma db seed     # isi akun demo + jurnal contoh (opsional)
```
Cek di Supabase → **Table Editor**, seharusnya muncul tabel `User`, `Dream`, `Analysis`, dst.

### 6. Deploy aplikasi
Supabase menyediakan **database**-nya. Aplikasi Next.js-nya di-host terpisah (mis. **Vercel**, Railway, atau Render): deploy repo `somnia-fe`, lalu isi env yang sama (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`) di dashboard hosting.

---

## 📁 Catatan penyimpanan file (penting saat deploy)

Gambar (upload mimpi + visualisasi AI) disimpan di folder lokal `storage/uploads/` lewat `lib/services/storage.ts`.

- **Host dengan disk permanen** (Railway/Render/VPS) → jalan apa adanya.
- **Host serverless** (Vercel) → filesystem-nya sementara, file akan hilang. Untuk produksi, ganti `lib/services/storage.ts` agar memakai **Supabase Storage** (buat bucket, unggah via `@supabase/supabase-js`, simpan URL publik di kolom `imagePath`). Kode storage sengaja diabstraksi di satu file itu supaya mudah ditukar.

---

## 📜 Kontrak API (docs/07)

Envelope respons konsisten:
```jsonc
// sukses
{ "success": true, "message": "...", "data": {}, "meta": {} }
// gagal
{ "success": false, "message": "...", "errors": [], "requestId": "...", "timestamp": "..." }
```
Validasi → 422 (error per-field) · auth → 401/403 · rate limit → 429.

Rujukan: [`docs/06-backend-spec.md`](docs/06-backend-spec.md) ·
[`docs/07-api-contract.md`](docs/07-api-contract.md) ·
[`docs/08-database-design.md`](docs/08-database-design.md) ·
[`docs/09-ai-design.md`](docs/09-ai-design.md) ·
[`docs/10-security.md`](docs/10-security.md)

---

## 🔑 Ringkasan environment variable

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | ✅ | SQLite `file:./dev.db` (lokal) **atau** Postgres pooled Supabase |
| `DIRECT_URL` | Supabase | Koneksi direct Supabase (untuk migrasi Prisma) |
| `SESSION_SECRET` | ✅ | String acak untuk keamanan sesi/token |
| `FRONTEND_URL` | ✅ (produksi) | Domain frontend untuk izin CORS, mis. `https://somnia.hallojanu.xyz`. Kosong = izinkan semua (`*`, untuk dev) |
| `ANTHROPIC_API_KEY` | — | Kosong = AI gratis (Pollinations). Diisi = pakai Claude |
| `AI_MODE` | — | `local` = paksa mesin offline (tanpa internet) |

## 🔌 Daftar endpoint (ringkas)

`auth/` register · login · logout · session — `dreams` (+ `[id]`, `analysis`, `visualization`, `archive`, `image`) · `dashboard` · `trends` · `gallery` · `calendar` (via `dreams?from=&to=`) · `symbols` (+ `[id]`, `[id]/bookmark`) · `reports` (+ `[id]`) · `conversations` (+ messages) · `companion/suggestions` · `community/posts` (+ komentar/reaksi/laporan) · `notifications` · `user/profile` · `admin/overview` · `files/[...]` · `health`

---

> Somnia adalah alat refleksi diri, bukan perangkat medis. Insight AI bersifat reflektif & edukatif — bukan diagnosis dan tak menggantikan bantuan profesional.
