import { NextResponse } from "next/server";
import { loadLegacyComparables } from "@/lib/services/comps-spatial-service";
import { exportComparablesToKml } from "@/lib/gis/kml-adapter";

export async function GET() {
  const allComps = loadLegacyComparables();
  const kmlContent = exportComparablesToKml(
    allComps,
    "Bank Data Penilaian Properti (532 Titik)"
  );

  return new NextResponse(kmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.google-earth.kml+xml",
      "Content-Disposition": 'attachment; filename="Bank_Data_Properti_GoogleMyMaps.kml"',
    },
  });
}
