# 2dto

> **Client-Side JSON to Java DTO Converter (Java 17+ Record & Lombok POJO)**  
> 100% In-Browser AST Engine. Zero Server Costs. Zero Data Leakage.

[![Deploy to GitHub Pages](https://github.com/KAnggara75/2dto/actions/workflows/deploy.yml/badge.svg)](https://github.com/KAnggara75/2dto/actions/workflows/deploy.yml)

## Features

- ⚡ **100% Client-Side Processing**: Operasi parsing dan inferensi tipe data diproses seluruhnya di memori browser Anda via TypeScript AST engine. Tidak ada payload JSON yang dikirimkan ke server/pihak ketiga.
- ☕ **Modern Java Support**:
  - Java 17+ `record` (canonical constructor, default)
  - Java Lombok Class (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- 🔢 **Precision-Safe Numbers**: Menggunakan `lossless-json` untuk mencegah pemotongan dan pembulatan angka integer 64-bit (`Long` / `BigInteger` > $2^{53}-1$).
- 📅 **Date & Time Inference**: Deteksi otomatis string format ISO-8601 ke `java.time.Instant` atau `java.time.LocalDate`.
- 🛡️ **Identifier Sanitization**: Otomatis membersihkan Java reserved keywords (misal: `class`, `default`, `import`) dengan menambahkan suffix `Val` dan anotasi `@JsonProperty`.
- 📝 **Dual-Pane Monaco Editor**: Editor interaktif dengan auto-formatting on paste, validasi syntax error real-time, dan highlight Java syntax.
- 🚀 **Zero-Config Deployment**: Ditenagai oleh Vite + Bun, siap di-deploy secara otomatis ke GitHub Pages melalui GitHub Actions.

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **JSON Engine**: [lossless-json](https://github.com/josdejong/lossless-json)
- **Icons**: [lucide-react](https://lucide.dev/)

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

# Build for production
bun run build
```

## License

[MIT](LICENSE)
