import { NextRequest, NextResponse } from "next/server";
import {
  getComparablesForValuation,
  upsertProperty,
  deleteProperty,
} from "@/lib/services/comps-spatial-service";
import { PropertyTypeEnum } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");
  const query = searchParams.get("q") || undefined;
  const propertyType = searchParams.get("type") as PropertyTypeEnum | null;

  const lat = latStr ? parseFloat(latStr) : undefined;
  const lng = lngStr ? parseFloat(lngStr) : undefined;
  const radius = radiusStr ? parseFloat(radiusStr) : undefined;

  const results = await getComparablesForValuation({
    latitude: lat,
    longitude: lng,
    radiusMeters: radius,
    propertyType: propertyType || undefined,
    searchQuery: query,
  });

  return NextResponse.json({
    success: true,
    total: results.length,
    data: results,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const saved = upsertProperty(body);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save property" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Property id is required for update" },
        { status: 400 }
      );
    }
    const updated = upsertProperty(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Property id is required" },
      { status: 400 }
    );
  }
  const deleted = deleteProperty(id);
  return NextResponse.json({ success: deleted });
}
