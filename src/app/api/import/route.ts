import { NextRequest, NextResponse } from "next/server";
import { ingestDbTahap1Buffer } from "@/lib/excel/excel-ingestion";
import { parseKml } from "@/lib/gis/kml-adapter";
import {
  loadLegacyComparables,
  savePropertiesToDisk,
} from "@/lib/services/comps-spatial-service";
import { MarketComparableEntity } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let newProperties: MarketComparableEntity[] = [];

    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (Array.isArray(body.records)) {
        newProperties = body.records;
      } else if (Array.isArray(body)) {
        newProperties = body;
      }
    } else {
      // Multipart form upload or raw buffer
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided" },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());

      if (fileName.endsWith(".kml")) {
        const kmlText = buffer.toString("utf-8");
        const placemarks = parseKml(kmlText);
        newProperties = placemarks.map((pm, idx) => ({
          id: `kml-${Date.now()}-${idx}`,
          legacy_no: idx + 1,
          jenis_properti: (pm.extendedData["jenis_properti"] as any) || "TANAH_BANGUNAN",
          alamat: pm.name,
          provinsi: pm.extendedData["provinsi"] || "Indonesia",
          kota_kab: pm.extendedData["kota_kab"] || "",
          kecamatan: pm.extendedData["kecamatan"] || "",
          desa_kelurahan: pm.extendedData["desa_kelurahan"] || "",
          latitude: pm.latitude,
          longitude: pm.longitude,
          luas_tanah: parseFloat(pm.extendedData["luas_tanah"]) || 0,
          luas_bangunan: parseFloat(pm.extendedData["luas_bangunan"]) || 0,
          kisaran_nilai_tanah: parseFloat(pm.extendedData["kisaran_nilai_tanah"]) || null,
          tanggal_data: new Date().toISOString().split("T")[0],
          surveyor_name: pm.extendedData["surveyor_name"] || null,
          reviewer_name: null,
          admin_code: null,
          legalitas: (pm.extendedData["legalitas"] as any) || "SHM",
          tapak: "PERSEGI",
          row_jalan: parseFloat(pm.extendedData["row_jalan"]) || 6.0,
          keterangan: "Imported via Google My Maps KML",
        }));
      } else {
        // Default Excel (.xlsx, .xls)
        const ingested = ingestDbTahap1Buffer(buffer);
        newProperties = ingested.records.map((r, idx) => ({
          id: `imported-${Date.now()}-${idx}`,
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
        }));
      }
    }

    if (newProperties.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid property records parsed" },
        { status: 400 }
      );
    }

    // Merge with existing properties
    const existing = loadLegacyComparables();
    const merged = [...newProperties, ...existing];

    // De-duplicate by coordinate or address
    const uniqueMap = new Map<string, MarketComparableEntity>();
    for (const p of merged) {
      const key = `${p.latitude.toFixed(5)}_${p.longitude.toFixed(5)}_${p.alamat.toLowerCase().trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, p);
      }
    }

    const uniqueList = Array.from(uniqueMap.values());
    savePropertiesToDisk(uniqueList);

    return NextResponse.json({
      success: true,
      importedCount: newProperties.length,
      totalCount: uniqueList.length,
    });
  } catch (err: any) {
    console.error("Import error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
