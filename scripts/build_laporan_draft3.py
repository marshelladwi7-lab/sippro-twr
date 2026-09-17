# -*- coding: utf-8 -*-
"""
Full Build Script: build_laporan_draft3.py
Purpose: Ingest international benchmarking research and Indonesian valuation realities
         into S:\Laporan Magang\LAPORAN MAGANG SHELLA DRAFT 3.docx while preserving
         all 5 embedded figures, 4 tables, and strict formatting invariants.
"""

import os
import re
import docx
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

SRC_FILE = r"S:\Laporan Magang\LAPORAN MAGANG SHELLA DRAFT 2.docx"
DST_FILE = r"S:\Laporan Magang\LAPORAN MAGANG SHELLA DRAFT 3.docx"

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

def update_paragraph_text(p, text, default_font="Times New Roman", default_size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=0, space_before=0):
    p.text = ""
    add_markdown_runs(p, text, default_font, default_size)
    set_paragraph_properties(p, align, line_spacing, space_after, space_before)

def insert_formatted_paragraph_before(target_p, text, style='Normal', default_font="Times New Roman", default_size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=0, space_before=0):
    new_p = target_p.insert_paragraph_before("", style=style)
    add_markdown_runs(new_p, text, default_font, default_size)
    set_paragraph_properties(new_p, align, line_spacing, space_after, space_before)
    return new_p

def set_cell_margins_and_shading(cell, top=100, bottom=100, left=140, right=140, fill_color=None):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>\n'
        f'  <w:top w:w="{top}" w:type="dxa"/>\n'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
        f'  <w:left w:w="{left}" w:type="dxa"/>\n'
        f'  <w:right w:w="{right}" w:type="dxa"/>\n'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)
    if fill_color:
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_color}"/>')
        tcPr.append(shd)

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>\n'
        f'  <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>\n'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>\n'
        f'  <w:left w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'  <w:insideV w:val="none"/>\n'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_comparative_table(doc, insert_before_p):
    insert_formatted_paragraph_before(
        insert_before_p,
        "**Tabel III.1** Matriks Komparasi Tata Kelola Data Properti Internasional dan Pengaruhnya terhadap Penilaian Pasar",
        style='Normal',
        default_size=10,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        line_spacing=1.15,
        space_after=3,
        space_before=6
    )

    table_data = [
        [
            "Negara & Lembaga Pengelola",
            "Dasar Hukum & Mandat Pelaporan",
            "Mekanisme Penangkapan Data",
            "Aksesibilitas & Transparansi (JLL GRETI)",
            "Dampak pada Penilaian Pasar & Agunan Bank"
        ],
        [
            "**Malaysia**\n*National Property Information Centre* (NAPIC) / JPPH, Kementerian Kewangan",
            "*Stamp Act 1949* & *National Land Code* (Pemberitahuan Pindah Milik Borang 14A).",
            "Statuter wajib: Setiap transaksi jual beli tanah/bangunan diajukan ke LHDN untuk penetapan bea meterai (*stamp duty*) dan dinilai (*adjudicated*) oleh penilai pemerintah JPPH. Jika harga kontrak lebih rendah dari Nilai Pasar JPPH, pajak dihitung dari Nilai Pasar JPPH.",
            "**Tier 2 (Transparent)**\nPublikasi semesteran *Property Market Report* (PMR), *Malaysian House Price Index* (MHPI), data *Property Overhang*, serta portal PRISM untuk penilai berdaftar LPPEH.",
            "Menghilangkan insentif *under-invoicing*, menyediakan data transaksi 100% riil terverifikasi bagi penilai independen, dan memitigasi risiko kredit perbankan terhadap *asset bubble*."
        ],
        [
            "**Singapura**\n*Urban Redevelopment Authority* (URA) & *Singapore Land Authority* (SLA)",
            "*Land Titles Act* (Part XII: Perlindungan Kepentingan Pembeli melalui *Caveat*).",
            "Pendaftaran *Caveat* via *e-Lodgement* oleh pengacara pembeli saat kontrak ditandatangani (*Option to Purchase* / OTP) untuk melindungi hak ekuitas pembeli dan agunan bank dari klaim pihak ketiga.",
            "**Tier 1 (Highly Transparent)**\nPortal URA REALIS (data mingguan/bulanan berbayar terjangkau), peta kadaster OneMap SLA, dan API terbuka transaksi *resale* flat HDB di *data.gov.sg*.",
            "Penilai SISV (*Singapore Institute of Surveyors and Valuers*) tidak mengandalkan harga penawaran listing; varians penilaian perbankan sangat rendah (<3%), menciptakan kepastian valuasi kredit hipotek."
        ],
        [
            "**Australia**\n*Valuer-General* Negara Bagian (e.g. NSW VG) & Ekosistem CoreLogic",
            "*Valuation of Land Act 1916* & regulasi pendaftaran tanah negara bagian.",
            "Pelaporan wajib transaksi melalui *Notice of Sale* (eNOS) saat penyelesaian legal (*settlement*). Data disatukan ke dalam berkas statuter *Property Sales Information* (PSI).",
            "**Tier 1 (Highly Transparent)**\nData mentah publik tersedia untuk riset. Sektor swasta (CoreLogic / RP Data) mengintegrasikan data transaksi dengan peta kadaster (*Geoscape*) dan perizinan pemda (*Development Application*).",
            "Semua bank utama (CBA, Westpac, NAB, ANZ) mewajibkan penilai CPV (*Certified Practising Valuer*) menggunakan API CoreLogic; audit valuasi agunan dilakukan secara terotomatisasi (*Automated Collateral Audit*)."
        ],
        [
            "**Inggris Raya**\n*HM Land Registry* (HMLR)",
            "*Land Registration Act 2002*.",
            "Pendaftaran wajib seluruh akta pengalihan hak kepemilikan (*transfer deed*) tanah dan bangunan yang dialihkan dengan nilai imbalan (*value received*).",
            "**Tier 1 (Highly Transparent)**\n*Price Paid Data* (PPD) dirilis bulanan secara bebas royalti di bawah *Open Government Licence* (OGL v3.0); mencakup 100% transaksi residensial di Inggris dan Wales sejak 1995.",
            "Transparansi harga absolut; penilai RICS (*Royal Institution of Chartered Surveyors*) memiliki akses penuh ke riwayat transaksi historis tanpa asimetri informasi."
        ],
        [
            "**Indonesia (Kondisi Eksisting)**\nTerfragmentasi di berbagai instansi (BPN, DJP/Bapenda, BI, OJK, Bank, KJPP)",
            "PMK 101/2014 jo. PMK 228/2019 (kewajiban internal KJPP); POJK 40/2019 (penilaian agunan bank). Ketiadaan mandat repositori transaksi nasional.",
            "AJB di PPAT bersifat rahasia. Terjadi distorsi pelaporan harga di bawah nilai pasar (*under-invoicing*) guna meminimalkan BPHTB (5%) dan PPh Final (2,5%). Penilai bergantung pada penawaran portal daring.",
            "**Tier 4 (Semi-Transparent)**\nNJOP bersifat fiskal dan tertinggal 30%-70%; ZNT disajikan agregat poligon; SHPR BI hanya menyurvei pengembang pasar perdana di 18 kota besar. Data pasar sekunder terkunci di masing-masing KJPP.",
            "Penilai rentan bias subjektivitas diskon penawaran (-5% s.d. -15%); risiko deviasi estimasi Nilai Likuidasi agunan perbankan dan ancaman sanksi hukum/regulasi bagi profesi penilai."
        ],
        [
            "**Indonesia (Solusi SIPPRO-TWR)**\nInisiatif Pangkalan Data Spasial KJPP Totok Wasito dan Rekan",
            "Pemenuhan Pasal 43 ayat (5) huruf c PMK 228/2019, SPI 106, SPI 202, serta mitigasi risiko agunan POJK 40/POJK.03/2019.",
            "Digitalisasi dan pembersihan 1.511 data historis survei, lelang, dan pencairan bank; geocoding koordinat WGS84; standarisasi atribut fisik, yuridis, tapak, dan elevasi; serta penapisan pra-survei berbasis web.",
            "**Platform Internal Terpadu**\nArsitektur spasial nir-biaya (*PostGIS + MapLibre GL + OpenStreetMap*); visualisasi spasial interaktif; penapisan multi-parameter; dan audit trail terstruktur.",
            "Memangkas waktu penelusuran data hingga 83,8% (dari 185 menit menjadi 30 menit); meningkatkan objektivitas pembobotan penyesuaian; dan menjamin pemenuhan standar kepatuhan regulasi PPPK Kemenkeu."
        ]
    ]

    table = doc.add_table(rows=len(table_data), cols=5)
    set_table_borders(table)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    col_widths = [Cm(2.6), Cm(2.8), Cm(3.4), Cm(2.8), Cm(3.2)]

    for row_idx, row in enumerate(table.rows):
        is_header = (row_idx == 0)
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for col_idx, cell in enumerate(row.cells):
            cell.width = col_widths[col_idx]
            bg_color = "EAEAEA" if is_header else ("F9F9F9" if row_idx % 2 == 1 else "FFFFFF")
            set_cell_margins_and_shading(cell, top=80, bottom=80, left=120, right=120, fill_color=bg_color)
            
            p = cell.paragraphs[0]
            p.text = ""
            cell_text = table_data[row_idx][col_idx]
            align = WD_ALIGN_PARAGRAPH.CENTER if is_header else (WD_ALIGN_PARAGRAPH.CENTER if col_idx == 3 and not is_header else WD_ALIGN_PARAGRAPH.LEFT)
            add_markdown_runs(p, cell_text, default_size=8.5)
            set_paragraph_properties(p, align=align, line_spacing=1.0, space_after=2, space_before=2)

    insert_before_p._element.addprevious(table._element)

    insert_formatted_paragraph_before(
        insert_before_p,
        "*Sumber: Analisis Komparatif Regulasi Pertanahan, JLL Global Real Estate Transparency Index (2024), World Bank (2020), dan Dokumen Benchmark SIPPRO-TWR (2026)*",
        style='Normal',
        default_size=9,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        line_spacing=1.0,
        space_after=6,
        space_before=2
    )

