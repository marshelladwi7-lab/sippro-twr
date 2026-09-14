import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { MarketComparableEntity, PropertyTypeEnum, LegalitasEnum, TapakShapeEnum } from "@/types/database";
import { ingestDbTahap1Buffer } from "@/lib/excel/excel-ingestion";
import { calculateHaversineDistance } from "@/lib/db/supabase";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "properties.json");

let cachedComparables: MarketComparableEntity[] | null = null;

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialList: MarketComparableEntity[] = [];
    const excelPath = path.resolve(process.cwd(), "DB Tahap 1.xlsx");
    if (fs.existsSync(excelPath)) {
      const buffer = fs.readFileSync(excelPath);
      const ingested = ingestDbTahap1Buffer(buffer);

      ingested.records.forEach((r, idx) => {
        initialList.push({
          id: `prop-${r.legacyNo || idx + 1}`,
          legacy_no: r.legacyNo,
          jenis_properti: r.jenisProperti,
          alamat: r.alamat,
          provinsi: r.provinsi,
          kota_kab: r.kotaKab,
          kecamatan: r.kecamatan,
          desa_kelurahan: r.desaKelurahan,
          latitude: r.coordinate?.latitude || 0,
          longitude: r.coordinate?.longitude || 0,
          luas_tanah: r.luasTanah,
          luas_bangunan: r.luasBangunan,
          kisaran_nilai_tanah: r.kisaranNilaiTanah,
          harga_penawaran: r.kisaranNilaiTanah ? r.kisaranNilaiTanah * r.luasTanah : null,
          harga_transaksi: null,
          tanggal_data: r.tanggalData,
          surveyor_name: r.surveyor || null,
          reviewer_name: r.reviewer || null,
          admin_code: r.admin || null,
          legalitas: "SHM",
          tapak: "PERSEGI",
          row_jalan: 6.0,
          keterangan: r.isOutlierArea ? "Catatan: Luas tanah > 500.000 m²" : null,
          raw_metadata: {
            isOutlierArea: r.isOutlierArea,
            vehiclePlate: r.vehiclePlate,
          },
        });
      });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialList, null, 2), "utf-8");
  }
}

export function loadLegacyComparables(): MarketComparableEntity[] {
  if (cachedComparables) return cachedComparables;

  try {
    ensureDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      cachedComparables = JSON.parse(raw);
      return cachedComparables || [];
    }
  } catch (err) {
    console.error("Error reading properties.json:", err);
  }

  return [];
}

export function savePropertiesToDisk(list: MarketComparableEntity[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
  cachedComparables = list;
}

export function upsertProperty(
  data: Partial<MarketComparableEntity>
): MarketComparableEntity {
  const all = loadLegacyComparables();
  const now = new Date().toISOString();

  if (data.id) {
    // Update existing
    const idx = all.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      const updated: MarketComparableEntity = {
        ...all[idx],
        ...data,
      };
      all[idx] = updated;
      savePropertiesToDisk(all);
      return updated;
    }
  }

  // Create new
  const newId = data.id || `prop-${Date.now()}`;
  const newProperty: MarketComparableEntity = {
    id: newId,
    legacy_no: data.legacy_no ?? all.length + 1,
    jenis_properti: data.jenis_properti || "TANAH_BANGUNAN",
    alamat: data.alamat || "Alamat baru",
    provinsi: data.provinsi || "Jawa Barat",
    kota_kab: data.kota_kab || "Kab. Bekasi",
    kecamatan: data.kecamatan || "Cikarang Pusat",
    desa_kelurahan: data.desa_kelurahan || "",
    latitude: data.latitude || -6.395972,
    longitude: data.longitude || 107.173722,
    luas_tanah: data.luas_tanah || 0,
    luas_bangunan: data.luas_bangunan || 0,
    kisaran_nilai_tanah: data.kisaran_nilai_tanah ?? null,
    harga_penawaran: data.harga_penawaran ?? null,
    harga_transaksi: data.harga_transaksi ?? null,
    tanggal_data: data.tanggal_data || now.split("T")[0],
    surveyor_name: data.surveyor_name || null,
    reviewer_name: data.reviewer_name || null,
    admin_code: data.admin_code || null,
    legalitas: data.legalitas || "SHM",
    tapak: data.tapak || "PERSEGI",
    row_jalan: data.row_jalan || 6.0,
    keterangan: data.keterangan || null,
    created_at: now,
  };

  all.unshift(newProperty);
  savePropertiesToDisk(all);
  return newProperty;
}

