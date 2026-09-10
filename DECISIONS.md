# Architecture Decision Records (ADR)

## ADR-001: Pure Client-Side Static Architecture
- **Status**: Accepted
- **Date**: 2026-09-09
- **Source**: Codebase evidence & PRD.md
- **Context**: Tool konversi online sering kali mengirimkan data payload ke backend server pihak ketiga, yang berisiko membocorkan data sensitif perusahaan atau PII. Selain itu, backend mandiri menimbulkan biaya operasional server.
- **Decision**: Mengembangkan konverter sebagai aplikasi web statis (SPA) murni berbasis React + Vite + TypeScript yang di-hosting pada GitHub Pages.
- **Consequences**:
  - Positif: Biaya operasional $0/bulan, latency rendering instan (< 10 ms), dan privasi 100% (0 byte data keluar ke network).
  - Negatif: Semua komputasi bergantung pada resource browser pengguna.

---

## ADR-002: Use Bun as Toolchain and Package Manager
- **Status**: Accepted
- **Date**: 2026-09-09
- **Source**: Developer request & STEP.md update
- **Context**: Kebutuhan eksekusi build, package resolution, dan testing yang cepat serta kompatibilitas dengan toolchain modern.
- **Decision**: Menggunakan Bun sebagai package manager, test runner (`bun test`), dan runtime runner lokal alih-alih Node.js/npm.
- **Consequences**:
  - Positif: Kecepatan install dependensi dan unit test jauh lebih tinggi, syntax native test runner yang bersih.
  - Negatif: Pipeline CI/CD memerlukan aksi `oven-sh/setup-bun` di runner GitHub Actions.

---

## ADR-003: Non-Lossy Integer Parsing with Lossless-JSON
- **Status**: Accepted
- **Date**: 2026-09-09
- **Source**: Codebase evidence (`src/lib/utils/parser.ts`)
- **Context**: `JSON.parse` bawaan JavaScript memotong angka integer yang melebihi $2^{53} - 1$ (misalnya ID snowflake database 64-bit) menjadi float presisi ganda yang dibulatkan.
- **Decision**: Menggunakan parser `lossless-json` untuk menangkap angka besar sebagai string digit murni sebelum dievaluasi ke tipe Java `Long` atau `BigInteger`.
- **Consequences**:
  - Positif: Integritas nilai ID 64-bit tetap terjaga tanpa risiko data corruption pada DTO.
  - Negatif: Menambah sedikit overhead parsing token dibandingkan parser native C++ browser.

---

## ADR-004: Standard Java POJO Class as Default Target with Lombok as an Option
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & commit `d88a96c`, `568d10b`
- **Context**: Awalnya tool hanya mendukung Java Record dan Lombok Class. Namun pengguna memerlukan Java Class POJO standar (Constructor, Getters, Setters) sebagai opsi default tanpa memaksa dependensi Lombok.
- **Decision**:
  - Menetapkan Java Class standar (POJO murni) sebagai output default.
  - Menyederhanakan target utama menjadi dua: Java Class dan Java 17+ Record.
  - Menggabungkan Lombok (`@Data`, `@Builder`) sebagai opsi checklist opsional di bawah mode Java Class.
- **Consequences**:
  - Positif: DTO yang dihasilkan langsung kompatibel dengan berbagai framework Java legacy maupun modern tanpa mewajibkan plugin Lombok.
  - Negatif: Kode POJO standar lebih panjang (memuat konstruktor dan getter/setter eksplisit).

---

## ADR-005: Make `@JsonProperty` an Explicit Opt-In Checkbox
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & commit `d88a96c`
- **Context**: Tidak semua proyek Java menggunakan Jackson library untuk deserialisasi JSON (sebagian menggunakan Gson, Jakarta JSON Binding, atau Java native mapping).
- **Decision**: Menjadikan anotasi `@JsonProperty` dan import Jackson opsional yang hanya ditambahkan jika pengguna mencentang checkbox yang disediakan.
- **Consequences**:
  - Positif: Output kode Java bersih dari dependensi pihak ketiga jika pengguna tidak membutuhkannya.
  - Negatif: Jika nama field JSON menggunakan format non-camelCase (seperti snake_case) dan opsi ini tidak dicentang, pengguna harus menyesuaikan konfigurasi deserializer di aplikasi Java mereka sendiri.