def main():
    print(f"Loading {SRC_FILE}...")
    doc = docx.Document(SRC_FILE)
    print(f"Loaded successfully. Total paragraphs: {len(doc.paragraphs)}, Tables: {len(doc.tables)}")

    # -------------------------------------------------------------
    # 1. BAB I: LATAR BELAKANG & TUJUAN MAGANG
    # -------------------------------------------------------------
    print("Enriching Bab I...")
    # Find P84 ("Ketergantungan pada data penawaran mengandung beberapa kelemahan operasional...")
    p84 = None
    p85 = None
    for i, p in enumerate(doc.paragraphs):
        if "Ketergantungan pada data penawaran mengandung beberapa kelemahan operasional" in p.text:
            p84 = p
            p85 = doc.paragraphs[i+1]
            break

    if p84 and p85:
        # Insert 3 rich paragraphs right before P85
        t1 = (
            "Dalam lanskap global, pengelolaan data transaksi properti telah berkembang menjadi fondasi infrastruktur informasi "
            "nasional yang terintegrasi, andal, dan dapat diakses secara transparan oleh segenap pemangku kepentingan. Di Malaysia, "
            "*Valuation and Property Services Department* (JPPH) Kementerian Keuangan mendirikan *National Property Information Centre* "
            "(NAPIC) pada tahun 1999 pasca-Krisis Moneter Asia 1997/1998 untuk mencegah bahaya gelembung aset (*asset bubble*) dan "
            "penumpukan kredit bermasalah perbankan. Seluruh transaksi properti di Malaysia terekam secara statuter melalui penyerahan "
            "instrumen pengalihan hak (*Borang 14A*) kepada *Lembaga Hasil Dalam Negeri* (LHDN) untuk pengenaan bea meterai (*stamp duty*), "
            "di mana pejabat penilai pemerintah (JPPH) bertindak mengadjudikasi kesesuaian nilai transaksi dengan Nilai Pasar. Apabila "
            "harga kontrak yang dilaporkan lebih rendah daripada Nilai Pasar hasil adjudikasi JPPH, maka bea meterai dihitung berdasarkan "
            "Nilai Pasar JPPH, sehingga secara otomatis mengeliminasi insentif pelaporan harga palsu (*under-invoicing*). Mekanisme keterbukaan "
            "data serupa diterapkan di Singapura melalui pencatatan *caveat* pada *Singapore Land Authority* (SLA) berdasarkan *Land Titles Act*, "
            "yang kemudian diagregasikan secara mingguan dan bulanan ke dalam sistem *Real Estate Information System* (REALIS) oleh "
            "*Urban Redevelopment Authority* (URA) serta portal data terbuka perumahan publik HDB di *data.gov.sg*. Di Australia, "
            "negara bagian New South Wales (NSW) mengamanatkan pelaporan penjualan properti (*Notice of Sale* / eNOS) berdasarkan "
            "*Valuation of Land Act 1916* yang dihimpun oleh *Valuer-General* dan disalurkan secara komersial melalui jejaring CoreLogic "
            "untuk memvalidasi penaksiran agunan perbankan secara terotomatisasi (*Automated Collateral Audit*). Demikian pula di Inggris Raya, "
            "*HM Land Registry* mempublikasikan data harga pembelian properti (*Price Paid Data*) secara berkala dan bebas royalti di bawah "
            "*Open Government Licence* (OGL v3.0) berdasarkan *Land Registration Act 2002*."
        )
        insert_formatted_paragraph_before(p85, t1, style='Normal')

        t2 = (
            "Berbeda secara signifikan dengan praktik tata kelola internasional tersebut, ekosistem data properti di Indonesia masih "
            "terkendala oleh fragmentasi kelembagaan dan asimetri informasi yang sangat akut (*acute information asymmetry*). Indonesia "
            "hingga saat ini belum memiliki repositori data transaksi properti tunggal yang terbuka untuk umum. Akta Jual Beli (AJB) yang "
            "dibuat di hadapan Pejabat Pembuat Akta Tanah (PPAT) berstatus dokumen tertutup dan rahasia perorangan. Lebih jauh lagi, terdapat "
            "distorsi fiskal yang mengakar, di mana harga yang dilaporkan dalam lembar formal AJB kerap kali disamakan dengan Nilai Jual "
            "Objek Pajak (NJOP) terendah guna meminimalkan kewajiban Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB 5%) bagi pembeli serta "
            "Pajak Penghasilan (PPh) Final Pengalihan Hak (2,5%) bagi penjual. Akibatnya, nilai pada dokumen resmi negara sering kali bukan "
            "merupakan representasi dari Nilai Pasar wajar (*Fair Market Value*). Di samping itu, pangkalan data pemerintah yang tersedia "
            "memiliki keterbatasan substansial bagi kepentingan penilaian pasar: NJOP yang dikelola Direktorat Jenderal Pajak (DJP) dan Badan "
            "Pendapatan Daerah (Bapenda) bersifat massal dan tertinggal 30% hingga 70% dari dinamika pasar riil, Zona Nilai Tanah (ZNT) oleh "
            "Kementerian ATR/BPN disajikan dalam batas poligon makro tanpa rincian atribut teknis unit properti, dan Survei Harga Properti "
            "Residensial (SHPR) oleh Bank Indonesia hanya menyurvei sekitar 1.700 pengembang di pasar perdana (*primary market*) pada 18 kota "
            "besar, sehingga sama sekali tidak mencakup transaksi pasar sekunder (*secondary market*) yang menjadi objek utama agunan kredit "
            "perbankan."
        )
        insert_formatted_paragraph_before(p85, t2, style='Normal')

        t3 = (
            "Ketiadaan repositori transaksi terpusat ini menimbulkan kerentanan hukum dan operasional bagi industri penilaian properti serta "
            "mengancam stabilitas sektor perbankan nasional. Berdasarkan Peraturan Otoritas Jasa Keuangan Nomor 40/POJK.03/2019 tentang "
            "Penilaian Kualitas Aset Bank Umum, penilaian agunan kredit bank wajib dilakukan secara objektif, independen, dan dapat diaudit "
            "guna menetapkan Nilai Likuidasi yang realistis melalui potongan likuidasi (*liquidation haircut*) untuk memitigasi risiko kredit "
            "bermasalah (*non-performing loan*). Kesalahan penaksiran nilai akibat penggunaan data pembanding fiktif atau tidak terverifikasi "
            "berpotensi menyeret penilai publik maupun pejabat kredit bank ke dalam ranah sanksi administratif, perdata, hingga tindak pidana "
            "kerugian keuangan negara pada bank BUMN. Menyikapi urgensi tersebut, Kementerian Keuangan Republik Indonesia melalui Peraturan "
            "Menteri Keuangan Nomor 101/PMK.01/2014 sebagaimana telah diubah dengan PMK Nomor 228/PMK.01/2019 telah mewajibkan setiap "
            "Kantor Jasa Penilai Publik (KJPP) untuk membangun, memelihara, dan memperbarui sistem pangkalan data penilaian berbasis teknologi "
            "informasi yang mencakup pencatatan jenis data, sumber perolehan, tanggal transaksi/penawaran, serta harga objek."
        )
        insert_formatted_paragraph_before(p85, t3, style='Normal')

    # Update Tujuan Magang Point 5
    for p in doc.paragraphs:
        if p.text.startswith("5. Mengkaji kesesuaian sistem pengelolaan data properti dengan Standar Penilaian Indonesia"):
            t_tujuan5 = (
                "5. Mengkaji kesesuaian sistem pengelolaan data properti dengan Standar Penilaian Indonesia (SPI), regulasi Kementerian "
                "Keuangan (PMK Nomor 228/PMK.01/2019), Peraturan Otoritas Jasa Keuangan (POJK Nomor 40/POJK.03/2019), serta melakukan komparasi "
                "analitis terhadap praktik terbaik (*international benchmarking*) sistem data properti nasional di Malaysia, Singapura, "
                "Australia, dan Inggris Raya."
            )
            update_paragraph_text(p, t_tujuan5, default_size=12)
            break

    # -------------------------------------------------------------
    # 2. BAB II: ENRICH CPMK 2, 3, 4
    # -------------------------------------------------------------
    print("Enriching Bab II CPMKs...")
    for p in doc.paragraphs:
        if p.text.startswith("3. Perumusan Rekayasa Konseptual Sistem Pangkalan Data Spasial:"):
            t_cpmk2 = (
                "3. Perumusan Rekayasa Konseptual Sistem Pangkalan Data Spasial: Menindaklanjuti kendala pangkalan data tabular, penulis "
                "merumuskan arsitektur sistem basis data spasial (SIPPRO-TWR) yang mengadopsi prinsip hierarki bukti pasar *International "
                "Valuation Standards* (IVS 105) serta mengacu pada model konseptual *Valuation Information* berbasis ISO 19152 *Land "
                "Administration Domain Model* (LADM). Penulis merancang alur kerja mulai dari pembersihan data mentah, standardisasi atribut "
                "fisik dan yuridis (legalitas, tapak, elevasi, ROW jalan), integrasi koordinat geografis WGS84, hingga pembuatan antarmuka "
                "penapisan pra-survei berbasis web."
            )
            update_paragraph_text(p, t_cpmk2, default_size=12)
        elif p.text.startswith("3. Audit dan Pembersihan Data Historis Kantor (1.511 Titik Data):"):
            t_cpmk3 = (
                "3. Audit dan Pembersihan Data Historis Kantor (1.511 Titik Data): Penulis mengumpulkan, menyeleksi, dan mengaudit data "
                "properti kantor yang sebelumnya tercecer dalam lembar kerja Excel selama periode 2021 hingga 2024. Penulis melakukan "
                "standardisasi skema basis data (*data schema standardization*) terhadap 1.511 baris data valid, membersihkan anomali string "
                "koordinat, menangani nilai hilang (*missing values*), mengklasifikasikan bukti pasar (penawaran versus transaksi riil "
                "lelang/pencairan bank), dan mengekspornya ke dalam format terstruktur (*comma-separated values*) yang siap diintegrasikan "
                "ke dalam basis data geospasial."
            )
            update_paragraph_text(p, t_cpmk3, default_size=12)
        elif p.text.startswith("2. Pemetaan Koordinat Geografis (Geocoding) dan Integrasi Spasial SIPPRO-TWR:"):
            t_cpmk4 = (
                "2. Pemetaan Koordinat Geografis (Geocoding) dan Integrasi Spasial SIPPRO-TWR: Penulis memetakan dan memverifikasi koordinat "
                "geografis (lintang dan bujur sistem proyeksi EPSG:4326/WGS84) untuk seluruh titik data properti di wilayah Jabodetabek dan "
                "Banten. Penulis mengonfigurasikan basis data spasial berbasis PostGIS serta membangun antarmuka peta interaktif berbasis "
                "MapLibre GL dengan memanfaatkan ubin peta terbuka (*open-source basemap tiles*), sehingga memungkinkan analisis kedekatan "
                "radius (*proximity analysis*), penapisan zonasi wilayah, dan visualisasi konsentrasi nilai properti secara presisi tanpa "
                "biaya lisensi perangkat lunak (*zero-cost architecture*)."
            )
            update_paragraph_text(p, t_cpmk4, default_size=12)

    # -------------------------------------------------------------
    # 3. BAB III: LANDASAN TEORI & MASALAH DATA
    # -------------------------------------------------------------
    print("Enriching Bab III Landasan Teori...")
    for p in doc.paragraphs:
        # 3.1.1 SPI 106 & IVS 105 & POJK 40/2019
        if p.text.startswith("Penerapan Pendekatan Pasar mensyaratkan penilai untuk menganalisis data pasar"):
            t_spi = (
                "Penerapan Pendekatan Pasar mensyaratkan penilai untuk menganalisis data pasar dan transaksi dari properti yang sebanding "
                "dan sejenis (*comparable properties*). Prinsip ini selaras dengan ketentuan *International Valuation Standards* (IVS 105: "
                "*Valuation Approaches and Methods - Market Approach*) yang menetapkan hierarki keandalan bukti pasar (*hierarchy of market "
                "evidence*): Tingkat 1 berupa transaksi aktual aset yang identik dalam kondisi pasar yang sebanding pada tanggal penilaian "
                "(*highest weight of evidence*); Tingkat 2 berupa transaksi aktual aset sejenis yang memerlukan penyesuaian objektif "
                "(*observable comparative adjustments*); dan Tingkat 3 berupa data penawaran aktif (*asking prices*) yang wajib disertai "
                "analisis diskon tawar-menawar empiris. Lebih lanjut, dalam konteks penilaian agunan kredit perbankan, penilai berpedoman "
                "pada SPI 202 (*Penilaian untuk Agunan Kredit*) dan POJK Nomor 40/POJK.03/2019 tentang Penilaian Kualitas Aset Bank Umum. "
                "Ketentuan ini menuntut penaksiran Nilai Pasar (*Market Value*) sekaligus estimasi Nilai Likuidasi (*Liquidation Value*) "
                "melalui penerapan potongan likuidasi (*liquidation haircut*) yang memperhitungkan keterbatasan waktu pemasaran paksa "
                "(*forced sale*), biaya transaksi likuidasi, dan daya serap pasar lokal guna mengantisipasi risiko kredit bermasalah (*non-performing loan*)."
            )
            update_paragraph_text(p, t_spi, default_size=12)

        # 3.1.2 Multi-Parameter Adjustment Grid
        elif p.text.startswith("Kaidah teknis penilaian properti mensyaratkan penggunaan sekurang-kurangnya 3 (tiga) data"):
            t_adj = (
                "Kaidah teknis penilaian properti mensyaratkan penggunaan sekurang-kurangnya 3 (tiga) data pembanding yang relevan dan "
                "telah terverifikasi secara fisik maupun yuridis. Dalam praktik penilaian di Indonesia, proses penyesuaian (*adjustment*) "
                "dilakukan secara sistematis melalui matriks penyesuaian multi-parameter yang mencakup dimensi-dimensi kritis: "
                "(1) **Legalitas Kepemilikan**, mengukur premi dan diskon status hak atas tanah di mana Sertifikat Hak Milik (SHM) dijadikan "
                "basis pembanding 1,0, Sertifikat Hak Guna Bangunan (HGB) disesuaikan berdasarkan sisa masa berlaku hak dan estimasi biaya "
                "perpanjangan/peningkatan hak (diskon -5% hingga -10%), serta Hak Pakai atau Girik/Letter C dengan penalti risiko legalitas (-15% "
                "hingga -25%); (2) **Karakteristik Fisik dan Geometri Tapak**, meliputi rasio lebar depan terhadap kedalaman (*frontage-to-depth "
                "ratio*), bentuk tapak (tanah beraturan persegi/persegi panjang versus bentuk L), penalti lokasi tusuk sate (*T-junction penalty* "
                "berkisar -5% hingga -10% akibat faktor kebisingan, paparan lampu kendaraan, dan risiko benturan), serta apresiasi bentuk kantong "
                "semar (*cul-de-sac/rear widening* dengan premi privasi hingga +5%); (3) **Aksesibilitas dan Lebar Muka Jalan** (*Right of Way* / "
                "ROW), yang diklasifikasikan secara berjenjang (<3 meter untuk jalan lingkungan sempit/motor, 3-5 meter untuk akses mobil tunggal, "
                "6-8 meter untuk simpangan dua mobil, dan >8 meter untuk jalan kolektor/arteri); (4) **Elevasi Tapak dan Risiko Lingkungan**, "
                "menilai ketinggian bidang tanah terhadap muka jalan eksisting (tapak rata jalan, tapak lebih tinggi/bebas banjir, atau tapak "
                "lebih rendah dengan penalti risiko genangan air sebesar -5% hingga -15% yang merefleksikan estimasi biaya urukan dan pematangan "
                "tanah); serta (5) **Kesesuaian Rencana Tata Ruang** (RDTR), yang mengikat intensitas pemanfaatan ruang mencakup Koefisien "
                "Dasar Bangunan (KDB), Koefisien Lantai Bangunan (KLB), dan Garis Sempadan Bangunan (GSB) yang menentukan batas kapasitas "
                "pengembangan tertinggi dan terbaik (*Highest and Best Use* / HBU)."
            )
            update_paragraph_text(p, t_adj, default_size=12)

        # 3.1.3 JLL GRETI & Bargaining Discount
        elif p.text.startswith("Pasar properti di Indonesia tergolong sebagai pasar yang tidak sempurna"):
            t_greti = (
                "Pasar properti di Indonesia tergolong sebagai pasar yang tidak sempurna (*imperfect market*) dengan tingkat keterbukaan "
                "informasi yang terbatas. Berdasarkan laporan *Global Real Estate Transparency Index* (GRETI 2024) yang dipublikasikan oleh "
                "Jones Lang LaSalle (JLL), Indonesia menempati peringkat ke-40 dunia dalam kategori *Semi-Transparent* (Tier 4). Posisi ini "
                "tertinggal jauh dibandingkan negara-negara maju seperti Inggris Raya dan Australia yang berada pada peringkat puncak kategori "
                "*Highly Transparent* (Tier 1), Singapura pada peringkat ke-13 (*Transparent* - Tier 2), maupun Malaysia pada peringkat ke-26 "
                "(*Transparent* - Tier 2). Dalam kondisi pasar semi-transparan seperti di Indonesia, transaksi jual beli riil tidak "
                "tercatat dalam basis data publik yang terbuka, sehingga penilai publik sangat bergantung pada data penawaran (*asking price*) "
                "yang dipublikasikan melalui media sosial, situs portal properti daring, maupun papan penawaran di lokasi."
            )
            update_paragraph_text(p, t_greti, default_size=12)

        elif p.text.startswith("Untuk menjembatani perbedaan antara harga penawaran dengan perkiraan harga transaksi"):
            t_disc = (
                "Untuk menjembatani perbedaan antara harga penawaran dengan perkiraan harga transaksi riil, penilai melakukan penyesuaian "
                "jenis data (*data-type adjustment*) berupa pemotongan diskon tawar-menawar (*bargaining discount*). Diskon ini merupakan "
                "representasi marjin negosiasi psikologis antara ekspektasi penjual (*vendor's aspirational pricing*) dengan daya beli pembeli. "
                "Dalam praktik industri penilaian di Indonesia, besaran diskon tawar-menawar berkisar antara -5% hingga -15%, tergantung pada "
                "jenis properti, likuiditas pasar lokal, dan kondisi ekonomi makro. Pada segmen residensial menengah-bawah dengan likuiditas tinggi, "
                "diskon tawar-menawar umumnya berkisar antara 5% hingga 10%, sedangkan pada properti komersial bernilai tinggi, tanah mentah "
                "skala besar, atau properti industri dengan likuiditas rendah, diskon tawar-menawar dapat mencapai 10% hingga 15%."
            )
            update_paragraph_text(p, t_disc, default_size=12)

        # 3.1.4 ISO 19152 LADM & World Bank
        elif p.text.startswith("4. Locurcio, Morano, Tajani, & Di Liddo (2020)"):
            # Update this and append ISO 19152 & World Bank
            t_locurcio = (
                "4. Locurcio, Morano, Tajani, & Di Liddo (2020) dalam jurnal *Sustainability* [DOI: 10.3390/su12114780] mengembangkan model "
                "penilaian berbasis GIS yang mampu mengisolasi pengaruh fasilitas perkotaan terhadap pembentukan harga properti, membuktikan "
                "bahwa kedekatan dengan simpul transportasi umum menyumbang premi nilai positif yang terukur."
            )
            update_paragraph_text(p, t_locurcio, default_size=12)

    # Insert ISO 19152 and World Bank right before 3.1.5 Kewajiban Pangkalan Data
    p_kewajiban = None
    for p in doc.paragraphs:
        if p.text.startswith("3.1.5 Kewajiban Pangkalan Data Penilaian"):
            p_kewajiban = p
            break

    if p_kewajiban:
        t_iso = (
            "Perkembangan teknologi geospasial dalam penilaian properti secara global telah distandarisasi melalui *International Organization "
            "for Standardization* (ISO 19152: *Land Administration Domain Model* - LADM Part 4 *Valuation Information*). Model konseptual ini "
            "menetapkan integrasi terpadu antara empat entitas kunci: *ValuationUnit* (unit penaksiran tunggal yang di Indonesia setara dengan NOP "
            "atau Nomor Identifikasi Bidang Tanah / NIB), *SpatialUnit* (geometri spasial koordinat lintang-bujur dan poligon batas bidang), "
            "*TransactionRecord* (riwayat transaksi legal, tanggal kesepakatan, dan harga riil), serta *ValuationRecord* (opini Nilai Pasar "
            "dan Nilai Likuidasi yang dihasilkan penilai). Integrasi ini sejalan dengan panduan Bank Dunia (*World Bank Property Tax Diagnostic "
            "Manual*, 2020) yang menegaskan bahwa efektivitas sistem penilaian properti modern dan penilaian massal berbantuan komputer "
            "(*Computer-Assisted Mass Appraisal* / CAMA) bertumpu pada konektivitas digital yang menghubungkan data fisik kadaster spasial "
            "dengan catatan transaksi pasar aktual secara terotomatisasi."
        )
        insert_formatted_paragraph_before(p_kewajiban, t_iso, style='Normal')

    # 3.1.5 Detail PMK 101/2014 jo. PMK 228/2019
    for p in doc.paragraphs:
        if p.text.startswith("3. Pasal 43 ayat (5) huruf c: Mengatur bahwa KJPP wajib memelihara dan memperbarui"):
            t_pmk43 = (
                "3. Pasal 43 ayat (5) huruf c: Menetapkan bahwa KJPP wajib memelihara dan memperbarui pangkalan data penilaian berbasis teknologi "
                "informasi yang sekurang-kurangnya memuat: jenis data, sumber data, tanggal perolehan data, dan harga objek data penilaian."
            )
            update_paragraph_text(p, t_pmk43, default_size=12)
        elif p.text.startswith("4. Pasal 43 ayat (7): Menetapkan sanksi administratif"):
            t_pmk_sanksi = (
                "4. Pasal 43 ayat (7) jo. Pasal 58A dan Pasal 69: Menetapkan bahwa pemenuhan pangkalan data penilaian merupakan objek audit "
                "kepatuhan berkala oleh Pusat Pembinaan Profesi Keuangan (PPPK) Sekretariat Jenderal Kementerian Keuangan. Pelanggaran terhadap "
                "kewajiban penyelenggaraan pangkalan data dapat dikenakan sanksi administratif bertingkat, mulai dari peringatan tertulis, "
                "pembekuan izin usaha, hingga pencabutan izin usaha KJPP."
            )
            update_paragraph_text(p, t_pmk_sanksi, default_size=12)

    # 3.2.2 Detail Institutional Gap & Tax Avoidance
    for p in doc.paragraphs:
        if p.text.startswith("Kendala kedua adalah keterbatasan akses terhadap data transaksi riil di Indonesia"):
            t_gap = (
                "Kendala kedua adalah ketiadaan akses publik terhadap data transaksi riil di Indonesia akibat ketiadaan sistem pencatatan "
                "transaksi nasional yang terbuka. Akta Jual Beli (AJB) yang disahkan oleh Pejabat Pembuat Akta Tanah (PPAT) berstatus dokumen "
                "rahasia dan tidak dapat diakses secara publik. Kondisi ini diperparah oleh praktik penghindaran pajak (*tax avoidance*) yang lazim "
                "terjadi di pasar properti sekunder, di mana nilai transaksi yang dicantumkan dalam lembar formal AJB sengaja disamakan dengan "
                "Nilai Jual Objek Pajak (NJOP) terendah guna meminimalkan kewajiban Bea Perolehan Hak atas Tanah dan Bangunan (BPHTB 5%) bagi pembeli "
                "serta Pajak Penghasilan (PPh) Final Pengalihan Hak (2,5%) bagi penjual. Akibatnya, nilai formal pada akta PPAT sering kali "
                "mengalami distorsi (*under-invoiced*) sebesar 30% hingga 60% di bawah harga transaksi riil yang sebenarnya disepakati. Selain itu, "
                "terjadi fragmentasi kelembagaan di mana data pertanahan (Kementerian ATR/BPN), data fiskal PBB (Bapenda/DJP), survei harga primer "
                "(Bank Indonesia), dan data agunan perbankan (OJK dan bank-bank umum) berada dalam silo masing-masing tanpa interoperabilitas "
                "pertukaran data (*data interoperability*)."
            )
            update_paragraph_text(p, t_gap, default_size=12)

    # -------------------------------------------------------------
    # 4. BAB III: INSERT NEW SECTION 3.2.3 & RENUMBER EXISTING 3.2.3 TO 3.2.4
    # -------------------------------------------------------------
    print("Inserting New Section 3.2.3 and renumbering existing to 3.2.4...")
    p_existing_323 = None
    for p in doc.paragraphs:
        if p.text.strip() == "3.2.3 Pengelolaan Data Properti di KJPP TWR":
            p_existing_323 = p
            break

    if p_existing_323:
        # Renumber existing to 3.2.4
        update_paragraph_text(p_existing_323, "3.2.4 Pengelolaan Data Properti di KJPP TWR", align=WD_ALIGN_PARAGRAPH.LEFT)
        p_existing_323.style = 'Heading 3'

        # Build new section 3.2.3 before p_existing_323
        p_sec = insert_formatted_paragraph_before(
            p_existing_323,
            "3.2.3 Komparasi Sistem Pengelolaan Data Properti: Pengalaman Internasional dan Pelajaran bagi Indonesia",
            style='Heading 3',
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=6,
            space_before=12
        )

        p_sec_intro = insert_formatted_paragraph_before(
            p_existing_323,
            "Permasalahan asimetri informasi dan keterbatasan akses data transaksi properti yang dihadapi penilai di Indonesia bukanlah "
            "fenomena unik, melainkan tantangan klasik dalam ekonomi pertanahan yang telah berhasil dipecahkan oleh berbagai negara maju "
            "dan berkembang melalui pembentukan sistem informasi pertanahan statuter terintegrasi. Telaah kritis terhadap praktik terbaik "
            "(*international benchmarking*) di Malaysia, Singapura, Australia, dan Inggris Raya memberikan gambaran arsitektur kelembagaan "
            "dan teknologi yang esensial untuk memodernisasi pengelolaan data properti di Indonesia.",
            style='Normal'
        )

        # 3.2.3.1 Malaysia
        insert_formatted_paragraph_before(
            p_existing_323,
            "A. Sistem Pusat Informasi Harta Tanah Negara (NAPIC / JPPH) di Malaysia",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_malaysia = (
            "Di Malaysia, pengelolaan data properti nasional dipimpin oleh *Jabatan Penilaian dan Perkhidmatan Harta* (JPPH) di bawah "
            "Kementerian Keuangan Malaysia melalui divisi khususnya, *National Property Information Centre* (NAPIC), yang dibentuk pada "
            "tahun 1999 atas rekomendasi Dewan Tindakan Ekonomi Negara (*National Economic Action Council* - NEAC) pasca-Krisis Keuangan Asia. "
            "Keunggulan utama sistem Malaysia bertumpu pada **mekanisme penangkapan data transaksi statuter yang bersifat wajib secara hukum** "
            "berdasarkan *National Land Code* dan *Stamp Act 1949*. Setiap kali terjadi peralihan hak atas tanah atau bangunan, para pihak "
            "wajib mengisi formulir pindah milik (*Borang 14A*) yang diserahkan ke *Lembaga Hasil Dalam Negeri* (LHDN) untuk penetapan bea "
            "meterai (*stamp duty*). Berkas tersebut secara otomatis dirujuk ke Pejabat Penilai JPPH untuk dilakukan penilaian dan adjudikasi "
            "Nilai Pasar wajar (*adjudicated market value*). Apabila harga kontrak yang dilaporkan dalam akad jual beli lebih rendah daripada "
            "Nilai Pasar hasil penilaian JPPH, maka bea meterai dikenakan berdasarkan Nilai Pasar JPPH. Ketentuan ini secara mutlak "
            "menghilangkan insentif pelaporan harga palsu (*under-invoicing*).\n\n"
            "Data transaksi yang telah divalidasi oleh JPPH kemudian diintegrasikan ke dalam pangkalan data terpusat NAPIC melalui sistem "
            "PRISM (*Property Real Estate Information System Malaysia*). NAPIC secara rutin mempublikasikan *Property Market Report* (PMR) "
            "setiap semester yang mencakup lima sub-sektor (residensial, komersial, industri, pertanian, dan tanah pembangunan), menghitung "
            "*Malaysian House Price Index* (MHPI) berbasis model regresi hedonik, serta memantau unit properti yang belum terjual (*Property "
            "Overhang*) sebagai indikator risiko sistemik bagi Bank Negara Malaysia (BNM). Bagi penilai publik berlisensi LPPEH (*Lembaga "
            "Penilai, Pentaksir, Ejen Harta Tanah dan Pengurus Harta*), portal PRISM menyediakan akses data mikro transaksi historis yang "
            "lengkap dengan spesifikasi fisik, usia bangunan, dan luas tapak, sehingga penilai tidak perlu berspekulasi menggunakan data penawaran."
        )
        insert_formatted_paragraph_before(p_existing_323, t_malaysia, style='Normal')

        # 3.2.3.2 Singapura
        insert_formatted_paragraph_before(
            p_existing_323,
            "B. Sistem Caveat dan URA REALIS di Singapura",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_singapura = (
            "Singapura memiliki salah satu pasar properti paling transparan di dunia (peringkat 13 JLL GRETI 2024) berkat sinergi antara "
            "*Urban Redevelopment Authority* (URA), *Singapore Land Authority* (SLA), dan *Housing & Development Board* (HDB). Fondasi "
            "transparansi transaksi properti di Singapura bertumpu pada instrumen hukum yang disebut ***Caveat*** berdasarkan Bagian XII "
            "*Land Titles Act*. Segera setelah pembeli menandatangani opsi pembelian (*Option to Purchase* / OTP) atau perjanjian jual beli, "
            "pengacara pembeli mendaftarkan *caveat* secara elektronik (*e-Lodgement*) ke SLA. Pendaftaran *caveat* ini bukan sekadar formalitas, "
            "melainkan perlindungan hukum mutlak atas kepentingan ekuitas pembeli dan bank penyedia fasilitas KPR agar hak atas properti "
            "tersebut tidak dapat dialihkan atau dibebani oleh klaim pihak ketiga lainnya.\n\n"
            "Pencatatan *caveat* pada SLA memuat data yang sangat detail: harga pembelian riil (*Purchase Price*), harga per satuan luas "
            "(*per square foot / psf* dan *per square meter / psm*), luas lantai bersih (*floor area*), rentang lantai unit pada apartemen/strata "
            "title (*Storey Level Band*), masa hak (*tenure: freehold*, sewa 99 tahun, sewa 999 tahun), serta klasifikasi penjualan (*new sale, "
            "sub-sale, resale*). Data *caveat* ini dialirkan secara teratur ke dalam sistem *Real Estate Information System* (REALIS) URA yang "
            "dapat diakses oleh publik dan penilai berlisensi SISV (*Singapore Institute of Surveyors and Valuers*). Sementara itu, untuk pasar "
            "perumahan publik yang mencakup lebih dari 80% populasi, HDB menyediakan antarmuka pemrograman aplikasi (API) terbuka di *data.gov.sg* "
            "yang mencatat setiap transaksi *resale* flat perumahan publik secara harian. Ketersediaan data transaksi riil yang mendekati 100% "
            "ini membuat penilai di Singapura tidak pernah mengandalkan harga penawaran listing iklan untuk penilaian aset pasar aktif, dengan "
            "margin deviasi valuasi perbankan yang sangat rendah (<3%)."
        )
        insert_formatted_paragraph_before(p_existing_323, t_singapura, style='Normal')

        # 3.2.3.3 Australia
        insert_formatted_paragraph_before(
            p_existing_323,
            "C. Lembaga Valuer-General dan Ekosistem Data CoreLogic di Australia",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_australia = (
            "Di Australia, tata kelola data penilaian dan nilai tanah berada di bawah kewenangan pejabat statuter independen yang disebut "
            "***Valuer-General*** di masing-masing negara bagian (seperti NSW Valuer General berdasarkan *Valuation of Land Act 1916*). "
            "Sistem Australia mewajibkan pelaporan penjualan properti melalui pengisian formulir statuter ***Notice of Sale*** (eNOS) pada saat "
            "penyelesaian proses hukum jual beli (*settlement*). Informasi transaksi yang terekam meliputi identitas bidang tanah kadaster "
            "(*Lot/Section/Plan Number*), harga kontrak aktual, tanggal penandatanganan kontrak, tanggal penyelesaian transaksi (*settlement date*), "
            "luas tanah, serta kode zonasi tata ruang pemerintah daerah (*Local Council Zoning*).\n\n"
            "Keunggulan utama Australia terletak pada kemitraan publik-swasta yang solid. Data transaksi mentah (*Property Sales Information* / "
            "PSI) dari Valuer-General diintegrasikan oleh agregator data komersial seperti CoreLogic (RP Data). CoreLogic memperkaya data "
            "transaksi tersebut dengan data batas bidang kadaster (*Geoscape Australia*), citra satelit resolusi tinggi, riwayat izin perencanaan "
            "(*Development Applications*), dan denah lantai unit. Ekosistem ini terhubung langsung melalui API ke sistem persetujuan kredit seluruh "
            "bank komersial utama di Australia (CBA, Westpac, NAB, ANZ). Laporan penilaian yang dibuat oleh penilai bersertifikasi CPV (*Certified "
            "Practising Valuer*) dari *Australian Property Institute* (API) diaudit secara terotomatisasi (*Automated Collateral Audit*) "
            "terhadap klaster data transaksi resmi di sekitarnya, sehingga menjamin objektivitas penaksiran agunan dan meminimalisir risiko kredit macet."
        )
        insert_formatted_paragraph_before(p_existing_323, t_australia, style='Normal')

        # 3.2.3.4 Inggris Raya
        insert_formatted_paragraph_before(
            p_existing_323,
            "D. Keterbukaan Data Transaksi Properti (HM Land Registry) di Inggris Raya",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_uk = (
            "Inggris Raya menempati peringkat tertinggi dalam transparansi real estat global (Tier 1 *Highly Transparent* pada JLL GRETI) "
            "melalui kebijakan keterbukaan data (*open data*) yang diselenggarakan oleh *HM Land Registry* (HMLR). Berdasarkan ketentuan "
            "*Land Registration Act 2002*, setiap pengalihan hak atas tanah dan bangunan yang dialihkan dengan nilai imbalan (*value received*) "
            "wajib didaftarkan melalui penyerahan akta transfer resmi (*Transfer Deed* / Form TR1).\n\n"
            "Sejak tahun 2013, Pemerintah Inggris merilis data seluruh transaksi residensial di Inggris dan Wales ke dalam publikasi terbuka "
            "berjudul ***Price Paid Data*** (PPD) di bawah lisensi *Open Government Licence* (OGL v3.0). Berkas data ini dapat diunduh secara bebas "
            "tanpa royalti dan mencakup riwayat transaksi sejak tahun 1995 hingga saat ini (lebih dari 28 juta baris transaksi). Setiap baris "
            "data PPD memuat harga riil yang dibayarkan, tanggal transfer, kode pos lengkap (*postcode*), tipe properti (*detached, semi-detached, "
            "terraced, flat/maisonette*), indikator properti baru vs bekas, serta status kepemilikan (*freehold* atau *leasehold*). Kebijakan "
            "data terbuka ini menciptakan level transparansi mutlak, memungkinkan penilai publik anggota *Royal Institution of Chartered "
            "Surveyors* (RICS), akademisi, perbankan, dan masyarakat umum menganalisis tren pasar properti secara objektif dan akurat."
        )
        insert_formatted_paragraph_before(p_existing_323, t_uk, style='Normal')

        # 3.2.3.5 Comparative Table III.1
        insert_formatted_paragraph_before(
            p_existing_323,
            "E. Matriks Komparasi Sistem Tata Kelola Data Properti Internasional",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_tab_intro = (
            "Untuk mensintesis perbedaan karakteristik kelembagaan, aspek legal, dan implikasi operasional antara negara-negara tolok ukur "
            "dengan kondisi eksisting di Indonesia, disajikan matriks komparasi pada Tabel III.1 berikut."
        )
        insert_formatted_paragraph_before(p_existing_323, t_tab_intro, style='Normal')

        # Insert Table III.1
        build_comparative_table(doc, p_existing_323)

        # 3.2.3.6 Lessons for Indonesia & KJPP
        insert_formatted_paragraph_before(
            p_existing_323,
            "F. Pelajaran Strategis dan Implikasi bagi Profesi Penilai di Indonesia",
            style='Normal',
            default_font="Times New Roman",
            default_size=12,
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=6
        )
        t_lessons = (
            "Komparasi internasional di atas memberikan tiga pelajaran strategis yang sangat fundamental bagi perbaikan ekosistem penilaian "
            "dan tata kelola data properti di Indonesia:\n\n"
            "1. **Pentingnya Mandat Hukum Penangkapan Data Statuter:** Pengalaman Malaysia (NAPIC) dan Singapura (SLA Caveat) membuktikan "
            "bahwa basis data transaksi yang akurat tidak dapat dibangun hanya dengan mengandalkan survei sukarela atau penarikan data listing iklan. "
            "Dibutuhkan mandat regulasi yang mengaitkan pelaporan transaksi riil dengan proses administrasi hukum perpajakan (bea meterai/BPHTB) "
            "atau pendaftaran hak atas tanah. Mekanisme adjudikasi nilai pasar seperti yang dijalankan JPPH di Malaysia merupakan solusi paling "
            "efektif untuk mengeliminasi distorsi pelaporan harga palsu (*under-invoicing*) yang selama ini melumpuhkan akurasi data di Indonesia.\n\n"
            "2. **Kebutuhan Integrasi dan Interoperabilitas Antar-Instansi:** Pengelolaan data pertanahan dan fiskal tidak boleh terkotak-kotak "
            "dalam silo kelembagaan. Sinergi antara Kementerian Keuangan (PPPK dan DJP), Kementerian ATR/BPN, Bank Indonesia, Otoritas Jasa "
            "Keuangan, dan asosiasi profesi MAPPI mutlak diperlukan guna membangun repositori data properti nasional yang menghubungkan bidang "
            "tanah kadaster, catatan transaksi riil, dan penaksiran agunan perbankan sesuai kerangka ISO 19152 LADM Part 4.\n\n"
            "3. **Urgensi Inovasi Digital Mandiri di Tingkat KJPP:** Sembari menantikan terwujudnya kebijakan satu data properti nasional dari "
            "pemerintah pusat, inisiatif mandiri di tingkat Kantor Jasa Penilai Publik (KJPP) menjadi langkah yang sangat mendesak. KJPP tidak "
            "boleh terus bergantung pada lembar kerja Excel manual yang terfragmentasi. Pembangunan sistem pangkalan data spasial terpadu seperti "
            "SIPPRO-TWR di KJPP Totok Wasito dan Rekan menjadi bukti konkret bahwa penilai dapat mengadopsi prinsip-prinsip tata kelola data modern, "
            "menstandardisasi matriks penyesuaian pasar, serta mengintegrasikan analisis spasial GIS secara nir-biaya (*zero-cost architecture*). "
            "Inisiatif ini secara langsung menjawab kewajiban kepatuhan PMK Nomor 228/PMK.01/2019, menegakkan integritas opini nilai sesuai SPI 106 "
            "dan SPI 202, serta memitigasi risiko kredit agunan perbankan sesuai amanat POJK Nomor 40/POJK.03/2019."
        )
        insert_formatted_paragraph_before(p_existing_323, t_lessons, style='Normal')

    # -------------------------------------------------------------
    # 5. BAB IV: SIMPULAN DAN SARAN
    # -------------------------------------------------------------
    print("Enriching Bab IV Simpulan dan Saran...")
    for p in doc.paragraphs:
        if p.text.startswith("1. Pencarian data pasar pembanding di lapangan menghadapi kendala utama berupa"):
            t_simp1 = (
                "1. Pencarian data pasar pembanding di lapangan menghadapi kendala struktural berupa asimetri informasi akut (*acute "
                "information asymmetry*) dan ketiadaan repositori transaksi properti nasional yang terbuka. Berbeda dengan negara-negara "
                "maju dan berkembang seperti Malaysia (NAPIC), Singapura (URA REALIS), Australia (NSW Valuer-General), dan Inggris Raya (HMLR) "
                "yang memiliki mekanisme penangkapan data transaksi statuter yang terintegrasi, penilai publik di Indonesia masih sangat "
                "bergantung pada data penawaran portal daring yang rentan distorsi ekspektasi penjual, iklan kedaluwarsa, dan bias subjektivitas "
                "diskon tawar-menawar (-5% hingga -15%)."
            )
            update_paragraph_text(p, t_simp1, default_size=12)
        elif p.text.startswith("2. Kondisi eksisting pengelolaan data properti di KJPP Totok Wasito dan Rekan telah"):
            t_simp2 = (
                "2. Kondisi eksisting pengelolaan data properti di KJPP Totok Wasito dan Rekan telah menghimpun ribuan data historis hasil "
                "inspeksi dan penugasan terdahulu, namun pengelolaannya masih terperangkap dalam lembar kerja tabular (spreadsheet) yang "
                "terfragmentasi, belum memiliki standardisasi skema basis data, rawan nilai hilang (*missing values*), serta tidak dilengkapi "
                "referensi geospasial sehingga menghambat efisiensi penelusuran data pembanding pra-survei."
            )
            update_paragraph_text(p, t_simp2, default_size=12)
        elif p.text.startswith("3. Rancang bangun pangkalan data spasial berbasis web (SIPPRO-TWR) berhasil"):
            t_simp3 = (
                "3. Rancang bangun pangkalan data spasial berbasis web (SIPPRO-TWR) berhasil mengadopsi prinsip hierarki bukti pasar IVS 105 "
                "dan model konseptual ISO 19152 *Land Administration Domain Model* (LADM) Part 4 *Valuation Information*. Dengan memanfaatkan "
                "arsitektur teknologi geospasial nir-biaya (*zero-cost architecture*: PostGIS, MapLibre GL, dan ubin peta terbuka OpenStreetMap/CARTO), "
                "sistem berhasil mendigitalisasi, membersihkan anomali string koordinat, menstandardisasi atribut fisik dan yuridis, serta memetakan "
                "1.511 titik data properti di wilayah Jabodetabek dan Banten secara presisi."
            )
            update_paragraph_text(p, t_simp3, default_size=12)
        elif p.text.startswith("4. Implementasi SIPPRO-TWR pada alur kerja penapisan pra-survei"):
            t_simp4 = (
                "4. Implementasi SIPPRO-TWR pada alur kerja penapisan pra-survei (*pre-survey screening*) terbukti meningkatkan efisiensi "
                "operasional secara signifikan. Berdasarkan pengujian simulasi pada enam objek penilaian riil, sistem berhasil memangkas rata-rata "
                "waktu penelusuran dan verifikasi data pembanding dari 185,0 menit (metode manual) menjadi 30,0 menit (metode SIPPRO-TWR), atau "
                "mencapai efisiensi penghematan waktu rata-rata sebesar 83,8%."
            )
            update_paragraph_text(p, t_simp4, default_size=12)
        elif p.text.startswith("5. Pengembangan SIPPRO-TWR mendukung kepatuhan teknis terhadap Standar Penilaian"):
            t_simp5 = (
                "5. Pengembangan SIPPRO-TWR mendukung kepatuhan teknis terhadap Standar Penilaian Indonesia (SPI 106 dan SPI 202) serta memenuhi "
                "mandat hukum penyelenggaraan pangkalan data berbasis teknologi informasi berdasarkan Peraturan Menteri Keuangan Nomor 228/PMK.01/2019 "
                "(Pasal 21 huruf h, Pasal 24 ayat (2) huruf i, dan Pasal 43 ayat (5) huruf c). Sistem ini juga memperkuat mitigasi risiko hukum "
                "dan transparansi penentuan Nilai Likuidasi agunan perbankan sesuai ketentuan Peraturan Otoritas Jasa Keuangan Nomor 40/POJK.03/2019."
            )
            update_paragraph_text(p, t_simp5, default_size=12)

    # Insert Section 4.2.4 (Saran bagi Pengambil Kebijakan dan Asosiasi Profesi) before DAFTAR PUSTAKA
    p_dp = None
    for p in doc.paragraphs:
        if p.text.strip() == "DAFTAR PUSTAKA":
            p_dp = p
            break

    if p_dp:
        insert_formatted_paragraph_before(
            p_dp,
            "4.2.4 Saran bagi Pengambil Kebijakan dan Asosiasi Profesi",
            style='Heading 3',
            align=WD_ALIGN_PARAGRAPH.LEFT,
            space_after=3,
            space_before=9
        )
        t_saran_kebijakan = (
            "1. Kementerian Keuangan (PPPK dan DJP) bersama Kementerian ATR/BPN disarankan untuk menginisiasi pembentukan Pusat Informasi "
            "Harta Tanah / Pangkalan Data Transaksi Properti Nasional (mengadopsi model sukses NAPIC Malaysia atau CoreLogic/Valuer-General "
            "Australia). Hal ini dapat diwujudkan dengan mewajibkan adjudikasi nilai pasar pada pelaporan instrumen pengalihan hak (AJB/Borang "
            "Pindah Milik) guna mengeliminasi praktik pelaporan harga palsu (*under-invoicing*) yang merugikan penerimaan pajak dan mengaburkan "
            "transparansi pasar properti.\n\n"
            "2. Otoritas Jasa Keuangan (OJK) dan Bank Indonesia disarankan mendorong integrasi data valuasi agunan kredit perbankan yang "
            "dihasilkan oleh KJPP ke dalam repositori agregat risiko kredit nasional. Langkah ini akan meningkatkan efektivitas pemantauan "
            "kesehatan portofolio kredit perbankan, mempercepat audit kepatuhan agunan POJK Nomor 40/POJK.03/2019, serta mencegah penumpukan "
            "risiko sistemik akibat kredit bermasalah (*non-performing loan*).\n\n"
            "3. Masyarakat Profesi Penilai Indonesia (MAPPI) disarankan untuk menyusun pedoman teknis operasional mengenai standardisasi "
            "skema pangkalan data penilaian berbasis ISO 19152 *Land Administration Domain Model* (LADM) Part 4, serta menyelenggarakan studi "
            "empiris berkala untuk mengkalibrasi besaran diskon tawar-menawar (*bargaining discount*) dan matriks penyesuaian fisik-yuridis "
            "pada berbagai sub-pasar properti di Indonesia."
        )
        insert_formatted_paragraph_before(p_dp, t_saran_kebijakan, style='Normal')

    # -------------------------------------------------------------
    # 6. DAFTAR PUSTAKA: COMPLETE APA CITATIONS
    # -------------------------------------------------------------
    print("Updating Daftar Pustaka...")
    # Find start of references (paragraphs after P_DP)
    dp_idx = None
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip() == "DAFTAR PUSTAKA":
            dp_idx = i
            break

    if dp_idx is not None:
        # Clear existing bibliography paragraphs after DAFTAR PUSTAKA
        existing_bib_count = len(doc.paragraphs) - (dp_idx + 1)
        for _ in range(existing_bib_count):
            p_to_remove = doc.paragraphs[dp_idx + 1]
            p_to_remove._element.getparent().remove(p_to_remove._element)

        # Full APA 7th Edition Bibliography
        references = [
            "Atiqi, F., Dimyati, M., Gamal, A., & Pramayuda, A. (2022). Urban Physical Characteristics and Land Value: A Case Study of Jakarta, Indonesia. *Land*, 11(12), 2235. https://doi.org/10.3390/land11122235",
            "Australian Property Institute. (2020). *Australia and New Zealand Valuation and Property Guidance Notes (ANZVGN)*. Deakin: Australian Property Institute.",
            "Bank Indonesia. (2024). *Survei Harga Properti Residensial (SHPR) Pasar Primer Triwulan II-2024*. Jakarta: Departemen Komunikasi Bank Indonesia.",
            "Bayan, B., Roy, S., & Garg, P. K. (2022). Design and Development of Web-GIS-Based Real Estate Information System. *Journal of Geovisualization and Spatial Analysis*, 6(2), 27. https://doi.org/10.1007/s41651-022-00122-3",
            "Direktorat Jenderal Kekayaan Negara. (2021). *Modul Pelatihan Penilaian Properti Residensial Berbasis Pendekatan Pasar*. Jakarta: Kementerian Keuangan Republik Indonesia.",
            "HM Land Registry. (2024). *Price Paid Data: Open Government Licence Documentation and Technical Specifications*. London: Her Majesty's Land Registry. https://www.gov.uk/guidance/about-the-price-paid-data",
            "International Organization for Standardization. (2024). *ISO 19152-4: Geographic information — Land Administration Domain Model (LADM) — Part 4: Valuation information*. Geneva: ISO.",
            "International Valuation Standards Council. (2022). *International Valuation Standards (IVS 105: Valuation Approaches and Methods)*. London: IVSC.",
            "Irawan, D., & Tjahjono, E. D. (2017). Pengantar Praktik Penilaian (Appraisal) Kebutuhan Perbankan dan Standar Penilaian Indonesia. *Jurnal Keuangan dan Perbankan*, 14(2), 115–128.",
            "Jones Lang LaSalle. (2024). *Global Real Estate Transparency Index (GRETI) 2024: Transparency in the Age of Technology and Sustainability*. Chicago: JLL Research.",
            "Kementerian Keuangan Republik Indonesia. (2021). *Pedoman Teknis Penilaian Barang Milik Negara Menggunakan Pendekatan Perbandingan Data Pasar*. Jakarta: Direktorat Penilaian DJKN.",
            "Locurcio, M., Morano, P., Tajani, F., & Di Liddo, F. (2020). An Innovative Territorial Information Tool for the Assessment of Urban Amenities: A GIS-Based Hedonic Pricing Model. *Sustainability*, 12(11), 4780. https://doi.org/10.3390/su12114780",
            "Malaysia Valuation and Property Services Department. (2024). *Property Market Report 2023 & Malaysian House Price Index (MHPI) Methodology*. Putrajaya: National Property Information Centre (NAPIC), Ministry of Finance Malaysia.",
            "Masyarakat Profesi Penilai Indonesia. (2018). *Kode Etik Penilai Indonesia dan Standar Penilaian Indonesia (KEPI & SPI Edisi VII 2018)*. Jakarta: Komite Penyusun Standar Penilaian Indonesia (KPSPI - MAPPI).",
            "Masyarakat Profesi Penilai Indonesia. (2023). *Petunjuk Praktik Penilaian (PPI) 04: Penilaian Properti Agunan Kredit Perbankan*. Jakarta: MAPPI.",
            "Masyarakat Profesi Penilai Indonesia. (2024). *Pedoman Teknis Biaya Bangunan (BTB) 2024*. Jakarta: MAPPI.",
            "New South Wales Valuer General. (2023). *Valuer General Data Guide: Property Sales Information (PSI) Data Files*. Sydney: Department of Planning, Industry and Environment.",
            "Nor, A. M., Audu, M. A., & Mohamed, A. (2025). Spatial Hedonic Modelling of Residential Property Prices Using Open Geodata. *Frontiers in Built Environment*, 11, 1489021. https://doi.org/10.3389/fbuil.2025.1489021",
            "Otoritas Jasa Keuangan. (2019). *Peraturan Otoritas Jasa Keuangan Nomor 40/POJK.03/2019 tentang Penilaian Kualitas Aset Bank Umum*. Jakarta: Lembaran Negara Republik Indonesia.",
            "Peraturan Menteri Keuangan Republik Indonesia Nomor 101/PMK.01/2014 tentang Penilai Publik. Berita Negara Republik Indonesia Tahun 2014 Nomor 766.",
            "Peraturan Menteri Keuangan Republik Indonesia Nomor 186/PMK.010/2019 tentang Klasifikasi Objek Pajak Bumi dan Bangunan. Berita Negara Republik Indonesia Tahun 2019 Nomor 1583.",
            "Peraturan Menteri Keuangan Republik Indonesia Nomor 228/PMK.01/2019 tentang Perubahan Kedua atas Peraturan Menteri Keuangan Nomor 101/PMK.01/2014 tentang Penilai Publik. Berita Negara Republik Indonesia Tahun 2019 Nomor 1761.",
            "Piras, G., Muzi, F., & Zylka, K. (2024). Spatial Data Integration and Quality Control in Automated Valuation Models. *Applied Sciences*, 14(11), 4757. https://doi.org/10.3390/app14114757",
            "Politeknik Keuangan Negara STAN. (2024). *Pedoman Penyelenggaraan Praktik Kerja Lapangan / Magang Program Studi Diploma III PBB/Penilai*. Tangerang Selatan: PKN STAN.",
            "Singapore Urban Redevelopment Authority. (2024). *REALIS: Real Estate Information System and Private Property Transaction Registry Specifications*. Singapore: URA.",
            "Tajani, F., Morano, P., Salvo, F., & De Ruggiero, M. (2021). Automated Valuation Models: Spatial Statistics and Machine Learning Approaches for Mass Appraisal. *Land Use Policy*, 108, 105562. https://doi.org/10.1016/j.landusepol.2021.105562",
            "Undang-Undang Republik Indonesia Nomor 2 Tahun 2012 tentang Pengadaan Tanah bagi Pembangunan untuk Kepentingan Umum. Lembaran Negara Republik Indonesia Tahun 2012 Nomor 22.",
            "World Bank. (2020). *Property Tax Diagnostic Manual: A Guidance Note for Designing and Implementing Property Tax Reforms*. Washington, DC: The World Bank. https://doi.org/10.1596/34522",
            "Wyatt, P. (1997). The Development of a GIS-Based Property Information System for Real Estate Valuation. *International Journal of Geographical Information Science*, 11(5), 435–450. https://doi.org/10.1080/136588197242239"
        ]

        for ref in references:
            new_p = doc.add_paragraph("", style='Normal')
            add_markdown_runs(new_p, ref, default_size=12)
            # Hanging indent for APA style
            set_paragraph_properties(new_p, align=WD_ALIGN_PARAGRAPH.JUSTIFY, line_spacing=1.5, space_after=6)
            new_p.paragraph_format.left_indent = Cm(1.27)
            new_p.paragraph_format.first_line_indent = Cm(-1.27)

    print(f"Saving new document to {DST_FILE}...")
    doc.save(DST_FILE)
    print("Saved successfully!")

if __name__ == "__main__":
    main()
