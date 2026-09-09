# Project Context

## 1. Project Purpose
`2dto` adalah developer utility tool privat dan gratis yang berjalan 100% di sisi klien (browser) untuk mengubah payload JSON menjadi definisi Java Data Transfer Object (DTO) modern (Java Class POJO, Java 17+ Record, dan Lombok Class). Solusi ini dirancang untuk mengatasi risiko kebocoran data sensitif (PII, skema database perusahaan) saat developer menggunakan konverter daring pihak ketiga.

---

## 2. System Boundary
- **In Boundary**:
  - Web UI SPA dengan dual-pane code editor Monaco (resizable dengan pembatas 50% lebar layar).
  - In-browser AST generator, lossless number parser, inferrer, sanitizer, dan generator kode Java.
  - Multi-file separation untuk sub-objek bersarang dengan tab bar interaktif.
  - Indikator status JSON real-time (hijau: valid, kuning: kosong, merah: invalid).
  - Export fitur: Copy to clipboard dan download individual `.java` atau `.zip` (multi-file).
  - Static hosting via GitHub Pages.
- **Out of Boundary**:
  - Tidak memiliki backend server / REST API runtime.
  - Tidak memiliki database atau server-side storage (Zero Persistence Policy).
  - Tidak melakukan konversi balik (Java Class -> JSON Payload).

---

## 3. Main Actors & Personas
- **Backend Developer (Java, Spring Boot, Quarkus, Micronaut)**: Mengonversi contoh payload response REST API, webhook, atau event Kafka menjadi kontrak DTO Java yang strictly typed.
- **Security-Conscious Engineer**: Pengembang yang membutuhkan jaminan 0-byte payload leak ke server eksternal saat memproses data internal perusahaan.

---

## 4. Important Domain Concepts & Glossary
- **Record**: Tipe data immutable canonical constructor yang diperkenalkan sejak Java 14/16/17+.
- **POJO Class**: Plain Old Java Object standar yang memiliki private fields, constructors, getters, dan setters tanpa dependensi eksternal library.
- **Lombok**: Library Java yang meng-generate getters, setters, dan constructors secara otomatis saat compile-time via anotasi `@Data` dan `@Builder`.
- **Lossless Number**: Representasi angka yang disimpan sebagai string digit asli sebelum evaluasi tipe untuk mencegah batas IEEE-754 ($> 2^{53} - 1$).
- **Jakarta Validation**: Anotasi validasi standar Java EE / Jakarta EE (`@NotNull`, `@Valid`).

---

## 5. External Systems & Integrations
- **GitHub Pages / Actions**: Infrastruktur static asset CDN dan otomatisasi deployment.
- **Monaco Editor (VS Code Web Engine)**: Engine text editor yang di-load via CDN `@monaco-editor/react`.

---

## 6. Runtime Environment & Constraints
- **Target Deployment**: Static Hosting (Custom Domain `https://2dto.kanggara.my.id/`).
- **Base Path**: `/` (Root domain base).
- **Runtime**: Browser modern berbasis Chromium, Firefox, atau WebKit/Safari dengan dukungan WebAssembly / ES2022.
- **Package Manager & Toolchain**: Bun 1.4+ dan Vite 8.
