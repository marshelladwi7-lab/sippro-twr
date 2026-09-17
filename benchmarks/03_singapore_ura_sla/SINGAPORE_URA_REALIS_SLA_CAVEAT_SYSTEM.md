# Benchmark Singapura: Sistem Caveat SLA & Arsitektur URA REALIS

## 1. Profil Kelembagaan & Infrastruktur Data Singapura
- **Badan Perencanaan & Informasi Pasar:** **URA (Urban Redevelopment Authority)**, Kementerian Pembangunan Nasional Singapura.
- **Badan Pertanahan & Pendaftaran Hak:** **SLA (Singapore Land Authority)**, Kementerian Hukum Singapura.
- **Penyedia Perumahan Publik (80%+ Populasi):** **HDB (Housing & Development Board)**.
- **Sistem Inti:**
  1. **REALIS (Real Estate Information System):** Repositori data transaksi properti privat, perkantoran, ritel, dan industri yang dikelola URA.
  2. **INLIS (Integrated Land Information Service):** Layanan pencarian sertifikat, hak tanggungan, dan status kepemilikan spasial berbasis OneMap oleh SLA.
  3. **HDB Resale Open Data Portal:** Akses data terbuka (API publik) untuk setiap transaksi flat subsidi sekunder di seluruh Singapura.

---

## 2. Mekanisme Hukum: Caveat Lodgement (Land Titles Act)

Pondasi transparansi harga properti di Singapura bertumpu pada instrumen hukum yang disebut **Caveat**:

```
[Pembeli Memperoleh 'Option to Purchase' (OTP) / Kontrak Jual Beli]
                              │
                              ▼
        [Pengacara Pembeli Mendaftarkan CAVEAT ke SLA]
 (Sesuai Bagian XII Land Titles Act: Melindungi Kepentingan Ekuitas Pembeli)
                              │
                              ▼
        [Singapore Land Authority (SLA) Mencatat Caveat]
 (Data: Harga Kontrak, Luas m², Lantai Unit, Masa Hak, Profil Pembeli)
                              │
                              ▼
  ┌───────────────────────────┴───────────────────────────┐
  ▼                                                       ▼
[URA REALIS Feed]                               [OneMap / INLIS GIS]
- Update Mingguan / Bulanan                      - Verifikasi Spasial
- Akses Berlangganan Terbuka                    - Pemetaan Batas Bidang
- Standar Acuan Penilai SISV                    - Zonasi Master Plan
```

### Mengapa Caveat Begitu Efektif?
1. **Kepentingan Perlindungan Finansial:** Pembeli dan bank pemberi kredit KPR berkepentingan mendaftarkan caveat secepat mungkin ke SLA agar pihak ketiga lain (seperti kreditor lain dari penjual) tidak dapat mengklaim hak atas tanah tersebut.
2. **Keterbukaan Data Spasial Tingkat Tinggi:** Caveat mencantumkan:
   - Harga riil transaksi (*Purchase Price*) dalam SGD.
   - Harga per satuan luas (*unit price per square foot / psf* dan *per square meter / psm*).
   - Luas unit (*floor area*).
   - Ketinggian lantai (*Storey Level Band*, misal: Lantai 06 s.d. 10) yang sangat penting untuk penyesuaian nilai *view* pada apartemen/strata title.
   - Status kepemilikan (*Tenure*: Freehold, 99-year leasehold, 999-year leasehold).
   - Tipe penjualan: *New Sale* (Developer), *Sub-sale* (sebelum TOP), atau *Resale* (pasar sekunder).

---

## 3. Praktik Penilaian SISV (Singapore Institute of Surveyors and Valuers)

Berkat keterbukaan REALIS dan data caveat:
- Penilai publik di Singapura yang mengacu pada standar **SISV Valuation Standards and Practice Guidelines** tidak pernah menggunakan harga penawaran listing iklan untuk penilaian aset yang memiliki data pasar aktif.
- Setiap laporan penilaian hipotek bank wajib menyertakan tabel pembanding minimal 3 hingga 5 transaksi *caveat* aktual dalam kompleks kondominium yang sama atau radius terdekat dalam 6-12 bulan terakhir.
- Varians valuasi antar penilai di Singapura sangat rendah (<3%), menciptakan kepercayaan tinggi bagi bank dan otoritas moneter (Monetary Authority of Singapore - MAS).

---

## 4. Relevansi & Adaptasi bagi Bank Data Indonesia (SIPPRO TWR)

Singapura membuktikan bahwa **standarisasi variabel mikro adalah kunci objektivitas penilaian**:
1. **Pemisahan Jelas Luas Tanah vs Luas Bangunan:** Pada hunian tapak, harga dianalisis berdasarkan luas tanah dan bangunan secara terpisah; pada strata title dianalisis berbasis nett floor area.
2. **Faktor Masa Berlaku Hak (*Unexpired Lease*):** Singapura menggunakan kurva *Bala's Table* untuk mendiskon nilai sisa sewa (99 tahun). Di Indonesia, SIPPRO TWR mengadopsi prinsip ini dalam mendiskon HGB yang mendekati masa jatuh tempo dibandingkan SHM.
3. **Pengelompokan Lantai (Storey Bands):** Menjadi dasar penyesuaian vertikal (*floor height adjustment*) untuk penilaian unit apartemen di kota besar seperti Jakarta dan Surabaya.
