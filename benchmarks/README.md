# Master Direktori Riset & Benchmark Data Properti Nasional
## Repositori Acuan Standar Internasional & Regulasi Domestik untuk Sistem Bank Data Penilai Indonesia (SIPPRO TWR)

Repositori ini menyimpan berkas dokumen primer, regulasi hukum, spesifikasi data transaksi, script pipeline ekstraksi, dan contoh dataset resmi dari negara-negara acuan (Malaysia, Singapura, Australia, Inggris) serta standar multilateral (World Bank, IVSC, ISO).

---

## Struktur Folder & Inventaris Dokumen

### 📁 `01_indonesia_regulatory_and_valuation_standards/`
*Landasan hukum, standar profesi, dan regulasi agunan perbankan Indonesia:*
- **`KEPI_SPI_2018_Standar_Penilaian_Indonesia.pdf` (3.87 MB):** Dokumen resmi Standar Penilaian Indonesia (SPI) edisi VII 2018 dan Kode Etik Penilai Indonesia (KEPI) oleh MAPPI & KPSPI. Memuat SPI 106 (Pendekatan Pasar), SPI 101/102, SPI 202 (Agunan Bank).
- **`PMK_228_PMK.01_2019_Penilai_Publik.pdf` (1.75 MB):** Peraturan Menteri Keuangan RI No. 228/PMK.01/2019 tentang Perubahan Kedua atas PMK 101/PMK.01/2014. Memuat dasar hukum kewajiban KJPP memiliki sistem pangkalan data penilaian berbasis teknologi informasi.
- **`PMK_101_PMK.01_2014_Penilai_Publik.pdf` (675 KB):** Regulasi dasar Kementerian Keuangan mengenai profesi Penilai Publik di Indonesia.
- **`POJK_40_POJK.03_2019_Penilaian_Kualitas_Aset_Bank_Umum.pdf` (810 KB):** Peraturan Otoritas Jasa Keuangan (OJK) tentang penilaian kualitas aset bank, ketentuan agunan, penilaian independen, dan haircut likuidasi.
- **`INDONESIA_PROPERTY_DATA_INFRASTRUCTURE_AUDIT.md`:** Kajian mendalam mengenai problem asimetri informasi, distorsi pajak (BPHTB/PPh vs NJOP), ketiadaan data transaksi sekunder, dan urgensi pembangunan Bank Data Penilai terpusat.

---

### 📁 `02_malaysia_napic_jpph/`
*Model departemen penilaian pemerintah & pusat data properti nasional terpadu:*
- **`MALAYSIA_NAPIC_JPPH_SYSTEM_ARCHITECTURE.md`:** Analisis arsitektur sistem NAPIC (National Property Information Centre) & JPPH (Jabatan Penilaian dan Perkhidmatan Harta) Kementerian Kewangan Malaysia. Membahas penangkapan data 100% statuter melalui Duti Setem (LHDN), penanganan unit *overhang*, dan portal penilai berdaftar.
- **`NAPIC_DATA_DICTIONARY_AND_TRANSACTION_SCHEMA.json`:** Kamus data representatif skema rekaman transaksi properti NAPIC/JPPH.

---

### 📁 `03_singapore_ura_sla/`
*Model transparansi transaksi mikro berbasis instrumen hukum Caveat:*
- **`SINGAPORE_URA_REALIS_SLA_CAVEAT_SYSTEM.md`:** Analisis sistem Caveat di bawah Land Titles Act Singapura, integrasi registri hak milik SLA (Singapore Land Authority) dengan URA REALIS, serta penerapannya oleh penilai SISV.
- **`Singapore_HDB_Resale_Transaction_Sample.csv`:** Sampel 100 baris data transaksi aktual flat residensial yang diunduh langsung dari API resmi Pemerintah Singapura (`data.gov.sg`).
- **`Singapore_HDB_Resale_Prices_Metadata.json`:** Spesifikasi kolom dan metadata resmi dari Housing & Development Board (HDB) Singapura.
- **`Singapore_HDB_Resale_Transaction_Sample.json`:** Sampel format JSON untuk integrasi API.

---

### 📁 `04_australia_valuer_general/`
*Model statuter Valuer-General & ekosistem data komersial-perbankan (CoreLogic / API):*
- **`AUSTRALIA_VALUER_GENERAL_CORELOGIC_API_FRAMEWORK.md`:** Analisis peran statuter Valuer-General di Australia, mekanisme wajib pelaporan *Notice of Sale (NOS)* saat settlement, sinergi dengan CoreLogic (RP Data), dan standar penilaian Australian Property Institute (API).
- **`NSW_Valuer_General_Data_Guide.md`:** Panduan teknis resmi pemrosesan file data penjualan properti (Property Sales Information - PSI).
- **`NSW_Valuer_General_Data_Extraction_Pipeline.py`:** Script pipeline Python lengkap untuk ekstraksi, normalisasi skema pasca-2001 (Record B & C), pembersihan data, dan deduplikasi arsip Valuer General.
- **`NSW_Valuer_General_Download_Pipeline.py`:** Script otomatisasi unduh data mingguan dan tahunan dari portal resmi Valuer General.

---

### 📁 `05_global_frameworks_transparency/`
*Standar internasional, studi multilateral, dan dokumen transparansi global:*
- **`World_Bank_Property_Tax_Diagnostic_Manual_2020.pdf` (7.00 MB):** Panduan teknis Bank Dunia (Roy Kelly, Roland White, Aanchal Anand) mengenai administrasi penilaian properti, cakupan kadaster, identifikasi properti unik (PIN/NOP), dan transparansi transaksi.
- **`UK_HM_Land_Registry_Price_Paid_Data_Sample.csv`:** Sampel data transaksi riil dari rilis resmi bulanan HM Land Registry Inggris di bawah Open Government Licence (OGL).
- **`UK_HM_Land_Registry_Price_Paid_Data_Specification.md`:** Spesifikasi teknis 16 kolom baku HM Land Registry Price Paid Data.
- **`arXiv_2008.05051_Spatial_Temporal_Real_Estate_Price_Prediction.pdf` (3.9 MB):** Publikasi riset terbitan arXiv mengenai pemodelan prediksi harga properti menggunakan Graph Convolutional Networks (GCN) dan LSTM spasial-temporal.
- **`arXiv_2110.07151_ML_Hedonic_Methods_Real_Estate_Price_Prediction.pdf` (1.1 MB):** Riset perbandingan model Machine Learning vs Regresi Hedonik dalam valuasi properti.
- **`GLOBAL_BENCHMARK_SYNTHESIS_AND_INDONESIA_BLUEPRINT.md`:** Dokumen sintesis menyeluruh yang memetakan peringkat transparansi global (JLL GRETI), standar IVSC IVS 105, ISO 19152 LADM, dan cetak biru arsitektur teknis SIPPRO TWR.

---

## Verifikasi Integritas Berkas
Seluruh file PDF dan dataset dalam folder ini bersumber langsung dari institusi resmi pemerintah dan badan standar internasional:
- Kementerian Keuangan RI / PPPK (JDIH Kemenkeu)
- Otoritas Jasa Keuangan (OJK RI)
- Masyarakat Profesi Penilai Indonesia (MAPPI / KPSPI)
- Government of Singapore (data.gov.sg / HDB)
- NSW Government Valuer General Australia
- HM Land Registry United Kingdom (GOV.UK)
- The World Bank (Documents & Knowledge Repository)
- arXiv Open Research Repository