---

## ADR-006: Root Path Base for Custom Subdomain
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Bugfix commit `88f74fc`
- **Context**: Repository diakses melalui custom domain `https://2dto.kanggara.my.id/`. Konfigurasi `base: '/2dto/'` sebelumnya menyebabkan aset JS/CSS gagal di-load (404 Not Found).
- **Decision**: Mengatur `base: '/'` di `vite.config.ts` untuk menargetkan root subdomain.
- **Consequences**:
  - Positif: Seluruh aset bundle di-load secara presisi di custom subdomain root.
  - Negatif: Jika di masa depan ingin diakses via fallback URL `<username>.github.io/2dto/`, subpath tersebut tidak akan cocok tanpa konfigurasi reverse proxy atau conditional base path.

---

## ADR-007: Resizable Workspace Split Pane with 50% Maximum Boundary
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & commit `ac22f1c`
- **Context**: Tampilan dua panel Monaco Editor sebelumnya berukuran statis seimbang. Pengguna membutuhkan fleksibilitas memperbesar atau memperkecil editor JSON input sesuai kompleksitas payload, namun panel output Java tetap harus memiliki ruang minimal 50% lebar layar.
- **Decision**: Mengimplementasikan custom drag-to-resize divider di `EditorWorkspace.tsx` dengan batas persentase minimal 20% dan maksimal 50% lebar kontainer untuk panel input.
- **Consequences**:
  - Positif: Pengalaman editor lebih adaptif untuk berbagai ukuran layar tanpa merusak proporsi output Java DTO.
  - Negatif: Menggunakan mouse drag event listener global pada window saat proses resize aktif.

---

## ADR-008: Header Removal and Action Buttons Consolidation into Output Pane
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & commits `ac8d68e`, `8739e17`, `cfeb764`
- **Context**: Bar Header atas (berisi logo 2dto, badge *Client-Side*, dan slogan privasi) memakan ruang vertikal layar yang seharusnya dimaksimalkan untuk editor kode.
- **Decision**: Menghapus bar Header secara menyeluruh dan mengonsolidasikan tombol aksi cepat (*Load Sample*, *Copy Code*, dan *Download*) langsung ke bar judul panel output *Generated Java DTO*.
- **Consequences**:
  - Positif: Ruang vertikal editor Monaco bertambah signifikan, antarmuka lebih bersih dan fungsional, serta aksi terkait output terintegrasi secara kontekstual di atas panel kode Java.
  - Negatif: Informasi branding dan link GitHub tidak lagi ditampilkan di UI utama.

---

