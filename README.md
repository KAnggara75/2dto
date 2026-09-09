# 2dto

> **Client-Side JSON to Java DTO Converter (Standard POJO, Java 17+ Record & Lombok)**  
> 100% In-Browser AST Engine. Zero Server Costs. Zero Data Leakage.

[![Deploy to GitHub Pages](https://github.com/KAnggara75/2dto/actions/workflows/deploy.yml/badge.svg)](https://github.com/KAnggara75/2dto/actions/workflows/deploy.yml)

🌐 **Live Web Application**: [https://2dto.kanggara.my.id/](https://2dto.kanggara.my.id/)

---

## Features

- ⚡ **100% Client-Side Processing**: Operasi parsing dan inferensi tipe data diproses seluruhnya di memori browser Anda via TypeScript AST engine. Tidak ada payload JSON yang dikirimkan ke server/pihak ketiga (Zero Data Leakage).
- ☕ **Versatile Java Output Targets**:
  - **Standard Java POJO Class** (Default): Dilengkapi private fields, no-arg constructor, multiline all-args constructor, serta getter dan setter standar tanpa ketergantungan library eksternal.
  - **Java 17+ `record`**: Konstruktor kanonikal ringkas dan immutable.
  - **Lombok Integration**: Opsional checklist untuk `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, dan `@Builder` pada mode Java Class.
- 🗂️ **Multi-File Separate Output**: Mendukung pemisahan otomatis objek bersarang (*nested objects*) menjadi file `.java` independen (1 class per file) dengan tab bar interaktif serta opsi download bundle `.zip` (via JSZip) atau single file.
- 🔢 **Precision-Safe Numbers**: Menggunakan `lossless-json` untuk mencegah pemotongan dan pembulatan angka integer 64-bit (`Long` / `BigInteger` > $2^{53}-1$).
- 📅 **Date & Time Inference**: Deteksi otomatis string berformat ISO-8601 ke tipe `java.time.Instant` atau `java.time.LocalDate`.
- 🛡️ **Identifier Sanitization & Jackson Support**:
  - Otomatis membersihkan Java reserved keywords (misal: `class`, `default`, `import`, `record`).
  - Anotasi `@JsonProperty` opsional via checkbox.
  - Anotasi Jakarta Validation (`@NotNull`, `@Valid`) opsional.
- 📝 **Dual-Pane Resizable Monaco Editor**:
  - Drag-to-resize divider untuk mengatur lebar editor JSON (maksimal 50% lebar layar).
  - Indikator status JSON real-time (hijau: valid, kuning: kosong, merah: invalid).
  - Quick action buttons (*Load Sample*, *Copy Code*, dan *Download*) terintegrasi langsung di atas panel output kode Java.
- 🚀 **Zero-Config Deployment**: Ditenagai oleh Vite 8 + Bun 1.4+, terdeploy otomatis ke GitHub Pages dan custom domain melalui GitHub Actions.

---

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **JSON Engine**: [lossless-json](https://github.com/josdejong/lossless-json)
- **Archive Generator**: [JSZip](https://stuk.github.io/jszip/)
- **Icons**: [lucide-react](https://lucide.dev/)

---

## Development

Pastikan Anda telah menginstal [Bun](https://bun.sh/):

```bash
# Clone repository
git clone https://github.com/KAnggara75/2dto.git
cd 2dto

# Install dependencies
bun install

# Start development server
bun run dev

# Run unit tests
bun test

# Build for production
bun run build
```

---

## Architecture & Project Memory

Dokumentasi arsitektur dan riwayat keputusan teknis tersedia pada repository:
- [`CODEBASE_MAP.md`](CODEBASE_MAP.md) — Peta navigasi modul dan dependensi.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — Diagram arsitektur dan alur pemrosesan data AST.
- [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — Konteks sistem, batasan, dan konsep domain.
- [`DECISIONS.md`](DECISIONS.md) — Catatan keputusan arsitektural (ADR).
- [`TODO.md`](TODO.md) — Technical debt dan backlog perbaikan.

---

## License

[MIT](LICENSE)
