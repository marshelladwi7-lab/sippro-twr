# -*- coding: utf-8 -*-
"""
Script: render_all_diagrams.py
Purpose: Render 4 modern, high-resolution, simplified architectural diagrams
         grounded 100% on the live website at http://localhost:3000/
         (DFD Level 0, DFD Level 1, BPMN Workflow, ERD Data Model)
         Rendered via Playwright at 2x device scale factor for crystal-clear docx embedding.
"""

import os
import sys
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. DFD LEVEL 0: CONTEXT DIAGRAM (DIAGRAM KONTEKS)
# -------------------------------------------------------------
html_dfd_0 = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 30px; background: #0b132b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
    .canvas { width: 1200px; margin: 0 auto; background: #1c2541; border: 1px solid #3a506b; border-radius: 16px; padding: 35px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #3a506b; padding-bottom: 15px; }
    .title { font-size: 21px; font-weight: 800; color: #38bdf8; letter-spacing: 0.5px; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    
    .grid { display: grid; grid-template-columns: 290px 1fr 290px; gap: 28px; align-items: center; }
    .col { display: flex; flex-direction: column; gap: 20px; }
    
    .entity-box {
      background: #0b132b; border-radius: 12px; padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }
    .entity-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .entity-flow { font-size: 11px; color: #94a3b8; line-height: 1.45; }
    .flow-in { color: #4ade80; font-weight: 700; }
    .flow-out { color: #38bdf8; font-weight: 700; }
    
    .system-core {
      background: radial-gradient(circle, #1e3a8a 0%, #0f172a 100%);
      border: 2.5px solid #38bdf8; border-radius: 20px; padding: 35px 25px; text-align: center;
      box-shadow: 0 0 35px rgba(56, 189, 248, 0.3); position: relative;
    }
    .system-badge { display: inline-block; background: #2563eb; color: #fff; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
    .system-name { font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 10px; letter-spacing: -0.5px; }
    .system-desc { font-size: 12px; color: #cbd5e1; margin: 0 0 18px; line-height: 1.5; }
    .system-features { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .feat-chip { background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #e0f2fe; font-size: 10px; padding: 5px 10px; border-radius: 6px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="header">
      <div class="title">Diagram Konteks SIPPRO-TWR (DFD Level 0)</div>
      <div class="subtitle">Aliran Informasi Antara Pengguna dan Pangkalan Data Properti Berbasis Peta Citra Satelit (http://localhost:3000/)</div>
    </div>
    <div class="grid">
      
      <!-- Left Column: Input Actors -->
      <div class="col">
        <div class="entity-box" style="border: 1.5px solid #10b981;">
          <div class="entity-title" style="color: #6ee7b7;">📍 Surveyor & Penilai Lapangan</div>
          <div class="entity-flow">
            <span class="flow-in">➔ Input:</span> Titik Koordinat GPS, Foto Fisik, Luas Tanah & Bangunan, Sertifikat (SHM/HGB), Harga Penawaran/Transaksi.<br><br>
            <span class="flow-out">⬅ Output:</span> Posisi Pin di Citra Satelit, Detail Data Pembanding, Unduhan Rute Peta (File KML).
          </div>
        </div>

        <div class="entity-box" style="border: 1.5px solid #f59e0b;">
          <div class="entity-title" style="color: #fcd34d;">📑 Staff Administrasi Kantor</div>
          <div class="entity-flow">
            <span class="flow-in">➔ Input:</span> File Rekapitulasi Excel Lama (.xlsx) via Drag & Drop Batch Upload.<br><br>
            <span class="flow-out">⬅ Output:</span> Konfirmasi Upload Berhasil, Perapian Format Koordinat & Angka Harga Otomatis.
          </div>
        </div>
      </div>

      <!-- Center: Core System Process -->
      <div class="system-core">
        <div class="system-badge">Sistem Terpusat • Port 3000</div>
        <div class="system-name">SIPPRO-TWR PLATFORM</div>
        <div class="system-desc">
          Pangkalan Data Spasial Penilaian Properti KJPP Taufik Wahyudi Rahardjo dan Rekan.<br>
          Menyatukan 1.511 Data Hasil Survei Lapangan di 61 Kota ke Atas Peta Citra Satelit Resolusi Tinggi.
        </div>
        <div class="system-features">
          <span class="feat-chip">🛰️ Peta Citra Satelit (GIS)</span>
          <span class="feat-chip">📋 Katalog Spreadsheet (1.511 Data)</span>
          <span class="feat-chip">📤 Batch Upload Excel</span>
          <span class="feat-chip">📊 Ekspor Excel & KML</span>
          <span class="feat-chip">⚡ Zero-Cost Architecture</span>
        </div>
      </div>

      <!-- Right Column: Reviewer & Stakeholders -->
      <div class="col">
        <div class="entity-box" style="border: 1.5px solid #38bdf8;">
          <div class="entity-title" style="color: #7dd3fc;">👨‍💼 Pimpinan KJPP & Tim QC</div>
          <div class="entity-flow">
            <span class="flow-in">➔ Input:</span> Filter Pencarian Wilayah (misal: Bekasi), Saringan Kategori Objek.<br><br>
            <span class="flow-out">⬅ Output:</span> Statistik Real-Time (1.511 Titik, Rata-rata Rp 9,4 Jt/m²), Sebaran 61 Kota, Kertas Kerja Penilaian.
          </div>
        </div>

        <div class="entity-box" style="border: 1.5px solid #a855f7;">
          <div class="entity-title" style="color: #d8b4fe;">🏦 Perbankan & Klien Penilaian</div>
          <div class="entity-flow">
            <span class="flow-out">⬅ Output:</span> Kertas Kerja Pembanding Terformat (.xlsx), Bukti Foto Satelit Lingkungan, Laporan Agunan Bebas Data Fiktif.
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
"""

# -------------------------------------------------------------
# 2. DFD LEVEL 1: SUBSYSTEM ARCHITECTURE (DEKOMPOSISI FUNGSIONAL)
# -------------------------------------------------------------
html_dfd_1 = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 30px; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
    .canvas { width: 1200px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
    .title { font-size: 20px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 12px; color: #94a3b8; margin-top: 5px; }
    
    .grid-modules { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .mod-card {
      background: #0f172a; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;
      border: 1.5px solid #475569; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    .mod-badge { font-size: 10px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px; }
    .mod-title { font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
    .mod-desc { font-size: 11px; color: #94a3b8; line-height: 1.45; margin-bottom: 12px; }
    .mod-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .mod-tag { font-size: 9px; padding: 3px 6px; border-radius: 4px; font-weight: 600; }

    .tag-cyan { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .tag-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .tag-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
    .tag-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }

    .datastore-box {
      background: #090d16; border: 2px dashed #38bdf8; border-radius: 12px; padding: 18px 24px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .ds-left { display: flex; flex-direction: column; gap: 4px; }
    .ds-title { font-size: 14px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .ds-desc { font-size: 11px; color: #94a3b8; }
    .ds-schema { font-family: monospace; font-size: 10.5px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 6px 12px; border-radius: 6px; color: #e0f2fe; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="header">
      <div class="title">Diagram Alir Data Fungsional SIPPRO-TWR (DFD Level 1)</div>
      <div class="subtitle">Empat Modul Utama Pemrosesan Data Berbasis Peta Citra Satelit pada Aplikasi Live (http://localhost:3000/)</div>
    </div>
    
    <!-- 4 Subsystem Modules -->
    <div class="grid-modules">
      
      <!-- Modul 1.0 -->
      <div class="mod-card" style="border-color: #38bdf8;">
        <div>
          <div class="mod-badge">Modul 1.0</div>
          <div class="mod-title">Peta Citra Satelit (GIS)</div>
          <div class="mod-desc">Menampilkan foto satelit resolusi tinggi dunia nyata, memplot 1.511 pin lokasi properti, animasi terbang (*fly-to*) saat kartu diklik, dan balon popup rincian properti.</div>
        </div>
        <div class="mod-tags">
          <span class="mod-tag tag-cyan">Satellite Imagery</span>
          <span class="mod-tag tag-cyan">Popup Detail</span>
        </div>
      </div>

      <!-- Modul 2.0 -->
      <div class="mod-card" style="border-color: #10b981;">
        <div>
          <div class="mod-badge">Modul 2.0</div>
          <div class="mod-title">Pencarian & Filter Kategori</div>
          <div class="mod-desc">Penyaringan instan (&lt;100 ms) berdasarkan kata kunci lokasi (misal: Bekasi), saringan kategori (Tanah Kosong / Bangunan), dan dropdown pilihan kota.</div>
        </div>
        <div class="mod-tags">
          <span class="mod-tag tag-emerald">Search Bar</span>
          <span class="mod-tag tag-emerald">Filter Chips</span>
        </div>
      </div>

      <!-- Modul 3.0 -->
      <div class="mod-card" style="border-color: #a855f7;">
        <div>
          <div class="mod-badge">Modul 3.0</div>
          <div class="mod-title">Katalog Spreadsheet</div>
          <div class="mod-desc">Penyajian seluruh 1.511 data survei dalam bentuk tabel baris dan kolom yang rapi, lengkap dengan penomoran halaman, pencarian tabel, dan tombol aksi ke peta.</div>
        </div>
        <div class="mod-tags">
          <span class="mod-tag tag-purple">Spreadsheet View</span>
          <span class="mod-tag tag-purple">Pagination</span>
        </div>
      </div>

      <!-- Modul 4.0 -->
      <div class="mod-card" style="border-color: #f59e0b;">
        <div>
          <div class="mod-badge">Modul 4.0</div>
          <div class="mod-title">Upload Excel & Ekspor File</div>
          <div class="mod-desc">Unggah file Excel survei lama via drag-and-drop dengan perapian koordinat otomatis, serta tombol 1-klik ekspor ke Excel (.xlsx) dan Google Earth (.kml).</div>
        </div>
        <div class="mod-tags">
          <span class="mod-tag tag-amber">Batch Ingest</span>
          <span class="mod-tag tag-amber">1-Click Export</span>
        </div>
      </div>

    </div>

    <!-- Datastore -->
    <div class="datastore-box">
      <div class="ds-left">
        <div class="ds-title">
          <span>🗄️ D1: PANGKALAN DATA PROPERTI TERPADU (1.511 Titik Survei Lapangan)</span>
        </div>
        <div class="ds-desc">Merekam data posisi spasial GPS, fisik tanah/bangunan, legalitas sertifikat, dan indikasi nilai pasar riil.</div>
      </div>
      <div class="ds-schema">
        id | nama_objek | alamat | kota | lat, lng | luas_tanah | luas_bangunan | sertifikat | harga_pasar | harga_per_m2 | surveyor
      </div>
    </div>

  </div>
</body>
</html>
"""

# -------------------------------------------------------------
# 3. BPMN BUSINESS PROCESS WORKFLOW (ALUR KERJA OPERASIONAL)
# -------------------------------------------------------------
html_bpmn = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 30px; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
    .canvas { width: 1200px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid #334155; padding-bottom: 15px; }
    .title { font-size: 20px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 12px; color: #94a3b8; margin-top: 5px; }

    .swimlane-container { display: flex; flex-direction: column; gap: 12px; }
    .swimlane { display: grid; grid-template-columns: 190px 1fr; background: #0f172a; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }
    .lane-actor {
      background: #1e293b; padding: 18px; display: flex; flex-direction: column; justify-content: center;
      border-right: 2px solid #38bdf8; font-weight: 700; font-size: 12px; color: #e2e8f0;
    }
    .lane-actor small { font-size: 10px; color: #38bdf8; font-family: monospace; font-weight: 600; margin-top: 3px; }
    
    .lane-steps { padding: 14px 20px; display: flex; align-items: center; gap: 14px; }
    .step-box {
      background: #1e293b; border: 1px solid #475569; border-radius: 8px; padding: 12px 14px;
      font-size: 11px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    .step-tag { font-size: 9px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px; }
    .step-text { color: #f1f5f9; font-weight: 600; line-height: 1.4; }
    .arrow { color: #64748b; font-size: 16px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="header">
      <div class="title">Alur Kerja Penilaian Properti Berbasis Peta Satelit (BPMN Workflow)</div>
      <div class="subtitle">Integrasi Alur Kerja dari Survei Lapangan, Pemrosesan di Web SIPPRO-TWR, hingga Penyusunan Laporan Bank</div>
    </div>
    <div class="swimlane-container">
      
      <!-- Lane 1: Surveyor Lapangan -->
      <div class="swimlane">
        <div class="lane-actor">
          <span>SURVEYOR LAPANGAN</span>
          <small>Inspeksi & Input Data</small>
        </div>
        <div class="lane-steps">
          <div class="step-box">
            <div class="step-tag">Langkah 1: Survei Fisik</div>
            <div class="step-text">Inspeksi lokasi properti, catat koordinat GPS HP, foto fisik, ukur lebar jalan (ROW), dan catat harga penawaran.</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box">
            <div class="step-tag">Langkah 2: Input Formulir Web</div>
            <div class="step-text">Buka menu 'Tambah Data' di web, masukkan koordinat GPS, luas tanah, luas bangunan, dan status sertifikat SHM/HGB.</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box">
            <div class="step-tag">Langkah 3: Batch Upload Excel</div>
            <div class="step-text">Jika memiliki ratusan data survei lama, drag-and-drop file Excel ke modul upload untuk diimpor sekaligus.</div>
          </div>
        </div>
      </div>

      <!-- Lane 2: Sistem Web SIPPRO-TWR -->
      <div class="swimlane">
        <div class="lane-actor">
          <span>APLIKASI SIPPRO-TWR</span>
          <small>Sistem Web (Port 3000)</small>
        </div>
        <div class="lane-steps">
          <div class="step-box" style="border-color: #38bdf8;">
            <div class="step-tag" style="color: #38bdf8;">Langkah 4: Validasi & Perapian</div>
            <div class="step-text">Sistem otomatis merapikan format angka koordinat dan menghitung indikasi nilai tanah per m².</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box" style="border-color: #38bdf8;">
            <div class="step-tag" style="color: #38bdf8;">Langkah 5: Pemetaan Citra Satelit</div>
            <div class="step-text">Titik properti langsung muncul di atas Peta Citra Satelit dan tercatat di Katalog Spreadsheet.</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box" style="border-color: #38bdf8;">
            <div class="step-tag" style="color: #38bdf8;">Langkah 6: Pembaruan Statistik</div>
            <div class="step-text">Header metrik otomatis memperbarui Total Data (1.511 titik), Rata-rata Nilai, dan Cakupan 61 Kota.</div>
          </div>
        </div>
      </div>

      <!-- Lane 3: Penilai Properti (Valuer) -->
      <div class="swimlane">
        <div class="lane-actor">
          <span>PENILAI PROPERTI</span>
          <small>Analis & Reviewer KKP</small>
        </div>
        <div class="lane-steps">
          <div class="step-box" style="border-color: #10b981;">
            <div class="step-tag" style="color: #10b981;">Langkah 7: Cari & Filter Wilayah</div>
            <div class="step-text">Ketik nama wilayah (misal: 'Bekasi') di search bar; saring kategori objek (Tanah & Bangunan / Tanah Kosong).</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box" style="border-color: #10b981;">
            <div class="step-tag" style="color: #10b981;">Langkah 8: Verifikasi Foto Satelit</div>
            <div class="step-text">Cek fisik atap, lebar jalan depan, dan lingkungan dari foto satelit; klik pin untuk memeriksa rincian sertifikat.</div>
          </div>
          <span class="arrow">➔</span>
          <div class="step-box" style="border-color: #10b981;">
            <div class="step-tag" style="color: #10b981;">Langkah 9: Ekspor Excel & KML</div>
            <div class="step-text">Unduh kertas kerja ke format Excel (.xlsx) untuk laporan bank, dan ekspor KML ke Google Earth surveyor.</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
"""

# -------------------------------------------------------------
# 4. MODEL DATA / ERD (KARTU IDENTITAS PROPERTI TERPADU)
# -------------------------------------------------------------
html_erd = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 30px; background: #0b132b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #f8fafc; }
    .canvas { width: 1200px; margin: 0 auto; background: #1c2541; border: 1px solid #3a506b; border-radius: 16px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid #3a506b; padding-bottom: 15px; }
    .title { font-size: 20px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 12px; color: #94a3b8; margin-top: 5px; }

    .erd-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 20px; }
    .table-card {
      background: #0b132b; border: 1.5px solid #38bdf8; border-radius: 10px; overflow: hidden;
      box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    }
    .table-head {
      background: #1e3a8a; padding: 10px 14px; border-bottom: 1.5px solid #38bdf8;
      display: flex; justify-content: space-between; align-items: center;
    }
    .table-name { font-size: 13px; font-weight: 800; color: #ffffff; }
    .table-desc { font-size: 9px; color: #93c5fd; font-weight: 600; text-transform: uppercase; }
    
    .table-body { padding: 8px 12px; font-size: 11px; }
    .field-row { display: flex; justify-content: space-between; padding: 4.5px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .field-row:last-child { border-bottom: none; }
    .field-name { font-weight: 600; color: #e2e8f0; }
    .field-type { font-family: monospace; color: #38bdf8; font-size: 10px; }
    .pk { color: #f59e0b; font-weight: 700; }
    .fk { color: #10b981; font-weight: 700; }
    
    .rel-badge { display: inline-block; background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="header">
      <div class="title">Diagram Struktur Data Terpadu SIPPRO-TWR (Model Data ERD)</div>
      <div class="subtitle">Desain Entitas Pangkalan Data Penilaian Properti Berbasis Peta Citra Satelit (http://localhost:3000/)</div>
    </div>
    
    <div class="erd-grid">
      
      <!-- Table 1: Primary Properties Table -->
      <div class="table-card">
        <div class="table-head">
          <span class="table-name">properties</span>
          <span class="table-desc">Tabel Utama Data Properti</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span class="field-name pk">PK property_id</span><span class="field-type">UUID / INT</span></div>
          <div class="field-row"><span class="field-name">nama_objek</span><span class="field-type">VARCHAR(100)</span></div>
          <div class="field-row"><span class="field-name">alamat_lengkap</span><span class="field-type">TEXT</span></div>
          <div class="field-row"><span class="field-name fk">FK kota_id</span><span class="field-type">VARCHAR(50)</span></div>
          <div class="field-row"><span class="field-name">latitude (Lintang)</span><span class="field-type">DECIMAL(10,7)</span></div>
          <div class="field-row"><span class="field-name">longitude (Bujur)</span><span class="field-type">DECIMAL(10,7)</span></div>
          <div class="field-row"><span class="field-name">kategori_objek</span><span class="field-type">VARCHAR(30)</span></div>
          <div class="field-row"><span class="field-name">luas_tanah (LT)</span><span class="field-type">NUMERIC (m²)</span></div>
          <div class="field-row"><span class="field-name">luas_bangunan (LB)</span><span class="field-type">NUMERIC (m²)</span></div>
          <div class="field-row"><span class="field-name">jenis_sertifikat</span><span class="field-type">VARCHAR (SHM/HGB)</span></div>
          <div class="field-row"><span class="field-name">harga_total</span><span class="field-type">NUMERIC (Rp)</span></div>
          <div class="field-row"><span class="field-name">harga_per_m2</span><span class="field-type">NUMERIC (Rp/m²)</span></div>
          <div class="field-row"><span class="field-name">status_data</span><span class="field-type">VARCHAR (Penawaran)</span></div>
          <div class="field-row"><span class="field-name">nama_surveyor</span><span class="field-type">VARCHAR(100)</span></div>
          <div class="field-row"><span class="field-name">tanggal_survei</span><span class="field-type">DATE</span></div>
          <div class="field-row"><span class="field-name">lebar_jalan_row</span><span class="field-type">VARCHAR(50)</span></div>
        </div>
      </div>

      <!-- Table 2: Regions / Cities -->
      <div class="table-card" style="border-color: #10b981;">
        <div class="table-head" style="background: #064e3b; border-color: #10b981;">
          <span class="table-name">regions</span>
          <span class="table-desc" style="color: #6ee7b7;">Cakupan 61 Wilayah</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span class="field-name pk">PK kota_id</span><span class="field-type">VARCHAR(50)</span></div>
          <div class="field-row"><span class="field-name">nama_kota</span><span class="field-type">VARCHAR(100)</span></div>
          <div class="field-row"><span class="field-name">provinsi</span><span class="field-type">VARCHAR(100)</span></div>
          <div class="field-row"><span class="field-name">jumlah_titik</span><span class="field-type">INTEGER</span></div>
          <div class="field-row"><span class="field-name">rata_rata_nilai</span><span class="field-type">NUMERIC (Rp/m²)</span></div>
          <div class="field-row"><span class="field-name">total_luas_area</span><span class="field-type">NUMERIC (m²)</span></div>
          <div style="margin-top: 15px; font-size: 10.5px; color: #94a3b8;">
            Mendukung pengelompokan wilayah Jabodetabek dan 61 kota/kabupaten di seluruh Indonesia.
          </div>
        </div>
      </div>

      <!-- Table 3: File Transfers / Ingest & Export -->
      <div class="table-card" style="border-color: #f59e0b;">
        <div class="table-head" style="background: #78350f; border-color: #f59e0b;">
          <span class="table-name">file_transfers</span>
          <span class="table-desc" style="color: #fcd34d;">Riwayat Upload & Ekspor</span>
        </div>
        <div class="table-body">
          <div class="field-row"><span class="field-name pk">PK file_id</span><span class="field-type">UUID</span></div>
          <div class="field-row"><span class="field-name">tipe_aksi</span><span class="field-type">VARCHAR(20)</span></div>
          <div class="field-row"><span class="field-name">format_file</span><span class="field-type">.XLSX / .KML</span></div>
          <div class="field-row"><span class="field-name">nama_file</span><span class="field-type">VARCHAR(255)</span></div>
          <div class="field-row"><span class="field-name">total_baris</span><span class="field-type">INTEGER</span></div>
          <div class="field-row"><span class="field-name">waktu_proses</span><span class="field-type">TIMESTAMP</span></div>
          <div style="margin-top: 15px; font-size: 10.5px; color: #94a3b8;">
            Merekam batch upload spreadsheet Excel serta ekspor 1-klik file kertas kerja penilaian.
          </div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
"""

diagrams = [
    ("dfd_level_0_context_diagram.png", html_dfd_0),
    ("dfd_level_1_subsystem_architecture.png", html_dfd_1),
    ("bpmn_business_process_workflow.png", html_bpmn),
    ("erd_iso19152_data_model.png", html_erd),
]

def render_all():
    print("Rendering all 4 modernized diagrams using Playwright (2x device scale factor)...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1300, "height": 850}, device_scale_factor=2)
        
        for filename, html_str in diagrams:
            temp_file = os.path.join(OUTPUT_DIR, "temp_diagram.html")
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(html_str)
            
            page.goto(f"file:///{temp_file.replace(os.sep, '/')}")
            page.wait_for_timeout(500)
            
            out_path = os.path.join(OUTPUT_DIR, filename)
            canvas = page.locator(".canvas")
            if canvas.count() > 0:
                canvas.screenshot(path=out_path)
            else:
                page.screenshot(path=out_path)
                
            if os.path.exists(temp_file):
                os.remove(temp_file)
            print(f"[SUCCESS] Rendered: {filename} ({os.path.getsize(out_path):,} bytes)")
            
        browser.close()
    print("\n=== ALL 4 DIAGRAMS RECREATED & RENDERED PERFECTLY ===")

if __name__ == "__main__":
    render_all()
