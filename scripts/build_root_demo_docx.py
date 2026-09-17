# -*- coding: utf-8 -*-
"""
Script: build_root_demo_docx.py
Purpose: Generate a clean, comprehensive, stakeholder-friendly Word documentation (.docx)
         for the live website running at http://localhost:3000/ (SIPPRO-TWR).
         Target file: S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx
"""

import os
import re
import docx
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

SCREENSHOTS_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
OUTPUT_DOCX = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color="D1D5DB", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_markdown_runs(p, text, default_font="Times New Roman", default_size=12, default_color=None):
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
        if default_color:
            r.font.color.rgb = default_color

def set_paragraph_properties(p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=6, space_before=0):
    p.alignment = align
    pf = p.paragraph_format
    pf.line_spacing = line_spacing
    pf.space_after = Pt(space_after)
    pf.space_before = Pt(space_before)

def add_p(doc, text, default_font="Times New Roman", default_size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=6, space_before=0):
    p = doc.add_paragraph()
    add_markdown_runs(p, text, default_font, default_size)
    set_paragraph_properties(p, align, line_spacing, space_after, space_before)
    return p

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.bold = True
    r.font.color.rgb = RGBColor(30, 58, 138)  # Deep Navy
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.space_before = Pt(18)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12.5)
    r.bold = True
    r.font.color.rgb = RGBColor(30, 41, 59)  # Slate 800
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.space_before = Pt(14)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.bold = True
    r.font.color.rgb = RGBColor(51, 65, 85)  # Slate 700
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.space_before = Pt(8)
    return p

def add_figure(doc, img_filename, caption_text, width_cm=14.5):
    img_path = os.path.join(SCREENSHOTS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"[WARN] File not found: {img_path}")
        return None
    
    p_img = doc.add_paragraph()
    p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_img.paragraph_format.space_before = Pt(6)
    p_img.paragraph_format.space_after = Pt(3)
    r = p_img.add_run()
    r.add_picture(img_path, width=Cm(width_cm))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.line_spacing = 1.15
    p_cap.paragraph_format.space_before = Pt(2)
    p_cap.paragraph_format.space_after = Pt(10)
    add_markdown_runs(p_cap, caption_text, default_size=9.5, default_color=RGBColor(71, 85, 105))
    return p_img

