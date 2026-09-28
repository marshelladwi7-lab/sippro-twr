import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    // 1. Sheet 1: Template Data Properti
    const templateRows = [
      {
        "JENIS PROPERTI": "Tanah & Bangunan",
        "ALAMAT": "Jl. Tebet Barat Dalam VII No. 14, RT 005/RW 03",
        "PROVINSI": "DKI Jakarta",
        "KOTA_KAB": "Jakarta Selatan",
        "KECAMATAN": "Tebet",
        "DESA_KELURAHAN": "Tebet Barat",
        "TITIK KOORDINAT": "-6.236125, 106.848912",
        "LUAS TANAH": 160,
        "LUAS BANGUNAN": 140,
        "KISARAN NILAI TANAH/M2": 18500000,
        "HARGA PENAWARAN": 3500000000,
        "HARGA TRANSAKSI": 3150000000,
        "TANGGAL DATA": "2026-03-01",
        "LEGALITAS": "SHM",
        "BENTUK TAPAK": "PERSEGI",
        "ROW JALAN": 7.0,
        "SUMBER DATA": "Broker Properti (Ray White Tebet)",
        "NAMA PEMBERI DATA": "Bpk. Hendra Gunawan",
        "NOMOR PEMBERI DATA": "081298765432",
        "SURVEYOR": "Rian Kusuma, S.T.",
        "REVIEWER": "Ir. Budi Santoso, MAPPI (Cert.)",
        "ADMIN": "ADM-JKT-01",
        "KETERANGAN": "Rumah tinggal 2 lantai terawat, jalan aspal mulus bebas banjir",
      },
      {
        "JENIS PROPERTI": "Tanah Kosong",
        "ALAMAT": "Jl. Margonda Raya KM 4 No. 88",
        "PROVINSI": "Jawa Barat",
        "KOTA_KAB": "Kota Depok",
        "KECAMATAN": "Beji",
        "DESA_KELURAHAN": "Pondok Cina",
        "TITIK KOORDINAT": "-6.371250, 106.832410",
        "LUAS TANAH": 350,
        "LUAS BANGUNAN": 0,
        "KISARAN NILAI TANAH/M2": 12000000,
        "HARGA PENAWARAN": 4500000000,
        "HARGA TRANSAKSI": 4200000000,
        "TANGGAL DATA": "2026-02-15",
        "LEGALITAS": "SHM",
        "BENTUK TAPAK": "PERSEGI",
        "ROW JALAN": 12.0,
        "SUMBER DATA": "Pemilik Langsung",
        "NAMA PEMBERI DATA": "Ibu Ratna Dewi",
        "NOMOR PEMBERI DATA": "081122334455",
        "SURVEYOR": "Dian Prasetyo, S.T.",
        "REVIEWER": "Ir. Budi Santoso, MAPPI (Cert.)",
        "ADMIN": "ADM-DPK-02",
        "KETERANGAN": "Komersial pinggir jalan utama Margonda, cocok untuk ruko / kantor",
      },
    ];

    const dataSheet = XLSX.utils.json_to_sheet(templateRows);

    // Set column widths for comfortable reading
    dataSheet["!cols"] = [
      { wch: 20 }, // JENIS PROPERTI
      { wch: 38 }, // ALAMAT
      { wch: 16 }, // PROVINSI
      { wch: 18 }, // KOTA_KAB
      { wch: 16 }, // KECAMATAN
      { wch: 18 }, // DESA_KELURAHAN
      { wch: 24 }, // TITIK KOORDINAT
      { wch: 14 }, // LUAS TANAH
      { wch: 16 }, // LUAS BANGUNAN
      { wch: 24 }, // KISARAN NILAI TANAH/M2
      { wch: 18 }, // HARGA PENAWARAN
      { wch: 18 }, // HARGA TRANSAKSI
      { wch: 15 }, // TANGGAL DATA
      { wch: 12 }, // LEGALITAS
      { wch: 15 }, // BENTUK TAPAK
      { wch: 12 }, // ROW JALAN
      { wch: 25 }, // SUMBER DATA
      { wch: 24 }, // NAMA PEMBERI DATA
      { wch: 20 }, // NOMOR PEMBERI DATA
      { wch: 22 }, // SURVEYOR
      { wch: 25 }, // REVIEWER
      { wch: 14 }, // ADMIN
      { wch: 45 }, // KETERANGAN
    ];

    // 2. Sheet 2: Petunjuk Pengisian
    const petunjukRows = [
      {
        "KOLOM": "JENIS PROPERTI",
        "STATUS": "WAJIB",
        "TIPE DATA": "Pilihan",
        "PANDUAN PENGISIAN": "Pilihan baku: 'Tanah & Bangunan', 'Tanah Kosong', atau 'Tanah & Bangunan Diabaikan'",
        "CONTOH": "Tanah & Bangunan",
      },
      {
        "KOLOM": "ALAMAT",
        "STATUS": "WAJIB",
        "TIPE DATA": "Teks",
        "PANDUAN PENGISIAN": "Nama jalan, nomor bangunan, RT/RW, atau landmark pengenal",
        "CONTOH": "Jl. Tebet Barat Dalam VII No. 14",
      },
      {
        "KOLOM": "TITIK KOORDINAT",
        "STATUS": "WAJIB",
        "TIPE DATA": "Teks / Angka",
        "PANDUAN PENGISIAN": "Format: 'latitude, longitude' dalam WGS84 (EPSG:4326). Bisa berupa titik desimal atau koma",
        "CONTOH": "-6.236125, 106.848912",
      },
      {
        "KOLOM": "LUAS TANAH",
        "STATUS": "WAJIB",
        "TIPE DATA": "Angka (m²)",
        "PANDUAN PENGISIAN": "Luas tanah objek pembanding dalam meter persegi",
        "CONTOH": "160",
      },
      {
        "KOLOM": "LUAS BANGUNAN",
        "STATUS": "WAJIB",
        "TIPE DATA": "Angka (m²)",
        "PANDUAN PENGISIAN": "Luas fisik bangunan dalam meter persegi (isi 0 jika tanah kosong)",
        "CONTOH": "140",
      },
      {
        "KOLOM": "KISARAN NILAI TANAH/M2",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Angka (IDR)",
        "PANDUAN PENGISIAN": "Indikasi nilai pasar tanah per meter persegi (Rupiah)",
        "CONTOH": "18500000",
      },
      {
        "KOLOM": "TANGGAL DATA",
        "STATUS": "WAJIB",
        "TIPE DATA": "Tanggal / Teks",
        "PANDUAN PENGISIAN": "Format YYYY-MM-DD atau DD/MM/YYYY saat data diverifikasi/disurvei",
        "CONTOH": "2026-03-01",
      },
      {
        "KOLOM": "SUMBER DATA",
        "STATUS": "DIANJURKAN",
        "TIPE DATA": "Teks",
        "PANDUAN PENGISIAN": "Asal muasal data pembanding (contoh: Broker, Pemilik Langsung, Bank, Iklan Online, Teman)",
        "CONTOH": "Broker Properti (Ray White Tebet)",
      },
      {
        "KOLOM": "NAMA PEMBERI DATA",
        "STATUS": "DIANJURKAN",
        "TIPE DATA": "Teks",
        "PANDUAN PENGISIAN": "Nama lengkap informan, perantara, atau pemilik yang memberikan informasi",
        "CONTOH": "Bpk. Hendra Gunawan",
      },
      {
        "KOLOM": "NOMOR PEMBERI DATA",
        "STATUS": "DIANJURKAN",
        "TIPE DATA": "Teks / Angka",
        "PANDUAN PENGISIAN": "Nomor telepon / WhatsApp narasumber pemberi data untuk audit & rekonfirmasi",
        "CONTOH": "081298765432",
      },
      {
        "KOLOM": "SURVEYOR",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Teks",
        "PANDUAN PENGISIAN": "Nama penilai / surveyor yang memeriksa lapangan",
        "CONTOH": "Rian Kusuma, S.T.",
      },
      {
        "KOLOM": "REVIEWER",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Teks",
        "PANDUAN PENGISIAN": "Nama penilai bersertifikat MAPPI yang me-review data",
        "CONTOH": "Ir. Budi Santoso, MAPPI (Cert.)",
      },
      {
        "KOLOM": "LEGALITAS",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Pilihan",
        "PANDUAN PENGISIAN": "SHM, HGB, Hak Pakai, Girik, dll (Default: SHM)",
        "CONTOH": "SHM",
      },
      {
        "KOLOM": "BENTUK TAPAK",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Pilihan",
        "PANDUAN PENGISIAN": "PERSEGI, L-SHAPE, TUSUK SATE, KANTONG SEMAR",
        "CONTOH": "PERSEGI",
      },
      {
        "KOLOM": "ROW JALAN",
        "STATUS": "OPSIONAL",
        "TIPE DATA": "Angka (meter)",
        "PANDUAN PENGISIAN": "Lebar badan jalan depan objek properti (meter)",
        "CONTOH": "7.0",
      },
    ];

    const petunjukSheet = XLSX.utils.json_to_sheet(petunjukRows);
    petunjukSheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 60 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, dataSheet, "LIST_DATA_PROPERTI");
    XLSX.utils.book_append_sheet(workbook, petunjukSheet, "PETUNJUK_PENGISIAN");

    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="Template_Import_Bank_Data_TWR.xlsx"',
      },
    });
  } catch (error) {
    console.error("Failed to generate template excel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Excel template" },
      { status: 500 }
    );
  }
}
