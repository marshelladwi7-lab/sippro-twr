# Benchmark Australia: Lembaga Valuer-General, Notice of Sale, & Ekosistem CoreLogic / API

## 1. Lembaga Valuer-General & Kerangka Hukum Penilaian di Australia
- **Lembaga Statuter:** **Valuer-General** di setiap negara bagian Australia (misal: NSW Valuer General dibentuk berdasarkan *Valuation of Land Act 1916*).
- **Karakteristik Kunci:** Valuer-General adalah pejabat independen yang ditunjuk undang-undang, bertanggung jawab menjamin integritas dan transparansi nilai tanah di seluruh yurisdiksi.
- **Asosiasi Profesi Penilai:** **Australian Property Institute (API)**, menerbitkan standar *Australia and New Zealand Valuation and Property Guidance Notes (ANZVGN)* dengan gelar sertifikasi profesi **Certified Practising Valuer (CPV)**.

---

## 2. Mekanisme Penangkapan Data: Statutory Notice of Sale (NOS)

Australia memiliki tingkat transparansi data properti tertinggi di dunia (Tier 1 - *Highly Transparent* pada JLL Global Transparency Index) karena pelaporan transaksi bersifat **wajib secara hukum saat proses penyelesaian jual beli (*settlement*)**:

```
[Penjual & Pembeli Menandatangani Kontrak Jual Beli]
                        │
                        ▼
   [Proses Penyelesaian Legal / Settlement oleh Pengacara]
                        │
                        ▼
[Kewajiban Pengisian Formulir Statuter: Notice of Sale (Form 1 / eNOS)]
                        │
                        ▼
    [NSW Land Registry Services (LRS) & Valuer-General]
  (Mencatat Nomor Hak / Lot-DP, Tanggal Kontrak, Tanggal Settlement,
        Harga Beli, Luas Tanah, Zonasi, Kode Penggunaan)
                        │
                        ▼
┌───────────────────────┴───────────────────────┐
▼                                               ▼
[Bulk Property Sales Information (PSI)]     [Ekosistem Agregator: CoreLogic / RP Data]
- File Delimited (.DAT / ASCII)             - Pengayaan Spasial (Geoscape Cadastre)
- Tersedia untuk Riset & Publik              - Integrasi API ke Seluruh Bank & KJPP
- Riwayat Transaksi Sejak 1990               - Platform Kerja Harian Penilai CPV / API
```

---

## 3. Struktur Data Statuter NSW Valuer General (Skema Pasca-2001)

Sebagaimana terdokumentasi dalam berkas *Property Sales Information Data Files* resmi Valuer General:

| Tipe Data | Elemen Kunci | Deskripsi |
| :--- | :--- | :--- |
| **Identitas Aset** | `Property ID`, `District Code`, `Lot/Section/Plan` | Referensi tunggal yang mengaitkan transaksi secara langsung ke batas bidang tanah kadaster (*Cadastral Parcel*). |
| **Harga & Tanggal** | `Purchase Price`, `Contract Date`, `Settlement Date` | Memisahkan dengan tegas tanggal penandatanganan kesepakatan (*contract date*) dengan tanggal penyerahan fisik/pencairan dana (*settlement date*). |
| **Fisik & Zonasi** | `Area`, `Area Unit (M/H)`, `Zoning Code` | Luas dalam meter persegi atau hektar, disertai kode tata ruang pemda (misal: R2 Low Density Residential, B4 Mixed Use). |
| **Strata / Unit** | `Record C: Unit Number, Strata Plan` | Penanganan khusus untuk properti bertingkat (apartemen/kondominium). |

---

## 4. Ekosistem Publik-Swasta: Sinergi CoreLogic dan Perbankan

Di Australia, perbankan tidak mengizinkan penilai independen menaksir harga agunan tanpa mengutip data transaksi resmi dari sistem:
1. **CoreLogic / RP Data** membeli feed data mentah harian dari seluruh Valuer-General negara bagian.
2. Data diperkaya dengan foto satelit, denah lantai (*floorplan*), izin mendirikan bangunan (DA - *Development Application* dari *Local Council*), dan koordinat akurat.
3. Bank-bank besar di Australia (CBA, Westpac, NAB, ANZ) mengintegrasikan portal CoreLogic / ValEx ke sistem persetujuan kredit mereka.
4. Laporan penilaian yang dibuat oleh penilai CPV diverifikasi silang secara otomatis (*Automated Collateral Audit*) terhadap data transaksi di sekitarnya.

---

## 5. Relevansi Fundamental bagi Sistem Bank Data SIPPRO TWR

1. **Dual Date Tracking (Tanggal Akad vs Tanggal Efektif):**
   - Mengadopsi pola Australia yang memisahkan tanggal kesepakatan harga dengan tanggal pencairan/pembukuan. Hal ini sangat krusial dalam SPI 106 untuk melakukan **Penyesuaian Waktu / Tren Pasar (*Market Conditions Adjustment*)**.
2. **Standardisasi Tata Cara Ekstraksi:**
   - Script ekstraksi pipeline NSW Valuer General (`NSW_Valuer_General_Data_Extraction_Pipeline.py`) yang tersimpan di repositori ini menjadi cetak biru arsitektur ETL (*Extract, Transform, Load*) untuk membersihkan data mentah agunan perbankan di Indonesia.
3. **Validasi Anomali Data (Sanity Checks):**
   - Menolak data penjualan bernilai Rp 0 atau transfer antar keluarga / hibah (*sales not for full market consideration*).
