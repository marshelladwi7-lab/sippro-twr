# Benchmark Malaysia: Arsitektur Sistem NAPIC & JPPH (Kementerian Kewangan Malaysia)

## 1. Profil Kelembagaan & Sejarah Pendirian
- **Induk Organisasi:** **JPPH (Jabatan Penilaian dan Perkhidmatan Harta)** / *Valuation and Property Services Department*, Kementerian Kewangan Malaysia.
- **Divisi Khusus Data:** **NAPIC (National Property Information Centre / Pusat Maklumat Harta Tanah Negara)**.
- **Latar Belakang Pendirian:** Didirikan pada tahun 1999 atas rekomendasi Dewan Tindakan Ekonomi Negara (National Economic Action Council - NEAC) pasca Krisis Keuangan Asia 1997/1998. Krisis tersebut mengungkap kelemahan fatal: minimnya data akurat mengenai kelebihan pasokan (*property overhang*) dan ketiadaan sistem pencatatan transaksi terpusat yang memicu *asset bubble* dan kredit macet perbankan.

---

## 2. Mekanisme Penangkapan Data Transaksi Statuter (Statutory Transaction Capture)

Keunggulan sistem Malaysia yang paling ideal untuk dipelajari oleh Indonesia adalah **mekanisme legal pengumpulan data transaksi 100% riil**:

```
[Penjual & Pembeli Melakukan Transaksi]
                  │
                  ▼
   [Pengajuan Pindah Milik (Borang 14A - National Land Code)]
                  │
                  ▼
   [Lembaga Hasil Dalam Negeri (LHDN) / Inland Revenue Board]
      (Pengenaan Bea Duti Setem / Stamp Duty)
                  │
                  ▼
   [Rujukan Wajib ke Penilai Pemerintah: JPPH]
      (Pejabat Penilai JPPH Memeriksa & Memvalidasi Nilai Pasar)
                  │
                  ▼
   [Pangkalan Data Pusat: NAPIC (PRISM System)]
                  │
                  ├───► Laporan Pasaran Harta (Publik & Investor)
                  ├───► Malaysian House Price Index (MHPI)
                  ├───► Pemantauan Unit Terbengkalai / Overhang (Bank Negara Malaysia)
                  └───► Portal Penilai Berdaftar (Valuation Microdata Access)
```

### Kunci Sukses Hukum & Operasional:
1. **Tidak Bergantung pada Sukarela:** Pengumpulan data bukan survei opsional atau scraping website, melainkan bagian dari proses administrasi hukum perpajakan negara.
2. **Pemberantasan Under-Invoicing:** Berdasarkan hukum pajak Malaysia, jika harga yang dilaporkan dalam akad jual beli (*consideration price*) lebih rendah daripada nilai wajar yang dihitung oleh penilai JPPH (*adjudicated market value*), maka bea meterai (stamp duty) dihitung berdasarkan Nilai Pasar JPPH. Hal ini secara otomatis menghilangkan insentif pelaporan harga palsu.
3. **Penyimpanan Detail Fisik Aset:** Penilai JPPH menginput rincian teknis: tipe bangunan, luas tapak (*land area*), luas bangunan (*built-up area*), umur bangunan, masa pegangan hak (*freehold* vs *leasehold*), dan status hunian.

---

## 3. Produk & Layanan Data NAPIC

1. **Laporan Pasaran Harta (Property Market Report - PMR):**
   - Diterbitkan per semester dan per tahun.
   - Mencakup 5 sub-sektor: Residensial, Komersial, Industri, Pertanian, dan Tanah Pembangunan.
   - Menyajikan volume dan nilai transaksi hingga tingkat distrik/mukim.
2. **Indeks Harga Rumah Malaysia (Malaysian House Price Index - MHPI):**
   - Dihitung menggunakan pendekatan hedonik (*Hedonic Regression Pricing Model*) dan rantai indeks Laspeyres yang mencerminkan pergerakan harga riil bersih dari perubahan kualitas unit.
3. **Definisi Standar Unit Tak Terjual (*Property Overhang*):**
   - Suatu unit diklasifikasikan sebagai *Overhang* jika: **telah menerima Sijil Penyiapan dan Pematuhan (Certificate of Completion and Compliance - CCC), namun tetap belum terjual setelah lebih dari 9 bulan sejak diluncurkan ke pasar**.
   - Metrik ini menjadi indikator risiko sistemik utama bagi Bank Negara Malaysia (BNM) dalam menetapkan kebijakan permodalan bank.
4. **Portal PRISM (Property Real Estate Information System Malaysia):**
   - Memberikan akses data historis transaksi bagi Penilai Publik berlisensi (*Registered Valuers* LPPEH), pengembang, dan institusi perbankan.

---

## 4. Pelajaran Kritis untuk Bank Data SIPPRO TWR Indonesia

| Fitur NAPIC Malaysia | Kondisi Indonesia Saat Ini | Solusi SIPPRO TWR |
| :--- | :--- | :--- |
| **Data Source** | Data legal LHDN + adjudikasi penilai JPPH | Mengandalkan scraping web penawaran | Mengintegrasikan data transaksi pencairan KPR Bank + data lelang agunan + data inspeksi KJPP terverifikasi |
| **Verifikasi Nilai** | Validasi nilai pasar oleh Penilai JPPH | Penilai mendiskon harga penawaran secara manual (-5% s.d. -15%) | Sistem menghitung *indicated value* berbasis SPI 106 dengan grid penyesuaian matematis terstandarisasi |
| **Metadata Properti** | Lengkap: Hak milik, luas tanah, luas bangunan, zonasi | Terfragmentasi di lembar kerja Excel | Skema Drizzle/PostgreSQL relasional terstandarisasi: NOP, legalitas (SHM/HGB), KDB/KLB, ZNT |
| **Geospasial** | Terintegrasi dengan GIS kadaster Semenanjung | Terpisah antara teks dan peta cetak | PostGIS (EPSG:4326) dengan query radius spasial (`ST_DWithin`) dan visualisasi poligon bebas biaya |