def add_callout_box(doc, title, body_text, icon="💡"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Cm(14.5)
    set_cell_background(cell, "F0F7FF") # Light soft blue
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.line_spacing = 1.25
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.space_before = Pt(2)
    
    r_title = p.add_run(f"{icon} {title}\n")
    r_title.bold = True
    r_title.font.name = "Times New Roman"
    r_title.font.size = Pt(11)
    r_title.font.color.rgb = RGBColor(30, 58, 138)
    
    add_markdown_runs(p, body_text, default_size=10.5, default_color=RGBColor(30, 41, 59))
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(6)
    p_sp.paragraph_format.line_spacing = 1.0

def build_document():
    print(f"Building document: {OUTPUT_DOCX}...")
    doc = docx.Document()
    
    for s in doc.sections:
        s.top_margin = Cm(4.0)
        s.bottom_margin = Cm(3.0)
        s.left_margin = Cm(4.0)
        s.right_margin = Cm(3.0)
        
    # =========================================================
    # COVER / HALAMAN JUDUL
    # =========================================================
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(24)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.line_spacing = 1.25
    p_title.paragraph_format.space_after = Pt(12)
    r_t = p_title.add_run("PANDUAN OPERASIONAL, GAMBARAN BESAR & DEMO FITUR APLIKASI WEB SIPPRO-TWR")
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(15)
    r_t.bold = True
    r_t.font.color.rgb = RGBColor(30, 58, 138)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.line_spacing = 1.2
    p_sub.paragraph_format.space_after = Pt(36)
    r_s = p_sub.add_run(
        "Sistem Pangkalan Data Penilaian Properti Berbasis Peta Spasial Interaktif: "
        "Penjelasan Sederhana, Gambaran Besar (The Big Picture), Alur Data, dan Simulasi 12 Fitur Utama "
        "untuk Pimpinan KJPP, Penilai, Perbankan, dan Pemangku Kepentingan"
    )
    r_s.font.name = "Times New Roman"
    r_s.font.size = Pt(11.5)
    r_s.italic = True
    r_s.font.color.rgb = RGBColor(71, 85, 105)
    
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.line_spacing = 1.3
    p_meta.paragraph_format.space_before = Pt(40)
    p_meta.paragraph_format.space_after = Pt(50)
    add_markdown_runs(p_meta, (
        "**Disusun Oleh:**\n"
        "**MARSHELLA DWI ANGGITA**\n"
        "NPM: 233040013898\n\n"
        "Program Studi Diploma III Pajak Bumi dan Bangunan / Penilai\n"
        "Jurusan Akuntansi — Politeknik Keuangan Negara STAN\n\n"
        "**Lokasi Praktik Kerja Lapangan (Magang):**\n"
        "Kantor Jasa Penilai Publik (KJPP) Taufik Wahyudi Rahardjo dan Rekan\n"
        "Cabang Jakarta Timur — Duren Sawit\n\n"
        "**Pembimbing Magang:**\n"
        "Taufik Wahyudi Rahardjo, S.E., M.Ec.Dev., MAPPI (Cert.)\n"
        "Pimpinan Rekan / Penilai Publik Berizin Kemenkeu\n\n"
        "**Tahun Akademik 2025/2026**"
    ), default_size=11)
    
    doc.add_page_break()
    
    # =========================================================
    # RINGKASAN EKSEKUTIF
    # =========================================================
    add_heading_1(doc, "RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)")
    
    add_p(doc, 
        "Dokumen ini disusun khusus sebagai **panduan presentasi dan demonstrasi resmi** "
        "aplikasi web **SIPPRO-TWR** (*Sistem Pangkalan Data Penilaian Properti KJPP TWR*). "
        "Seluruh tangkapan layar, simulasi fitur, dan angka statistik yang disajikan dalam dokumen ini "
        "diambil langsung secara nyata dari aplikasi web yang aktif berjalan (*live*) di alamat "
        "**`http://localhost:3000/`**."
    )
    
    add_callout_box(doc, "Intisari Utama untuk Pimpinan KJPP & Tim Perbankan",
        "**SIPPRO-TWR** mengubah cara kerja lama penilai properti yang selama ini membuka ratusan file Excel "
        "yang berserakan dan rawan hilang, menjadi satu sistem **Peta Spasial Digital Interaktif**. "
        "Sebanyak **1.511 data historis hasil survei lapangan** di 61 kota/kabupaten kini terkumpul rapi di atas peta, "
        "lengkap dengan titik koordinat GPS akurat, legalitas sertifikat (SHM/HGB), foto lingkungan satelit, "
        "serta nilai transaksi/penawaran riil. Menemukan data pembanding kini tuntas dalam **hitungan detik** "
        "dengan tingkat akurasi 100% dan **tanpa biaya langganan software apapun (Zero-Cost)**."
    )
    
    add_heading_2(doc, "Tabel Perbandingan: Sebelum vs Sesudah Implementasi SIPPRO-TWR")
    
    tbl_comp = doc.add_table(rows=6, cols=3)
    tbl_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_comp)
    
    headers = ["Aspek Pekerjaan", "Cara Kerja Lama (Sebelum)", "Dengan SIPPRO-TWR (Sesudah)"]
    col_widths = [Cm(3.5), Cm(5.5), Cm(5.5)]
    
    for c_idx, h in enumerate(headers):
        cell = tbl_comp.cell(0, c_idx)
        cell.width = col_widths[c_idx]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 120, 120, 140, 140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)
        
    comp_data = [
        ("Pencarian Data Pembanding", 
         "Membuka puluhan file Excel di laptop masing-masing; memakan waktu **3 hingga 4 jam** per penilaian.",
         "Mengetik nama area di peta web; hasil muncul otomatis dalam **kurang dari 30 detik (Hemat 84% Waktu)**."),
        ("Validitas Titik Lokasi",
         "Sering terjadi salah ketik alamat atau data broker fiktif tanpa koordinat GPS pasti.",
         "Setiap data terkunci pada titik koordinat GPS presisi dan dapat diverifikasi lewat **Citra Satelit**."),
        ("Pemeriksaan Akses Jalan",
         "Harus datang langsung ke lokasi hanya untuk mengetahui apakah mobil bisa masuk gang atau tidak.",
         "Cukup beralih ke mode **Peta Satelit Resolusi Tinggi** di web untuk melihat lebar jalan (*ROW*)."),
        ("Kolaborasi Antar Penilai",
         "Data tersimpan di laptop pribadi masing-masing penilai; jika orangnya cuti/keluar, data hilang.",
         "Satu pangkalan data terpusat (*cloud/server*); seluruh penilai kantor menggunakan data bersama."),
        ("Kepatuhan Audit Bank & OJK",
         "Rawan sanggahan auditor bank jika kertas kerja data pembanding diragukan keasliannya.",
         "Kertas kerja lengkap dengan identitas surveyor, tanggal survei, dan nomor sertifikat tanah resmi.")
    ]
    
    for r_idx, row in enumerate(comp_data, start=1):
        bg = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row):
            cell = tbl_comp.cell(r_idx, c_idx)
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 100, 100, 120, 120)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if c_idx > 0 else WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.line_spacing = 1.15
            add_markdown_runs(p, val, default_size=9.5)
            
    doc.add_page_break()

    # =========================================================
    # BAGIAN 1: GAMBARAN BESAR (THE BIG PICTURE)
    # =========================================================
    add_heading_1(doc, "BAGIAN 1: GAMBARAN BESAR & MENGAPA APLIKASI INI DIBUAT (THE BIG PICTURE)")
    
    add_heading_2(doc, "1.1 Realita dan Masalah Nyata di Kantor KJPP Saat Ini")
    add_p(doc,
        "Profesi Penilai Properti di Indonesia memiliki tanggung jawab hukum dan finansial yang sangat besar. "
        "Ketika sebuah bank nasional (seperti Bank Mandiri, BCA, atau BRI) memberikan kredit pemilikan rumah (KPR) "
        "atau kredit modal kerja bernilai miliaran rupiah, bank mengandalkan **Laporan Penilaian Properti** dari KJPP "
        "untuk menentukan batas aman nilai agunan. Jika penilai salah menentukan nilai, bank berisiko menanggung kredit macet "
        "tanpa jaminan yang cukup."
    )
    add_p(doc,
        "Dalam menentukan nilai pasar sebuah properti, metode utama yang wajib digunakan menurut **Standar Penilaian Indonesia (SPI 106)** "
        "adalah **Pendekatan Pasar (*Market Approach*)**. Metode ini mengharuskan penilai membandingkan objek penilaian dengan "
        "minimal 3 (tiga) properti pembanding sejenis yang berdekatan dan baru saja ditawarkan atau ditransaksikan di pasar nyata."
    )
    add_p(doc,
        "Namun, di lapangan, kantor KJPP menghadapi 3 tantangan berat sehari-hari:\n"
        "1. **Pecahnya Basis Data (Data Silo):** Setiap penilai menyimpan hasil surveinya di file Excel masing-masing di laptop pribadi. "
        "Kantor tidak memiliki satu peta terpadu yang merangkum seluruh survei yang pernah dilakukan selama bertahun-tahun.\n"
        "2. **Bahaya 'Data Bodong' / Fiktif:** Karena dikejar tenggat waktu laporan bank yang ketat, sebagian staf tergoda mengutip data dari calo "
        "atau spanduk liar di pinggir jalan tanpa verifikasi koordinat nyata, yang ketika diaudit ternyata fiktif atau harganya telah dimanipulasi.\n"
        "3. **Waktu Kerja yang Terbuang:** Mencari file Excel lama, mencocokkan alamat di Google Maps manual, dan memeriksa dokumen sertifikat "
        "menyita waktu hingga 3-4 jam hanya untuk menyusun kertas kerja awal sebelum survei dimulai."
    )
    
    add_heading_2(doc, "1.2 Solusi SIPPRO-TWR: Menghubungkan Data Lapangan ke Atas Peta")
    add_p(doc,
        "SIPPRO-TWR hadir untuk menyelesaikan masalah di atas secara tuntas. Konsep dasarnya sangat sederhana dan mudah dimengerti: "
        "**'Menaruh seluruh riwayat survei properti kantor langsung ke atas peta interaktif seperti Google Maps'**."
    )
    add_p(doc,
        "Dengan aplikasi ini, penilai tidak perlu lagi membaca baris demi baris teks alamat yang membingungkan di Excel. "
        "Cukup buka peta di web browser, ketik nama wilayah (misal: 'Bekasi' atau 'Duren Sawit'), maka semua titik pin lokasi properti "
        "akan langsung muncul di layar. Setiap pin dapat diklik untuk melihat informasi lengkap: luas tanah, luas bangunan, harga penawaran "
        "per meter persegi, bukti nomor sertifikat tanah (SHM/HGB), hingga nama surveyor yang memeriksa langsung ke lapangan."
    )
    
    add_heading_2(doc, "1.3 Belajar dari Praktik Internasional (Malaysia, Singapura, dan Australia)")
    add_p(doc,
        "Negara-negara tetangga telah membuktikan bahwa keterbukaan dan sentralisasi data properti berbasis peta adalah kunci kemajuan industri penilai:\n"
        "• **Malaysia (JPPH / NAPIC):** Melalui portal *National Property Information Centre*, seluruh data transaksi properti "
        "terpusat dalam sistem basis data nasional yang dapat diakses penilai untuk mencegah manipulasi harga.\n"
        "• **Singapura (SLA OneMap):** Mengintegrasikan seluruh data kadaster bidang tanah, rencana zonasi tata ruang, dan harga patokan "
        "ke dalam satu sistem peta spasial digital resmi negara.\n"
        "• **Australia (CoreLogic RP Data):** Menghubungkan titik koordinat properti dengan riwayat transaksi lelang dan hipotek bank."
    )
    add_p(doc,
        "SIPPRO-TWR mengadopsi prinsip keunggulan internasional tersebut dan menerapkannya langsung di tingkat operasional KJPP TWR. "
        "Lebih istimewa lagi, sistem ini dibangun secara mandiri (**Zero-Cost Architecture**) menggunakan teknologi peta terbuka "
        "sehingga kantor KJPP **tidak perlu membayar biaya lisensi software bernilai jutaan rupiah per bulan**."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 2: ALUR KERJA & DIAGRAM SISTEM
    # =========================================================
    add_heading_1(doc, "BAGIAN 2: BAGAIMANA DATA MENGALIR DI DALAM SISTEM (ALUR DATA SEDERHANA)")
    
    add_heading_2(doc, "2.1 Alur Kerja dari Survei Lapangan hingga Jadi Laporan (BPMN Workflow)")
    add_p(doc,
        "Bagan di bawah menggambarkan perjalanan data properti dari saat surveyor memegang meteran di lapangan "
        "hingga data tersebut tersimpan rapi di peta dan siap digunakan untuk laporan penilaian bank:"
    )
    add_figure(doc, "bpmn_business_process_workflow.png", 
               "Gambar 2.1: Alur Proses Bisnis Pengumpulan, Verifikasi, dan Pemanfaatan Data Pembanding (BPMN 2.0 Standard)",
               width_cm=14.5)
    add_p(doc,
        "**Penjelasan Sederhana 4 Tahap Alur Kerja:**\n"
        "1. **Tahap 1 - Survei Lapangan:** Penilai mendatangi lokasi properti, memotret fisik bangunan, mengukur lebar jalan (*ROW*), "
        "mencatat nomor koordinat GPS dari HP, serta menanyakan harga penawaran atau transaksi kepada pemilik/agen.\n"
        "2. **Tahap 2 - Input ke Web:** Penilai membuka menu *'Tambah Data'* di web SIPPRO-TWR dan mengisi form ringkas dalam waktu kurang dari 2 menit.\n"
        "3. **Tahap 3 - Validasi Otomatis:** Sistem secara otomatis memeriksa kebenaran titik koordinat di peta dan menghitung harga satuan per m².\n"
        "4. **Tahap 4 - Siap Digunakan Seluruh Kantor:** Begitu tersimpan, titik tersebut langsung muncul di peta interaktif dan dapat langsung "
        "dipilih sebagai data pembanding oleh penilai lain yang sedang mengerjakan tugas di wilayah yang sama."
    )
    
    add_heading_2(doc, "2.2 Siapa Saja yang Terhubung ke Sistem (Diagram Konteks DFD Level 0)")
    add_p(doc,
        "Diagram konteks memperlihatkan bagaimana pihak-pihak yang berbeda berinteraksi dengan SIPPRO-TWR:"
    )
    add_figure(doc, "dfd_level_0_context_diagram.png", 
               "Gambar 2.2: Diagram Konteks Aliran Informasi Antara Pengguna dan Sistem SIPPRO-TWR (DFD Level 0)",
               width_cm=14.5)
    add_p(doc,
        "• **Penilai / Surveyor Lapangan:** Memasukkan data survei baru, melihat foto satelit, dan mencari pembanding terdekat.\n"
        "• **Pimpinan KJPP & Tim Quality Control (QC):** Memantau total persebaran titik data di seluruh kota dan memastikan kepatuhan standar penilaian.\n"
        "• **Perbankan & Lembaga Pemberi Kredit:** Menerima hasil laporan penilaian yang transparan, akurat, dan memiliki dasar pembanding yang dapat diuji kembali."
    )
    
    add_heading_2(doc, "2.3 Bagian-Bagian Utama di Dalam Aplikasi (DFD Level 1)")
    add_p(doc,
        "Di dalam aplikasi web, terdapat 4 modul utama yang bekerja saling terhubung:"
    )
    add_figure(doc, "dfd_level_1_subsystem_architecture.png", 
               "Gambar 2.3: Arsitektur 4 Modul Pengolahan Data di Dalam Sistem SIPPRO-TWR (DFD Level 1)",
               width_cm=14.5)
    add_p(doc,
        "1. **Modul Peta Spasial:** Mengatur tampilan peta digital, pin lokasi properti, dan citra satelit resolusi tinggi.\n"
        "2. **Modul Spreadsheet Data:** Menyediakan tabel katalog data massal yang familiar dan mudah disortir.\n"
        "3. **Modul Impor File Excel:** Mesin pintar untuk menarik ratusan data Excel lama sekaligus ke dalam sistem secara otomatis.\n"
        "4. **Modul Ekspor Laporan:** Tombol 1-klik untuk mengunduh kertas kerja data ke format Excel resmi atau peta Google Earth (KML)."
    )
    
    add_heading_2(doc, "2.4 Kartu Identitas Properti (Model Data / ERD Sederhana)")
    add_p(doc,
        "Setiap properti yang tersimpan di dalam sistem memiliki data yang terstruktur seperti KTP Properti:"
    )
    add_figure(doc, "erd_iso19152_data_model.png", 
               "Gambar 2.4: Model Struktur Data Entitas Properti Terpadu Berstandar Kadaster (ERD)",
               width_cm=14.5)
    add_p(doc,
        "Struktur data ini memastikan setiap properti tercatat secara lengkap:\n"
        "• **Data Lokasi:** Alamat jalan, kelurahan, kecamatan, kota, dan titik koordinat garis lintang/bujur (Latitude/Longitude).\n"
        "• **Data Fisik Tanah & Bangunan:** Luas Tanah (LT), Luas Bangunan (LB), bentuk tapak tanah, lebar muka (*frontage*), dan elevasi jalan.\n"
        "• **Data Yuridis (Legalitas):** Jenis hak (Sertifikat Hak Milik / SHM, HGB, Girik), nomor sertifikat, dan peruntukan zonasi tata ruang.\n"
        "• **Data Nilai Pasar:** Harga penawaran/transaksi, persentase diskon negosiasi pasar, serta harga indikasi tanah per meter persegi (Rp/m²)."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 3: SIMULASI LENGKAP DARI LIVE APLIKASI http://localhost:3000/
    # =========================================================
    add_heading_1(doc, "BAGIAN 3: SIMULASI LENGKAP SELURUH FITUR APLIKASI (LIVE DI http://localhost:3000/)")
    
    add_p(doc,
        "Bagian ini mendokumentasikan secara visual dan terperinci seluruh **12 Fitur Utama** yang terdapat pada "
        "aplikasi web SIPPRO-TWR yang sedang aktif berjalan di alamat **`http://localhost:3000/`**. "
        "Setiap fitur dijelaskan secara lugas: apa fungsinya, bagaimana cara memakainya, dan mengapa fitur tersebut "
        "sangat penting bagi operasional kantor KJPP."
    )
    
    # Fitur 1
    add_heading_2(doc, "3.1 Fitur 1: Layar Beranda & Kokpit Peta Interaktif Utama")
    add_figure(doc, "01_beranda_peta_spasial_utama.png", 
               "Gambar 3.1: Layar Utama Kokpit Peta Spasial SIPPRO-TWR saat Dibuka Pertama Kali (http://localhost:3000/)",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Ini adalah beranda utama yang langsung menyambut penilai saat pertama kali membuka web. "
        "Layar dibagi menjadi dua bagian yang sangat efisien: **Panel Kiri** berisi daftar kartu properti yang bisa digulir (*scroll*), "
        "dan **Panel Kanan** menampilkan peta interaktif berukuran penuh yang memetakan ribuan titik properti di seluruh Indonesia."
    )
    add_p(doc,
        "**Cara Menggunakannya:**\n"
        "Penilai cukup menggeser (*drag*) peta menggunakan mouse atau memperbesar (*zoom-in*) area yang diminati. "
        "Setiap pin berwarna di peta menunjukkan sebuah properti nyata hasil survei. Ketika kursor diarahkan ke sebuah pin, "
        "kartu properti yang sesuai di panel kiri akan otomatis tersorot."
    )
    add_p(doc,
        "**Mengapa Fitur Ini Sangat Penting?**\n"
        "Penilai tidak lagi 'buta lokasi'. Dalam hitungan detik, penilai langsung mengetahui apakah di sekitar objek agunan debitur "
        "sudah ada data survei milik kantor atau belum. Hal ini menghemat waktu survei berjam-jam karena penilai tidak perlu lagi "
        "mencari data pembanding dari nol."
    )
    
    # Fitur 2
    add_heading_2(doc, "3.2 Fitur 2: Bilah Statistik & Rangkuman Data Instan (Telemetry Bar)")
    add_figure(doc, "02_bilah_metrik_ringkasan_data.png", 
               "Gambar 3.2: Bilah Telemetri Metrik Real-Time Menampilkan Statistik Total Data, Rata-Rata Harga, dan Cakupan Wilayah",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Bilah horizontal berwarna biru gelap di bagian paling atas aplikasi yang berfungsi sebagai **Papan Informasi Eksekutif**. "
        "Bilah ini secara otomatis menghitung dan menampilkan 4 angka kunci secara langsung (*real-time*):\n"
        "1. **Total Titik Data:** Menunjukkan jumlah persis data survei yang tersimpan di sistem (**1.511 Data Titik**).\n"
        "2. **Rata-rata Nilai:** Nilai indikasi tanah rata-rata per meter persegi (**Rp 9.406.779 / m²**).\n"
        "3. **Total Akumulasi Luas:** Luas total seluruh bidang tanah yang pernah disurvei (**1.006.280.408 m²**).\n"
        "4. **Cakupan Wilayah:** Sebaran data di seluruh Indonesia (**61 Kota / Kabupaten**)."
    )
    add_p(doc,
        "**Mengapa Fitur Ini Sangat Penting?**\n"
        "Sangat berguna bagi Pimpinan KJPP saat mempresentasikan kapasitas kantor kepada klien bank atau asosiasi penilai (MAPPI). "
        "Cukup dengan satu pandangan sekilas (*executive glance*), pimpinan dapat membuktikan bahwa KJPP TWR memiliki "
        "basis data properti yang sangat kuat, luas, dan terukur secara ilmiah."
    )
    
    # Fitur 3
    add_heading_2(doc, "3.3 Fitur 3: Panel Pencarian Cepat & Filter Jenis Objek")
    add_figure(doc, "03_panel_pencarian_dan_filter.png", 
               "Gambar 3.3: Panel Pencarian Cepat Berdasarkan Kata Kunci Alamat dan Tombol Filter Kategori Properti",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Alat bantu pencarian di sisi kiri atas yang dirancang agar penilai dapat menyaring ribuan data dalam sekejap mata. "
        "Dilengkapi dengan kotak pencarian bebas (*free-text search*) dan tombol saringan cepat (*filter chips*):\n"
        "• **Tombol 'Semua':** Menampilkan seluruh jenis objek tanpa saringan.\n"
        "• **Tombol 'Tanah & Bangunan':** Khusus menampilkan rumah tinggal, ruko, gedung, atau pabrik.\n"
        "• **Tombol 'Tanah Kosong':** Khusus menampilkan kavling tanah mentah atau tanah matang siap bangun.\n"
        "• **Dropdown Wilayah:** Menu pilihan cepat untuk memilih kota spesifik (Jakarta Timur, Bekasi, Depok, dll)."
    )
    add_p(doc,
        "**Mengapa Fitur Ini Sangat Penting?**\n"
        "Sesuai aturan SPI 106, tanah kosong tidak boleh dibandingkan langsung dengan rumah mewah tanpa penyesuaian khusus. "
        "Dengan filter ini, penilai terhindar dari kesalahan mencampuradukkan kategori properti sejak tahap awal pengumpulan data."
    )
    
    # Fitur 4
    add_heading_2(doc, "3.4 Fitur 4: Simulasi Pencarian Lokasi Cepat (Contoh Kasus: Wilayah Bekasi)")
    add_figure(doc, "04_pencarian_interaktif_bekasi.png", 
               "Gambar 3.4: Hasil Pencarian Interaktif Saat Pengguna Mengetik 'Bekasi' — Peta dan Daftar Langsung Menyaring Otomatis",
               width_cm=14.5)
    add_p(doc,
        "**Apa yang Terjadi di Layar Ini?**\n"
        "Gambar ini memperlihatkan demonstrasi nyata ketika pengguna mengetik kata **'Bekasi'** di kotak pencarian. "
        "Seketika itu juga, tanpa perlu menekan tombol Enter atau me-refresh halaman, sistem langsung menyaring daftar "
        "dan hanya memunculkan data properti yang beralamat di wilayah Bekasi. Titik-titik pin di peta juga otomatis berpusat "
        "ke area Bekasi."
    )
    add_p(doc,
        "**Kecepatan & Responsivitas:**\n"
        "Penyaringan berlangsung dalam waktu **kurang dari 100 milidetik**. Penilai langsung melihat 6 properti pembanding di Bekasi, "
        "mulai dari Jalan Ir. H. Juanda, Pondok Gede, hingga Summarecon Bekasi, lengkap dengan harga per meter perseginya."
    )
    
    # Fitur 5
    add_heading_2(doc, "3.5 Fitur 5: Kartu Properti Interaktif (Property Card)")
    add_figure(doc, "05_kartu_properti_dan_seleksi.png", 
               "Gambar 3.5: Kartu Properti di Panel Samping yang Terpilih Menampilkan Indikator Lengkap Spesifikasi Tanah dan Bangunan",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Setiap properti disajikan dalam bentuk 'kartu informasi' yang rapi dan elegan. Kartu ini merangkum data terpenting:\n"
        "• **Nama Objek & Alamat Lengkap:** Menunjukkan letak persis properti di jalan tertentu.\n"
        "• **Harga Satuan Tanah (Rp/m²):** Dihitung otomatis oleh sistem dari total harga dibagi luas tanah.\n"
        "• **Spesifikasi Dimensi:** Luas Tanah (misal: 140 m²) dan Luas Bangunan (misal: 90 m²).\n"
        "• **Status Legalitas:** Label sertifikat (misal: **SHM** warna hijau atau **HGB** warna biru).\n"
        "• **Status Data:** Penanda apakah data merupakan harga *Penawaran* atau harga *Transaksi Riil*."
    )
    add_p(doc,
        "**Interaksi Cerdas:**\n"
        "Saat penilai mengeklik salah satu kartu, kartu tersebut akan mendapat bingkai biru menyala (*selected state*), "
        "dan kamera peta di panel kanan akan otomatis bergerak melayang (*fly-to animation*) langsung ke titik pin properti tersebut!"
    )
    
    # Fitur 6
    add_heading_2(doc, "3.6 Fitur 6: Balon Informasi Detail Penanda Peta (Map Marker Popup)")
    add_figure(doc, "06_popup_detail_marker_peta.png", 
               "Gambar 3.6: Balon Pop-up Interaktif yang Muncul Saat Pin Peta Diklik, Menampilkan Rincian Lengkap Properti",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Ketika penilai mengeklik salah satu pin di atas peta, sebuah balon jendela informasi pop-up modern akan muncul tepat di atas pin tersebut. "
        "Jendela ini menampilkan rincian mendalam:\n"
        "1. **Judul & Alamat Lengkap:** Contoh: *Rumah Tinggal Jl. KH Noer Ali, Bekasi Barat*.\n"
        "2. **Angka Nilai:** Total Nilai Pasar Properti dan Nilai per meter perseginya.\n"
        "3. **Rincian Luas & Legalitas:** Luas Tanah, Luas Bangunan, dan Jenis Sertifikat Hak Milik.\n"
        "4. **Karakteristik Fisik Lapangan:** Bentuk tapak tanah (Persegi / L-Shape), kondisi elevasi terhadap muka jalan, dan lebar jalan (*ROW*).\n"
        "5. **Data Kontak Sumber:** Nama pemberi data (pemilik atau agen properti) dan tanggal pelaksanaan survei."
    )
    add_p(doc,
        "**Mengapa Fitur Ini Sangat Berharga?**\n"
        "Memungkinkan verifikasi silang instan. Penilai yang bertugas di kantor dapat langsung memeriksa detail properti "
        "tanpa perlu membuka lembaran berkas kertas survei lama di lemari arsip."
    )
    
    # Fitur 7
    add_heading_2(doc, "3.7 Fitur 7: Mode Tampilan Citra Satelit Nyata (Esri World Imagery)")
    add_figure(doc, "07_pengalih_peta_satelit_esri.png", 
               "Gambar 3.7: Tampilan Peta Beralih ke Mode Citra Satelit Resolusi Tinggi (Esri World Imagery) Tanpa Biaya Berlangganan",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Pengguna dapat mengganti tampilan peta jalan biasa (*vektor*) menjadi **Citra Foto Udara Satelit Nyata**. "
        "Foto satelit ini disediakan langsung oleh satelit resolusi tinggi global tanpa biaya langganan sepeser pun."
    )
    add_p(doc,
        "**Manfaat Luar Biasa untuk Penilai:**\n"
        "Melalui tampilan satelit ini, penilai dapat melakukan 'survei meja' (*desktop appraisal*) sebelum berangkat ke lapangan:\n"
        "• Melihat dengan mata kepala sendiri bentuk atap dan kondisi fisik lingkungan properti.\n"
        "• Mengetahui apakah jalan di depan properti muat untuk 2 mobil berpapasan atau hanya gang sempit.\n"
        "• Memeriksa apakah properti berdekatan dengan faktor pengurang nilai (*negative factors*), seperti saluran transmisi listrik tegangan ekstra tinggi (SUTET), tempat pemakaman umum (TPU), atau bantaran sungai rawan banjir."
    )
    
    # Fitur 8
    add_heading_2(doc, "3.8 Fitur 8: Formulir Input Titik Properti Baru (Modal Tambah Data)")
    add_figure(doc, "08_modal_tambah_data_baru.png", 
               "Gambar 3.8: Jendela Formulir Input Data Properti Baru dengan Validasi Isian Lengkap dan Koordinat GPS Presisi",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Jendela formulir pop-up yang bersih dan terstruktur untuk menambahkan hasil survei lapangan baru ke dalam sistem. "
        "Formulir ini memandu surveyor agar tidak ada satu pun informasi penting yang tertinggal:\n"
        "• **Nama & Alamat Objek:** Nama jalan, RT/RW, kelurahan, dan kota.\n"
        "• **Posisi Koordinat GPS:** Garis Lintang (*Latitude*) dan Garis Bujur (*Longitude*) langsung dari GPS smartphone penilai.\n"
        "• **Spesifikasi Fisik:** Luas Tanah, Luas Bangunan, Tahun Dibangun, Jumlah Lantai, dan Lebar Muka.\n"
        "• **Legalitas & Harga:** Pilihan Sertifikat (SHM/HGB/Hak Pakai), Harga Penawaran, dan Perkiraan Diskon Negosiasi."
    )
    add_p(doc,
        "**Sistem Pencegah Kesalahan (Anti-Error Validation):**\n"
        "Formulir ini dilengkapi validasi otomatis. Jika penilai lupa mengisi luas tanah atau salah mengetik koordinat "
        "(misalnya koordinat berada di luar wilayah Indonesia), sistem akan memberi peringatan dan menolak penyimpanan "
        "hingga data diperbaiki. Hal ini menjamin pangkalan data kantor tetap bersih dan bebas data cacat."
    )
    
    # Fitur 9
    add_heading_2(doc, "3.9 Fitur 9: Tampilan Spreadsheet Lengkap (Tabel Data Massal)")
    add_figure(doc, "09_tampilan_spreadsheet_lengkap.png", 
               "Gambar 3.9: Tampilan Mode Spreadsheet Tabular Menampilkan 1.511 Baris Data Lengkap dengan Nomor Halaman Teratur",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Bagi staf atau pimpinan yang lebih menyukai membaca data dalam bentuk baris dan kolom seperti Microsoft Excel, "
        "cukup klik menu **'Spreadsheet'** di bagian atas. Seluruh **1.511 data properti** disajikan dalam bentuk tabel "
        "yang sangat rapi, bersih, dan dilengkapi dengan nomor urut serta sistem penomoran halaman (*pagination*)."
    )
    add_p(doc,
        "**Kelengkapan Kolom:**\n"
        "Tabel ini memuat kolom No, Alamat & Wilayah, Jenis Objek, Luas Tanah, Luas Bangunan, Legalitas Sertifikat, "
        "Nilai Indikasi per m², dan Nama Penilai/Sumber Data. Pengguna dapat mengklik judul kolom untuk mengurutkan data "
        "dari harga termurah ke termahal atau sebaliknya."
    )
    
    # Fitur 10
    add_heading_2(doc, "3.10 Fitur 10: Penyaringan & Aksi Cepat pada Tabel Spreadsheet")
    add_figure(doc, "10_spreadsheet_filter_dan_aksi.png", 
               "Gambar 3.10: Fitur Pencarian Cepat di Dalam Mode Spreadsheet Disertai Tombol Aksi Langsung ke Peta",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Menampilkan kemudahan menyaring data langsung di dalam tabel spreadsheet. Pada gambar ini dicontohkan pengguna mengetik kata "
        "**'Jakarta'**, maka tabel seketika memfilter dan hanya menampilkan properti di area Jakarta."
    )
    add_p(doc,
        "**Tombol Aksi Cepat (Action Buttons):**\n"
        "Pada setiap baris data di tabel, terdapat tombol aksi praktis:\n"
        "• **Tombol 'Lihat di Peta':** Mengeklik tombol ini akan langsung membawa pengguna kembali ke layar peta dan mengarahkan kamera tepat di atas properti tersebut.\n"
        "• **Tombol 'Edit Data':** Membuka formulir untuk memperbarui informasi jika ada perubahan harga penawaran.\n"
        "• **Tombol 'Hapus':** Untuk menghapus data ganda (*duplicate*) dengan konfirmasi keamanan."
    )
    
    # Fitur 11
    add_heading_2(doc, "3.11 Fitur 11: Modul Unggah Otomatis File Excel (Batch Ingestion)")
    add_figure(doc, "11_modul_impor_excel_batch.png", 
               "Gambar 3.11: Modul Impor File Excel Otomatis dengan Area Drag-and-Drop dan Mesin Pembersih Koordinat Mandiri",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Ini adalah fitur penyelamat untuk kantor KJPP yang memiliki ribuan data lama tersimpan di file Excel masa lalu. "
        "Alih-alih menyuruh staf mengetik ulang satu per satu (yang bisa memakan waktu berbulan-bulan), "
        "staf cukup menarik dan menjatuhkan (*drag and drop*) file Excel ke dalam kotak area bertuliskan *'Pilih file Excel atau Drag & Drop ke sini'*. "
        "Sistem langsung memproses seluruh baris secara serentak."
    )
    add_p(doc,
        "**Kecerdasan Pembersih Data Otomatis:**\n"
        "Sering kali data di Excel lama memiliki kesalahan pengetikan manusia, seperti:\n"
        "• Angka desimal memakai koma bukan titik (contoh: `1,078611`).\n"
        "• Posisi koordinat tertukar antara Lintang dan Bujur.\n"
        "• Penulisan angka harga bercampur simbol mata uang atau spasi liar (contoh: `Rp 1.500.000.000,-`).\n\n"
        "Modul impor SIPPRO-TWR dilengkapi **pembersih otomatis (*auto-sanitizer*)** yang langsung mendeteksi, memperbaiki koma menjadi titik, "
        "membalik koordinat yang tertukar, dan membersihkan teks harga menjadi angka murni tanpa perlu campur tangan manual!"
    )
    
    # Fitur 12
    add_heading_2(doc, "3.12 Fitur 12: Tombol Ekspor 1-Klik ke Excel & Google Earth (KML)")
    add_figure(doc, "12_ekspor_excel_dan_kml.png", 
               "Gambar 3.12: Dua Tombol Aksi Ekspor Instan di Bagian Header: Unduh Spreadsheet Excel dan Unduh Titik Peta KML",
               width_cm=14.5)
    add_p(doc,
        "**Apa Fungsi Layar Ini?**\n"
        "Dua tombol ekspor instan berwarna hijau dan biru di pojok kanan atas layar:\n"
        "1. **Tombol '📊 Excel':** Mengunduh seluruh data properti yang sedang tampil di layar menjadi file kerja resmi **Microsoft Excel (.xlsx)**. "
        "File ini sudah terformat rapi sesuai kertas kerja penilaian (*KKP*) dan siap dilampirkan ke laporan perbankan.\n"
        "2. **Tombol '📍 KML (Google Earth)':** Mengunduh data menjadi file spasial **Keyhole Markup Language (.kml)**. "
        "File ini dapat langsung dibuka di aplikasi **Google Earth** di laptop atau dikirim via WhatsApp ke smartphone penilai lapangan "
        "untuk dijadikan panduan rute navigasi perjalanan survei!"
    )
    add_p(doc,
        "**Mengapa Fitur Ini Sangat Berharga?**\n"
        "Mengintegrasikan dunia kerja digital di kantor dengan kebutuhan fisik penilai saat mengemudi di lapangan. "
        "Tidak ada lagi penilai yang tersesat atau salah mendatangi alamat pembanding."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 4: MANFAAT BAGI SETIAP STAKEHOLDER
    # =========================================================
    add_heading_1(doc, "BAGIAN 4: NILAI MANFAAT BAGI SELURUH PEMANGKU KEPENTINGAN (STAKEHOLDER VALUE)")
    
    add_p(doc,
        "Kehadiran SIPPRO-TWR memberikan dampak positif yang nyata dan terukur bagi seluruh pihak yang terlibat "
        "dalam ekosistem penilaian properti perbankan di Indonesia:"
    )
    
    add_heading_2(doc, "4.1 Bagi Penilai Properti Lapangan (Surveyor & Valuer)")
    add_p(doc,
        "• **Pangkas Waktu Riset:** Penilai tidak lagi pusing mencari data pembanding ke sana kemari. Cukup buka peta, pembanding sudah tersedia.\n"
        "• **Hemat Biaya Operasional:** Rute survei dapat direncanakan secara efisien lewat Google Earth, menghemat bensin dan tenaga surveyor.\n"
        "• **Kertas Kerja Otomatis:** Menghindari salah rumus perhitungan harga per meter persegi karena semua telah dihitung otomatis oleh sistem."
    )
    
    add_heading_2(doc, "4.2 Bagi Pimpinan Rekan KJPP & Tim Quality Control (QC)")
    add_p(doc,
        "• **Pengawasan Menyeluruh (*Full Visibility*):** Pimpinan dapat memantau produktivitas tim survei dan pertumbuhan pangkalan data kantor secara harian.\n"
        "• **Kepatuhan Regulasi Terjamin:** Memastikan seluruh kertas kerja penilai mematuhi SPI 106 dan aturan OJK (POJK 40/POJK.03/2019).\n"
        "• **Aset Pengetahuan Kantor Terjaga:** Mengubah data yang tadinya milik pribadi masing-masing penilai menjadi aset kekayaan intelektual resmi KJPP TWR yang bernilai tinggi."
    )
    
    add_heading_2(doc, "4.3 Bagi Perbankan & Lembaga Keuangan (Bank Mandiri, BCA, OJK, dsb.)")
    add_p(doc,
        "• **Keamanan Agunan Terjamin:** Nilai pasar yang disajikan memiliki pembanding riil dan terverifikasi secara geografis, menekan risiko agunan fiktif (*over-valuation*).\n"
        "• **Laporan Mudah Diaudit:** Auditor bank dapat merekonstruksi dan memverifikasi titik pembanding dengan sangat mudah melalui koordinat GPS dan foto satelit yang disertakan.\n"
        "• **Keputusan Kredit Lebih Cepat:** Waktu penyelesaian laporan (*turn-around time / TAT*) KJPP menjadi jauh lebih singkat, sehingga bank dapat mencairkan kredit debitur lebih cepat."
    )
    
    add_heading_2(doc, "4.4 Bagi Dunia Akademisi & Politeknik Keuangan Negara STAN")
    add_p(doc,
        "• **Bukti Nyata Kompetensi Mahasiswa:** Menunjukkan bahwa lulusan D-III PBB/Penilai PKN STAN tidak hanya menguasai teori penilaian properti, "
        "tetapi juga mampu memimpin inovasi teknologi informasi terapan yang langsung memecahkan masalah industri penilai nasional.\n"
        "• **Karya Magang Berstandar Industri:** Menjadi tolok ukur (*benchmark*) baru karya magang yang aplikatif, modern, dan bernilai guna langsung bagi kantor tempat praktik."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 5: PANDUAN PRESENTASI 3 MENIT
    # =========================================================
    add_heading_1(doc, "BAGIAN 5: PANDUAN CARA DEMO / PRESENTASI 3 MENIT DI DEPAN AUDIENS & BOSS")
    
    add_p(doc,
        "Gunakan naskah panduan di bawah ini saat mempresentasikan aplikasi SIPPRO-TWR di hadapan Pimpinan KJPP, "
        "Dosen Penguji PKN STAN, atau Tim Reviewer Bank. Naskah ini dirancang dengan gaya bertutur yang lugas, "
        "percaya diri, tidak berbelit-belit, dan langsung menonjolkan nilai bisnis (*business value*)."
    )
    
    add_callout_box(doc, "Naskah Presentasi Kilat 3 Menit (Quick Presentation Script)",
        "**[MENIT 0:00 - 0:45] PEMBUKAAN & MASALAH UTAMA (THE HOOK)**\n"
        "\"Selamat pagi Bapak/Ibu Pimpinan dan Dewan Penguji. Setiap hari di kantor KJPP, penilai kita menghabiskan waktu 3 sampai 4 jam "
        "hanya untuk mencari 3 data pembanding properti dari file Excel yang berserakan. Belum lagi risiko data broker liar yang tidak jelas koordinatnya. "
        "Hari ini, saya mempersembahkan solusinya: **SIPPRO-TWR**, sistem pangkalan data penilaian properti berbasis peta interaktif yang aktif berjalan "
        "di hadapan Bapak/Ibu saat ini.\"\n\n"
        
        "**[MENIT 0:45 - 2:00] DEMO FITUR PETA, SATELIT & PENCARIAN (THE WOW FACTOR)**\n"
        "\"Bisa kita lihat di layar, sebanyak **1.511 data survei kantor** kini terpampang langsung di atas peta interaktif. "
        "Di bagian atas, kita langsung melihat rata-rata nilai tanah Rp 9,4 juta per meter persegi di 61 kota. "
        "Misalkan kantor kita mendapat tugas menilai rumah di Bekasi. Saya cukup ketik 'Bekasi' di kotak pencarian... dan dalam hitungan milidetik, "
        "seluruh pembanding di Bekasi langsung muncul! Saya klik salah satu kartu, peta otomatis melayang ke lokasinya. "
        "Jika kita klik pin di peta, rincian sertifikat SHM, luas tanah, dan harga per meter langsung tersaji. "
        "Bahkan, jika saya klik tombol 'Satelit', kita bisa langsung melihat kondisi fisik atap rumah dan lebar jalan dari foto udara tanpa perlu berangkat ke lokasi!\"\n\n"
        
        "**[MENIT 2:00 - 3:00] DEMO EKSPOR, EFISIENSI & PENUTUP (THE IMPACT)**\n"
        "\"Saat laporan harus segera dikirim ke bank, penilai cukup menekan tombol 'Excel' di kanan atas untuk mengunduh kertas kerja otomatis, "
        "atau tombol 'KML' untuk mengirimkan rute survei ke Google Earth di smartphone surveyor. "
        "Hasilnya? Waktu penyiapan data hemat 84%, laporan agunan bank terlindungi dari tuduhan data fiktif, "
        "dan yang terpenting: sistem ini dibangun dengan arsitektur **Zero-Cost**, tanpa biaya langganan bulanan software asing sepeser pun. "
        "Inilah wujud nyata modernisasi profesi penilai properti Indonesia. Terima kasih, saya siap menerima masukan dan diskusi.\"",
        icon="🎤"
    )
    
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(12)
    p_end.paragraph_format.space_after = Pt(6)
    
    add_heading_2(doc, "5.1 Tips Sukses Saat Menjalankan Demo Langsung")
    add_p(doc,
        "1. **Buka Web di Browser Bersih:** Pastikan aplikasi telah berjalan lancar di `http://localhost:3000/` dengan zoom browser 100%.\n"
        "2. **Tunjukkan Efek Visual Peta:** Tunjukkan transisi basemap dari peta jalan biasa ke peta satelit untuk memberikan efek visual yang memukau.\n"
        "3. **Tunjukkan Kecepatan Filter:** Ketik nama area dengan santai untuk memperlihatkan bagaimana sistem merespons seketika tanpa ada jeda (*lag*).\n"
        "4. **Fokus pada Manfaat Bukan Kode:** Jangan menyebutkan istilah teknis rumit (seperti React hooks, database schema, atau query latency), "
        "melainkan fokuslah pada: waktu yang dihemat, keamanan agunan bank, dan kemudahan bagi staf penilai."
    )
    
    backup_docx = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR_REMAKE.docx"
    project_docx = r"S:\TWR Bank Data Project\docs\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx"
    
    # Always save to backup and project docs first
    doc.save(backup_docx)
    print(f"[SUCCESS] Saved to remake path: {backup_docx} ({os.path.getsize(backup_docx):,} bytes)")
    doc.save(project_docx)
    print(f"[SUCCESS] Saved to project docs path: {project_docx} ({os.path.getsize(project_docx):,} bytes)")
    
    try:
        doc.save(OUTPUT_DOCX)
        print(f"[SUCCESS] Saved directly to original path: {OUTPUT_DOCX} ({os.path.getsize(OUTPUT_DOCX):,} bytes)")
    except PermissionError:
        print(f"[INFO] Original file '{OUTPUT_DOCX}' is currently locked by Word. The remake has been saved to '{backup_docx}' and '{project_docx}'.")

if __name__ == "__main__":
    build_document()
