# Panduan Publikasi Online 100% Gratis ($0 Biaya Selamanya)
## Sistem Informasi Pangkalan Data Penilaian Properti (SIPPRO-TWR)

Platform SIPPRO-TWR dirancang 100% mematuhi mandat **Zero-Cost Architecture**:
- **Framework**: Next.js 15 (App Router, Server Components).
- **Peta & Geospasial**: MapLibre GL JS + CARTO Positron + CARTO Dark Matter + Esri World Imagery (Foto Satelit) — **Rp 0,- / Bebas Watermark / Tanpa Kartu Kredit**.
- **Penyimpanan Data**: Database JSON lokal (`data/properties.json`) berkapasitas 1.512 data terverifikasi + opsi Supabase PostGIS Free Tier.
- **Keamanan & Autentikasi**: RBAC mandiri berbasis Secure HTTP-Only Cookie Session (`twr_auth_session`) — **Rp 0,- (Tanpa Auth0 / Firebase / Clerk)**.

---

### Opsi 1: Publikasi Permanen ke Cloud via Vercel (Paling Direkomendasikan)
Vercel menyediakan paket Hobby yang **100% gratis selamanya** dengan Edge Network global, HTTPS otomatis, dan performa tinggi untuk Next.js.

#### Langkah 1: Simpan Kode ke GitHub
Jalankan di terminal proyek:
```bash
git add .
git commit -m "feat: unified valuation landing login page with zero cost architecture"
git remote add origin https://github.com/<username-anda>/sippro-twr.git
git push -u origin master
```

#### Langkah 2: Hubungkan ke Vercel (1-Klik)
1. Kunjungi [vercel.com/signup](https://vercel.com/signup) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **"Add New Project"** lalu pilih repositori `sippro-twr`.
3. Framework Preset: **Next.js** (otomatis terdeteksi).
4. Klik **"Deploy"**.
5. Dalam waktu < 2 menit, website Anda sudah aktif secara global di domain:
   `https://sippro-twr.vercel.app` (atau nama kustom gratis pilihan Anda).

---

### Opsi 2: Akses Langsung Jaringan Lokal Wi-Fi (Real-Time di HP & Laptop Kantor)
Server produksi saat ini telah aktif di port 3000. Siapa pun di satu jaringan Wi-Fi/LAN yang sama (kantor KJPP / bank mitra) dapat langsung mengaksesnya:
- **Alamat URL**: `http://192.168.1.44:3000/`

---

### Opsi 3: Terowongan Publik Sementara (Free Quick Tunnel)
Jika Anda ingin mendemokan website ke pihak luar secara instan tanpa commit ke GitHub:
1. Pastikan server lokal berjalan:
   ```bash
   npm run start
   ```
2. Buka terminal baru dan jalankan salah satu alat terowongan gratis berikut:
   - Menggunakan **Cloudflare Tunnel (Bebas Biaya)**:
     ```bash
     npx --yes cloudflared tunnel --url http://localhost:3000
     ```
   - Atau menggunakan **Ngrok Free**:
     ```bash
     ngrok http 3000
     ```
