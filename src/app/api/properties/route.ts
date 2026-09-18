import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getComparablesForValuation,
  upsertProperty,
  deleteProperty,
} from "@/lib/services/comps-spatial-service";
import { PropertyTypeEnum } from "@/types/database";

export const dynamic = "force-dynamic";

const PropertySchema = z.object({
  id: z.string().optional(),
  legacy_no: z.number().nullable().optional(),
  jenis_properti: z.enum(["TANAH_BANGUNAN", "TANAH_KOSONG", "TANAH_BANGUNAN_DIABAIKAN"]),
  alamat: z.string().min(1, "Alamat wajib diisi").max(500),
  provinsi: z.string().default("Jawa Barat"),
  kota_kab: z.string().default("Kab. Bekasi"),
  kecamatan: z.string().default(""),
  desa_kelurahan: z.string().default(""),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  luas_tanah: z.number().min(0),
  luas_bangunan: z.number().min(0).default(0),
  kisaran_nilai_tanah: z.number().nullable().optional(),
  harga_penawaran: z.number().nullable().optional(),
  harga_transaksi: z.number().nullable().optional(),
  tanggal_data: z.string().default(() => new Date().toISOString().split("T")[0]),
  surveyor_name: z.string().nullable().optional(),
  reviewer_name: z.string().nullable().optional(),
  admin_code: z.string().nullable().optional(),
  legalitas: z.enum(["SHM", "HGB", "HAK_PAKAI", "GIRIK_LETTER_C", "STRATA_TITLE"]).default("SHM"),
  tapak: z.enum(["PERSEGI", "L_SHAPE", "TUSUK_SATE", "KANTONG_SEMAR", "HOOK", "TIDAK_BERATURAN"]).default("PERSEGI"),
  row_jalan: z.number().min(0).default(6.0),
  keterangan: z.string().nullable().optional(),
});

const UpdatePropertySchema = PropertySchema.partial().extend({
  id: z.string().min(1, "ID properti wajib disertakan"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const radiusStr = searchParams.get("radius");
    const query = searchParams.get("q")?.trim() || undefined;
    const propertyType = searchParams.get("type") as PropertyTypeEnum | null;

    let lat: number | undefined;
    let lng: number | undefined;
    let radius: number | undefined;

    if (latStr) {
      const parsedLat = parseFloat(latStr);
      if (!isNaN(parsedLat) && parsedLat >= -90 && parsedLat <= 90) {
        lat = parsedLat;
      }
    }

    if (lngStr) {
      const parsedLng = parseFloat(lngStr);
      if (!isNaN(parsedLng) && parsedLng >= -180 && parsedLng <= 180) {
        lng = parsedLng;
      }
    }

    if (radiusStr) {
      const parsedRadius = parseFloat(radiusStr);
      if (!isNaN(parsedRadius) && parsedRadius > 0) {
        radius = Math.min(parsedRadius, 50000); // max 50km radius
      }
    }

    const results = await getComparablesForValuation({
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      propertyType: propertyType || undefined,
      searchQuery: query ? query.slice(0, 100) : undefined,
    });

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat data properti. Silakan coba kembali.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal: " + parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const saved = upsertProperty(parsed.data as any);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    console.error("POST /api/properties error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal menyimpan entitas properti." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = UpdatePropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal: " + parsed.error.issues.map((i) => i.message).join(", "),
        },
        { status: 400 }
      );
    }

    const updated = upsertProperty(parsed.data as any);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/properties error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal memperbarui entitas properti." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: "ID properti wajib disertakan." },
        { status: 400 }
      );
    }
    const deleted = deleteProperty(id.trim());
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error("DELETE /api/properties error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal menghapus entitas properti." },
      { status: 500 }
    );
  }
}
