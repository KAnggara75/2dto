# STEP.md: Client-Side JSON to Java DTO Converter

Panduan teknis langkah-demi-langkah untuk membangun single-page application (SPA) konverter JSON ke Java DTO (Java 17+ Record & Lombok POJO) berbasis React + TypeScript + Vite tanpa backend server, siap di-deploy ke GitHub Pages.

---

## 1. Project Directory Structure

```text
json-to-dto-web/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions workflow untuk GitHub Pages
├── src/
│   ├── components/
│   │   ├── EditorWorkspace.tsx   # Dual pane editor (Monaco Editor)
│   │   ├── ConfigToolbar.tsx     # Opsi: Record vs Lombok, package name, toggle validasi
│   │   └── Header.tsx            # App bar & action buttons (Copy, Download, Share URL)
│   ├── lib/
│   │   ├── converter/
│   │   │   ├── inferrer.ts       # Type inference logic (string, number, array, object)
│   │   │   ├── generator.ts      # Template generator untuk Record dan Lombok POJO
│   │   │   ├── sanitizer.ts      # Sanitasi Java reserved keywords & casing
│   │   │   └── types.ts          # Type definition AST & konfigurasi konversi
│   │   └── utils/
│   │       └── parser.ts         # JSON parser (lossless number parsing)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts                # Konfigurasi base URL untuk GitHub Pages
└── README.md
```

---

## 2. Inisialisasi & Setup Dependensi

Eksekusi perintah berikut untuk membuat scaffolding proyek Vite dengan template TypeScript:

```bash
npm create vite@latest json-to-dto-web -- --template react-ts
cd json-to-dto-web

# Install UI editor & utilities
npm install @monaco-editor/react lucide-react clsx tailwindcss @tailwindcss/vite lossless-json

# Setup TypeScript types jika diperlukan
npm install -D @types/node
```

> **Catatan Teknis Dependensi:** Library `lossless-json` digunakan menggantikan `JSON.parse` native untuk mencegah bug pemotongan angka integer 64-bit (`Long` / `BigInteger` yang melampaui $2^{53} - 1$) ke float standar JavaScript.

---

## 3. Implementasi Core Converter Engine (TypeScript)

### Step 3.1: Definisi Type & AST (`src/lib/converter/types.ts`)
Definisikan model representasi field metadata sebelum dirender ke sintaks Java.

```typescript
export type DtoTargetType = 'RECORD' | 'LOMBOK';

export interface ConverterConfig {
  rootClassName: string;
  packageName: string;
  dtoType: DtoTargetType;
  useJakartaValidation: boolean;
  useLombokBuilder: boolean;
  detectIsoDates: boolean;
}

export interface FieldMetadata {
  originalKey: string;
  sanitizedFieldName: string;
  javaType: string;
  isNestedObject: boolean;
  nestedClassName?: string;
  isCollection: boolean;
}

export interface ClassMetadata {
  className: string;
  fields: FieldMetadata[];
}
```

### Step 3.2: Sanitizer & Reserved Keywords (`src/lib/converter/sanitizer.ts`)
Tangani konversi casing dan kata kunci terlarang bahasa Java:

```typescript
const JAVA_RESERVED = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
  'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
  'try', 'void', 'volatile', 'while', 'record'
]);

export function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function sanitizeFieldName(key: string): { name: string; needsAnnotation: boolean } {
  let camel = toCamelCase(key);
  let needsAnnotation = camel !== key;

  if (JAVA_RESERVED.has(camel)) {
    camel = `${camel}Val`;
    needsAnnotation = true;
  }
  return { name: camel, needsAnnotation };
}
```

### Step 3.3: Type Inferrer Engine (`src/lib/converter/inferrer.ts`)
Aturan inferensi tipe:
- **Angka bulat:** Rentang `[-2^31, 2^31 - 1]` -> `Integer`. Melebihi rentang -> `Long`.
- **Angka desimal:** Mengandung pecahan -> `Double`.
- **String ISO-8601:** `^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$` -> `java.time.Instant` atau `java.time.LocalDate`.
- **Array:** Homogen (`List<T>`), Objek bertingkat (`List<ChildDto>`), Kosong/Heterogen (`List<Object>`).
- **Objek:** Buat instance `ClassMetadata` baru dan daftarkan ke AST pool secara rekursif.

### Step 3.4: Java Code Generator (`src/lib/converter/generator.ts`)
Fungsi serializer dari `ClassMetadata[]` menjadi representasi string Java valid:
- **Record Template:** Format inline canonical constructor parameter.
- **Lombok Template:** Class reguler dengan anotasi `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- Tambahkan import package `com.fasterxml.jackson.annotation.JsonProperty` dan `java.util.List`.

---

## 4. Implementasi UI Workspace (React + Monaco)

### Step 4.1: Workspace State Management (`src/App.tsx`)
- Sediakan state untuk `rawJson`, `generatedCode`, `errorFeedback`, dan `config`.
- Gunakan hooks `useDeferredValue` atau `useMemo` dengan debounce 300ms agar rendering output Java tetap responsif tanpa lag saat user mengetik JSON berukuran ribuan baris.

### Step 4.2: Monaco Editor Configuration
- **Left Pane:** Language mode `json`, opsi format on paste aktif, minimap non-aktif.
- **Right Pane:** Language mode `java`, read-only `true`, fold style aktif.
- Action toolbar: Tombol copy to clipboard dengan feedback toast visual.

---

## 5. Konfigurasi Deployment GitHub Pages

### Step 5.1: Konfigurasi `vite.config.ts`
Atur base path agar asset path relative sesuai sub-path GitHub Pages repository:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Sesuaikan dengan nama repo GitHub Anda: https://<username>.github.io/<repo-name>/
  base: process.env.NODE_ENV === 'production' ? '/<nama-repo-anda>/' : '/',
});
```

### Step 5.2: CI/CD Workflow (`.github/workflows/deploy.yml`)
Tambahkan otomatisasi deployment setiap kali ada commit baru ke branch `main`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 5.3: Setup GitHub Repository Settings
1. Buka tab **Settings** di repository GitHub Anda.
2. Pilih menu **Pages** di panel sebelah kiri.
3. Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**.

---

## 6. Checklist Verifikasi & Testing

- [ ] **Large Integer Parsing:** Angka ID besar (misal: `189283719283719283`) berhasil dipetakan ke `Long` tanpa overflow/pembulatan.
- [ ] **ISO Timestamp:** Key bertipe `"2026-09-09T14:48:00Z"` otomatis diinferensi sebagai `Instant`.
- [ ] **Recursive Sub-classes:** Payload dengan kedalaman objek 3+ level menghasilkan class/record independen yang terstruktur rapi.
- [ ] **Java Keyword Escaping:** Key `"class"` atau `"public"` menghasilkan variable yang disanitasi beserta anotasi `@JsonProperty`.
- [ ] **Zero Network Leak:** Verifikasi tab Network browser developer tools untuk memastikan data JSON tidak pernah dikirim ke host eksternal.