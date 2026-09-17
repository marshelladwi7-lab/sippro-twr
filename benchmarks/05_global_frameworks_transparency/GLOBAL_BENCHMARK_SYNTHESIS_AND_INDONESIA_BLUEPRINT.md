# Sintesis Benchmark Global & Cetak Biru Sistem Bank Data Penilai Indonesia (SIPPRO TWR)

## 1. Matriks Perbandingan Transparansi Properti Global (JLL GRETI Framework)

Berdasarkan *Global Real Estate Transparency Index (GRETI)* dan praktik tata kelola data pertanahan internasional:

| Indikator | Australia (NSW VG / CoreLogic) | Singapura (URA REALIS / SLA) | Malaysia (JPPH / NAPIC) | Inggris (HM Land Registry) | Indonesia (Kondisi Saat Ini) | Target SIPPRO TWR Bank Data |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tingkat Transparansi (JLL GRETI)** | **Tier 1** (Highly Transparent) | **Tier 2** (Transparent) | **Tier 3** (Semi-Transparent) | **Tier 1** (Highly Transparent) | **Tier 4** (Low / Semi-Transparent) | **Tier 2 Equivalent Platform** |
| **Sumber Data Primer** | *Notice of Sale* (eNOS) wajib saat settlement | *Caveat* perlindungan hak di Land Titles Act | Registrasi Bea Meterai (LHDN) + Adjudikasi Penilai JPPH | *Transfer Deed* wajib saat pendaftaran hak | Scraping portal listing iklan (Rumah123, OLX) | Data Transaksi KPR Bank, Lelang KPKNL, & Riset Terverifikasi KJPP |
| **Akurasi Nilai Terlapor** | 100% Harga Kontrak Riil | 100% Harga Kontrak Riil | 100% Nilai Transaksi / Nilai Pasar JPPH | 100% Harga Akta Pengalihan | Sering *under-invoiced* mengikuti NJOP | Data tervalidasi dengan audit trail penilai berlisensi MAPPI |
| **Akses Data Penilai** | Langganan API CoreLogic / ValEx oleh semua bank & CPV | Langganan REALIS URA oleh semua penilai SISV | Portal PRISM JPPH untuk penilai berdaftar LPPEH | Open Data CSV (OGL v3.0) bebas royalti | Terkunci di file Excel masing-masing KJPP | Cloud Multi-Tenant System terenkripsi dengan API standar |
| **Dukungan Spasial (GIS)** | Kadaster Nasional (Geoscape Australia) | OneMap Cadastre (SLA) | e-Tanah GIS | INSPIRE Cadastral Parcels | Terfragmentasi (Bhumi ATR/BPN terpisah dari data transaksi) | PostGIS (EPSG:4326) + MapLibre GL + OpenStreetMap Tiles ($0 Stack) |

---

## 2. Keselarasan dengan Standar Penilaian Internasional (IVSC) & ISO 19152

### A. IVS 105 (Valuation Approaches and Methods - Market Approach)
Standar internasional yang diterbitkan oleh *International Valuation Standards Council (IVSC)* menegaskan:
1. **Hierarki Keandalan Data:**
   - Tingkat 1: Transaksi aktual aset yang identik dalam kondisi pasar yang sama pada tanggal penilaian.
   - Tingkat 2: Transaksi aset sejenis dengan penyesuaian (*adjustments*) yang objektif dan terukur.
   - Tingkat 3: Data penawaran (*asking prices*) yang wajib disertai verifikasi diskon tawar-menawar pasar.
2. SIPPRO TWR mengadopsi struktur IVS 105 dengan mewajibkan setiap entitas data memiliki atribut `source_type`: `'TRANSAKSI_AKTUAL'`, `'PENCAIRAN_KPR'`, `'LELANG_AGUNAN'`, atau `'PENAWARAN_LISTING'`.

### B. ISO 19152: Land Administration Domain Model (LADM) - Part 4 Valuation
Model konseptual data standar ISO yang dikembangkan bersama FIG (International Federation of Surveyors) menetapkan struktur integrasi:
- **`ValuationUnit`:** Unit tunggal aset penaksiran (mengacu pada NOP di Indonesia).
- **`SpatialUnit`:** Geometri poligon atau titik koordinat (Point EPSG:4326).
- **`TransactionRecord`:** Riwayat transaksi dengan harga jual, tanggal, dan pihak terkait.
- **`ValuationRecord`:** Hasil taksiran Nilai Pasar (*Market Value*) dan Nilai Likuidasi (*Liquidation Value*) yang dihasilkan penilai.

---

## 3. Cetak Biru Arsitektur Teknis SIPPRO TWR Indonesia

Berdasarkan sintesis keunggulan Malaysia, Singapura, Australia, dan Inggris, sistem Bank Data Properti Penilai Indonesia ini dibangun dengan fondasi:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      INGESTION & CLEANING LAYER                         │
│  - Pembersihan String Koordinat Anomali ("1,078611, 04.134472" -> WGS84)│
│  - Validasi Outlier Luas (LT/LB > 1.000.000 m² / Luas <= 0)             │
│  - Penanganan Data Null & Deteksi Duplikasi Entitas                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   SPATIAL & DATABASE LAYER (PostGIS)                    │
│  - PostGIS Geometry (Point, 4326) dengan Spatial Index GIST             │
│  - Query Radius Spasial: ST_DWithin(geom, ST_MakePoint(lon, lat), dist) │
│  - Integrasi Zonasi: Kode ZNT, KDB, KLB, Elevasi Muka Jalan             │
│  - Zero-Cost Infrastructure: Supabase Free Tier + MapLibre GL           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                VALUATION ENGINE (SPI 106 & POJK 40/2019)                │
│  - Market Comparison Formula: Indicated Value = P_comp * (1 + Σ Adj)    │
│  - Matriks Penyesuaian Indonesia Terstandarisasi:                       │
│      * Legalitas: SHM (1.0), HGB (-5% s.d. -10%), Girik (-15% s.d. -25%)│
│      * Bentuk Tapak: Tusuk Sate (-5% s.d. -10%), Kantong Semar (+5%)   │
│      * Akses Jalan: Lebar ROW (<3m, 3-5m, 6-8m, >8m)                   │
│      * Elevasi Jalan: Rata (0), Lebih Rendah/Banjir (-5% s.d. -15%)     │
│  - POJK 40/2019 Collateral Haircut (Nilai Likuidasi Agunan Bank)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE & AUDITING                        │
│  - Peta Interaktif Kerapatan Data Bebas Biaya (CARTO Positron)          │
│  - Dashboard Eksekutif Kepatuhan PMK 228/2019 & PPPK Kemenkeu           │
│  - Audit Trail: Riwayat Perubahan Data & Log Akses Penilai              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Kesimpulan Strategis bagi Penilai Properti Indonesia

Sistem Bank Data Kolektif ini bukan sekadar alat pembantu pencarian data internal, melainkan **infrastruktur dasar penegakan integritas profesi penilai di Indonesia**:
1. Menjawab ketertinggalan transparansi data properti Indonesia dibandingkan Malaysia (NAPIC), Singapura (REALIS), dan Australia (Valuer-General).
2. Melindungi Penilai Publik dari tuduhan manipulasi data pembanding fiktif di hadapan aparat penegak hukum dan regulator (PPPK Kemenkeu & OJK).
3. Memberikan kepastian mitigasi risiko agunan bagi industri perbankan nasional sesuai POJK 40/POJK.03/2019.