## ADR-009: Hybrid System-Aware and Cyclic Theme Mode Selection
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & commits `360141d`, `03b0b16`, `a1a8661`
- **Context**: Aplikasi sebelumnya hanya beroperasi pada tema gelap permanen (`vs-dark`). Pengguna memerlukan dukungan tampilan terang (light mode) yang otomatis mendeteksi preferensi sistem OS pengguna, namun tetap memberikan kebebasan beralih manual tanpa menghabiskan ruang layar toolbar dengan banyak tombol.
- **Decision**:
  - Mendukung deteksi preferensi OS otomatis melalui media query `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Menerapkan Tailwind v4 custom dark variant `@custom-variant dark (&:where(.dark, .dark *));` dan tema Monaco adaptif (`vs` vs `vs-dark`).
  - Mengimplementasikan 1 tombol tunggal yang bergantian siklus (`light` -> `dark` -> `system`) di pojok kanan atas toolbar dengan persistensi ke `localStorage`.
- **Consequences**:
  - Positif: Tampilan nyaman di berbagai kondisi pencahayaan, transisi mulus mengikuti OS, kontrol ringkas 1 tombol hemat ruang, dan preferensi pengguna tersimpan persisten.
  - Negatif: Komponen UI Monaco dan Tailwind memerlukan styling kelas ganda (`dark:*`).

---

## ADR-010: Custom One Dark Syntax Highlighting Theme for Java Output Pane
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & `src/components/EditorWorkspace.tsx`
- **Context**: Monaco Editor `vs-dark` bawaan menggunakan palet warna standar VS Code gelap dan secara default memperlakukan tipe kustom Java sebagai generic identifier. Developer menginginkan tema Atom One Dark autentik pada panel output dengan pewarnaan spesifik: keyword modifier (`private`, `public`) berwarna ungu, tipe/kelas (`String`, primitif) berwarna kuning emas, koleksi (`List`, `Map`) berwarna hijau, nama atribut/variabel (`code`) berwarna merah, dan titik koma abu-abu.
- **Decision**:
  - Mendaftarkan custom theme `'one-dark'` melalui API `monaco.editor.defineTheme` pada hook `beforeMount`.
  - Mengonfigurasi custom declarative tokenizer `monaco.languages.setMonarchTokensProvider('java', ...)` untuk mengklasifikasikan `(List|Map)` sebagai `type.collection` (`#98c379`), PascalCase types `^[A-Z][\w$]*` sebagai `type` (`#e5c07b`), dan identifiers sebagai `variable` (`#e06c75`).
  - Menerapkan tema `'one-dark'` pada panel output Java saat dark mode aktif dan `'vs'` saat light mode aktif.
- **Consequences**:
  - Positif: Tampilan kode Java DTO memiliki kontras tinggi, estetika One Dark yang konsisten, serta diferensiasi visual yang jelas antara koleksi, tipe data, dan atribut.
  - Negatif: Memerlukan definisi Monarch token provider kustom untuk Java di dalam bundle frontend.

---

## ADR-011: Semantic HTML Landmarks for Accessibility Navigation
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Accessibility audit & `src/App.tsx`
- **Context**: Audit aksesibilitas (axe-core / Lighthouse) mengidentifikasi bahwa dokumen tidak memiliki `main` landmark (`Document does not have a main landmark`), menyulitkan pengguna screen reader menavigasi struktur halaman web.
- **Decision**:
  - Membungkus toolbar atas (`<ConfigToolbar />`) menggunakan elemen semantik `<header role="banner">`.
  - Membungkus ruang kerja editor (`<EditorWorkspace />`) menggunakan elemen semantik `<main role="main">` dengan kelas layout responsif `flex-1 min-h-0 flex flex-col overflow-hidden`.
- **Consequences**:
  - Positif: Lolos audit aksesibilitas landmark, memudahkan navigasi teknologi asistif, dan mempertahankan flexbox full-height layout secara utuh.
  - Negatif: Tidak ada dampak negatif.

---

## ADR-012: WCAG 2.1 AA Color Contrast Enhancements in Light Mode
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Accessibility audit & `src/components/ConfigToolbar.tsx`, `src/components/EditorWorkspace.tsx`
- **Context**: Pada mode terang (Light Mode), beberapa teks pendukung dan label (seperti label checkbox, placeholder input, badge counter, teks status) menggunakan warna abu-abu terlalu terang (`text-slate-400`, `text-slate-500`) yang menghasilkan rasio kontras di bawah ambang batas WCAG AA (< 4.5:1).
- **Decision**:
  - Mengganti teks label opsi konfigurasi menjadi `text-slate-700` (~7.5:1 contrast ratio) dan label input Class/Package menjadi `text-slate-700 font-medium`.
  - Meningkatkan teks status dan sub-keterangan editor menjadi `text-slate-600` dan judul editor menjadi `text-slate-800`.
  - Mempertegas warna ikon checkbox dan border status tombol disabled (`border-slate-300`).
  - Menyesuaikan badge *Separate Files* menjadi `text-indigo-800 border-indigo-300` pada latar `bg-indigo-50`.
