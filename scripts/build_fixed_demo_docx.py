# -*- coding: utf-8 -*-
"""
Script: build_fixed_demo_docx.py
Purpose: Generate the perfected, stakeholder-ready Word documentation (.docx)
         focused EXCLUSIVELY on the live website at http://localhost:3000/
         with High-Resolution Satellite Imagery (Citra Satelit GIS),
         ZERO formatting errors (no stray ** symbols), natural/comfortable language,
         and complete removal of non-live features (executive bank summary, matriks penyesuaian, mesin likuidasi).
"""

import os
import re
import shutil
import docx
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

SCREENSHOTS_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
OUTPUT_PRIMARY = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx"
OUTPUT_FIXED   = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR_FIXED.docx"
OUTPUT_PROJECT = r"S:\TWR Bank Data Project\docs\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR.docx"

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

def add_runs_safely(p, text, default_font="Times New Roman", default_size=12, default_color=None):
    """
    Robust parser for bold (**text**) and italic (*text*).
    Guarantees that NO '**' or stray markdown asterisks ever leak into the document.
    """
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**') and len(part) >= 4:
            inner = part[2:-2]
            r = p.add_run(inner)
            r.bold = True
        elif part.startswith('*') and part.endswith('*') and len(part) >= 2:
            inner = part[1:-1]
            r = p.add_run(inner)
            r.italic = True
        else:
            # Strip any accidental leftover asterisks
            clean = part.replace('**', '')
            r = p.add_run(clean)
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
    add_runs_safely(p, text, default_font, default_size)
    set_paragraph_properties(p, align, line_spacing, space_after, space_before)
    return p

def add_bullet_item(doc, bold_prefix, text_body):
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.line_spacing = 1.35
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.space_before = Pt(0)
    
    r1 = p.add_run(bold_prefix + " ")
    r1.bold = True
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(12)
    
    r2 = p.add_run(text_body)
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(12)
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

def add_figure(doc, img_filename, caption_text, width_cm=14.5):
    img_path = os.path.join(SCREENSHOTS_DIR, img_filename)
    if not os.path.exists(img_path):
        print(f"[WARN] Image file not found: {img_path}")
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
    add_runs_safely(p_cap, caption_text, default_size=9.5, default_color=RGBColor(71, 85, 105))
    return p_img

