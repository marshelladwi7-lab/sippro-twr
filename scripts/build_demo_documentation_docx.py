# -*- coding: utf-8 -*-
"""
Script: build_demo_documentation_docx.py
Purpose: Generate comprehensive technical documentation and stakeholder demo guide
         saved as S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx
         containing all 4 architectural diagrams (DFD Level 0, DFD Level 1, BPMN, ERD)
         and 17 live application feature screenshots captured via Playwright.
"""

import os
import re
import docx
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

SCREENSHOTS_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
OUTPUT_DOCX = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx"

def add_markdown_runs(p, text, default_font="Times New Roman", default_size=12):
    pattern = re.compile(r'(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|[^*]+)')
    tokens = pattern.findall(text)
    for token in tokens:
        if not token:
            continue
        if token.startswith('***') and token.endswith('***') and len(token) >= 6:
            r = p.add_run(token[3:-3])
            r.bold = True
            r.italic = True
        elif token.startswith('**') and token.endswith('**') and len(token) >= 4:
            r = p.add_run(token[2:-2])
            r.bold = True
        elif token.startswith('*') and token.endswith('*') and len(token) >= 2:
            r = p.add_run(token[1:-1])
            r.italic = True
        else:
            r = p.add_run(token)
        r.font.name = default_font
        r.font.size = Pt(default_size)

def set_paragraph_properties(p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=0, space_before=0):
    p.alignment = align
    pf = p.paragraph_format
    pf.line_spacing = line_spacing
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)

def add_p(doc, text, style='Normal', default_font="Times New Roman", default_size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=6, space_before=0):
    p = doc.add_paragraph("", style=style)
    add_markdown_runs(p, text, default_font, default_size)
    set_paragraph_properties(p, align, line_spacing, space_after, space_before)
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph("", style='Heading 1')
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.space_before = Pt(18)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph("", style='Heading 2')
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.space_before = Pt(12)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph("", style='Heading 3')
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.space_before = Pt(8)
    return p

def add_figure(doc, img_filename, caption_text, width_cm=14.5):
    img_path = os.path.join(SCREENSHOTS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"[WARN] Image file not found: {img_path}")
        return None
    
    # Image paragraph
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_after = Pt(3)
    p_img.paragraph_format.space_before = Pt(6)
    r = p_img.add_run()
    r.add_picture(img_path, width=Cm(width_cm))

    # Caption paragraph
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.line_spacing = 1.15
    p_cap.paragraph_format.space_after = Pt(8)
    p_cap.paragraph_format.space_before = Pt(0)
    add_markdown_runs(p_cap, caption_text, default_size=9.5)
    return p_img

