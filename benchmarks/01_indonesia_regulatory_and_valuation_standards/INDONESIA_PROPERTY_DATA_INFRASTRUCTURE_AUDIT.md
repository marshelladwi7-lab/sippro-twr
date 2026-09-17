# Audit Infrastruktur Data Properti Indonesia & Urgensi Sistem Bank Data Penilai

## 1. Latar Belakang & Problem Fundamental Penilai Properti di Indonesia

Sebagai Penilai Publik / Penilai Properti di Indonesia (bernaung di bawah MAPPI dan berizin dari Pusat Pembinaan Profesi Keuangan / PPPK Kementerian Keuangan), pelaksanaan tugas penilaian aset real estat senantiasa berhadapan dengan **asimetri informasi akut (acute information asymmetry)** dan **fragmentasi data pasar (market data fragmentation)**.

### A. Kontradiksi Standar Penilaian (SPI 106) vs Realitas Pasar
Sesuai **Standar Penilaian Indonesia (SPI 106 - Pendekatan Pasar)**:
- Penilai diwajibkan menggunakan minimal 3 (tiga) data pembanding yang andal, relevan, dan terverifikasi.
- Standar mengutamakan **Data Transaksi Aktual (Actual Transaction Data)** dibandingkan **Data Penawaran (Offering/Listing Data)**.
- Namun, dalam praktik di lapangan:
  1. **Akses Data Transaksi Tertutup:** Akta Jual Beli (AJB) yang dibuat di hadapan Pejabat Pembuat Akta Tanah (PPAT) bersifat rahasia perorangan dan tidak dapat diakses publik.
  2. **Fenomena "Under-Invoicing" Transaksi (Tax Avoidance):** Pada sebagian besar transaksi properti di Indonesia, harga yang tercantum di lembar formal AJB sengaja disamakan dengan Nilai Jual Objek Pajak (NJOP) terendah untuk meminimalkan beban Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB 5%) bagi pembeli dan PPh Final Pengalihan Hak (2.5%) bagi penjual. Akibatnya, nilai pada instrumen legal negara seringkali **bukan representasi dari Nilai Pasar (Fair Market Value)**.
  3. **Ketergantungan Ekstrem pada Data Penawaran Listing Web:** Karena ketiadaan repositori transaksi yang sah, KJPP terpaksa mengandalkan data penawaran dari situs listing (Rumah123, OLX, Lamudi). Penilai kemudian melakukan penyesuaian subjektif berupa diskon tawar-menawar (*discount factor* berkisar antara -5% hingga -15%) tanpa dasar statistik empiris yang seragam.

### B. Mandat Hukum Pangkalan Data Penilaian bagi KJPP
Kementerian Keuangan telah menyadari risiko hukum dan integritas ini, sehingga mengeluarkan regulasi ketat:
1. **PMK No. 101/PMK.01/2014 jo. PMK No. 228/PMK.01/2019 tentang Penilai Publik:**
   - Mewajibkan setiap Kantor Jasa Penilai Publik (KJPP) memiliki **Sistem Pangkalan Data Penilaian Berbasis Teknologi Informasi**.
   - Pangkalan data tersebut minimal wajib merekam: (1) Jenis data, (2) Sumber data, (3) Tanggal perolehan, dan (4) Harga objek.
   - Pangkalan data merupakan salah satu objek pemeriksaan utama dalam audit kepatuhan tahunan oleh PPPK Kemenkeu.
2. **POJK No. 40/POJK.03/2019 tentang Penilaian Kualitas Aset Bank Umum:**
   - Pasal-pasal penilaian agunan mewajibkan bank menggunakan laporan penilaian independen yang objektif dan dapat diaudit.
   - Membatasi plafon LTV (*Loan-to-Value*) dan mewajibkan estimasi Nilai Likuidasi (*liquidation haircut*) yang realistis guna mengantisipasi risiko kredit macet (NPL).
   - Valuasi yang meleset akibat data pembanding fiktif / tidak akurat berpotensi menyeret Penilai Publik dan pejabat bank ke ranah pidana perbankan atau kerugian keuangan negara (UU Tipikor bagi bank BUMN).

### C. Keterbatasan Repositori Pemerintah yang Ada
| Lembaga / Platform | Jenis Data | Karakteristik & Keterbatasan untuk Penilaian Pasar |
| :--- | :--- | :--- |
| **DJP / Bapenda (PBB-P2)** | Nilai Jual Objek Pajak (NJOP) | Bersifat fiskal untuk pemungutan pajak. Diperbarui secara massal dan periodik (1-3 tahun sekali). Sangat tertinggal dari dinamika harga pasar aktual (discrepancy 30% - 70%). |
| **ATR/BPN (Bhumi & ZNT)** | Zona Nilai Tanah (ZNT) | Berupa nilai indikasi rata-rata per zona poligon spasial. Tidak memuat rincian transaksi mikro (unit level), tanpa spesifikasi teknis bangunan, dan belum mencakup seluruh wilayah secara merata. |
| **Bank Indonesia (SHPR / IHPR)** | Indeks Harga Properti Residensial | Hanya mensurvei ~1.700 developer di **pasar primer (rumah baru)** pada 18 kota besar. **Sama sekali tidak memotret pasar sekunder (secondary market)** yang merupakan 80%+ dari portofolio agunan perbankan. |
| **Silo Internal KJPP** | Data internal inspeksi | Tersebar di file Excel masing-masing appraiser, rentan hilang (*data decay*), format tidak terstandardisasi, dan tidak terhubung secara spasial (GIS). |

---

## 2. Kenapa Sistem Bank Data Kolektif Bersama Mutlak Diperlukan?

1. **Memutus Siklus Valuasi Subjektif:** Menggantikan tebak-tebakan diskon penawaran dengan data transaksi riil terverifikasi (baik data pencairan kredit bank, lelang KPKNL/Bank, maupun riset lapangan terverifikasi).
2. **Kepatuhan Regulasi Penuh:** Memenuhi standar PMK 228/2019 dan KEPI/SPI 2018 secara otomatis dan auditable.
3. **Standarisasi Matriks Penyesuaian (Adjustment Grid):** Parameter penyesuaian (legalitas SHM/HGB/Girik, elevasi jalan, bentuk tapak/tusuk sate, lebar ROW) terdokumentasi dan terkalibrasi secara matematis.
4. **Efisiensi Spasial (Zero-Cost GIS):** Pemetaan koordinat WGS84 dengan visualisasi poligon ZNT dan jarak fasilitas umum tanpa lisensi mahal berbayar (memanfaatkan MapLibre + OpenStreetMap/CARTO + PostGIS).
