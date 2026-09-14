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

export function ingestDbTahap1Buffer(buffer: Buffer | Uint8Array): IngestionResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // 1. Ingest Surveyor vehicle plates from "Surveyor" sheet
  const surveyorVehicles: Record<string, string> = {};
  if (workbook.Sheets["Surveyor"]) {
    const surveyorSheet = workbook.Sheets["Surveyor"];
    // Surveyor sheet has names at row 2 and plates at row 25
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

  // 2. Ingest operational metadata from "Sheet1"
  const kecamatanMetadata: Sheet1KecamatanMetadata[] = [];
  if (workbook.Sheets["Sheet1"]) {
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

  // 3. Stream-parse "List_DP"
  const listSheet = workbook.Sheets["List_DP"] || workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<any>(listSheet);

  const records: ParsedComparableRecord[] = [];
  let validCoordinateCount = 0;
  let reconstructedCoordinateCount = 0;
  let outlierCount = 0;
  let pendingValuationCount = 0;

  for (const row of rawRows) {
    const rawCoordStr = row["latlng"] ?? row["LATLNG"] ?? row["Titik Koordinat"] ?? "";
    const sanitizedCoord = sanitizeCoordinate(rawCoordStr);

    if (sanitizedCoord?.isValidIndonesianBbox) {
      validCoordinateCount++;
      if (sanitizedCoord.isReconstructed) {
        reconstructedCoordinateCount++;
      }
    }

    const luasTanah = typeof row["luas_tanah"] === "number"
      ? row["luas_tanah"]
      : parseFloat(row["luas_tanah"]) || 0;

    const luasBangunan = typeof row["luas_bangunan"] === "number"
      ? row["luas_bangunan"]
      : parseFloat(row["luas_bangunan"]) || 0;

    const rawNilai = row["kisaran_nilai_tanah"] ?? row["KISARAN_NILAI_TANAH"];
    let kisaranNilaiTanah: number | null = null;
    if (rawNilai !== undefined && rawNilai !== null && rawNilai !== "") {
      const parsed = typeof rawNilai === "number" ? rawNilai : parseFloat(rawNilai);
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

    const surveyorName = String(row["surveyor"] || "").trim();
    const vehiclePlate = surveyorVehicles[surveyorName.toUpperCase()];

    records.push({
      legacyNo: Number(row["no"] || records.length + 1),
      jenisProperti: mapPropertyType(row["jenis_properti"]),
      alamat: String(row["alamat"] || "").trim(),
      provinsi: String(row["provinsi"] || "").trim(),
      kotaKab: String(row["kota_kab"] || "").trim(),
      kecamatan: String(row["kecamatan"] || "").trim(),
      desaKelurahan: String(row["desa_kelurahan"] || "").trim(),
      coordinate: sanitizedCoord,
      luasTanah,
      luasBangunan,
      kisaranNilaiTanah,
      tanggalData: parseExcelDate(row["tanggal_data"]),
      surveyor: surveyorName,
      reviewer: String(row["reviewer"] || "").trim(),
      admin: String(row["admin"] || "").trim(),
      isOutlierArea,
      vehiclePlate,
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
