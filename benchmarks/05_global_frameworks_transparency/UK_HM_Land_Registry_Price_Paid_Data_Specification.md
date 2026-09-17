# Spesifikasi Teknis HM Land Registry Price Paid Data (PPD) - United Kingdom

## 1. Ikhtisar & Landasan Keterbukaan Data
- **Penerbit:** **HM Land Registry (Her Majesty's / His Majesty's Land Registry)**, Pemerintah Inggris dan Wales.
- **Cakupan Data:** Seluruh catatan transaksi jual beli properti residensial di Inggris dan Wales sejak Januari 1995 hingga bulan berjalan.
- **Lisensi:** **Open Government Licence v3.0 (OGL)** - Bebas digunakan untuk keperluan komersial maupun non-komersial tanpa biaya royalti.
- **Frekuensi Rilis:** Diperbarui setiap bulan pada hari kerja ke-20.

---

## 2. Struktur Kolom Standar (Data Dictionary)

Berkas Price Paid Data didistribusikan dalam format CSV tanpa tajuk baris pertama (*no header*), dengan urutan 16 kolom baku:

| No | Nama Kolom | Tipe Data | Deskripsi & Contoh Nilai |
| :--- | :--- | :--- | :--- |
| **1** | `Transaction unique identifier` | UUID / String | Nomor referensi unik sistem untuk setiap transaksi (misal: `{9A1B2C3D-4E5F-6789-...}`). Berubah jika ada perbaikan data. |
| **2** | `Price` | Integer (GBP) | Harga jual beli aktual yang tercantum pada akta pengalihan hak (*transfer deed*). |
| **3** | `Date of Transfer` | Date (YYYY-MM-DD) | Tanggal sah penyelesaian transaksi (*completion date*). |
| **4** | `Postcode` | String (Alphanumeric)| Kode pos lokasi objek saat transaksi berlangsung (misal: `SW1A 1AA`). |
| **5** | `Property Type` | Char(1) | `D` = Detached (Rumah Mandiri)<br>`S` = Semi-Detached (Rumah Gandeng Sepihak)<br>`T` = Terraced (Rumah Deret / Townhouse)<br>`F` = Flats / Maisonettes (Apartemen/Rumah Susun)<br>`O` = Other (Lainnya/Tanah Luas) |
| **6** | `Old / New` | Char(1) | `Y` = Properti Bangunan Baru (*Newly Built*)<br>`N` = Bangunan Eksisting / Seken (*Established Residential Building*) |
| **7** | `Duration (Tenure)` | Char(1) | `F` = Freehold (Hak Milik Sepenuhnya)<br>`L` = Leasehold (Hak Sewa Jangka Panjang) |
| **8** | `PAON` | String | Primary Addressable Object Name: Nomor rumah atau nama gedung (misal: `42` atau `Orchard House`). |
| **9** | `SAON` | String | Secondary Addressable Object Name: Nomor sub-unit / flat / apartemen (misal: `Flat 3B`). |
| **10**| `Street` | String | Nama jalan lokasi properti. |
| **11**| `Locality` | String | Nama dusun, kelurahan, atau area lokal. |
| **12**| `Town / City` | String | Kota administratif (misal: `London`, `Manchester`). |
| **13**| `District` | String | Wilayah kabupaten / kota madya (*Borough / District*). |
| **14**| `County` | String | Wilayah provinsi (*County*). |
| **15**| `PPD Category Type` | Char(1) | `A` = Transaksi Standar (Residential single sale for value)<br>`B` = Transaksi Tambahan (Penyitaan/Repossession, Buy-to-let berhipotek, atau korporat) |
| **16**| `Record Status` | Char(1) | *(Khusus file update bulanan)*<br>`A` = Addition (Catatan transaksi baru ditambahkan)<br>`C` = Change (Koreksi data pada transaksi sebelumnya)<br>`D` = Delete (Penghapusan transaksi yang keliru/batal) |

---

## 3. Ketentuan Pengecualian Data (*Exclusion Criteria*)
HM Land Registry mengecualikan transaksi yang **bukan mencerminkan Nilai Pasar Wajar**, yaitu:
1. Transaksi tanpa nilai uang (*sales not for value*), hibah, warisan, atau hadiah.
2. Pengalihan hak akibat putusan pengadilan perceraian.
3. Pembebasan lahan untuk kepentingan umum (*compulsory purchase order*).
4. Penjualan program diskon perumahan rakyat bersubsidi (*Right to Buy* dengan diskon pemerintah).
5. Transaksi pengalihan kepada wali amanat (*Trustees*).

---

## 4. Relevansi Arsitektural bagi SIPPRO TWR Indonesia

1. **Flag Status Catatan (Record Status: A, C, D):**
   - Skema ini diadopsi oleh sistem SIPPRO TWR untuk menangani data transaksi properti Indonesia yang mengalami koreksi pasca-audit bank atau pembatalan akad kredit.
2. **Kategori Standar vs Non-Standar (Category A vs B):**
   - Memisahkan transaksi jual beli sukarela (*arm's length transaction*) dari penjualan lelang eksekusi hak tanggungan (AYDA / lelang likuidasi perbankan).
