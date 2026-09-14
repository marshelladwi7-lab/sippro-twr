import * as fs from "fs";
import * as path from "path";
import { MarketComparableEntity, PropertyTypeEnum } from "@/types/database";
import { ingestDbTahap1Buffer } from "@/lib/excel/excel-ingestion";
import { calculateHaversineDistance } from "@/lib/db/supabase";

let cachedComparables: MarketComparableEntity[] | null = null;

export function loadLegacyComparables(): MarketComparableEntity[] {
  if (cachedComparables) return cachedComparables;

  try {
    const filePath = path.resolve(process.cwd(), "DB Tahap 1.xlsx");
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ingested = ingestDbTahap1Buffer(buffer);

      cachedComparables = ingested.records.map((r, idx) => ({
        id: `legacy-${r.legacyNo || idx + 1}`,
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
        tanggal_data: r.tanggalData,
        surveyor_name: r.surveyor || null,
        reviewer_name: r.reviewer || null,
        admin_code: r.admin || null,
        legalitas: "SHM",
        tapak: "PERSEGI",
        row_jalan: 6.0,
        raw_metadata: {
          isOutlierArea: r.isOutlierArea,
          vehiclePlate: r.vehiclePlate,
        },
      }));
      return cachedComparables;
    }
  } catch (err) {
    console.error("Error loading DB Tahap 1.xlsx:", err);
  }

  return [];
}

export interface SpatialQueryParams {
  latitude: number;
  longitude: number;
  radiusMeters?: number; // default 2000m
  propertyType?: PropertyTypeEnum;
  limit?: number; // default 15
}

export async function getComparablesForValuation(
  params: SpatialQueryParams
): Promise<MarketComparableEntity[]> {
  const radius = params.radiusMeters ?? 2000;
  const limit = params.limit ?? 15;
  const allComps = loadLegacyComparables();

  // Spatial radius filtering with Haversine distance calculation
  const matches: MarketComparableEntity[] = [];

  for (const comp of allComps) {
    if (!comp.latitude || !comp.longitude) continue;
    if (params.propertyType && comp.jenis_properti !== params.propertyType) {
      continue;
    }

    const dist = calculateHaversineDistance(
      params.latitude,
      params.longitude,
      comp.latitude,
      comp.longitude
    );

    if (dist <= radius) {
      matches.push({
        ...comp,
        distance_meters: dist,
      });
    }
  }

  // Sort strictly by closest distance
  matches.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));

  return matches.slice(0, limit);
}
