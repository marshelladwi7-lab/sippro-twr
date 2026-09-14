import { NextRequest, NextResponse } from "next/server";
import {
  getComparablesForValuation,
  loadLegacyComparables,
} from "@/lib/services/comps-spatial-service";
import { PropertyTypeEnum } from "@/types/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");
  const propertyType = searchParams.get("propertyType") as PropertyTypeEnum | null;

  // If no lat/lng provided, return all comparables for global map view
  if (!latStr || !lngStr) {
    const all = loadLegacyComparables();
    return NextResponse.json({
      success: true,
      total: all.length,
      data: all,
    });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = radiusStr ? parseFloat(radiusStr) : 2000;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: "Invalid latitude or longitude format" },
      { status: 400 }
    );
  }

  const results = await getComparablesForValuation({
    latitude: lat,
    longitude: lng,
    radiusMeters: radius,
    propertyType: propertyType || undefined,
  });

  return NextResponse.json({
    success: true,
    count: results.length,
    radiusMeters: radius,
    data: results,
  });
}
