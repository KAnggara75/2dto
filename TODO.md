# Project TODO & Technical Debt

## 1. Immediate Tasks
_Tugas atau perbaikan yang mempengaruhi keandalan, kelengkapan, dan pengujian saat ini._
- [ ] Tambahkan unit test untuk kombinasi `@JsonProperty` dan `@NotNull` pada mode Java Record.
- [ ] Tambahkan verifikasi parsing JSON berukuran besar (> 500 KB) untuk mengukur batas render Monaco editor.

## 2. Existing Code Annotations (TODO / FIXME)
_Daftar TODO/FIXME yang tercantum langsung di dalam source code._
- *Tidak ditemukan catatan TODO/FIXME di dalam direktori `src/` (Clean).*

## 3. Technical Debt & Structural Improvements
_Pekerjaan arsitektural/refactoring jangka panjang untuk maintainability dan kenyamanan pengguna._
- [ ] **Dual Base URL Support**: Sediakan fallback otomatis atau environment variable untuk mendeteksi apakah aplikasi di-deploy di root custom domain (`https://2dto.kanggara.my.id/`) atau subpath GitHub Pages default (`https://kanggara75.github.io/2dto/`).
- [ ] **Web Worker Offloading**: Untuk payload JSON di atas 2 MB, pertimbangkan menjalankan proses `TypeInferrer` dan `generator` di Web Worker terpisah agar UI main thread tetap 100% mulus.
- [ ] **Format JSON Button**: Tambahkan tombol eksplisit "Format JSON / Prettify" di toolbar input Monaco jika user ingin merapikan payload yang belum terformat.
- [ ] **Pilihan Deserializer Lain**: Pertimbangkan opsi anotasi selain Jackson, misalnya Gson (`@SerializedName`) jika ada kebutuhan dari komunitas developer.
