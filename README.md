# 🌙 Somnia — Backend (Server Layer)

Lapisan **backend** dari aplikasi **Somnia — Penganalisis Jurnal Mimpi**.

> ℹ️ **Penting:** Somnia dibangun sebagai **satu aplikasi Next.js utuh** (frontend + backend jadi satu). Repo ini berisi **hanya kode sisi-server** (API routes, business logic, database, AI) yang diambil dari aplikasi tersebut, sesuai pemisahan FE/BE untuk penilaian.
>
> - **Frontend + aplikasi lengkap yang bisa dijalankan:** https://github.com/muhamadabel/somnia-fe
> - Kode di repo ini **tidak berjalan sendiri** — ia adalah bagian server dari app Next.js di repo `somnia-fe`.

---

## 📂 Isi repo ini

```
app/api/            30 API route handler (kontrak API — docs/07)
  auth/             register, login, logout, session
  dreams/           CRUD mimpi, analisis AI, visualisasi AI, arsip, gambar
  conversations/    Teman AI (chat sadar-riwayat)
  community/        post, komentar, reaksi, laporan konten
  reports/          laporan kesejahteraan
  symbols/ user/ notifications/ admin/ files/ health/
lib/
  db.ts             Prisma client (singleton)
  auth.ts           sesi, pseudonim komunitas, audit log
  api.ts            envelope respons, error handling, rate limit, paginasi
  validation.ts     skema Zod untuk setiap mutasi
  constants.ts      emosi/mood/simbol + label Indonesia
  utils.ts
  services/         analysis, reports, trends, storage
  ai/               subsistem AI (provider-agnostic)
    index.ts        pemilihan provider + pembangun konteks riwayat
    llm-shared.ts   prompt + parsing bersama semua provider LLM
    pollinations.ts provider AI GRATIS tanpa key (default)
    anthropic.ts    provider Claude (jika ANTHROPIC_API_KEY diisi)
    local.ts        mesin lokal offline (fallback)
    image.ts        generasi gambar AI gratis (Pollinations Flux)
    art.ts          generator seni SVG prosedural (fallback gambar)
    lexicon.ts      kamus bilingual emosi/simbol/tema
middleware.ts       gate sesi untuk rute terproteksi
prisma/
  schema.prisma     19 model (docs/08 — soft delete, analisis berversi, dst.)
  seed.ts           data demo (akun + jurnal + komunitas)
docs/               dokumen spesifikasi (00–16)
```

---

## 🧱 Stack backend

- **Runtime/API:** Next.js 15 Route Handlers (App Router) — TypeScript
- **Database:** Prisma ORM + SQLite (portabel; ganti ke PostgreSQL cukup ubah `datasource` di `schema.prisma`)
- **Auth:** sesi cookie httpOnly + bcrypt (docs/10)
- **Validasi:** Zod di setiap endpoint
- **AI (gratis, tanpa key by default):**
  - Teman AI → **Pollinations.ai** (LLM gratis, membaca seluruh riwayat mimpi = "ingat semua")
  - Gambar mimpi → **Pollinations Flux** (gambar AI asli, bukan upload)
  - Analisis & laporan → mesin lokal (instan & andal)
  - Semua otomatis fallback ke mesin lokal/SVG saat offline; `ANTHROPIC_API_KEY` → Claude untuk semuanya

---

## 📜 Kontrak API (docs/07)

Setiap endpoint mengembalikan envelope konsisten:

```jsonc
// sukses
{ "success": true, "message": "...", "data": {}, "meta": {} }
// gagal
{ "success": false, "message": "...", "errors": [], "requestId": "...", "timestamp": "..." }
```

Validasi → 422 (dengan error per-field), auth → 401/403, rate limit → 429.
Rincian lengkap ada di [`docs/07-api-contract.md`](docs/07-api-contract.md),
model data di [`docs/08-database-design.md`](docs/08-database-design.md),
desain AI di [`docs/09-ai-design.md`](docs/09-ai-design.md),
keamanan di [`docs/10-security.md`](docs/10-security.md).

---

## ▶️ Menjalankan

Kode ini adalah bagian dari app Next.js. Untuk menjalankan server + API,
gunakan repo lengkap:

```bash
git clone https://github.com/muhamadabel/somnia-fe.git
cd somnia-fe
npm install
npm run setup   # prisma generate + db + seed
npm run dev     # http://localhost:3000  (halaman + /api/*)
```

Login demo: `demo@somnia.app` / `dream1234` · Admin: `admin@somnia.app` / `admin1234`

---

> Somnia adalah alat refleksi diri, bukan perangkat medis. Insight AI bersifat
> reflektif & edukatif — bukan diagnosis dan tak menggantikan bantuan profesional.
