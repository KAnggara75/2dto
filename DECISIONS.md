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
