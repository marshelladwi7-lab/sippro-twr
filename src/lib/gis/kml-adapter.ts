import { MarketComparableEntity } from "@/types/database";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * Exports market comparables to Google My Maps compatible KML format
 */
export function exportComparablesToKml(
  comparables: MarketComparableEntity[],
  documentName = "Bank Data Penilaian Properti"
): string {
  const placemarks = comparables
    .filter((c) => c.latitude && c.longitude)
    .map((c) => {
      const priceStr = c.kisaran_nilai_tanah
        ? `Rp ${c.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
        : "Pending Valuation";

      const desc = `
        <![CDATA[
          <b>Alamat:</b> ${c.alamat}<br/>
          <b>Wilayah:</b> ${c.desa_kelurahan}, ${c.kecamatan}, ${c.kota_kab}, ${c.provinsi}<br/>
          <b>Harga Satuan:</b> ${priceStr}<br/>
          <b>Luas Tanah:</b> ${c.luas_tanah} m²<br/>
          <b>Luas Bangunan:</b> ${c.luas_bangunan} m²<br/>
          <b>Legalitas:</b> ${c.legalitas}<br/>
          <b>Bentuk Tapak:</b> ${c.tapak}<br/>
          <b>ROW Jalan:</b> ${c.row_jalan} meter<br/>
          <b>Surveyor OTS:</b> ${c.surveyor_name || "-"}<br/>
          <b>Tanggal Data:</b> ${c.tanggal_data}<br/>
        ]]>
      `.trim();

      return `
    <Placemark>
      <name>${escapeXml(c.alamat || `Objek #${c.legacy_no || c.id}`)}</name>
      <description>${desc}</description>
      <ExtendedData>
        <Data name="legacy_no"><value>${c.legacy_no || ""}</value></Data>
        <Data name="jenis_properti"><value>${c.jenis_properti}</value></Data>
        <Data name="kisaran_nilai_tanah"><value>${c.kisaran_nilai_tanah || 0}</value></Data>
        <Data name="luas_tanah"><value>${c.luas_tanah}</value></Data>
        <Data name="luas_bangunan"><value>${c.luas_bangunan}</value></Data>
        <Data name="legalitas"><value>${c.legalitas}</value></Data>
        <Data name="tapak"><value>${c.tapak}</value></Data>
        <Data name="row_jalan"><value>${c.row_jalan}</value></Data>
        <Data name="surveyor_name"><value>${escapeXml(c.surveyor_name || "")}</value></Data>
      </ExtendedData>
      <Point>
        <coordinates>${c.longitude},${c.latitude},0</coordinates>
      </Point>
    </Placemark>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(documentName)}</name>
    <description>Exported from Indonesian Property Valuation Bank Data System</description>
${placemarks}
  </Document>
</kml>`;
}

export interface ParsedKmlPlacemark {
  name: string;
  latitude: number;
  longitude: number;
  extendedData: Record<string, string>;
}

/**
 * Parses Google My Maps KML file into typed placemarks
 */
export function parseKml(kmlString: string): ParsedKmlPlacemark[] {
  const placemarks: ParsedKmlPlacemark[] = [];
  const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/gi;

  let match: RegExpExecArray | null;
  while ((match = placemarkRegex.exec(kmlString)) !== null) {
    const block = match[1];

    // Extract name
    const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(block);
    const name = nameMatch ? nameMatch[1].trim() : "Unnamed Object";

    // Extract coordinates: lng,lat[,alt]
    const coordMatch = /<coordinates>([\s\S]*?)<\/coordinates>/i.exec(block);
    if (!coordMatch) continue;

    const coordsStr = coordMatch[1].trim();
    const parts = coordsStr.split(/[\s,]+/);
    if (parts.length < 2) continue;

    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) continue;

    // Extract ExtendedData
    const extendedData: Record<string, string> = {};
    const dataRegex = /<Data name="([^"]+)">\s*<value>([\s\S]*?)<\/value>\s*<\/Data>/gi;
    let dataMatch: RegExpExecArray | null;
    while ((dataMatch = dataRegex.exec(block)) !== null) {
      extendedData[dataMatch[1]] = dataMatch[2].trim();
    }

    placemarks.push({
      name,
      latitude: lat,
      longitude: lng,
      extendedData,
    });
  }

  return placemarks;
}
