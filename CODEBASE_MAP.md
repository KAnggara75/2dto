# Codebase Navigation Map

## Overview
Repository `2dto` adalah web application statis (SPA) berbasis React 19 + TypeScript + Vite + Bun untuk mengonversi JSON menjadi Java DTO (Standard POJO, Java 17+ Record, dan Lombok Class) secara 100% in-browser tanpa backend server.

---

## Modul & Direktori

### `src/lib/converter`
- **Responsibility**: Inti mesin konversi AST (Abstract Syntax Tree), inferensi tipe data, sanitasi identifier Java, dan serialisasi kode Java.
- **Entry / Key Files**:
  - [`src/lib/converter/index.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/index.ts) — Titik masuk utama konversi (`convertJsonToDto`).
  - [`src/lib/converter/types.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/types.ts) — Definisi tipe AST (`ClassMetadata`, `FieldMetadata`, `ConverterConfig`, `DtoTargetType`).
  - [`src/lib/converter/inferrer.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/inferrer.ts) — Mesin inferensi tipe (Integer, Long, Double, ISO Instant/LocalDate, generic list, rekursif object).
  - [`src/lib/converter/sanitizer.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/sanitizer.ts) — Penanganan Java reserved keywords (`class`, `default`, `import`, dsb.) dan penamaan PascalCase/camelCase.
  - [`src/lib/converter/generator.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/generator.ts) — Serializer AST menjadi teks Java: Standard POJO Class (Constructor, Getter, Setter), Java 17+ Record, dan Lombok Class.
  - [`src/lib/converter/converter.test.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/converter.test.ts) — Unit test suite untuk pengujian inferensi dan generator.
- **Dependencies**: `lossless-json`, `bun:test` (saat testing).
- **Consumers**: [`src/App.tsx`](file:///Users/i/work/KAnggara75/2dto/src/App.tsx).
- **External Integrations**: Tidak ada (100% in-memory / air-gapped).

---

### `src/lib/utils`
- **Responsibility**: Helper utilitas parser JSON presisi tinggi.
- **Entry / Key Files**:
  - [`src/lib/utils/parser.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/utils/parser.ts) — Lossless number parser berbasis library `lossless-json` untuk mencegah pemotongan integer 64-bit ($> 2^{53} - 1$).
- **Dependencies**: `lossless-json`.
- **Consumers**: [`src/lib/converter/inferrer.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/inferrer.ts), [`src/lib/converter/index.ts`](file:///Users/i/work/KAnggara75/2dto/src/lib/converter/index.ts).

---

### `src/components`
- **Responsibility**: Komponen antarmuka pengguna (UI) editor, toolbar opsi konfigurasi, dan area interaktif editor.
- **Entry / Key Files**:
  - [`src/components/ConfigToolbar.tsx`](file:///Users/i/work/KAnggara75/2dto/src/components/ConfigToolbar.tsx) — Bar navigasi & konfigurasi atas: tautan repositori GitHub di sisi paling kiri, pilihan target DTO (Java Class vs Record), input nama class dan package, checklist `@JsonProperty`, ISO dates, Jakarta validation, Lombok, serta tombol siklus tema (`light` -> `dark` -> `system`) di pojok kanan atas.
  - [`src/components/EditorWorkspace.tsx`](file:///Users/i/work/KAnggara75/2dto/src/components/EditorWorkspace.tsx) — Dual-pane Monaco editor adaptif (kiri: input JSON dengan status indikator valid/empty/invalid dan draggable separator max 50%; kanan: output Java DTO dengan file tabs dan tombol aksi Load Sample, Copy Code, dan Download; tema editor berganti otomatis antara `vs` dan `vs-dark`).
- **Dependencies**: `@monaco-editor/react`, `lucide-react`, `tailwindcss`.
- **Consumers**: [`src/App.tsx`](file:///Users/i/work/KAnggara75/2dto/src/App.tsx).

---

### `src/` (Root App)
- **Responsibility**: State management aplikasi, sinkronisasi tema, dan bootstrap React.
- **Entry / Key Files**:
  - [`src/App.tsx`](file:///Users/i/work/KAnggara75/2dto/src/App.tsx) — State utama (`rawJson`, `debouncedJson`, `config`, `errorFeedback`, `themeMode`), deteksi preferensi tema OS via `prefers-color-scheme`, copy & download handlers.
  - [`src/main.tsx`](file:///Users/i/work/KAnggara75/2dto/src/main.tsx) — React 19 DOM root mounting.
  - [`src/index.css`](file:///Users/i/work/KAnggara75/2dto/src/index.css) — Tailwind CSS v4 entry point dengan `@custom-variant dark`.
  - [`src/vite-env.d.ts`](file:///Users/i/work/KAnggara75/2dto/src/vite-env.d.ts) — Deklarasi tipe module CSS untuk TypeScript compiler.
- **Dependencies**: `react`, `react-dom`.
- **Consumers**: Browser runtime.

---

### `.github/workflows`
- **Responsibility**: Otomatisasi CI/CD build dan deployment ke GitHub Pages.
- **Entry / Key Files**:
  - [`.github/workflows/deploy.yml`](file:///Users/i/work/KAnggara75/2dto/.github/workflows/deploy.yml) — GitHub Actions workflow menggunakan `oven-sh/setup-bun` dan `bun run build`.
- **Dependencies**: GitHub Actions runner (Ubuntu latest), `actions/checkout`, `actions/upload-pages-artifact`, `actions/deploy-pages`.
