# SIPPRO-TWR (Sistem Informasi Pangkalan Data Penilaian Properti)

> **Platform Pangkalan Data Penilaian Properti & Estimasi Nilai Spasial**  
> Standar Penilaian Indonesia (SPI 106) • Kode Etik Penilai Indonesia (KEPI) • 100% Zero-Cost Architecture

---

## 🌟 Ringkasan Platform

**SIPPRO-TWR** adalah platform geospasial profesional untuk penelusuran riwayat penilaian properti dan analisis estimasi nilai pasar properti di Indonesia yang dikembangkan untuk **KJPP Totok Warsito dan Rekan**.

- **Pangkalan Data Historis Terverifikasi**: 1.512 data komparasi pasar riil (luas tanah, luas bangunan, NOP, koordinat WGS84, legalitas SHM/HGB).
- **Peta Spasial GIS 100% Bebas Watermark**: Mengintegrasikan CARTO Positron (Terang), CARTO Dark Matter (Gelap), CARTO Voyager (Vektor), dan Citra Satelit Resolusi Tinggi Esri World Imagery tanpa biaya lisensi pihak ketiga (Rp 0,-).
- **Alat Analisis Estimasi Nilai Spasial**: Mesin kalkulasi nilai pasar wajar berbasis median harga/m² bukti pembanding sekitarnya dalam radius buffer 1 s/d 5 km dengan rentang toleransi konservatif (-5%) hingga optimis (+5%).
- **Autentikasi Berbasis Peran (RBAC)**: Portal terpadu (*Landing Page = Login Page*) dengan *1-Click Role Quick Fill* untuk Penilai Publik, Reviewer Teknis, Surveyor Lapangan, Partner Admin, dan Tamu Demo.
- **Audit Keamanan Terverifikasi**: Lolos uji penetrasi AI **Strix** ([usestrix/strix](https://github.com/usestrix/strix)) dengan status **Zero Vulnerabilities** (CSP, HSTS, X-Frame-Options, sanitasi input Zod).

---

## 🚀 Teknologi ($0 Zero-Cost Stack)

- **Runtime & UI**: Next.js 15 (App Router, Server Actions), React 19, TypeScript (Strict), Tailwind CSS.
- **Geospasial / GIS**: MapLibre GL JS (EPSG:4326), Tile Vektor CARTO, Foto Satelit Esri World Imagery.
- **Penyimpanan Data**: Database JSON lokal terindeks (`data/properties.json`) + integrasi Supabase Free Tier.
- **Pengujian & Kualitas**: Vitest (40 unit tests lolos), Strix Security Scanner.

---

## 📦 Menjalankan Secara Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Atau jalankan build produksi
npm run build
npm run start
```

Akses sistem di browser: `http://localhost:3000`

---

## 🌐 Deployment ke Vercel (Gratis Selamanya)

1. Fork atau push repositori ini ke akun GitHub Anda:
   ```bash
   git remote add origin https://github.com/marshelladwi7-lab/sippro-twr.git
   git branch -M main
   git push -u origin main
   ```
2. Buka [Vercel](https://vercel.com) dan klik **"Add New Project"**.
3. Pilih repositori `sippro-twr` dan klik **"Deploy"**.
4. Website akan langsung aktif secara publik dengan HTTPS gratis.

---

© KJPP Totok Warsito dan Rekan. Seluruh hak cipta dilindungi.