- **Consequences**:
  - Positif: Teks dan kontrol UI sangat mudah dibaca pada berbagai tingkat pencahayaan layar dan memenuhi standar kepatuhan aksesibilitas WCAG 2.1 AA.
  - Negatif: Warna sedikit lebih gelap dibanding palet pastel awal, namun tetap selaras dengan desain keseluruhan.

---

## ADR-013: PageSpeed Form Accessibility Labels and Browser Theme Color
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: PageSpeed Insights audit & `index.html`, `src/components/ConfigToolbar.tsx`
- **Context**: Audit performa dan aksesibilitas PageSpeed/Lighthouse mendeteksi bahwa input teks `Class` dan `Package` tidak terhubung dengan elemen `<label>` eksplisit yang memiliki atribut `for`/`id` yang cocok. Selain itu, dokumen HTML memerlukan tag `<meta name="theme-color">` untuk konsistensi rendering address bar browser.
- **Decision**:
  - Mengubah elemen pembungkus nama input menjadi `<label htmlFor="...">` yang terhubung langsung ke `id` dan `name` input terkait.
  - Menambahkan atribut `aria-label="Root Class Name"` dan `aria-label="Package Name"`.
  - Menambahkan `<meta name="theme-color" content="#020617" />` pada `<head>` di `index.html`.
- **Consequences**:
  - Positif: Meningkatkan skor aksesibilitas Lighthouse ke tingkat optimal (100%), memastikan assistive technology mengenali tujuan input secara tepat, dan meningkatkan integrasi tema browser.
  - Negatif: Tidak ada dampak negatif.

---

## ADR-014: Custom Branding Icon and Multi-Resolution Favicon Integration
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & `public/`, `index.html`, `src/components/ConfigToolbar.tsx`
- **Context**: Aplikasi sebelumnya menggunakan favicon placeholder default `vite.svg` dan belum memiliki logo identitas visual pada navigasi header.
- **Decision**:
  - Mengunduh avatar developer GitHub (`https://avatars.githubusercontent.com/u/24321218?v=4`) dan membuat aset multi-resolusi di `public/`: `favicon.ico`, `favicon-32x32.png`, `favicon.png`, `icon.png`, `apple-touch-icon.png` (180x180), `icon-192.png`, dan `icon-512.png`.
  - Menghubungkan aset ikon di `index.html` (`<link rel="icon">`, `<link rel="shortcut icon">`, `<link rel="apple-touch-icon">`).
  - Menambahkan brand logo bundar dan judul `2dto` di samping tautan repositori GitHub pada `ConfigToolbar.tsx`.
- **Consequences**:
  - Positif: Meningkatkan estetika identitas produk, kepatuhan audit PWA/Lighthouse, dan konsistensi ikon tab browser lintas perangkat desktop dan mobile.
  - Negatif: Menambahkan beberapa aset PNG berukuran kecil (~18 KB) ke dalam direktori statis `public/`.

---

## ADR-015: RGB(34, 34, 34) Dark Palette Harmonization and Fixed-Width Theme Toggle
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & `src/components/ConfigToolbar.tsx`, `src/components/EditorWorkspace.tsx`, `src/App.tsx`, `index.html`
- **Context**: Tema gelap sebelumnya menggunakan percampuran warna gelap bawaan One Dark (`#282c34`) dan Tailwind `slate-950` / `slate-900`. Developer menginginkan warna gelap berbasis `RGB(34, 34, 34)` (`#222222`). Selain itu, perubahan teks label tombol tema (`light`, `dark`, `system`) memiliki panjang karakter yang bervariasi sehingga memicu layout shift horizontal pada checklist konfigurasi lainnya saat diklik.
- **Decision**:
  - Mengubah warna latar Monaco editor One Dark (`editor.background`) menjadi `#222222` dengan line highlight `#2a2a2a`.
  - Mengubah latar root shell (`App.tsx`), `index.html` body, dan meta `theme-color` menjadi `#222222`.
  - Menyelaraskan seluruh header toolbar, subheader panel input/output, dan tab bar menjadi turunan harmonis `#222222`, `#1e1e1e`, `#1a1a1a`, dan border `#333333`.
  - Mengunci lebar tombol tema ke ukuran tetap `w-[88px]` dengan wadah teks `w-[48px] text-left` dan ikon `shrink-0` untuk mengeliminasi pergeseran layout (Cumulative Layout Shift = 0).