export function deleteProperty(id: string): boolean {
  const all = loadLegacyComparables();
  const filtered = all.filter((p) => p.id !== id);
  if (filtered.length !== all.length) {
    savePropertiesToDisk(filtered);
    return true;
  }
  return false;
}

export function exportToExcelBuffer(): Buffer {
  const all = loadLegacyComparables();
  const rows = all.map((p) => ({
    NO: p.legacy_no,
    JENIS_PROPERTI: p.jenis_properti,
    ALAMAT: p.alamat,
    PROVINSI: p.provinsi,
    KOTA_KAB: p.kota_kab,
    KECAMATAN: p.kecamatan,
    DESA_KELURAHAN: p.desa_kelurahan,
    TITIK_KOORDINAT: `${p.latitude}, ${p.longitude}`,
    LATITUDE: p.latitude,
    LONGITUDE: p.longitude,
    LUAS_TANAH_M2: p.luas_tanah,
    LUAS_BANGUNAN_M2: p.luas_bangunan,
    KISARAN_NILAI_TANAH_M2: p.kisaran_nilai_tanah,
    HARGA_PENAWARAN: p.harga_penawaran,
    HARGA_TRANSAKSI: p.harga_transaksi,
    TANGGAL_DATA: p.tanggal_data,
    SURVEYOR: p.surveyor_name,
    REVIEWER: p.reviewer_name,
    ADMIN: p.admin_code,
    LEGALITAS: p.legalitas,
    BENTUK_TAPAK: p.tapak,
    ROW_JALAN: p.row_jalan,
    KETERANGAN: p.keterangan,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bank_Data_Properti");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export interface SpatialQueryParams {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  propertyType?: PropertyTypeEnum;
  searchQuery?: string;
  limit?: number;
}

export async function getComparablesForValuation(
  params: SpatialQueryParams
): Promise<MarketComparableEntity[]> {
  const allComps = loadLegacyComparables();

  let matches = allComps;

  // Text search filter (alamat, kota, kecamatan, surveyor)
  if (params.searchQuery) {
    const q = params.searchQuery.toLowerCase().trim();
    matches = matches.filter(
      (c) =>
        c.alamat.toLowerCase().includes(q) ||
        c.kota_kab.toLowerCase().includes(q) ||
        c.kecamatan.toLowerCase().includes(q) ||
        c.desa_kelurahan.toLowerCase().includes(q) ||
        (c.surveyor_name && c.surveyor_name.toLowerCase().includes(q))
    );
  }

  // Property type filter
  if (params.propertyType) {
    matches = matches.filter((c) => c.jenis_properti === params.propertyType);
  }

  // Spatial radius filtering if lat & lng are specified
  if (params.latitude !== undefined && params.longitude !== undefined) {
    const radius = params.radiusMeters ?? 5000;
    const withDistance: MarketComparableEntity[] = [];

    for (const comp of matches) {
      if (!comp.latitude || !comp.longitude) continue;
      const dist = calculateHaversineDistance(
        params.latitude,
        params.longitude,
        comp.latitude,
        comp.longitude
      );
      if (dist <= radius) {
        withDistance.push({
          ...comp,
          distance_meters: dist,
        });
      }
    }

    withDistance.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
    matches = withDistance;
  }

  if (params.limit) {
    return matches.slice(0, params.limit);
  }

  return matches;
}
