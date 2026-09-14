import { describe, it, expect } from "vitest";
import {
  exportComparablesToKml,
  parseKml,
} from "../src/lib/gis/kml-adapter";
import { MarketComparableEntity } from "../src/types/database";

describe("Google My Maps KML Adapter (Two-way integration)", () => {
  const sampleComps: MarketComparableEntity[] = [
    {
      id: "comp-1",
      legacy_no: 1,
      jenis_properti: "TANAH_BANGUNAN",
      alamat: "Kawasan Industri GIIC Cikarang",
      provinsi: "Jawa Barat",
      kota_kab: "Bekasi",
      kecamatan: "Cikarang Pusat",
      desa_kelurahan: "Cicau",
      latitude: -6.395972,
      longitude: 107.173722,
      luas_tanah: 2500,
      luas_bangunan: 1200,
      kisaran_nilai_tanah: 4500000,
      tanggal_data: "2026-08-10",
      surveyor_name: "Ketut Agus Sudiartawan",
      reviewer_name: "I Komang Adi",
      admin_code: "ADM1",
      legalitas: "SHM",
      tapak: "PERSEGI",
      row_jalan: 8.0,
    },
  ];

  it("should generate valid KML string with Placemark and ExtendedData", () => {
    const kml = exportComparablesToKml(sampleComps, "Export Test");
    expect(kml).toContain("<?xml version=");
    expect(kml).toContain("<kml xmlns=");
    expect(kml).toContain("<name>Kawasan Industri GIIC Cikarang</name>");
    expect(kml).toContain("<coordinates>107.173722,-6.395972,0</coordinates>");
    expect(kml).toContain('<Data name="luas_tanah"><value>2500</value></Data>');
  });

  it("should parse KML back into structured placemarks with coordinates and extended data", () => {
    const kml = exportComparablesToKml(sampleComps, "Roundtrip Test");
    const parsed = parseKml(kml);

    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe("Kawasan Industri GIIC Cikarang");
    expect(parsed[0].latitude).toBeCloseTo(-6.395972, 5);
    expect(parsed[0].longitude).toBeCloseTo(107.173722, 5);
    expect(parsed[0].extendedData["luas_tanah"]).toBe("2500");
    expect(parsed[0].extendedData["legalitas"]).toBe("SHM");
  });
});