- **Consequences**:
  - Positif: Tampilan antarmuka dark mode menjadi elegan dan konsisten, serta tidak ada kedipan atau geseran elemen checkbox saat pengguna mengganti mode tema.
  - Negatif: Diperlukan nilai warna CSS custom class (`[#222222]`, `[#1e1e1e]`, `[#333333]`) untuk menimpa palet default Tailwind slate.

---

## ADR-016: Browser Storage Persistence for Package Name
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & `src/App.tsx`
- **Context**: Sebelumnya, nilai `packageName` kembali ke nilai awal `'com.example.dto'` setiap kali halaman web di-refresh, mengharuskan developer mengetikkan ulang nama package organisasi/proyek mereka berulang kali.
- **Decision**:
  - Menginisialisasi `config.packageName` secara lazy melalui pembacaan `localStorage.getItem('package-name')` dengan fallback default `'com.example.dto'`.
  - Menyinkronkan setiap perubahan `config.packageName` ke `localStorage.setItem('package-name', ...)` di dalam `useEffect` dengan pembungkus proteksi `try/catch` untuk menangani storage quota atau mode penjelajahan privat (incognito).
- **Consequences**:
  - Positif: Meningkatkan kenyamanan alur kerja developer secara signifikan (nama package tetap tersimpan saat reload halaman atau membuka sesi baru).
  - Negatif: Tidak ada dampak negatif. Nilai disimpan di storage lokal browser pengguna tanpa sinkronisasi jaringan (tetap 100% private).

---

## ADR-017: Mandatory @JsonProperty on Java Reserved Keywords
- **Status**: Accepted
- **Date**: 2026-09-10
- **Source**: Developer request & `src/lib/converter/sanitizer.ts`, `src/lib/converter/generator.ts`, `src/lib/converter/inferrer.ts`
- **Context**: Saat pengguna mematikan checklist `@JsonProperty`, atribut field yang namanya bentrok dengan kata kunci terlarang Java (misal: `class`, `default`, `import`, `return`, `record`) disanitasi menjadi `classVal`, `defaultVal`, dsb. Tanpa anotasi `@JsonProperty("class")`, deserializer JSON Jackson tidak dapat memetakan key asli JSON ke nama field Java yang telah disanitasi, menyebabkan nilainya bernilai `null` saat runtime.
- **Decision**:
  - Menandai field yang bersumber dari kata kunci terlarang Java dengan flag `isReserved: true` di metadata AST.
  - Memaksa penyematan anotasi `@JsonProperty("<originalKey>")` dan impor `com.fasterxml.jackson.annotation.JsonProperty` khusus untuk field yang berstatus `isReserved`, meskipun opsi `config.useJsonProperty` bernilai `false`.
  - Menerapkan aturan ini secara seragam pada Java Class POJO, Lombok Class, dan Java 17+ Record.
- **Consequences**:
  - Positif: Mencegah bug fatal deserialisasi payload JSON yang mengandung kata kunci reserved Java (seperti `class` atau `default`) tanpa mengharuskan pengguna mencentang opsi `@JsonProperty` untuk seluruh field.
  - Negatif: Mengakibatkan dependensi Jackson tersemat pada file Java DTO yang memiliki reserved keywords meskipun opsi anotasi dimatikan secara global.