def add_callout_box(doc, title, body_text, icon="💡"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Cm(14.5)
    set_cell_background(cell, "F0F7FF")
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
    
    add_runs_safely(p, body_text, default_size=10.5, default_color=RGBColor(30, 41, 59))
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(6)
    p_sp.paragraph_format.line_spacing = 1.0

def build_perfect_document():
    print(f"Building perfected documentation docx...")
    doc = docx.Document()
    
    # Page setup A4: Margins 4cm Top, 4cm Left, 3cm Bottom, 3cm Right
    for s in doc.sections:
        s.top_margin = Cm(4.0)
        s.bottom_margin = Cm(3.0)
        s.left_margin = Cm(4.0)
        s.right_margin = Cm(3.0)
        
    # =========================================================
    # HALAMAN JUDUL (COVER)
    # =========================================================
    p_pre = doc.add_paragraph()
    p_pre.paragraph_format.space_before = Pt(24)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.line_spacing = 1.25
    p_title.paragraph_format.space_after = Pt(12)
    r_t = p_title.add_run("PANDUAN OPERASIONAL & DEMO FITUR APLIKASI WEB SIPPRO-TWR")
    r_t.font.name = "Times New Roman"
    r_t.font.size = Pt(15)
    r_t.bold = True
    r_t.font.color.rgb = RGBColor(30, 58, 138)
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.line_spacing = 1.25
    p_sub.paragraph_format.space_after = Pt(36)
    r_s = p_sub.add_run(
        "Sistem Pangkalan Data Penilaian Properti Berbasis Peta Citra Satelit Interaktif (GIS):\n"
        "Penjelasan Gambaran Besar (The Big Picture), Alur Data, dan Simulasi Seluruh Fitur Utama "
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
    
    # Clean author runs without stray markdown
    r_m1 = p_meta.add_run("Disusun Oleh:\n")
    r_m1.font.name = "Times New Roman"
    r_m1.font.size = Pt(11)
    
    r_m2 = p_meta.add_run("MARSHELLA DWI ANGGITA\n")
    r_m2.bold = True
    r_m2.font.name = "Times New Roman"
    r_m2.font.size = Pt(11)
    
    r_m3 = p_meta.add_run("NPM: 233040013898\n\n")
    r_m3.font.name = "Times New Roman"
    r_m3.font.size = Pt(11)
    
    r_m4 = p_meta.add_run("Program Studi Diploma III Pajak Bumi dan Bangunan / Penilai\nJurusan Akuntansi — Politeknik Keuangan Negara STAN\n\n")
    r_m4.font.name = "Times New Roman"
    r_m4.font.size = Pt(11)
    
    r_m5 = p_meta.add_run("Lokasi Praktik Kerja Lapangan (Magang):\n")
    r_m5.font.name = "Times New Roman"
    r_m5.font.size = Pt(11)
    
    r_m6 = p_meta.add_run("Kantor Jasa Penilai Publik (KJPP) Taufik Wahyudi Rahardjo dan Rekan\nCabang Jakarta Timur — Duren Sawit\n\n")
    r_m6.bold = True
    r_m6.font.name = "Times New Roman"
    r_m6.font.size = Pt(11)
    
    r_m7 = p_meta.add_run("Pembimbing Magang:\n")
    r_m7.font.name = "Times New Roman"
    r_m7.font.size = Pt(11)
    
    r_m8 = p_meta.add_run("Taufik Wahyudi Rahardjo, S.E., M.Ec.Dev., MAPPI (Cert.)\n")
    r_m8.bold = True
    r_m8.font.name = "Times New Roman"
    r_m8.font.size = Pt(11)
    
    r_m9 = p_meta.add_run("Pimpinan Rekan / Penilai Publik Berizin Kemenkeu\n\nTahun Akademik 2025/2026")
    r_m9.font.name = "Times New Roman"
    r_m9.font.size = Pt(11)
    
    doc.add_page_break()
    
    # =========================================================
    # RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
    # =========================================================
    add_heading_1(doc, "RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)")
    
    add_p(doc, 
        "Dokumen ini disusun sebagai panduan resmi demonstrasi dan penjelasan operasional aplikasi web "
        "SIPPRO-TWR (Sistem Pangkalan Data Penilaian Properti KJPP TWR). Seluruh tangkapan layar, alur kerja, "
        "dan simulasi fitur yang disajikan di dalam panduan ini diambil langsung dari aplikasi web yang aktif berjalan "
        "(live) pada alamat http://localhost:3000/."
    )
    
    add_callout_box(doc, "Intisari Solusi untuk Manajemen KJPP dan Perbankan",
        "SIPPRO-TWR memodernisasi cara kerja penilai properti dari yang sebelumnya membuka puluhan file Excel "
        "yang terpisah di laptop masing-masing, menjadi satu sistem Peta Citra Satelit Interaktif (GIS). "
        "Sebanyak 1.511 data historis hasil survei lapangan yang tersebar di 61 kota/kabupaten kini terangkum rapi "
        "di atas citra satelit resolusi tinggi. Penilai dapat melihat fisik atap rumah, lebar jalan, sertifikat (SHM/HGB), "
        "dan harga pasar riil secara instan. Waktu penyiapan data pembanding dipangkas hingga 84%, tanpa biaya langganan "
        "software apapun (Zero-Cost)."
    )
    
    add_heading_2(doc, "Tabel Perbandingan: Cara Kerja Lama vs Solusi SIPPRO-TWR")
    
    tbl_comp = doc.add_table(rows=6, cols=3)
    tbl_comp.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_comp)
    
    headers = ["Aspek Pekerjaan", "Cara Kerja Lama (Sebelumnya)", "Solusi SIPPRO-TWR (Saat Ini)"]
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
         "Mencari file Excel lama di laptop penilai satu per satu; membutuhkan waktu 3 hingga 4 jam per penugasan.",
         "Mengetik nama area di search bar peta; data langsung muncul dalam hitungan detik (Hemat waktu 84%)."),
        ("Akurasi Posisi & Lingkungan",
         "Hanya mengandalkan teks alamat; sering salah gang atau tertipu spanduk agen yang tidak jelas.",
         "Titik terkunci pada koordinat GPS presisi di atas Citra Satelit Resolusi Tinggi (Ground Truth)."),
        ("Pengecekan Akses Jalan",
         "Harus datang langsung ke lokasi hanya untuk mengetahui apakah jalan depan muat mobil atau gang sempit.",
         "Cukup memeriksa lebar jalan (ROW) dan kondisi lingkungan sekitar langsung dari foto satelit di web."),
        ("Penyimpanan Data Kantor",
         "Data tersebar di flashdisk dan laptop pribadi; jika staf keluar kantor, data ikut hilang.",
         "Seluruh 1.511 data tersimpan terpusat di server kantor dan dapat diakses bersama secara aman."),
        ("Kesiapan Audit Bank & OJK",
         "Sulit membuktikan keaslian pembanding jika auditor bank meminta verifikasi ulang.",
         "Data lengkap dengan tanggal survei, nama penilai, bukti sertifikat, dan koordinat peta yang valid.")
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
            add_runs_safely(p, val, default_size=9.5)
            
    doc.add_page_break()

    # =========================================================
    # BAGIAN 1: GAMBARAN BESAR (THE BIG PICTURE)
    # =========================================================
    add_heading_1(doc, "BAGIAN 1: GAMBARAN BESAR & LATAR BELAKANG SISTEM (THE BIG PICTURE)")
    
    add_heading_2(doc, "1.1 Mengapa Sistem Ini Dibuat? (Tantangan Nyata di Kantor KJPP)")
    add_p(doc,
        "Profesi Penilai Properti di Indonesia memegang peranan yang sangat penting dalam menjaga stabilitas sistem perbankan. "
        "Ketika bank menyalurkan Kredit Pemilikan Rumah (KPR) atau kredit usaha bernilai miliaran rupiah, bank membutuhkan "
        "Laporan Penilaian Properti independen dari KJPP untuk memastikan nilai jaminan (agunan) benar-benar aman. "
        "Berdasarkan Standar Penilaian Indonesia (SPI 106), penilai wajib menggunakan Pendekatan Pasar (Market Approach), "
        "yaitu membandingkan objek penilaian dengan minimal 3 properti pembanding sejenis yang berdekatan."
    )
    add_p(doc,
        "Namun, operasional kantor KJPP selama ini menghadapi kendala nyata:\n"
        "1. Data survei tersimpan secara terpisah-pisah di berbagai folder Excel di laptop masing-masing penilai.\n"
        "2. Sulit dan memakan waktu lama (3 sampai 4 jam) untuk mencari kembali data pembanding lama di area yang sama.\n"
        "3. Tingginya risiko data penawaran fiktif dari calo jalanan yang sering me-markup harga properti.\n"
        "4. Penilai sering harus melakukan survei fisik ke lapangan hanya untuk mengecek apakah mobil bisa lewat di depan properti."
    )
    
    add_heading_2(doc, "1.2 Solusi Cerdas: Sentralisasi Data di Atas Peta Citra Satelit (GIS)")
    add_p(doc,
        "SIPPRO-TWR hadir untuk menjawab persoalan tersebut secara menyeluruh. Prinsip utamanya adalah menyatukan seluruh "
        "riwayat survei properti kantor ke dalam satu Peta Spasial Digital berbasis Citra Satelit Resolusi Tinggi (GIS). "
        "Penilai tidak perlu lagi membaca baris teks alamat yang membingungkan. Cukup membuka aplikasi web di laptop atau komputer kantor, "
        "mengetik nama wilayah, maka seluruh pin properti akan langsung tampil di atas citra satelit nyata."
    )
    add_p(doc,
        "Penilai dapat langsung melihat bentuk atap rumah, lebar gang, pagar properti, dan lingkungan sekitarnya. "
        "Setiap pin data dapat diklik untuk memeriksa luas tanah, luas bangunan, sertifikat kepemilikan (SHM/HGB), harga pasar per meter persegi, "
        "hingga nama surveyor yang memeriksa langsung ke lapangan. Seluruh sistem ini dibangun menggunakan teknologi open-source bebas royalti, "
        "sehingga kantor KJPP TWR tidak perlu membayar biaya langganan bulanan software asing."
    )
    
    add_heading_2(doc, "1.3 Inspirasi Praktik Internasional (Benchmark Malaysia & Singapura)")
    add_p(doc,
        "Pemanfaatan peta digital untuk pangkalan data properti telah terbukti berhasil di negara-negara tetangga:\n"
        "• Malaysia (JPPH / NAPIC): Mengoperasikan National Property Information Centre yang memusatkan seluruh data transaksi properti "
        "secara transparan untuk mencegah manipulasi harga.\n"
        "• Singapura (SLA OneMap): Mengintegrasikan data bidang tanah, tata ruang kota, dan harga properti ke dalam satu portal peta digital resmi."
    )
    add_p(doc,
        "SIPPRO-TWR membawa semangat keunggulan data tersebut ke dalam alur kerja harian KJPP TWR di Jakarta Timur, "
        "menghasilkan sistem kerja yang lebih cepat, transparan, dan terpercaya."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 2: ALUR KERJA SISTEM & ARSITEKTUR DATA (SEDERHANA)
    # =========================================================
    add_heading_1(doc, "BAGIAN 2: ALUR KERJA SISTEM & ARSITEKTUR DATA (SEDERHANA)")
    
    add_heading_2(doc, "2.1 Alur Kerja Penilaian Lapangan ke Laporan (BPMN Workflow)")
    add_p(doc,
        "Bagan alur kerja (flowchart) di bawah ini menggambarkan perjalanan data secara berurutan, "
        "mulai dari saat surveyor melakukan pengukuran di lapangan hingga data siap dipakai untuk laporan bank:"
    )
    add_figure(doc, "bpmn_business_process_workflow.png", 
               "Gambar 2.1: Alur Kerja Penilaian Properti Berbasis Peta Citra Satelit (BPMN Workflow Swimlane)",
               width_cm=14.5)
    
    add_p(doc, "Alur proses bisnis ini terbagi menjadi 3 jalur peran yang sangat jelas dan teratur:")
    add_bullet_item(doc, "1. Jalur Surveyor Lapangan:", 
                    "Melakukan inspeksi fisik ke lokasi, mencatat koordinat GPS dari smartphone, mengambil foto bangunan, mengukur lebar jalan (ROW), dan mencatat harga penawaran/transaksi. Setelah itu, surveyor memasukkan data melalui form 'Tambah Data' di web SIPPRO-TWR, atau mengunggah puluhan data lama sekaligus melalui modul drag-and-drop Excel.")
    add_bullet_item(doc, "2. Jalur Sistem Web SIPPRO-TWR:", 
                    "Sistem secara otomatis memvalidasi koordinat GPS, merapikan format desimal angka harga, menghitung indikasi nilai tanah per meter persegi, dan langsung memplot pin properti di atas Peta Citra Satelit resolusi tinggi. Header ringkasan statistik (Total Data, Rata-rata Nilai, Cakupan 61 Kota) juga langsung diperbarui seketika.")
    add_bullet_item(doc, "3. Jalur Penilai Properti (Valuer & Reviewer):", 
                    "Penilai mengetik nama wilayah target (contoh: 'Bekasi') di kotak pencarian dan memilih kategori properti yang sejenis. Penilai memeriksa kondisi fisik atap rumah dan lebar jalan depan langsung dari citra satelit, mengklik pin untuk memeriksa bukti sertifikat tanah, lalu mengunduh kertas kerja pembanding ke Excel atau mengekspor file KML ke Google Earth.")
    
    add_heading_2(doc, "2.2 Pihak-Pihak yang Terhubung ke Sistem (DFD Level 0)")
    add_p(doc,
        "Diagram Konteks (DFD Level 0) memperlihatkan batasan sistem SIPPRO-TWR dan bagaimana 4 pihak pemangku kepentingan "
        "berinteraksi saling bertukar informasi:"
    )
    add_figure(doc, "dfd_level_0_context_diagram.png", 
               "Gambar 2.2: Diagram Konteks Aliran Informasi Antara Pengguna dan SIPPRO-TWR (DFD Level 0)",
               width_cm=14.5)
    
    add_bullet_item(doc, "• Surveyor & Penilai Lapangan:", 
                    "Mengirimkan input data hasil survei (titik koordinat GPS, foto fisik, dimensi luas, bukti sertifikat, dan harga pasar). Menerima output berupa posisi pin di atas peta satelit, detail data pembanding terdekat, serta unduhan rute panduan survei (file KML).")
    add_bullet_item(doc, "• Staff Administrasi Kantor:", 
                    "Mengirimkan file Excel rekapitulasi survei lama kantor. Menerima output berupa konfirmasi data tersimpan dan hasil perapian format koordinat otomatis.")
    add_bullet_item(doc, "• Pimpinan KJPP & Tim Quality Control (QC):", 
                    "Mengirimkan kriteria penyaringan wilayah. Menerima output ringkasan statistik portofolio kantor secara langsung (1.511 titik data, rata-rata Rp 9,4 Juta/m², sebaran 61 kota) serta kertas kerja penilaian yang siap direview.")
    add_bullet_item(doc, "• Perbankan & Klien Penilaian:", 
                    "Menerima output berupa kertas kerja pembanding terformat resmi (.xlsx), foto bukti fisik lingkungan sekitar via citra satelit, serta laporan penilaian agunan yang bebas dari risiko data fiktif.")
    
    add_heading_2(doc, "2.3 Empat Komponen Utama di Balik Layar (DFD Level 1)")
    add_p(doc,
        "Diagram Alir Data Level 1 menguraikan sistem menjadi 4 modul pengolahan fungsional yang bekerja saling terhubung "
        "dengan Pangkalan Data Properti Terpadu (Datastore D1):"
    )
    add_figure(doc, "dfd_level_1_subsystem_architecture.png", 
               "Gambar 2.3: Arsitektur Empat Modul Utama Pemrosesan Data SIPPRO-TWR (DFD Level 1)",
               width_cm=14.5)
    
    add_bullet_item(doc, "1. Modul 1.0 - Peta Citra Satelit (GIS):", 
                    "Bertanggung jawab menampilkan peta foto udara resolusi tinggi (Satellite Imagery), merender 1.511 pin lokasi properti, menjalankan animasi terbang (fly-to) saat kartu diklik, serta memunculkan popup informasi detail properti.")
    add_bullet_item(doc, "2. Modul 2.0 - Pencarian & Filter Kategori:", 
                    "Memproses pencarian kata kunci alamat secara instan (<100 milidetik), menyediakan tombol saringan kategori (Tanah & Bangunan atau Tanah Kosong), serta menu dropdown pilihan kota.")
    add_bullet_item(doc, "3. Modul 3.0 - Katalog Spreadsheet:", 
                    "Menyajikan seluruh 1.511 data properti dalam format tabel baris dan kolom yang rapi, lengkap dengan fitur pencarian tabel, penomoran halaman (pagination), dan tombol aksi cepat untuk melihat properti di peta.")
    add_bullet_item(doc, "4. Modul 4.0 - Upload Excel & Ekspor File:", 
                    "Mengelola penerimaan file Excel lama secara serentak via drag-and-drop dengan koreksi koordinat mandiri, serta menghasilkan file unduhan resmi Excel (.xlsx) dan Google Earth (.kml) dalam satu kali klik.")
    add_bullet_item(doc, "5. Datastore D1 - Pangkalan Data Properti Terpadu:", 
                    "Basis data terpusat yang menyimpan 1.511 rekaman survei lengkap dengan atribut nama objek, alamat, koordinat GPS, luas tanah/bangunan, status sertifikat, indikasi nilai per m², dan nama penilai.")
    
    add_heading_2(doc, "2.4 Format Kartu Identitas Properti (Model Data ERD)")
    add_p(doc,
        "Diagram Entitas Relasi (ERD) di bawah ini memperlihatkan struktur tabel data di dalam pangkalan data SIPPRO-TWR "
        "yang dirancang mencerminkan karakteristik penilaian properti di Indonesia:"
    )
    add_figure(doc, "erd_iso19152_data_model.png", 
               "Gambar 2.4: Model Struktur Data Terpadu Pangkalan Data Properti SIPPRO-TWR (ERD)",
               width_cm=14.5)
    
    add_bullet_item(doc, "• Tabel Utama Properti ('properties' - 1.511 Baris):", 
                    "Menyimpan kartu identitas setiap properti: property_id (Kunci Utama/PK), nama objek, alamat lengkap, kota_id (Kunci Tamu/FK), koordinat GPS (latitude dan longitude), kategori objek, luas tanah (LT), luas bangunan (LB), jenis sertifikat (SHM/HGB), total harga pasar, harga tanah per m², status data penawaran, nama surveyor, tanggal survei, dan lebar jalan depan (ROW).")
    add_bullet_item(doc, "• Tabel Cakupan Wilayah ('regions' - 61 Kota/Kabupaten):", 
                    "Menyimpan data ringkasan wilayah: kota_id (PK), nama kota, provinsi, total jumlah titik survei di kota tersebut, dan rata-rata nilai tanah per m² untuk mendukung analisis tren pasar properti.")
    add_bullet_item(doc, "• Tabel Riwayat File ('file_transfers'):", 
                    "Mencatat seluruh rekam jejak transfer berkas: file_id (PK), jenis aksi (Upload Excel, Ekspor Excel, Ekspor KML), nama file, total baris yang diproses, dan catatan waktu pengerjaan.")
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 3: SIMULASI 11 FITUR UTAMA LIVE (http://localhost:3000/)
    # =========================================================
    add_heading_1(doc, "BAGIAN 3: SIMULASI LENGKAP FITUR APLIKASI WEB (LIVE DI http://localhost:3000/)")
    
    add_p(doc,
        "Bagian ini mendokumentasikan secara rinci seluruh fitur utama yang aktif berjalan pada aplikasi web "
        "SIPPRO-TWR di alamat http://localhost:3000/. Seluruh visualisasi menggunakan Peta Citra Satelit Resolusi Tinggi (GIS) "
        "yang menjadi keunggulan utama sistem ini. Setiap fitur dijelaskan dengan format yang jelas: "
        "Fungsi Layar, Cara Menggunakan, dan Manfaat Nyata bagi operasional kantor."
    )
    
    # ---------------------------------------------------------
    # FITUR 1: GIS SATELLITE MAIN VIEW
    # ---------------------------------------------------------
    add_heading_2(doc, "3.1 Fitur 1: Dashboard Utama & Peta Spasial Berbasis Citra Satelit (GIS)")
    add_figure(doc, "gis_satelit_01_tampilan_utama.png", 
               "Gambar 3.1: Layar Utama Dashboard SIPPRO-TWR Menampilkan Peta Citra Satelit Resolusi Tinggi dengan Sebaran Pin Properti",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Ini adalah beranda utama aplikasi. Layar dirancang dengan tata letak dua sisi: sisi kiri memuat daftar kartu properti "
        "yang dapat digulir, sementara sisi kanan menampilkan Peta Citra Satelit resolusi tinggi berukuran penuh yang memetakan "
        "seluruh titik survei di wilayah Jabodetabek dan sekitarnya."
    )
    add_p(doc,
        "Cara Menggunakan:\n"
        "Penilai dapat menggeser peta menggunakan mouse atau melakukan zoom-in ke jalan tertentu. "
        "Setiap pin berwarna di peta mewakili satu lokasi properti nyata. Mengarahkan kursor ke pin atau kartu properti "
        "akan langsung menghubungkan lokasi di peta dengan data di panel kiri."
    )
    add_p(doc,
        "Mengapa Fitur Ini Sangat Berharga?\n"
        "Peta citra satelit memberikan gambaran bumi yang sesungguhnya (Ground Truth). Penilai tidak perlu menebak-nebak kondisi lokasi; "
        "cukup dari layar komputer, penilai dapat langsung memastikan kerapatan lingkungan dan posisi fisik bangunan."
    )
    
    # ---------------------------------------------------------
    # FITUR 2: TELEMETRY METRICS BAR
    # ---------------------------------------------------------
    add_heading_2(doc, "3.2 Fitur 2: Header Ringkasan & Statistik Data Real-Time")
    add_figure(doc, "gis_satelit_02_summary_telemetry.png", 
               "Gambar 3.2: Panel Ringkasan Data di Bagian Atas Menampilkan 4 Angka Kunci Portofolio Survei Kantor",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Panel horizontal di bagian atas layar yang secara otomatis menghitung dan merangkum 4 informasi kunci secara langsung:\n"
        "1. Total Titik: Menampilkan jumlah persis data properti yang tersimpan di sistem (1.511 Data).\n"
        "2. Rata-rata Nilai: Rata-rata nilai indikasi tanah per meter persegi (Rp 9.406.779 / m²).\n"
        "3. Total Akumulasi Luas: Luas total bidang tanah yang tercakup dalam pangkalan data (1.006.280.408 m²).\n"
        "4. Cakupan Wilayah: Jumlah sebaran daerah survei di seluruh Indonesia (61 Kota / Kabupaten)."
    )
    add_p(doc,
        "Mengapa Fitur Ini Sangat Berharga?\n"
        "Memberikan gambaran instan bagi Pimpinan KJPP dan auditor perbankan mengenai kekuatan basis data kantor. "
        "Pimpinan dapat menunjukkan secara transparan bahwa kantor memiliki ribuan data pembanding yang terverifikasi."
    )
    
    # ---------------------------------------------------------
    # FITUR 3: SEARCH & FILTER SIDEBAR
    # ---------------------------------------------------------
    add_heading_2(doc, "3.3 Fitur 3: Panel Pencarian & Filter Kategori Properti")
    add_figure(doc, "gis_satelit_03_panel_pencarian.png", 
               "Gambar 3.3: Panel Pencarian Berdasarkan Kata Kunci dan Tombol Filter Kategori Objek Properti",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Alat bantu pencarian di sisi kiri atas untuk memfilter data dalam sekejap mata. Dilengkapi dengan:\n"
        "• Kotak Pencarian Bebas (Search Bar): Untuk mengetik nama jalan, kelurahan, atau kota sasaran.\n"
        "• Filter Kategori: Tombol pilihan cepat untuk menyaring jenis objek: 'Semua', 'Tanah & Bangunan', atau 'Tanah Kosong'.\n"
        "• Dropdown Wilayah: Menu pilihan kota spesifik untuk langsung mempersempit pencarian."
    )
    add_p(doc,
        "Mengapa Fitur Ini Sangat Berharga?\n"
        "Sesuai pedoman SPI 106, tanah kosong tidak boleh disamakan dengan rumah tinggal. "
        "Filter kategori memastikan penilai hanya membandingkan properti yang benar-benar sejenis."
    )
    
    # ---------------------------------------------------------
    # FITUR 4: INTERACTIVE SEARCH BEKASI
    # ---------------------------------------------------------
    add_heading_2(doc, "3.4 Fitur 4: Simulasi Pencarian Area Instan (Contoh Wilayah: Bekasi)")
    add_figure(doc, "gis_satelit_04_pencarian_bekasi.png", 
               "Gambar 3.4: Hasil Pencarian Instan Saat Mengetik Kata Kunci 'Bekasi' pada Peta Citra Satelit",
               width_cm=14.5)
    add_p(doc,
        "Apa yang Terjadi di Layar Ini?\n"
        "Gambar ini memperlihatkan demonstrasi nyata ketika pengguna mengetik kata 'Bekasi' pada search bar. "
        "Secara otomatis dan tanpa perlu menekan tombol reload, daftar kartu properti dan sebaran pin di peta satelit "
        "langsung mengerucut hanya pada properti yang berlokasi di wilayah Bekasi."
    )
    add_p(doc,
        "Kecepatan & Responsivitas:\n"
        "Penyaringan berjalan sangat cepat (kurang dari 100 milidetik). Penilai langsung melihat properti pembanding di Bekasi, "
        "seperti area Jalan Ir. H. Juanda, Pondok Gede, dan Summarecon Bekasi, lengkap dengan nilai pasar per meter perseginya."
    )
    
    # ---------------------------------------------------------
    # FITUR 5: PROPERTY CARD SELECTION
    # ---------------------------------------------------------
    add_heading_2(doc, "3.5 Fitur 5: Kartu Properti Interaktif & Navigasi Peta Otomatis (Fly-to)")
    add_figure(doc, "gis_satelit_05_properti_terpilih.png", 
               "Gambar 3.5: Kartu Properti yang Dipilih di Panel Samping Menampilkan Rincian Spesifikasi Lengkap",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Setiap properti disajikan dalam bentuk kartu informasi ringkas yang memuat:\n"
        "• Alamat Lengkap dan Nama Objek Properti.\n"
        "• Indikasi Harga per meter persegi (Rp/m²).\n"
        "• Luas Tanah (LT) dan Luas Bangunan (LB).\n"
        "• Label Legalitas Sertifikat (SHM warna hijau atau HGB warna biru).\n"
        "• Status Data (Penawaran atau Transaksi Riil)."
    )
    add_p(doc,
        "Interaksi Cerdas:\n"
        "Saat penilai mengeklik salah satu kartu properti, kamera peta citra satelit di sisi kanan akan otomatis terbang melayang (fly-to) "
        "dan memusatkan tampilan tepat di atas pin lokasi properti tersebut."
    )
    
    # ---------------------------------------------------------
    # FITUR 6: SATELLITE MARKER POPUP
    # ---------------------------------------------------------
    add_heading_2(doc, "3.6 Fitur 6: Popup Informasi Detail Properti di Atas Peta Satelit")
    add_figure(doc, "gis_satelit_06_popup_detail_satelit.png", 
               "Gambar 3.6: Jendela Popup Detail yang Muncul Saat Pin Peta Diklik Langsung di Atas Citra Satelit",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Ketika penilai mengeklik pin lokasi di peta satelit, sebuah jendela popup elegan akan muncul tepat di atas titik tersebut. "
        "Jendela ini menyajikan rincian teknis yang sangat lengkap:\n"
        "1. Nama Objek & Alamat Jalan Lengkap.\n"
        "2. Total Nilai Pasar dan Nilai per meter persegi.\n"
        "3. Spesifikasi Luas Tanah, Luas Bangunan, dan Jenis Sertifikat (SHM/HGB).\n"
        "4. Kondisi Fisik Lapangan: Bentuk tapak (persegi/L-shape), elevasi terhadap jalan, dan lebar jalan di depan properti.\n"
        "5. Identitas Sumber Data: Nama kontak pemilik/agen dan tanggal pelaksanaan survei."
    )
    add_p(doc,
        "Keunggulan Peta Satelit:\n"
        "Di latar belakang popup, penilai dapat langsung melihat foto udara nyata bangunan tersebut, bentuk pagar, "
        "hingga lebar aspal jalan raya di depannya. Ini memberikan kepastian 100% bahwa data tersebut benar-benar ada di lapangan."
    )
    
    # ---------------------------------------------------------
    # FITUR 7: MODAL TAMBAH DATA BARU
    # ---------------------------------------------------------
    add_heading_2(doc, "3.7 Fitur 7: Formulir Input Tambah Titik Properti Baru")
    add_figure(doc, "gis_satelit_07_form_tambah_data.png", 
               "Gambar 3.7: Formulir Input Tambah Data Baru dengan Panduan Isian Koordinat GPS dan Data Legalitas",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Jendela formulir pop-up yang bersih dan terstruktur untuk memasukkan hasil survei baru ke dalam sistem. "
        "Formulir ini memastikan data yang dimasukkan seragam dan lengkap:\n"
        "• Alamat & Lokasi: Nama jalan, kelurahan, kecamatan, dan kota.\n"
        "• Koordinat GPS: Garis Lintang (Latitude) dan Garis Bujur (Longitude) dari HP surveyor.\n"
        "• Spesifikasi Fisik: Luas Tanah, Luas Bangunan, Jumlah Lantai, dan Lebar Muka.\n"
        "• Legalitas & Harga: Pilihan Sertifikat (SHM/HGB), Harga Penawaran, dan Diskon Negosiasi."
    )
    add_p(doc,
        "Pencegahan Kesalahan (Validasi Otomatis):\n"
        "Formulir ini dilengkapi validasi otomatis. Jika ada kolom wajib yang terlewat atau angka koordinat keliru, "
        "sistem akan memberi peringatan sehingga pangkalan data kantor selalu terlindungi dari data yang rusak."
    )
    
    # ---------------------------------------------------------
    # FITUR 8: SPREADSHEET TABLE VIEW
    # ---------------------------------------------------------
    add_heading_2(doc, "3.8 Fitur 8: Mode Tampilan Spreadsheet (Katalog Tabel 1.511 Data)")
    add_figure(doc, "gis_satelit_08_tampilan_spreadsheet.png", 
               "Gambar 3.8: Mode Tampilan Spreadsheet Tabular yang Menampilkan Seluruh 1.511 Baris Data Secara Rapi",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Bagi staf atau pimpinan yang lebih nyaman menelaah data dalam bentuk tabel baris dan kolom seperti Microsoft Excel, "
        "cukup mengeklik menu 'Spreadsheet' di bagian atas. Seluruh 1.511 data properti disajikan dalam bentuk tabel "
        "yang rapi, bersih, dengan nomor urut dan sistem penomoran halaman (pagination)."
    )
    add_p(doc,
        "Struktur Kolom Tabel:\n"
        "Tabel memuat kolom No, Alamat & Wilayah, Kategori Objek, Luas Tanah, Luas Bangunan, Status Legalitas, "
        "Nilai Indikasi per m², dan Nama Penilai / Sumber Data."
    )
    
    # ---------------------------------------------------------
    # FITUR 9: SPREADSHEET FILTER & ACTIONS
    # ---------------------------------------------------------
    add_heading_2(doc, "3.9 Fitur 9: Pencarian Cepat & Tombol Aksi di Spreadsheet")
    add_figure(doc, "gis_satelit_09_filter_spreadsheet.png", 
               "Gambar 3.9: Pencarian Langsung di Dalam Spreadsheet Disertai Tombol Aksi 'Lihat di Peta', Edit, dan Hapus",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Menampilkan kemudahan menyaring data langsung di dalam mode tabel spreadsheet. Saat pengguna mengetik kata tertentu "
        "(misalnya: 'Jakarta'), tabel seketika memfilter dan hanya menampilkan properti di area tersebut."
    )
    add_p(doc,
        "Tombol Aksi Cepat:\n"
        "Pada setiap baris data, tersedia tombol aksi praktis:\n"
        "• Tombol 'Lihat di Peta': Langsung membawa pengguna kembali ke layar peta satelit dan memfokuskan kamera ke properti tersebut.\n"
        "• Tombol 'Edit': Membuka formulir untuk memperbarui informasi harga jika ada penawaran terbaru.\n"
        "• Tombol 'Hapus': Menghapus data jika ditemukan duplikasi, lengkap dengan konfirmasi keamanan."
    )
    
    # ---------------------------------------------------------
    # FITUR 10: BATCH EXCEL UPLOADER
    # ---------------------------------------------------------
    add_heading_2(doc, "3.10 Fitur 10: Modul Upload Batch File Excel Otomatis")
    add_figure(doc, "gis_satelit_10_upload_excel.png", 
               "Gambar 3.10: Modul Impor File Excel dengan Fitur Drag-and-Drop dan Mesin Perapian Format Otomatis",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Fitur unggah data massal yang sangat menghemat waktu. Kantor KJPP yang memiliki ratusan data survei lama di file Excel "
        "cukup menarik dan menjatuhkan (drag and drop) file Excel tersebut ke dalam area yang disediakan."
    )
    add_p(doc,
        "Perapian Format Otomatis:\n"
        "Sering kali data Excel lama memiliki ketidakteraturan, seperti koma pada angka desimal (contoh: 1,078611), "
        "koordinat lintang dan bujur yang tertukar, atau teks harga yang memuat tulisan 'Rp'. "
        "Sistem secara otomatis mendeteksi kesalahan tersebut, merapikan format angka, membalik koordinat yang tertukar, "
        "dan memasukkan data yang sudah bersih ke dalam peta satelit tanpa perlu diedit manual satu per satu."
    )
    
    # ---------------------------------------------------------
    # FITUR 11: 1-CLICK EXPORT
    # ---------------------------------------------------------
    add_heading_2(doc, "3.11 Fitur 11: Tombol Ekspor 1-Klik ke File Excel & Google Earth (KML)")
    add_figure(doc, "gis_satelit_11_tombol_ekspor.png", 
               "Gambar 3.11: Dua Tombol Ekspor di Header: Unduh Spreadsheet Excel dan Unduh Titik Peta Google Earth (KML)",
               width_cm=14.5)
    add_p(doc,
        "Fungsi Layar Ini:\n"
        "Dua tombol ekspor praktis di sudut kanan atas layar:\n"
        "1. Tombol 'Excel': Mengunduh seluruh data properti yang sedang terpilih menjadi file Microsoft Excel (.xlsx) resmi "
        "yang rapi dan siap dilampirkan ke dalam Laporan Penilaian KPR Bank.\n"
        "2. Tombol 'KML': Mengunduh data menjadi file peta Google Earth (.kml). File ini dapat langsung dibuka di Google Earth laptop "
        "atau dikirimkan via WhatsApp ke HP penilai lapangan untuk dijadikan rute panduan navigasi survei."
    )
    add_p(doc,
        "Mengapa Fitur Ini Sangat Berharga?\n"
        "Menghubungkan pekerjaan analisis data di kantor dengan kebutuhan navigasi fisik surveyor saat berkendara di jalan. "
        "Surveyor tidak akan lagi tersesat atau salah mendatangi alamat pembanding."
    )
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 4: NILAI MANFAAT BAGI SELURUH STAKEHOLDER
    # =========================================================
    add_heading_1(doc, "BAGIAN 4: NILAI MANFAAT BAGI SELURUH PEMANGKU KEPENTINGAN (STAKEHOLDER VALUE)")
    
    add_p(doc,
        "Implementasi SIPPRO-TWR memberikan dampak positif nyata bagi seluruh pihak yang terlibat dalam ekosistem penilaian properti:"
    )
    
    add_heading_2(doc, "4.1 Bagi Penilai Properti Lapangan (Surveyor & Valuer)")
    add_bullet_item(doc, "Hemat Waktu dan Tenaga:", 
                    "Penilai tidak perlu lagi mencari data pembanding dari nol. Buka peta satelit, pembanding di sekitar objek agunan langsung terlihat.")
    add_bullet_item(doc, "Efisiensi Rute Survei:", 
                    "Dengan ekspor file KML ke Google Earth, penilai dapat merencanakan rute perjalanan secara efisien sehingga menghemat bensin dan waktu tempuh.")
    add_bullet_item(doc, "Akurasi Perhitungan:", 
                    "Sistem secara otomatis menghitung harga satuan per meter persegi, mengeliminasi risiko salah ketik rumus di Excel.")
    
    add_heading_2(doc, "4.2 Bagi Pimpinan Rekan KJPP & Quality Control (QC)")
    add_bullet_item(doc, "Visibilitas Penuh Portofolio Data:", 
                    "Pimpinan dapat melihat sebaran 1.511 data survei kantor di seluruh kota secara langsung kapan saja.")
    add_bullet_item(doc, "Data Menjadi Aset Kantor:", 
                    "Mengubah data yang tadinya tersimpan di laptop pribadi staf menjadi aset kekayaan intelektual resmi KJPP TWR yang terus bertambah nilainya.")
    add_bullet_item(doc, "Kepatuhan Regulasi Penilaian:", 
                    "Memastikan setiap laporan penilaian yang keluar dari kantor memiliki dasar pembanding yang kuat dan mematuhi SPI 106.")
    
    add_heading_2(doc, "4.3 Bagi Perbankan & Lembaga Keuangan (Bank Mandiri, BCA, OJK, dsb.)")
    add_bullet_item(doc, "Keamanan Agunan Terjamin:", 
                    "Nilai pasar properti didasarkan pada titik pembanding riil yang terkunci koordinat GPS di atas foto satelit, menekan risiko penggelembungan nilai (over-valuation).")
    add_bullet_item(doc, "Kemudahan Verifikasi Audit:", 
                    "Auditor bank dapat menguji kembali kebenaran lokasi pembanding dengan sangat mudah melalui titik koordinat dan foto udara yang dilampirkan.")
    add_bullet_item(doc, "Proses Kredit Lebih Cepat:", 
                    "Waktu penyusunan laporan penilaian menjadi jauh lebih singkat, sehingga proses persetujuan kredit nasabah bank dapat diselesaikan lebih cepat.")
    
    add_heading_2(doc, "4.4 Bagi Almamater PKN STAN")
    add_bullet_item(doc, "Bukti Kompetensi Mahasiswa:", 
                    "Membuktikan bahwa lulusan D-III PBB/Penilai PKN STAN tidak hanya menguasai teori penilaian, tetapi juga mampu menciptakan inovasi teknologi yang memecahkan masalah nyata di dunia kerja.")
    add_bullet_item(doc, "Tolok Ukur Karya Magang:", 
                    "Menjadi contoh nyata laporan magang yang menghasilkan aplikasi terapan berstandar industri dengan manfaat operasional langsung.")
    
    doc.add_page_break()

    # =========================================================
    # BAGIAN 5: PANDUAN CARA DEMO 3 MENIT
    # =========================================================
    add_heading_1(doc, "BAGIAN 5: PANDUAN CARA DEMO / PRESENTASI 3 MENIT DI DEPAN AUDIENS & MANAJEMEN")
    
    add_p(doc,
        "Gunakan naskah praktis di bawah ini saat mempresentasikan aplikasi SIPPRO-TWR di hadapan Pimpinan KJPP, "
        "Dosen Penguji PKN STAN, atau Tim Reviewer Perbankan. Naskah ini dirancang dengan gaya bertutur yang santai, "
        "percaya diri, mudah dipahami, dan langsung menonjolkan nilai bisnis."
    )
    
    add_callout_box(doc, "Naskah Presentasi Ringkas 3 Menit (Quick Presentation Script)",
        "[MENIT 0:00 - 0:45] PEMBUKAAN & MASALAH NYATA (THE HOOK)\n"
        "\"Selamat pagi Bapak/Ibu Pimpinan dan Dewan Penguji. Setiap hari di kantor KJPP, penilai kita sering menghabiskan waktu "
        "3 sampai 4 jam hanya untuk mencari 3 data pembanding dari puluhan file Excel yang berserakan di laptop masing-masing. "
        "Belum lagi risiko data calo yang tidak jelas lokasinya. "
        "Hari ini, saya mempersembahkan solusinya: SIPPRO-TWR, sistem pangkalan data penilaian properti berbasis peta citra satelit interaktif "
        "yang aktif berjalan di layar hadapan Bapak/Ibu saat ini.\"\n\n"
        
        "[MENIT 0:45 - 2:00] DEMO FITUR PETA SATELIT & PENCARIAN (THE WOW FACTOR)\n"
        "\"Bisa kita lihat di layar, sebanyak 1.511 data survei kantor kini terpampang rapi langsung di atas Peta Citra Satelit Resolusi Tinggi. "
        "Di bagian atas, kita langsung melihat rata-rata nilai tanah Rp 9,4 juta per meter persegi di 61 kota. "
        "Misalkan kantor kita mendapat tugas menilai rumah di Bekasi. Saya cukup ketik 'Bekasi' di kotak pencarian... dan seketika itu juga, "
        "seluruh pembanding di Bekasi langsung tersaring di peta! Saya klik salah satu kartu, peta otomatis terbang ke lokasinya. "
        "Jika kita klik pin di peta satelit, rincian sertifikat SHM, luas tanah, dan harga per meter langsung muncul. "
        "Hebatnya lagi, melalui foto satelit ini, penilai bisa langsung melihat bentuk fisik atap rumah dan lebar jalan di depannya tanpa harus repot pergi ke lokasi!\"\n\n"
        
        "[MENIT 2:00 - 3:00] DEMO EKSPOR EXCEL & KESIMPULAN (THE IMPACT)\n"
        "\"Saat laporan harus segera diserahkan ke bank, penilai cukup menekan tombol 'Excel' di pojok kanan atas untuk mengunduh kertas kerja otomatis, "
        "atau tombol 'KML' untuk mengirim rute navigasi ke Google Earth di HP surveyor. "
        "Hasilnya? Waktu penyiapan data hemat 84%, laporan agunan bank aman dari risiko data fiktif, "
        "dan yang paling penting: sistem ini dibangun dengan arsitektur bebas biaya (Zero-Cost), tanpa biaya langganan software apapun. "
        "Inilah modernisasi nyata bagi profesi penilai properti Indonesia. Terima kasih, saya siap menerima pertanyaan dan masukan.\"",
        icon="🎤"
    )
    
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(12)
    p_end.paragraph_format.space_after = Pt(6)
    
    add_heading_2(doc, "5.1 Tips Praktis Saat Menjalankan Demo Langsung")
    add_p(doc,
        "1. Tampilkan di Browser Bersih: Buka aplikasi di http://localhost:3000/ dengan ukuran zoom browser 100%.\n"
        "2. Tonjolkan Citra Satelit: Jelaskan bahwa foto satelit resolusi tinggi ini gratis dan memberikan bukti fisik bumi yang nyata.\n"
        "3. Tunjukkan Kecepatan Pencarian: Ketik nama kota secara santai untuk memperlihatkan responsivitas sistem tanpa jeda (lag).\n"
        "4. Fokus pada Nilai Manfaat: Jangan membahas istilah kode pemrograman yang rumit; fokuslah pada penghematan waktu survei, keamanan data kantor, dan kenyamanan penilai."
    )
    
    # Save to LATEST and PROJECT path
    output_latest = r"S:\Laporan Magang\DOKUMENTASI_SIMULASI_DAN_DEMO_SIPPRO_TWR_LATEST.docx"
    doc.save(output_latest)
    print(f"[SUCCESS] Saved to {output_latest} ({os.path.getsize(output_latest):,} bytes)")
    
    doc.save(OUTPUT_PROJECT)
    print(f"[SUCCESS] Saved to project copy {OUTPUT_PROJECT} ({os.path.getsize(OUTPUT_PROJECT):,} bytes)")
    
    # Try saving to FIXED
    try:
        doc.save(OUTPUT_FIXED)
        print(f"[SUCCESS] Overwritten {OUTPUT_FIXED}")
    except PermissionError:
        print(f"[INFO] '{OUTPUT_FIXED}' is currently open in Word. Saved to '{output_latest}' instead.")
        
    # Try saving to PRIMARY
    try:
        doc.save(OUTPUT_PRIMARY)
        print(f"[SUCCESS] Overwritten {OUTPUT_PRIMARY}")
    except PermissionError:
        print(f"[INFO] '{OUTPUT_PRIMARY}' is currently open in Word.")

if __name__ == "__main__":
    build_perfect_document()
