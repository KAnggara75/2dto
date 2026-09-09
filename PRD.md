# PRD: Client-Side JSON to Java DTO Converter

Spesifikasi produk dan teknis untuk tool konversi JSON ke Java DTO (Java 17+ Record & Lombok POJO) berbasis peramban (in-browser) tanpa ketergantungan server/backend hosting.

---

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Sebagian besar developer backend ragu menggunakan converter web pihak ketiga karena kekhawatiran kebocoran data internal (payload JSON sering memuat struktur database, PII, atau data bisnis sensitif). Di sisi lain, menjalankan backend mandiri (seperti Go/Java API pada VPS) membutuhkan biaya sewa cloud, monitoring container, dan maintenance berkala.

### 1.2 Objective
Menyediakan developer tool statis, cepat, dan 100% privat yang berjalan sepenuhnya di sisi browser klien (in-memory AST engine), di-hosting secara gratis menggunakan GitHub Pages, serta mampu menghasilkan Java DTO modern (Java 17 Record dan Lombok Class).

### 1.3 Key Metrics & Success Criteria
* **Biaya Operasional:** $0 / bulan (Zero Cloud Bill).
* **Latency:** < 10 ms untuk rendering DTO payload JSON standar (< 500 baris).
* **Data Privacy:** 0 byte data keluar ke network (air-gapped safe).

---

## 2. User Persona & Scope

| Persona | Kebutuhan Utama | Nilai Tambah Client-Side |
|---|---|---|
| **Backend Engineer (Java / Quarkus / Spring)** | Generate DTO kontrak REST/Kafka secara cepat dari JSON sample. | Tidak perlu khawatir data confidential perusahaan terkirim ke server pihak ketiga. |
| **Tech Lead / Maintainer** | Ingin menyediakan tool utilitas tim yang tidak membutuhkan operasional maintenance. | Cukup deploy sekali ke GitHub Pages, tidak ada patch OS / maintenance server. |

* **In-Scope:**
  * Parsing JSON in-browser menggunakan non-lossy number decoder.
  * Dukungan output Java 17+ `record` (default) dan Java 8/11 Lombok `@Data`.
  * Sanitasi reserved keywords, pemetaan regex datetime ISO-8601, array homogen/heterogen.
  * Fitur ekspor: Copy-to-clipboard dan download file `.java`.
* **Out-of-Scope:**
  * Penyimpanan schema ke database (zero persistence policy).
  * Reverse convert (Java class ke JSON payload).

---

## 3. Functional Requirements (FR)

### 3.1 Type Inference Engine (In-Browser TypeScript)
* **FR-01 (Precision-Safe Number Inference):**
  * Parser tidak boleh membulatkan integer 64-bit menggunakan float default JS.
  * Integer rentang signed 32-bit dipetakan ke `Integer`.
  * Integer di atas 32-bit hingga signed 64-bit dipetakan ke `Long`.
  * Float / double dipetakan ke `Double`.
* **FR-02 (Date / Time Inference):**
  * Deteksi string berbasis ISO-8601 regex pattern.
  * Menghasilkan tipe `java.time.Instant` untuk format UTC timestamp atau `java.time.LocalDate` untuk format kalender murni.
* **FR-03 (Recursive Object Extraction):**
  * Nested object JSON harus diekstraksi menjadi record/class terpisah dan didefinisikan sebelum atau sesudah root class.
  * Penamaan nama sub-class diturunkan secara deterministik dari nama property JSON (PascalCase).
* **FR-04 (Identifier Sanitization):**
  * Konversi naming: field menjadi `lowerCamelCase`, nama class menjadi `PascalCase`.
  * Deteksi Java Reserved Keywords (contoh: `default`, `class`, `import`, `record`).
  * Jika nama key bentrok, beri suffix `Val` dan tambahkan `@JsonProperty("original_key")`.

### 3.2 Output Generation Mode
* **FR-05 (Mode Record - Modern Java):**
  ```java
  package com.example.dto;

  import com.fasterxml.jackson.annotation.JsonProperty;
  import java.util.List;

  public record CustomerProfile(
      @JsonProperty("customer_id") Long customerId,
      @JsonProperty("name") String name
  ) {}
  ```
