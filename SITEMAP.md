# 2dto Application & Navigation Sitemap

Peta struktur antarmuka, tata letak fungsional, dan alur konversi aplikasi web **2dto** ([https://2dto.kanggara.my.id/](https://2dto.kanggara.my.id/)).

```
2dto Web Application (Root /)
│
├── 1. Top Configuration & Navigation Toolbar (ConfigToolbar)
│   ├── [Ext] GitHub Repository Link (https://github.com/KAnggara75/2dto)
│   ├── DTO Target Mode Toggle
│   │   ├── Java Class (POJO - Default)
│   │   └── Java 17+ Record
│   ├── Class & Package Customization
│   │   ├── Root Class Name Input (Default: CustomerProfile / RootDto)
│   │   └── Package Name Input (Default: com.example.dto)
│   └── Annotation & Feature Options (Checkboxes)
│       ├── @JsonProperty (Jackson field mapping)
│       ├── ISO Dates (Instant / LocalDate auto-inference)
│       ├── Jakarta Validation (@NotNull, @Valid)
│       └── Lombok Options (Hanya aktif pada mode Java Class)
│           ├── @Data, @NoArgsConstructor, @AllArgsConstructor
│           └── @Builder
│
└── 2. Dual-Pane Resizable Editor Workspace (EditorWorkspace)
    │
    ├── 2.1 Left Pane: JSON Input Editor
    │   ├── Header Bar
    │   │   ├── Real-Time Status Dot (Green: Valid, Yellow: Empty, Red: Invalid)
    │   │   └── Auto-format info
    │   └── Monaco JSON Editor
    │       ├── Auto formatting on paste / type
    │       └── In-line syntax error markers
    │
    ├── 2.2 Central Resizer
    │   └── Drag-to-Resize Handle (Batas lebar panel input: Min 20% - Max 50% layar)
    │
    └── 2.3 Right Pane: Generated Java DTO Output
        ├── Header Bar (Quick Actions)
        │   ├── Multi-File Class Tabs (Navigasi file per objek bersarang)
        │   ├── Load Sample Button (Load JSON demo)
        │   ├── Copy Code Button (Salin kode Java aktif)
        │   └── Download Button (.java atau .zip bundle jika multi-file)
        └── Monaco Java Editor (Read-only)
            ├── Java Syntax Highlighting
            └── Class & Record preview
```

---

## Web Discovery & SEO Endpoints

| Resource / URL | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `https://2dto.kanggara.my.id/` | SPA Page | Halaman utama aplikasi konverter 2dto |
| `https://2dto.kanggara.my.id/sitemap.xml` | XML Sitemap | Standard XML sitemap untuk perayapan search engine |
| `https://2dto.kanggara.my.id/robots.txt` | Robots File | Aturan crawler bot dengan referensi sitemap |
| `https://github.com/KAnggara75/2dto` | GitHub Repo | Kode sumber terbuka repositori proyek |
