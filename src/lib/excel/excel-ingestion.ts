import * as XLSX from "xlsx";
import { sanitizeCoordinate, SanitizedCoordinate } from "./coordinate-sanitizer";

export type PropertyType =
  | "TANAH_BANGUNAN"
  | "TANAH_KOSONG"
  | "TANAH_BANGUNAN_DIABAIKAN";

export interface ParsedComparableRecord {
  legacyNo: number;
  jenisProperti: PropertyType;
  alamat: string;
  provinsi: string;
  kotaKab: string;
  kecamatan: string;
  desaKelurahan: string;
  coordinate: SanitizedCoordinate | null;
  luasTanah: number;
  luasBangunan: number;
  kisaranNilaiTanah: number | null; // null represents PENDING_VALUATION
  tanggalData: string; // ISO 8601
  surveyor: string;
  reviewer: string;
  admin: string;
  isOutlierArea: boolean; // luas_tanah > 500,000 m2
  vehiclePlate?: string;
  sumberData?: string;
  namaPemberiData?: string;
  nomorPemberiData?: string;
  hargaPenawaran?: number | null;
  hargaTransaksi?: number | null;
  legalitas?: string;
  tapak?: string;
  rowJalan?: number;
  keterangan?: string;
}

export interface Sheet1KecamatanMetadata {
  kecamatan: string;
  kode: string;
  kelurahanDesa: string;
  luasKm2: number;
  surveyor: string;
  noRekeningSurveyor: string;
  analis: string;
  noRekeningAnalis: string;
}

export interface IngestionResult {
  records: ParsedComparableRecord[];
  kecamatanMetadata: Sheet1KecamatanMetadata[];
  surveyorVehicles: Record<string, string>;
  totalRows: number;
  validCoordinateCount: number;
  reconstructedCoordinateCount: number;
  outlierCount: number;
  pendingValuationCount: number;
}

export function mapPropertyType(rawType: string | undefined): PropertyType {
  if (!rawType) return "TANAH_BANGUNAN";
  const normalized = rawType.toUpperCase().trim();
  if (normalized.includes("DIABAIKAN")) return "TANAH_BANGUNAN_DIABAIKAN";
  if (normalized.includes("KOSONG")) return "TANAH_KOSONG";
  return "TANAH_BANGUNAN";
}

export function parseExcelDate(serialOrStr: any): string {
  if (!serialOrStr) return new Date().toISOString().split("T")[0];
  if (typeof serialOrStr === "number") {
    // Excel base date Dec 30 1899
    const utcDays = Math.floor(serialOrStr - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }
  const parsed = new Date(serialOrStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  return String(serialOrStr);
}

function getRowField(row: Record<string, any>, possibleKeys: string[]): any {
  if (!row || typeof row !== "object") return undefined;

  // 1. Direct key match
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }

  // 2. Normalized alphanumeric key match
  const rowEntries = Object.entries(row);
  const normalizedMap = new Map<string, any>();
  for (const [k, v] of rowEntries) {
    if (v !== undefined && v !== null && v !== "") {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      normalizedMap.set(cleanKey, v);
    }
  }

  for (const key of possibleKeys) {
    const cleanTarget = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedMap.has(cleanTarget)) {
      return normalizedMap.get(cleanTarget);
    }
  }

  return undefined;
}