* **FR-06 (Mode Lombok Class - Legacy/Mutable Java):**
  ```java
  package com.example.dto;

  import com.fasterxml.jackson.annotation.JsonProperty;
  import lombok.Data;
  import lombok.Builder;
  import lombok.NoArgsConstructor;
  import lombok.AllArgsConstructor;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public class CustomerProfile {
      @JsonProperty("customer_id")
      private Long customerId;
      @JsonProperty("name")
      private String name;
  }
  ```

### 3.3 Workspace & Interaction
* **FR-07 (Dual Workspace Editor):** Integrasi Monaco Editor dengan auto-formatting dan syntax error highlighting di sisi JSON input.
* **FR-08 (Immediate Reactivity):** Preview DTO diperbarui secara instan saat user mengubah input JSON (menggunakan debounced background calculation).
* **FR-09 (Quick Export):** Tombol copy dengan feedback visual sukses dan tombol download satu file `.java`.

---

## 4. Non-Functional Requirements (NFR)

* **NFR-01 (Zero Network Leakage):** Aplikasi tidak boleh melakukan AJAX, Fetch, atau WebSocket request apa pun ke remote server saat proses konversi.
* **NFR-02 (Performance & Responsiveness):** Tidak terjadi freeze pada main thread UI browser saat memproses JSON hingga 1 MB. Operasi komputasi harus selesai di bawah 50 ms.
* **NFR-03 (Hosting & Availability):** Dibangun sebagai bundle static assets (HTML/CSS/JS) murni tanpa dynamic server runtime, menjamin uptime 99.99% di bawah SLA GitHub Pages.
* **NFR-04 (Cross-Browser Compatibility):** Berjalan optimal pada Chromium-based browser (Chrome, Edge, Brave), Firefox, dan Safari versi modern.

---

## 5. In-Browser Data Flow & Architecture

```text
+-------------------------------------------------------------+
|                      Browser Runtime                        |
|                                                             |
|  [ User Input JSON ]                                        |
|         │                                                   |
|         ▼                                                   |
|  [ Lossless Parser ] ──(Raw Tokens & Preserved Numbers)     |
|         │                                                   |
|         ▼                                                   |
|  [ Inferrer Engine ] ──(Type Analysis & AST Build)          |
|         │                                                   |
|         ▼                                                   |
|  [ Sanitizer ]       ──(Keywords & Case Transformation)     |
|         │                                                   |
|         ▼                                                   |
|  [ Code Generator ]  ──(Produce Record / Lombok String)     |
|         │                                                   |
|         ▼                                                   |
|  [ Monaco Java Editor View ]                                |
+-------------------------------------------------------------+
```

---

## 6. Edge Cases & Handling Strategy

| Skenario Edge Case | Potensi Masalah | Solusi Penanganan |
|---|---|---|
| **Nilai Null** (`"email": null`) | Type inference tidak dapat mendeteksi tipe data asli. | Fallback ke generic `Object` atau sediakan opsi konfigurasi fallback default ke `String`. |
| **Array Kosong** (`"items": []`) | Tipe generic list tidak diketahui. | Fallback ke `List<Object>`. |
| **Array Primitif Heterogen** (`[1, "dua", true]`) | Tipe data Java strictly typed tidak mendukung list campuran tanpa generic wildcard. | Petakan secara aman ke `List<Object>`. |
| **Number Precision Overflow** | Nilai database ID 64-bit terpotong/dibulatkan oleh JS runtime. | Gunakan `lossless-json` tokenizer untuk menjaga integritas string digit sebelum dievaluasi. |
| **Root JSON adalah Array** (`[{...}]`) | Gagal menginferensi root class entity. | Bungkus class turunan menjadi `ItemResponse`, dan hasilkan root identifier `List<ItemResponse>`. |

---

## 7. Delivery Roadmap

* **Phase 1 (Core Engine):** Implementasi parser lossless, type inferrer, sanitizer, dan generator Record Java.
* **Phase 2 (Editor Integration):** Implementasi dual-pane Monaco Editor, panel konfigurasi opsi Lombok, dan export utilities.
* **Phase 3 (Testing & Optimization):** Penanganan edge-cases (null, nested collision, numeric boundary) dan audit network zero-leak.
* **Phase 4 (Deployment):** Setup GitHub Actions pipeline dan verifikasi live deployment di GitHub Pages.