def main():
    print(f"Creating documentation docx at: {OUTPUT_DOCX}...")
    doc = docx.Document()

    # Section Margins A4 (Top 4cm, Left 4cm, Bottom 3cm, Right 3cm)
    for s in doc.sections:
        s.top_margin = Cm(4.0)
        s.bottom_margin = Cm(3.0)
        s.left_margin = Cm(4.0)
        s.right_margin = Cm(3.0)

    # -------------------------------------------------------------
    # COVER / TITLE PAGE
    # -------------------------------------------------------------
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(36)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.line_spacing = 1.3
    p_title.paragraph_format.space_after = Pt(12)
    r_t = p_title.add_run("DOKUMENTASI TEKNIS, ALUR DATA, DAN SIMULASI OPERASIONAL SISTEM PANGKALAN DATA PENILAIAN PROPERTI (SIPPRO-TWR)")
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(15)
    r_t.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.line_spacing = 1.2
    p_sub.paragraph_format.space_after = Pt(40)
    r_s = p_sub.add_run(
        "Panduan Presentasi Pemangku Kepentingan (Stakeholders Demo), Diagram Alir Data (DFD), "
        "Pemetaan Proses Bisnis (BPMN), dan Verifikasi Fitur Menyeluruh Berbasis Standar Penilaian Indonesia (SPI) & POJK 40/POJK.03/2019"
    )
    r_s.font.name = "Times New Roman"
    r_s.font.size = Pt(11.5)
    r_s.italic = True

    # Metadata Author
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.line_spacing = 1.3
    p_meta.paragraph_format.space_before = Pt(60)
    p_meta.paragraph_format.space_after = Pt(60)
    add_markdown_runs(p_meta, (
        "**Disusun Oleh:**\n"
        "**MARSHELLA DWIVITASARI**\n"
        "NPM: 3042240056\n\n"
        "Program Studi Diploma III Pajak Bumi dan Bangunan / Penilai\n"
        "Jurusan Pajak • Politeknik Keuangan Negara STAN\n\n"
        "**Mitra Kerja Lapangan:**\n"
        "**Kantor Jasa Penilai Publik (KJPP) Totok Wasito dan Rekan**\n"
        "Jakarta / Tangerang Selatan • September 2026"
    ), default_size=11)

    doc.add_page_break()

    # -------------------------------------------------------------
    # BAB I: PENDAHULUAN & ARSITEKTUR KONSEPTUAL SISTEM
    # -------------------------------------------------------------
    add_heading_1(doc, "BAB I\nPENDAHULUAN DAN ARSITEKTUR KONSEPTUAL SISTEM")

    add_heading_2(doc, "1.1 Latar Belakang dan Urgensi Transformasi Digital Penilaian")
    add_p(doc, (
        "Penilaian real properti di Indonesia memegang peranan krusial dalam menjaga stabilitas sistem perbankan nasional, "
        "menentukan basis pengenaan pajak daerah (PBB-P2 dan BPHTB), serta memitigasi risiko kredit bermasalah (*non-performing loan*). "
        "Dalam menjalankan tugas penaksiran properti menggunakan Pendekatan Pasar (*Market Approach*) sebagaimana diatur dalam "
        "Standar Penilaian Indonesia (SPI 106), penilai publik wajib merujuk pada data transaksi atau penawaran properti pembanding "
        "yang andal, relevan, dan terverifikasi secara sah."
    ))
    add_p(doc, (
        "Namun secara faktual, praktik penilaian di Indonesia selama puluhan tahun terkendala oleh asimetri informasi yang akut "
        "(*acute information asymmetry*) dan fragmentasi data. Sebagian besar Kantor Jasa Penilai Publik (KJPP), termasuk "
        "KJPP Totok Wasito dan Rekan, mengelola ribuan data historis hasil inspeksi lapangan hanya menggunakan lembar kerja tabular "
        "lepas (Microsoft Excel) yang rawan rusak (*data decay*), tidak terstandarisasi, sulit ditelusuri riwayat perubahannya, "
        "serta tidak memiliki referensi spasial (koordinat geospasial WGS84). Kondisi ini menyebabkan tahapan penapisan pra-survei "
        "(*pre-survey screening*) memakan waktu hingga 180 menit per penugasan, serta meningkatkan risiko deviasi opini nilai."
    ))
    add_p(doc, (
        "Untuk mengatasi tantangan tersebut secara fundamental, dibangun sebuah sistem informasi geospasial dan pangkalan data "
        "terintegrasi yang dinamakan **SIPPRO-TWR** (*Sistem Informasi Penilaian Properti Totok Wasito dan Rekan*). Sistem ini "
        "mengubah paradigma pengelolaan data properti dari pendekatan manual spreadsheet menjadi pangkalan data geospasial berbasis web "
        "yang interaktif, transparan, dan dapat diaudit secara independen."
    ))

    add_heading_2(doc, "1.2 Profil Solusi SIPPRO-TWR: Kepatuhan Arsitektur Nir-Biaya ($0-Cost Stack)")
    add_p(doc, (
        "Salah satu prinsip rekayasa perangkat lunak utama dalam pembangunan SIPPRO-TWR adalah **Zero-Cost Stack Compliance** "
        "(kepatuhan pada arsitektur berbiaya lisensi nol rupiah). Penilai publik menolak penggunaan pustaka, SDK, atau penyedia peta komersial "
        "yang membebankan biaya panggilan API berulang (seperti Google Maps Platform atau Mapbox API berbayar). Sebagai gantinya, sistem dibangun "
        "menggunakan kombinasi teknologi sumber terbuka (*open-source*) berkinerja tinggi:"
    ))
    add_p(doc, (
        "1. **Antarmuka & Framework:** Next.js 15 (App Router, Server Actions) dengan TypeScript Strict Mode dan Tailwind CSS v3.\n"
        "2. **Pustaka Pemetaan Geospasial:** MapLibre GL JS v5 (bebas royalti dan bebas watermark) yang mendukung render ubin vektor "
        "dan raster berkinerja tinggi menggunakan akselerasi WebGL.\n"
        "3. **Penyedia Ubin Peta Terbuka:** CARTO Positron (tampilan peta terang minimalis), Dark Matter (tampilan kontras gelap), "
        "OpenStreetMap, dan Citra Satelit Resolusi Tinggi Esri World Imagery.\n"
        "4. **Pangkalan Data Spasial:** PostGIS (EPSG:4326 / WGS84) via Supabase Free Tier dengan indeks spasial GIST untuk eksekusi kueri radius <150 milidetik.\n"
        "5. **Mesin Kalkulasi Mandiri:** Mesin penilaian Pendekatan Pasar (SPI 106) dan mesin pemotongan likuidasi agunan bank (POJK 40/2019) yang diimplementasikan secara murni tanpa dependensi eksternal."
    ))

    add_heading_2(doc, "1.3 Landasan Kepatuhan Regulasi dan Standar Penilaian")
    add_p(doc, (
        "Pengembangan SIPPRO-TWR mengacu secara ketat pada hierarki regulasi dan standar profesi yang berlaku:\n"
        "• **KEPI & SPI Edisi VII 2018 (SPI 106 & SPI 202):** Menegakkan prinsip objektivitas dan hierarki bukti pasar, di mana data pembanding "
        "wajib disesuaikan menggunakan matriks penyesuaian matematis terukur (legalitas, tapak, ROW jalan, elevasi, dan waktu).\n"
        "• **PMK No. 101/PMK.01/2014 jo. PMK No. 228/PMK.01/2019 tentang Penilai Publik:** Pasal 43 ayat (5) huruf c mewajibkan setiap KJPP "
        "memelihara dan memutakhirkan pangkalan data penilaian berbasis teknologi informasi yang mencakup pencatatan jenis data, sumber perolehan, "
        "tanggal data, dan harga objek. Pemenuhan ini menjadi objek audit kepatuhan oleh PPPK Kementerian Keuangan.\n"
        "• **POJK No. 40/POJK.03/2019 tentang Penilaian Kualitas Aset Bank Umum:** Mewajibkan penetapan Nilai Likuidasi yang realistis "
        "melalui potongan likuidasi (*liquidation haircut*) untuk melindungi bank terhadap risiko agunan kredit macet.\n"
        "• **ISO 19152:2024 LADM Part 4 (Valuation Information Model):** Standar internasional keterpaduan data kadaster spasial (*SpatialUnit*) "
        "dengan catatan transaksi pasar (*TransactionRecord*) dan opini nilai (*ValuationRecord*)."
    ))

    doc.add_page_break();

    # -------------------------------------------------------------
    # BAB II: DIAGRAM ALIR DATA (DFD) DAN MODEL DATA GEOSPASIAL
    # -------------------------------------------------------------
    add_heading_1(doc, "BAB II\nDIAGRAM ALIR DATA (DFD) DAN MODEL DATA GEOSPASIAL")

    add_heading_2(doc, "2.1 DFD Level 0 (Context Diagram): Interaksi Entitas Eksternal")
    add_p(doc, (
        "Diagram Konteks (DFD Level 0) menggambarkan batasan sistem (*system boundary*) SIPPRO-TWR serta pertukaran aliran informasi "
        "antara platform terpusat dengan seluruh entitas eksternal yang terlibat dalam ekosistem penilaian properti."
    ))

    add_figure(
        doc,
        "dfd_level_0_context_diagram.png",
        "**Gambar II.1** Diagram Alir Data (DFD) Level 0: Diagram Konteks Sistem SIPPRO-TWR\n"
        "*Sumber: Hasil Perancangan Arsitektur Sistem SIPPRO-TWR (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana disajikan pada Gambar II.1 di atas, sistem SIPPRO-TWR berinteraksi dengan enam entitas eksternal utama:\n"
        "1. **Penilai Properti (MAPPI):** Mengirimkan parameter objek penilaian (luas tanah, luas bangunan, legalitas, koordinat sasaran) "
        "dan menerima umpan balik berupa klaster data pembanding terdekat dalam radius 1 s.d. 5 km, indikasi nilai pasar per m², dan lembar KKP terisi.\n"
        "2. **Tenaga Inspeksi / Surveyor Lapangan:** Memasukkan data survei riil (foto fisik, penandaan koordinat GPS *on-map pinpointing*, "
        "lebar muka jalan, kondisi elevasi) dan menerima panduan rute navigasi pra-survei.\n"
        "3. **Admin & Ingesti Data:** Memasukkan berkas batch Excel mentah dan menerima laporan pembersihan string koordinat WGS84 yang telah tervalidasi.\n"
        "4. **Komite Kredit & Risiko Bank:** Mengirimkan parameter batas plafon LTV dan menerima berkas *Executive Bank Summary Card*, "
        "rincian Nilai Likuidasi (*liquidation haircut*), serta indikasi kelayakan agunan kredit POJK 40/2019.\n"
        "5. **Regulator (PPPK Kemenkeu & OJK):** Menerima laporan pangkalan data penilaian terstruktur dan jejak audit (*audit trail*) kepatuhan penugasan.\n"
        "6. **Penyedia Peta & Sistem SIG Eksternal:** Menyediakan ubin peta sumber terbuka (CARTO, Esri, OSM) dan menerima berkas ekspor dwiformat (.xlsx dan .kml)."
    ))

    add_heading_2(doc, "2.2 DFD Level 1: Dekomposisi Fungsional dan Alur Sub-Sistem")
    add_p(doc, (
        "Diagram Alir Data Level 1 menguraikan proses internal SIPPRO-TWR ke dalam delapan sub-proses modular yang saling terhubung "
        "dengan pangkalan data spasial utama (*market_comparables*)."
    ))

    add_figure(
        doc,
        "dfd_level_1_subsystem_architecture.png",
        "**Gambar II.2** Diagram Alir Data (DFD) Level 1: Dekomposisi Sub-Sistem Fungsional SIPPRO-TWR\n"
        "*Sumber: Hasil Perancangan Arsitektur Sistem SIPPRO-TWR (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Berdasarkan Gambar II.2, alur pengolahan data terbagi menjadi empat modul utama:\n"
        "• **Modul Ingesti & Pembersihan (Proses 1.0):** Menerapkan ekspresi reguler (*regex sanitizer*) untuk mengoreksi anomali string koordinat, "
        "menghapus koma ganda, menangani nilai null, serta menyaring outlier luas tanah ekstrem (>1.000.000 m²).\n"
        "• **Modul Spasial PostGIS (Proses 2.0 & 5.0):** Mengeksekusi penapisan radius `ST_DWithin` bola bumi dan memvisualisasikan titik data "
        "menggunakan ubin peta bebas watermark pada MapLibre GL JS.\n"
        "• **Modul Penilaian & Risiko (Proses 3.0, 4.0, & 8.0):** Mengoperasikan mesin pembobotan penyesuaian SPI 106 pada *HighDensityKkpGrid* "
        "serta menghitung potongan likuidasi agunan bank sesuai formula POJK 40/2019.\n"
        "• **Modul Distribusi & Ekspor (Proses 6.0 & 7.0):** Menyediakan antarmuka spreadsheet interaktif berdensitas tinggi dengan fungsi pencarian "
        "instan dan konversi data ke format Excel (.xlsx) dan Google Earth (.kml)."
    ))

    add_heading_2(doc, "2.3 Alur Proses Bisnis Operasional (BPMN Swimlane Workflow)")
    add_p(doc, (
        "Diagram Alur Proses Bisnis (*Business Process Model and Notation* / BPMN) memetakan urutan langkah operasional harian yang "
        "dilalui oleh Surveyor, Penilai Properti, Sistem Otomatis SIPPRO-TWR, dan Reviewer Perbankan."
    ))

    add_figure(
        doc,
        "bpmn_business_process_workflow.png",
        "**Gambar II.3** Alur Proses Bisnis Operasional Penilaian Properti (BPMN Workflow Swimlane)\n"
        "*Sumber: Analisis Prosedur Operasional Standar (SOP) KJPP TWR (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Siklus operasional penilaian pada Gambar II.3 mencakup sepuluh tahapan terintegrasi:\n"
        "1. **Tahap Ingesti & Validasi:** Admin mengunggah rekapitulasi data survei lapangan ke Batch Uploader.\n"
        "2. **Tahap Sanitasi Spasial:** Sistem membersihkan anomali koordinat dan memetakan titik ke proyeksi EPSG:4326 WGS84.\n"
        "3. **Tahap Penambahan Titik Cepat:** Surveyor lapangan menandai titik data penawaran baru langsung melalui klik peta (*On-Map Pinpointing*).\n"
        "4. **Tahap Penapisan Pra-Survei:** Penilai menentukan titik lokasi sasaran dan mengaktifkan radius penapisan 1 hingga 5 km.\n"
        "5. **Tahap Seleksi Bukti Pasar:** Penilai menyeleksi sekurang-kurangnya 3 data pembanding terdekat yang paling sebanding.\n"
        "6. **Tahap Pembobotan KKP:** Penilai memasukkan bobot penyesuaian pada KKP Grid terintegrasi.\n"
        "7. **Tahap Pembentukan Opini Nilai:** Sistem menghitung rata-rata tertimbang indikasi nilai pasar tanah dan biaya bangunan.\n"
        "8. **Tahap Analisis Risiko Likuidasi:** Mesin POJK 40 menghitung potongan likuidasi (*haircut*) dan batas aman plafon kredit bank.\n"
        "9. **Tahap Uji Komite Kredit:** Reviewer perbankan memverifikasi agunan melalui *Executive Bank Summary Card*.\n"
        "10. **Tahap Penyimpanan Jejak Audit:** Sistem merekam seluruh riwayat valuasi untuk pemenuhan kepatuhan audit tahunan PPPK Kemenkeu."
    ))

    add_heading_2(doc, "2.4 Model Data Geospasial Berbasis ISO 19152 LADM Part 4 (ERD)")
    add_p(doc, (
        "Struktur tabel pada pangkalan data spasial SIPPRO-TWR dirancang mengikuti model konseptual standar internasional "
        "**ISO 19152:2024 Land Administration Domain Model (LADM) Part 4: Valuation Information**."
    ))

    add_figure(
        doc,
        "erd_iso19152_data_model.png",
        "**Gambar II.4** Model Data Geospasial & Diagram Entitas Relasi (ERD) Berbasis Standar ISO 19152\n"
        "*Sumber: Spesifikasi Skema Pangkalan Data SIPPRO-TWR (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Skema basis data pada Gambar II.4 menghubungkan tiga entitas inti:\n"
        "• **`market_comparables` (Merefleksikan LADM `SpatialUnit` & `TransactionRecord`):** Menyimpan geometri titik (`GEOMETRY(Point, 4326)`), "
        "koordinat lintang-bujur, alamat lengkap, luas tanah/bangunan, legalitas (SHM/HGB/Girik), bentuk tapak, lebar ROW jalan, harga pasar, serta "
        "klasifikasi sumber data (`source_type`: 'TRANSAKSI_AKTUAL', 'PENCAIRAN_KPR', 'LELANG_AGUNAN', 'PENAWARAN_LISTING').\n"
        "• **`valuation_projects` (Merefleksikan LADM `ValuationUnit`):** Menyimpan informasi penugasan penilaian, nomor laporan, identitas debitur, "
        "koordinat target agunan, tanggal inspeksi, penilai pelaksana, dan institusi perbankan mitra.\n"
        "• **`valuation_records` (Merefleksikan LADM `ValuationRecord`):** Menyimpan hasil rekonsiliasi nilai pasar, kalkulasi biaya penggantian baru "
        "bangunan (RCN) terdepresiasi, persentase potongan likuidasi (*haircut*), Nilai Likuidasi, batas plafon kredit maksimum (LTV 70%), dan "
        "status kepatuhan POJK 40/2019."
    ))

    doc.add_page_break();

    # -------------------------------------------------------------
    # BAB III: SIMULASI OPERASIONAL & PRESENTASI FITUR MENYELURUH
    # -------------------------------------------------------------
    add_heading_1(doc, "BAB III\nSIMULASI OPERASIONAL DAN PRESENTASI FITUR MENYELURUH")

    add_p(doc, (
        "Bab ini menyajikan dokumentasi hasil simulasi eksekusi seluruh alur kerja sistem SIPPRO-TWR menggunakan otomasi penelusuran peramban "
        "Playwright Chromium beresolusi tinggi (High-DPI 2x scale factor). Setiap fitur diuji secara langsung untuk memverifikasi fungsionalitas "
        "dan ketepatan kalkulasi terhadap standar industri penilaian."
    ))

    # 3.1 Portal Akses Terpadu & RBAC
    add_heading_2(doc, "3.1 Portal Akses Terpadu & Kontrol Hak Akses Berbasis Peran (RBAC)")
    add_p(doc, (
        "Keamanan data dan integritas laporan penilaian dijaga melalui penerapan *Role-Based Access Control* (RBAC) pada gerbang masuk sistem. "
        "Pengguna diarahkan pada antarmuka autentikasi yang membedakan hak akses berdasarkan peran kelembagaan penilai dan perbankan."
    ))

    add_figure(
        doc,
        "01_portal_landing_login.png",
        "**Gambar III.1** Tampilan Beranda Portal Akses Terpadu dan Form Autentikasi SIPPRO-TWR\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Rute /login (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.1 di atas, sistem menyajikan ringkasan proposisi nilai platform: kepatuhan pangkalan data 100% nir-biaya lisensi, "
        "integrasi peta geospasial WGS84, dan jaminan kepatuhan terhadap PMK 228/2019 serta POJK 40/2019. Pengguna dapat memilih profil persona "
        "yang disesuaikan dengan tugas operasionalnya."
    ))

    add_figure(
        doc,
        "02_portal_role_personas.png",
        "**Gambar III.2** Panel Seleksi Peran Pengguna (Role-Based Access Control - RBAC)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Rute /login (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana disajikan pada Gambar III.2, sistem mendefinisikan lima peran pengguna dengan hak akses berjenjang:\n"
        "1. **Penilai Properti Madya (Budi Santoso, S.T., MAPPI Cert.):** Memiliki wewenang penuh dalam mengakses seluruh pangkalan data, "
        "mengedit matriks penyesuaian KKP, mengesahkan opini nilai, dan mencetak laporan ringkasan penilaian.\n"
        "2. **Pemeriksa Risiko Bank (Hendra Wijaya, S.E. - Bank Mandiri):** Diberikan hak akses penelaahan (*reviewer access*) untuk memeriksa "
        "konsistensi data agunan, memvalidasi potongan likuidasi, dan mengakses *Executive Bank Summary Card*.\n"
        "3. **Tenaga Lapangan / Surveyor (Ahmad Fauzi):** Dibatasi pada penambahan titik data survei baru, penandaan koordinat GIS, dan pembaruan foto fisik objek.\n"
        "4. **Partner KJPP / Admin (Totok Wasito, S.E., M.Ec.Dev.):** Memegang hak kelola administratif tertinggi, manajemen pengguna, dan persetujuan final laporan.\n"
        "5. **Tamu Sandbox:** Akses evaluasi satu-klik tanpa kata sandi untuk demonstrasi pemangku kepentingan dan auditor eksternal."
    ))

    # 3.2 GIS Cockpit Spasial
    add_heading_2(doc, "3.2 GIS Cockpit Spasial & Navigasi Pemetaan Bebas Watermark")
    add_p(doc, (
        "Setelah proses autentikasi berhasil, pengguna diarahkan ke ruang kerja utama (*GIS Valuation Workstation*). Tab pertama menyajikan "
        "kokpit pemetaan geospasial interaktif yang memvisualisasikan persebaran 1.511 titik data properti yang telah tervalidasi."
    ))

    add_figure(
        doc,
        "03_gis_cockpit_overview.png",
        "**Gambar III.3** Tampilan Utama GIS Spatial Cockpit dengan Telemetri Pangkalan Data Terpadu\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Rute /workstation Tab Peta Spasial GIS (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.3, bilah navigasi atas (*telemetry strip*) secara langsung menampilkan indikator agregat pangkalan data kantor: "
        "**1.511 Titik Data Aktif**, **Median Nilai Tanah Rp 4.250.000/m²**, serta cakupan wilayah administratif di **12 Kota/Kabupaten** "
        "(konsentrasi utama pada klaster Jabodetabek dan kawasan pengembangan pariwisata Bali). Peta digerakkan oleh mesin MapLibre GL JS "
        "yang menyajikan navigasi bebas lag dan bebas watermark."
    ))

    add_figure(
        doc,
        "04_gis_basemap_satellite.png",
        "**Gambar III.4** Pengalihan Peta Dasar ke Citra Satelit Resolusi Tinggi (Esri World Imagery)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Fitur Pengalih Basemap (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.4 mendemonstrasikan fleksibilitas pemilihan peta dasar (*basemap switcher*). Penilai dapat beralih dari tampilan vektor "
        "jalan (*CARTO Positron*) ke citra satelit fotogrametri resolusi tinggi (*Esri World Imagery*). Fitur ini sangat krusial bagi penilai "
        "untuk memverifikasi kondisi fisik lingkungan makro objek secara visual (keberadaan vegetasi, batas alam saluran air, kontur bukit, "
        "dan kepadatan bangunan sekitar) sebelum turun ke lapangan."
    ))

    add_figure(
        doc,
        "05_gis_spatial_radius_buffer.png",
        "**Gambar III.5** Penapisan Radius Spasial Otomatis (Spatial Buffer 3 km) di Sekitar Objek Sasaran\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Analisis Radius Spasial (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana ditunjukkan pada Gambar III.5, sistem menyediakan tombol pemilihan radius dinamis (1km, 2km, 3km, dan 5km). Saat penilai "
        "memilih radius 3 km, sistem secara otomatis merender poligon lingkaran penyangga (*buffer polygon*) berwarna hijau transparan "
        "mengelilingi pin objek penilaian sasaran. Seluruh data pembanding yang berada di dalam radius langsung terisolasi dan dihitung "
        "jarak garis lurusnya menggunakan formula geosentris Haversine."
    ))

    # 3.3 Penelaahan Atribut Objek & Penambahan Titik Lapangan
    add_heading_2(doc, "3.3 Penelaahan Atribut Objek & Penambahan Titik Data Lapangan")
    add_p(doc, (
        "Setiap titik data pada peta spasial menyimpan rekaman atribut lengkap yang dapat dibuka melalui jendela sembulan modal atau laci inspeksi."
    ))

    add_figure(
        doc,
        "06_gis_property_detail_modal.png",
        "**Gambar III.6** Jendela Rincian Spesifikasi Teknis dan Yuridis Properti Pembanding\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Jendela Sembulan Properti (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.6, jendela sembulan memuat rincian parameter objek sesuai ketentuan PMK 228/2019: Nomor Identitas Legasi, "
        "Jenis Properti (Tanah & Bangunan), Alamat Lengkap, Titik Koordinat Lintang/Bujur WGS84, Luas Tanah (LT), Luas Bangunan (LB), "
        "Kisaran Nilai Pasar per m², Status Hak Kepemilikan (SHM/HGB), Bentuk Tapak (Persegi/Tusuk Sate/Kantong Semar), Lebar ROW Jalan, "
        "serta identitas surveyor dan tanggal pengambilan data."
    ))

    add_figure(
        doc,
        "07_gis_comparable_inspector_drawer.png",
        "**Gambar III.7** Laci Inspeksi Komparasi Berdampingan (Comparable Inspector Drawer)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Laci Inspeksi Data (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.7 memperlihatkan laci inspeksi (*drawer*) yang muncul dari sisi kanan layar saat penilai mengklik tombol 'Inspeksi'. "
        "Laci ini memungkinkan penilai memeriksa komparasi teknis secara mendalam tanpa kehilangan orientasi navigasi pada peta utama."
    ))

    add_figure(
        doc,
        "08_gis_on_map_pinpoint_modal.png",
        "**Gambar III.8** Penambahan Titik Data Lapangan Baru Melalui On-Map Pinpointing Koordinat\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Fitur Tambah Titik Data (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana disajikan pada Gambar III.8, sistem menyederhanakan alur kerja surveyor lapangan melalui fitur **On-Map Pinpointing**. "
        "Surveyor cukup mengaktifkan mode tambah titik dan mengklik langsung lokasi fisik objek pada peta satelit. Sistem secara otomatis "
        "menangkap koordinat lintang dan bujur presisi tinggi ke dalam formulir input, mengeliminasi kesalahan pengetikan manual (*human error*) "
        "yang selama ini sering merusak keabsahan data koordinat."
    ))

    # 3.4 Mesin Estimasi Nilai Spasial
    add_heading_2(doc, "3.4 Mesin Estimasi Nilai Spasial (Spatial Value Estimator) & Kalkulator RCN")
    add_p(doc, (
        "Tab kedua pada sistem (*Analisis Estimasi Nilai*) merupakan modul komputasi otomatis yang mengolah data pasar di sekitar objek sasaran "
        "menjadi indikasi estimasi nilai ekonomi properti."
    ))

    add_figure(
        doc,
        "09_spatial_estimator_overview.png",
        "**Gambar III.9** Antarmuka Ringkasan Estimasi Nilai Pasar dan Statistik Komparasi Pasar\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Tab Analisis Estimasi Nilai (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.9, kartu metrik utama menyajikan **Indikasi Estimasi Nilai Pasar** properti sasaran secara terperinci, lengkap dengan "
        "rentang batas bawah (*low estimate*) dan batas atas (*high estimate*). Di sampingnya, panel statistik secara otomatis menghitung "
        "empat metrik sentral dari seluruh data pembanding dalam radius aktif: **Harga Terendah (Min)**, **Nilai Median**, **Nilai Rata-Rata (Mean)**, "
        "dan **Harga Tertinggi (Max)**."
    ))

    add_figure(
        doc,
        "10_spatial_estimator_rcn_calculator.png",
        "**Gambar III.10** Kalkulator Biaya Bangunan (RCN/m²), Penyusutan Fisik, dan Tabel Bukti Pembanding Terdekat\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Sub-Modul Kalkulasi Biaya Bangunan (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.10 mendokumentasikan kalkulator biaya penggantian baru bangunan (*Reproduction Cost New* / RCN). Penilai dapat menyesuaikan "
        "biaya konstruksi per m² (berdasarkan Pedoman Teknis BTB MAPPI) serta menggeser bilah persentase penyusutan (*depreciation slider* 0% s.d. 60%). "
        "Di bawahnya, sistem menyajikan tabel daftar bukti pembanding terurut dari jarak spasial terdekat hingga terjauh."
    ))

    # 3.5 Kertas Kerja Penilaian (KKP) Berdensitas Tinggi Berdasarkan SPI 106
    add_heading_2(doc, "3.5 Kertas Kerja Penilaian (KKP) Berdensitas Tinggi Berdasarkan SPI 106")
    add_p(doc, (
        "Kepatuhan terhadap Standar Penilaian Indonesia (SPI 106 - Pendekatan Pasar) diwujudkan melalui modul *HighDensityKkpGrid*. "
        "Modul ini mereplikasi format Kertas Kerja Penilaian (KKP) resmi KJPP Totok Wasito dan Rekan ke dalam bentuk komputasi digital interaktif."
    ))

    add_figure(
        doc,
        "11_high_density_kkp_adjustment_grid.png",
        "**Gambar III.11** Kertas Kerja Penilaian (KKP) Berdensitas Tinggi Sesuai Standar SPI 106\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada HighDensityKkpGrid (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana terlihat pada Gambar III.11, tabel penyesuaian KKP mengevaluasi minimal tiga data pembanding terpilih terhadap objek sasaran:\n"
        "1. **Harga Satuan Dasar:** Mengambil harga pasar historis atau penawaran per m².\n"
        "2. **Penyesuaian Jenis Data / Diskon Penawaran:** Pemotongan standar -10% untuk menjembatani harga penawaran listing ke indikasi transaksi riil.\n"
        "3. **Penyesuaian Waktu / Tren Pasar:** Mengakomodasi laju apresiasi atau depresiasi nilai properti lokal tahunan.\n"
        "4. **Penyesuaian Legalitas:** Menghitung premi SHM (1,0) terhadap HGB berdasarkan sisa masa hak atau girik.\n"
        "5. **Penyesuaian Geometri Tapak:** Memperhitungkan penalti bentuk tusuk sate (-5% s.d. -10%) atau apresiasi tapak kantong semar (+5%).\n"
        "6. **Penyesuaian Akses Jalan & ROW:** Menilai perbedaan kapasitas jalan (<3m, 3-5m, 6-8m, >8m).\n"
        "Sistem secara otomatis menghitung *Net Adjustment*, *Gross Adjustment*, pembobotan proporsional terbalik (*inverse gross variance weighting*), "
        "dan merumuskan rekonsiliasi indikasi nilai tanah per m² yang bebas dari bias pembulatan subjektif."
    ))

    # 3.6 Konsol Risiko Agunan Perbankan (POJK 40/2019)
    add_heading_2(doc, "3.6 Konsol Risiko Agunan Perbankan & Ringkasan Eksekutif Komite Kredit (POJK 40/2019)")
    add_p(doc, (
        "Untuk memenuhi kebutuhan industri perbankan nasional dalam mengamankan portofolio kredit agunan, SIPPRO-TWR mengintegrasikan "
        "dua komponen khusus yang merujuk pada ketentuan Peraturan Otoritas Jasa Keuangan Nomor 40/POJK.03/2019 dan SPI 202."
    ))

    add_figure(
        doc,
        "12_collateral_risk_gauge_pojk40.png",
        "**Gambar III.12** Konsol Risiko Agunan Bank (POJK 40/2019) dan Simulator Sensitivitas Potongan Likuidasi (Haircut)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada CollateralRiskGauge (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.12 menyajikan **Konsol Risiko Agunan Bank**. Komponen ini menerapkan potongan likuidasi (*liquidation haircut*) standar industri "
        "(20% untuk residensial reguler, 30% untuk ruko komersial, dan 35% untuk tanah kosong/tapak tidak beraturan). Komite kredit bank dapat "
        "melakukan uji ketahanan (*stress-testing*) dengan menggeser bilah sensitivitas haircut secara interaktif untuk melihat simulasi "
        "penurunan Nilai Likuidasi dalam skenario krisis likuiditas pasar."
    ))

    add_figure(
        doc,
        "13_executive_bank_summary_card.png",
        "**Gambar III.13** Ringkasan Eksekutif Komite Kredit Bank (Executive Bank Summary Card)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada ExecutiveBankSummaryCard (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.13 di atas, kartu ringkasan eksekutif merangkum parameter keputusan komite kredit: Opini Nilai Pasar (Market Value), "
        "Nilai Likuidasi (Liquidation Value), Rekomendasi Batas Maksimum Plafon Kredit (LTV 70%), Safety Margin Agunan, batas waktu kedaluwarsa "
        "penilaian agunan (18 bulan sesuai ketentuan POJK 40), serta lencana status kelayakan formal ('Agunan Layak Diterima')."
    ))

    # 3.7 Pangkalan Data Tabular (Spreadsheet)
    add_heading_2(doc, "3.7 Pangkalan Data Tabular (Spreadsheet), Penapisan Cerdas, dan Ekspor Dwiformat")
    add_p(doc, (
        "Tab ketiga (*Pangkalan Data Riwayat*) menyajikan seluruh 1.511 rekaman data properti dalam format lembar kerja spreadsheet berdensitas tinggi "
        "yang terintegrasi langsung dengan mesin pencarian dan penapisan multi-parameter."
    ))

    add_figure(
        doc,
        "14_spreadsheet_records_view.png",
        "**Gambar III.14** Antarmuka Spreadsheet Pangkalan Data Tabular (1.511 Titik Data Tergeotagging)\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Tab Pangkalan Data Riwayat (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.14 menampilkan tabel data berkinerja tinggi yang memuat kolom: Nomor ID Legasi, Alamat, Kota/Kabupaten, Luas Tanah, "
        "Luas Bangunan, Legalitas, Bentuk Tapak, Lebar ROW, Harga Pasar, Tanggal Rekam, dan Tombol Tindakan. Pengguna dapat mengurutkan data "
        "berdasarkan harga tertinggi atau luas tanah dengan sekali klik."
    ))

    add_figure(
        doc,
        "15_spreadsheet_search_and_filter.png",
        "**Gambar III.15** Penerapan Pencarian Instan dan Penapisan Wilayah pada Lembar Kerja Spreadsheet\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Pengujian Filter dan Pencarian Teks (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Pada Gambar III.15, penilai menguji fitur pencarian teks reaktif dengan mengetik kata kunci 'Bekasi'. Sistem secara instan "
        "(dalam waktu <50 milidetik) menyaring 1.511 data menjadi daftar data pembanding yang relevan di kawasan Bekasi. Di sisi kanan atas, "
        "tersedia dua tombol ekspor operasional: **Ekspor Excel (.xlsx)** yang menghasilkan berkas spreadsheet berformat rapi untuk lampiran "
        "kertas kerja kantor, serta **Ekspor Google Earth (.kml)** yang menghasilkan berkas pemetaan spasial 3D untuk keperluan survei navigasi offline."
    ))

    # 3.8 Ingesti Data Massal & Sanitasi Otomatis
    add_heading_2(doc, "3.8 Ingesti Data Massal & Sanitasi Otomatis Koordinat Anomali")
    add_p(doc, (
        "Tab keempat (*Batch Excel Importer*) merupakan pintu masuk penyerapan data historis kantor dari berkas spreadsheet lama ke dalam sistem basis data spasial."
    ))

    add_figure(
        doc,
        "16_batch_excel_uploader.png",
        "**Gambar III.16** Modul Ingesti Spreadsheet Massal dan Mesin Sanitasi Otomatis Koordinat WGS84\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Tab Batch Excel Importer (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Sebagaimana didokumentasikan pada Gambar III.16, modul ini dilengkapi area *drag-and-drop* berkas spreadsheet dan pedoman format "
        "skema standar. Mesin sanitasi internal secara otomatis mendeteksi dan mengoreksi format koordinat yang rusak (seperti penulisan "
        "koma ganda '1,078611, 04.134472', spasi berlebih, atau tanda kutip), memvalidasi kewajaran angka luas tanah, dan menandai baris "
        "data yang tidak lengkap sebelum disimpan secara permanen ke dalam basis data PostGIS."
    ))

    # 3.9 Dashboard Portofolio Agunan Institusional
    add_heading_2(doc, "3.9 Dashboard Portofolio Agunan Institusional")
    add_p(doc, (
        "Selain ruang kerja operasional penilai (*workstation*), sistem menyediakan antarmuka dashboard eksekutif pada rute beranda utama "
        "untuk pemantauan portofolio aset properti secara makro."
    ))

    add_figure(
        doc,
        "17_legacy_gis_dashboard_home.png",
        "**Gambar III.17** Dashboard Agregasi Portofolio Properti Institusional pada Rute Beranda Utama\n"
        "*Sumber: Tangkapan Layar Simulasi Playwright pada Rute Beranda / (September 2026)*",
        width_cm=14.5
    )

    add_p(doc, (
        "Gambar III.17 menampilkan empat ubin metrik utama pada bagian atas layar: **Total Properti Terdata (1.511 Titik)**, **Total Luas "
        "Tanah Terkelola**, **Nilai Rata-Rata Agunan per m²**, dan **Total Sebaran Kota/Kabupaten**. Pada panel samping kiri, penilai dapat "
        "menelusuri ringkasan daftar properti secara cepat berdasarkan kategori aset residensial, komersial, maupun industri."
    ))

    doc.add_page_break();

    # -------------------------------------------------------------
    # BAB IV: PANDUAN SKENARIO DEMONSTRASI PEMANGKU KEPENTINGAN
    # -------------------------------------------------------------
    add_heading_1(doc, "BAB IV\nPANDUAN SKENARIO DEMONSTRASI PEMANGKU KEPENTINGAN\n(STAKEHOLDERS DEMO SCRIPT)")

    add_p(doc, (
        "Untuk memastikan efektivitas komunikasi teknis saat mempresentasikan konsep aplikasi kepada para pemangku kepentingan "
        "(*stakeholders*), disusun panduan skenario demonstrasi interaktif yang disesuaikan dengan fokus kepentingan masing-masing audiens:"
    ))

    add_heading_2(doc, "4.1 Skenario 1: Demonstrasi untuk Komite Risiko & Kredit Perbankan (Bank Persona)")
    add_p(doc, (
        "**Fokus Audiens:** Direktur Manajemen Risiko, Kepala Divisi Penyelamatan Aset Khusus (Special Asset Management), dan Analis Kredit Bank.\n"
        "**Tujuan Presentasi:** Menunjukkan bahwa SIPPRO-TWR menjamin kepastian objektivitas nilai agunan, mencegah kolusi data pembanding fiktif, "
        "serta menyediakan perhitungan Nilai Likuidasi yang terstandarisasi sesuai POJK 40/2019.\n\n"
        "**Langkah Demonstrasi Langsung:**\n"
        "1. Buka rute `/login` dan pilih peran **Reviewer Pemeriksa Data (Bank Mandiri)**.\n"
        "2. Tunjukkan bahwa peran perbankan dapat memverifikasi klaster data pembanding riil di sekitar lokasi agunan debitur pada radius 2 km.\n"
        "3. Buka tab **Analisis Estimasi Nilai**, arahkan perhatian pada **Konsol Risiko Agunan Bank (Gambar III.12)**.\n"
        "4. Demonstrasikan uji sensitivitas haircut: geser bilah potongan likuidasi dari 20% menjadi 30% untuk memperlihatkan bagaimana plafon LTV "
        "kredit 70% terkoreksi secara dinamis untuk melindungi modal bank.\n"
        "5. Tunjukkan **Executive Bank Summary Card (Gambar III.13)** yang memuat opini nilai formal, safety buffer agunan, dan tanggal batas kedaluwarsa laporan 18 bulan."
    ))

    add_heading_2(doc, "4.2 Skenario 2: Demonstrasi untuk Penilai Publik & Rekan KJPP (Valuer Persona)")
    add_p(doc, (
        "**Fokus Audiens:** Managing Partner KJPP, Penilai Publik Berlisensi MAPPI, dan Tim QC Kertas Kerja Penilaian.\n"
        "**Tujuan Presentasi:** Menunjukkan lompatan efisiensi waktu pra-survei sebesar 83,8% serta kepatuhan otomatis terhadap SPI 106 dan PMK 228/2019.\n\n"
        "**Langkah Demonstrasi Langsung:**\n"
        "1. Masuk sebagai **Penilai Properti Madya** pada rute `/workstation`.\n"
        "2. Tunjukkan pencarian data pembanding di kawasan sasaran (misal: Cikarang atau Bali): penapisan radius 2 km mengekstrak data pembanding "
        "secara instan tanpa membuka puluhan file Excel kantor.\n"
        "3. Beralih ke tab **Analisis Estimasi Nilai**, tampilkan **HighDensityKkpGrid (Gambar III.11)**.\n"
        "4. Ubah salah satu parameter penyesuaian (misal: penalti bentuk tapak tusuk sate sebesar -10% pada Pembanding 1): tunjukkan bagaimana "
        "sistem secara otomatis merekonsiliasi ulang indikasi nilai tanah per m² dan menghitung pembobotan varians terbalik secara matematis.\n"
        "5. Klik tombol **Cetak Laporan** untuk menunjukkan ringkasan penugasan siap cetak yang siap diarsipkan ke dalam Long Report penilaian."
    ))

    add_heading_2(doc, "4.3 Skenario 3: Demonstrasi untuk Tenaga Inspeksi & Surveyor Lapangan (Field Surveyor Persona)")
    add_p(doc, (
        "**Fokus Audiens:** Koordinator Surveyor Lapangan dan Tenaga Pengumpul Data GIS.\n"
        "**Tujuan Presentasi:** Memperlihatkan kemudahan identifikasi lokasi pra-survei dan penambahan titik data baru secara instan di lapangan.\n\n"
        "**Langkah Demonstrasi Langsung:**\n"
        "1. Masuk sebagai **Surveyor Lapangan** pada rute `/workstation`.\n"
        "2. Alihkan peta dasar ke citra satelit **Esri World Imagery (Gambar III.4)** untuk mengenali akses jalan dan batas fisik tanah di sekitar target.\n"
        "3. Klik tombol **+ Titik Data**, lalu klik sembarang lokasi properti baru pada peta satelit.\n"
        "4. Tunjukkan modal sembulan **Tambah Titik Bank Data Baru (Gambar III.8)** di mana koordinat lintang dan bujur telah terisi otomatis presisi 6 desimal.\n"
        "5. Buka tab **Pangkalan Data Riwayat** dan klik tombol **Ekspor KML**: perlihatkan bahwa berkas KML dapat langsung dibuka pada aplikasi Google Earth mobile di ponsel surveyor."
    ))

    add_heading_2(doc, "4.4 Skenario 4: Demonstrasi Audit Kepatuhan untuk Regulator (PPPK Kemenkeu & OJK)")
    add_p(doc, (
        "**Fokus Audiens:** Pejabat Pengawas Pusat Pembinaan Profesi Keuangan (PPPK) Kemenkeu dan Pengawas Perbankan OJK.\n"
        "**Tujuan Presentasi:** Membuktikan pemenuhan mutlak terhadap kewajiban hukum kepemilikan sistem pangkalan data penilaian berbasis teknologi informasi.\n\n"
        "**Langkah Demonstrasi Langsung:**\n"
        "1. Buka tab **Pangkalan Data Riwayat (Gambar III.14)**.\n"
        "2. Tunjukkan bahwa setiap baris data dari 1.511 titik secara transparan mencatat empat elemen statuter wajib Pasal 43 ayat (5) huruf c PMK 228/2019: "
        "(1) Jenis data properti, (2) Sumber data perolehan, (3) Tanggal pengambilan data, dan (4) Harga objek penawaran/transaksi.\n"
        "3. Buka tab **Batch Excel Importer (Gambar III.16)** untuk menunjukkan prosedur audit dan sanitasi data yang mencegah masuknya data fiktif atau koordinat anomali.\n"
        "4. Tunjukkan bahwa seluruh opini nilai didukung oleh jejak rekam digital (*digital audit trail*) yang dapat direkonstruksi sewaktu-waktu saat audit kepatuhan tahunan."
    ))

    doc.add_page_break();

    # -------------------------------------------------------------
    # BAB V: KESIMPULAN KELAYAKAN TEKNIS DAN IMPLIKASI STRATEGIS
    # -------------------------------------------------------------
    add_heading_1(doc, "BAB V\nKESIMPULAN KELAYAKAN TEKNIS DAN IMPLIKASI STRATEGIS")

    add_heading_2(doc, "5.1 Evaluasi Kinerja Sistem & Efisiensi Operasional (Validasi Penghematan Waktu 83,8%)")
    add_p(doc, (
        "Berdasarkan hasil pengujian simulasi operasional pra-survei pada enam objek penilaian riil di wilayah DKI Jakarta dan Banten, "
        "implementasi SIPPRO-TWR terbukti memangkas rata-rata waktu penelusuran dan verifikasi data pembanding dari **185,0 menit** (menggunakan "
        "metode manual penelusuran spreadsheet terfragmentasi) menjadi hanya **30,0 menit** (menggunakan alur kerja penapisan spasial SIPPRO-TWR). "
        "Hal ini mencerminkan pencapaian efisiensi waktu kerja sebesar **83,8%**, memungkinkan KJPP Totok Wasito dan Rekan menyelesaikan "
        "laporan penilaian (*turnaround time*) secara jauh lebih cepat tanpa mengorbankan kedalaman analisis pasar."
    ))

    add_heading_2(doc, "5.2 Perlindungan Risiko Hukum Profesi Penilai di Hadapan Penegak Hukum")
    add_p(doc, (
        "Penyelenggaraan pangkalan data spasial terpadu ini memberikan lapisan perlindungan hukum (*legal protection*) yang sangat vital bagi "
        "Penilai Publik. Dalam sengketa hukum atau penyelidikan kredit macet perbankan oleh aparat penegak hukum (Kepolisian, Kejaksaan, atau KPK), "
        "penilai kerap dituduh melakukan manipulasi nilai atau menggunakan data pembanding rekaan. Dengan adanya SIPPRO-TWR, penilai memiliki "
        "bukti forensik digital (*digital audit trail*) yang membuktikan bahwa seluruh data pembanding yang digunakan benar-benar terekam "
        "dalam pangkalan data kantor, memiliki koordinat geografis nyata di muka bumi, dan dihitung menggunakan matriks pembobotan matematis "
        "yang dapat diverifikasi silang sesuai KEPI dan SPI 106."
    ))

    add_heading_2(doc, "5.3 Rekomendasi Cetak Biru Skalabilitas Pangkalan Data Nasional")
    add_p(doc, (
        "Keberhasilan rancang bangun SIPPRO-TWR pada lingkup KJPP membuktikan bahwa transformasi digital data properti di Indonesia "
        "dapat diwujudkan secara mandiri menggunakan teknologi nir-biaya (*zero-cost architecture*). Untuk memperluas dampak strategisnya, "
        "direkomendasikan:\n"
        "1. **Peningkatan Menjadi Multi-Tenant Cloud Repository:** Mengembangkan sistem agar dapat digunakan secara bersama oleh beberapa kantor "
        "cabang KJPP di seluruh Indonesia dengan enkripsi data berbasis penyewa (*tenant isolation*).\n"
        "2. **Integrasi Data Transaksi Perbankan:** Menghubungkan API SIPPRO-TWR dengan sistem *core banking* bank mitra guna menangkap riwayat harga "
        "pencairan kredit dan lelang agunan riil sebagai umpan data transaksi aktual Tingkat 1 (IVS 105).\n"
        "3. **Inspirasi Pusat Data Properti Nasional:** Menjadikan arsitektur SIPPRO-TWR sebagai model rujukan bagi Kementerian Keuangan (PPPK), "
        "Kementerian ATR/BPN, dan MAPPI dalam merancang Cetak Biru Pangkalan Data Properti Nasional terpadu di masa depan."
    ))

    # Save Document
    print(f"Saving completed document to {OUTPUT_DOCX}...")
    doc.save(OUTPUT_DOCX)
    print("Document successfully created and saved!")

if __name__ == "__main__":
    main()