export function ingestDbTahap1Buffer(buffer: Buffer | Uint8Array): IngestionResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // 1. Ingest Surveyor vehicle plates from "Surveyor" sheet
  const surveyorVehicles: Record<string, string> = {};
  if (workbook.Sheets["Surveyor"]) {
    const surveyorSheet = workbook.Sheets["Surveyor"];
    const surveyorCols = ["B", "G", "L", "Q"];
    for (const col of surveyorCols) {
      const nameCell = surveyorSheet[`${col}2`];
      const plateCell = surveyorSheet[`${col}25`];
      if (nameCell && nameCell.v && plateCell && plateCell.v) {
        surveyorVehicles[String(nameCell.v).trim().toUpperCase()] = String(
          plateCell.v
        ).trim();
      }
    }
  }

  // 2. Ingest operational metadata from "Sheet1" ONLY if List_DP exists (legacy DB Tahap 1 format)
  const kecamatanMetadata: Sheet1KecamatanMetadata[] = [];
  if (workbook.Sheets["List_DP"] && workbook.Sheets["Sheet1"]) {
    const rawSheet1 = XLSX.utils.sheet_to_json<any>(workbook.Sheets["Sheet1"], {
      range: 1, // Header at row 2
      header: ["kecamatan", "kode", "kelurahanDesa", "luasKm2", "surveyor", "noRekeningSurveyor", "analis", "noRekeningAnalis"],
    });

    for (const row of rawSheet1) {
      if (row.kecamatan && row.kode) {
        kecamatanMetadata.push({
          kecamatan: String(row.kecamatan).trim(),
          kode: String(row.kode).trim(),
          kelurahanDesa: String(row.kelurahanDesa || "").trim(),
          luasKm2: typeof row.luasKm2 === "number" ? row.luasKm2 : parseFloat(row.luasKm2) || 0,
          surveyor: String(row.surveyor || "").trim(),
          noRekeningSurveyor: String(row.noRekeningSurveyor || "").trim(),
          analis: String(row.analis || "").trim(),
          noRekeningAnalis: String(row.noRekeningAnalis || "").trim(),
        });
      }
    }
  }

  // 3. Select primary property data sheet with intelligent prioritization
  let listSheet: XLSX.WorkSheet | undefined;
  const candidateSheetNames = [
    "LIST_DATA_PROPERTI",
    "List_DP",
    "DATA_PROPERTI",
    "Bank_Data_Properti",
    "Sheet1",
  ];

  for (const name of candidateSheetNames) {
    if (workbook.Sheets[name]) {
      // If Sheet1, only skip if List_DP exists (DB Tahap 1 metadata)
      if (name === "Sheet1" && workbook.Sheets["List_DP"]) {
        continue;
      }
      listSheet = workbook.Sheets[name];
      break;
    }
  }

  if (!listSheet) {
    listSheet = workbook.Sheets[workbook.SheetNames[0]];
  }

  const rawRows = XLSX.utils.sheet_to_json<any>(listSheet);

  const records: ParsedComparableRecord[] = [];
  let validCoordinateCount = 0;
  let reconstructedCoordinateCount = 0;
  let outlierCount = 0;
  let pendingValuationCount = 0;

  for (const row of rawRows) {
    const rawCoordStr = String(
      getRowField(row, [
        "titik koordinat",
        "latlng",
        "lat_lng",
        "koordinat",
        "coordinate",
        "titik_koordinat",
        "lokasi",
      ]) || ""
    );
    const sanitizedCoord = sanitizeCoordinate(rawCoordStr);

    if (sanitizedCoord?.isValidIndonesianBbox) {
      validCoordinateCount++;
      if (sanitizedCoord.isReconstructed) {
        reconstructedCoordinateCount++;
      }
    }

    const rawLT = getRowField(row, [
      "luas tanah",
      "luas_tanah",
      "luas tanah m2",
      "luas_tanah_m2",
      "lt",
      "lt m2",
      "lt_m2",
    ]);
    const luasTanah =
      typeof rawLT === "number" ? rawLT : parseFloat(String(rawLT || 0)) || 0;

    const rawLB = getRowField(row, [
      "luas bangunan",
      "luas_bangunan",
      "luas bangunan m2",
      "luas_bangunan_m2",
      "lb",
      "lb m2",
      "lb_m2",
    ]);
    const luasBangunan =
      typeof rawLB === "number" ? rawLB : parseFloat(String(rawLB || 0)) || 0;

    const rawNilai = getRowField(row, [
      "kisaran nilai tanah/m2",
      "kisaran nilai tanah",
      "kisaran_nilai_tanah",
      "kisaran_nilai_tanah_m2",
      "nilai tanah",
      "nilai tanah/m2",
      "nilai_tanah",
      "harga tanah/m2",
      "harga per m2",
    ]);
    let kisaranNilaiTanah: number | null = null;
    if (rawNilai !== undefined && rawNilai !== null && rawNilai !== "") {
      const parsed =
        typeof rawNilai === "number"
          ? rawNilai
          : parseFloat(String(rawNilai).replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) {
        kisaranNilaiTanah = parsed;
      }
    }

    if (kisaranNilaiTanah === null) {
      pendingValuationCount++;
    }

    const isOutlierArea = luasTanah > 500000;
    if (isOutlierArea) {
      outlierCount++;
    }

    const rawAlamat = String(
      getRowField(row, [
        "alamat",
        "alamat lengkap",
        "alamat_lengkap",
        "lokasi properti",
        "nama jalan",
      ]) || ""
    ).trim();

    const rawProvinsi = String(
      getRowField(row, ["provinsi", "propinsi", "province"]) || "Jawa Barat"
    ).trim();

    const rawKota = String(
      getRowField(row, [
        "kota_kab",
        "kota kab",
        "kota",
        "kabupaten",
        "kota/kab",
        "kab",
      ]) || ""
    ).trim();

    const rawKecamatan = String(
      getRowField(row, ["kecamatan", "distrik"]) || ""
    ).trim();

    const rawDesa = String(
      getRowField(row, [
        "desa_kelurahan",
        "desa kelurahan",
        "kelurahan",
        "desa",
      ]) || ""
    ).trim();

    const rawTanggal = getRowField(row, [
      "tanggal data",
      "tanggal_data",
      "tanggal",
      "tgl data",
      "tgl",
    ]);
    const tanggalData = parseExcelDate(rawTanggal);

    const rawPenawaran = getRowField(row, [
      "harga penawaran",
      "harga_penawaran",
      "penawaran",
      "offering price",
    ]);
    const hargaPenawaran =
      rawPenawaran !== undefined && rawPenawaran !== null && rawPenawaran !== ""
        ? typeof rawPenawaran === "number"
          ? rawPenawaran
          : parseFloat(String(rawPenawaran).replace(/[^0-9.]/g, "")) || null
        : null;

    const rawTransaksi = getRowField(row, [
      "harga transaksi",
      "harga_transaksi",
      "transaksi",
      "deal price",
    ]);
    const hargaTransaksi =
      rawTransaksi !== undefined && rawTransaksi !== null && rawTransaksi !== ""
        ? typeof rawTransaksi === "number"
          ? rawTransaksi
          : parseFloat(String(rawTransaksi).replace(/[^0-9.]/g, "")) || null
        : null;

    const rawLegalitas = getRowField(row, ["legalitas", "surat hak", "sertifikat"]);
    const rawTapak = getRowField(row, ["bentuk tapak", "bentuk_tapak", "tapak", "bentuk tanah"]);
    const rawRow = getRowField(row, ["row jalan", "row_jalan", "lebar jalan", "row"]);
    const rawSumber = getRowField(row, ["sumber data", "sumber_data", "sumber", "data sumber"]);
    const rawNamaPemberi = getRowField(row, [
      "nama pemberi data",
      "nama_pemberi_data",
      "pemberi data",
      "informan",
      "narasumber",
    ]);
    const rawNoPemberi = getRowField(row, [
      "nomor pemberi data",
      "nomor_pemberi_data",
      "no pemberi data",
      "no_pemberi_data",
      "no hp pemberi data",
      "kontak informan",
      "no telp",
      "telepon",
    ]);

    const surveyorName = String(
      getRowField(row, ["surveyor", "nama surveyor", "surveyor ots", "penilai"]) || ""
    ).trim();
    const vehiclePlate = surveyorVehicles[surveyorName.toUpperCase()];

    const rawNo = getRowField(row, ["no", "nomor", "legacy_no", "id"]);

    records.push({
      legacyNo: Number(rawNo || records.length + 1),
      jenisProperti: mapPropertyType(
        getRowField(row, ["jenis properti", "jenis_properti", "tipe properti"])
      ),
      alamat: rawAlamat,
      provinsi: rawProvinsi,
      kotaKab: rawKota,
      kecamatan: rawKecamatan,
      desaKelurahan: rawDesa,
      coordinate: sanitizedCoord,
      luasTanah,
      luasBangunan,
      kisaranNilaiTanah,
      tanggalData,
      surveyor: surveyorName,
      reviewer: String(
        getRowField(row, ["reviewer", "nama reviewer", "penelaah"]) || ""
      ).trim(),
      admin: String(
        getRowField(row, ["admin", "kode admin", "petugas admin"]) || ""
      ).trim(),
      isOutlierArea,
      vehiclePlate,
      sumberData: rawSumber ? String(rawSumber).trim() : undefined,
      namaPemberiData: rawNamaPemberi ? String(rawNamaPemberi).trim() : undefined,
      nomorPemberiData: rawNoPemberi ? String(rawNoPemberi).trim() : undefined,
      hargaPenawaran,
      hargaTransaksi,
      legalitas: rawLegalitas ? String(rawLegalitas).trim().toUpperCase() : undefined,
      tapak: rawTapak ? String(rawTapak).trim().toUpperCase() : undefined,
      rowJalan: rawRow ? parseFloat(String(rawRow)) || 6.0 : undefined,
      keterangan: getRowField(row, ["keterangan", "catatan", "deskripsi", "notes"])
        ? String(getRowField(row, ["keterangan", "catatan", "deskripsi", "notes"])).trim()
        : undefined,
    });
  }

  return {
    records,
    kecamatanMetadata,
    surveyorVehicles,
    totalRows: records.length,
    validCoordinateCount,
    reconstructedCoordinateCount,
    outlierCount,
    pendingValuationCount,
  };
}
