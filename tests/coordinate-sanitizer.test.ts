import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  sanitizeCoordinate,
  isInsideIndonesia,
} from "../src/lib/excel/coordinate-sanitizer";
import { ingestDbTahap1Buffer } from "../src/lib/excel/excel-ingestion";

describe("Coordinate Sanitizer & Ingestion Engine (Phase 0)", () => {
  it("should correctly handle standard negative coordinates", () => {
    const res = sanitizeCoordinate("-6.395972, 107.173722");
    expect(res).not.toBeNull();
    expect(res!.latitude).toBe(-6.395972);
    expect(res!.longitude).toBe(107.173722);
    expect(res!.isReconstructed).toBe(false);
    expect(res!.isValidIndonesianBbox).toBe(true);
  });

  it("should correctly reconstruct truncated coordinates with comma decimal points", () => {
    // Batam example: "1,078611, 04.134472" -> lat 1.078611, lng 104.134472
    const res = sanitizeCoordinate("1,078611, 04.134472");
    expect(res).not.toBeNull();
    expect(res!.latitude).toBe(1.078611);
    expect(res!.longitude).toBe(104.134472);
    expect(res!.isReconstructed).toBe(true);
    expect(res!.isValidIndonesianBbox).toBe(true);
  });

  it("should correctly restore truncated 9x longitude for Sumatra", () => {
    // Batu Bara: "3,340583, 9.449694" -> lat 3.340583, lng 99.449694
    const res = sanitizeCoordinate("3,340583, 9.449694");
    expect(res).not.toBeNull();
    expect(res!.latitude).toBe(3.340583);
    expect(res!.longitude).toBe(99.449694);
    expect(res!.isReconstructed).toBe(true);
    expect(res!.isValidIndonesianBbox).toBe(true);
  });

  it("should correctly restore Minahasa 125x longitude", () => {
    // Minahasa Utara: "1,417111, 25.003194" -> lat 1.417111, lng 125.003194
    const res = sanitizeCoordinate("1,417111, 25.003194");
    expect(res).not.toBeNull();
    expect(res!.latitude).toBe(1.417111);
    expect(res!.longitude).toBe(125.003194);
    expect(res!.isReconstructed).toBe(true);
    expect(res!.isValidIndonesianBbox).toBe(true);
  });

  it("should ingest real DB Tahap 1.xlsx and reconstruct all 76 mangled records into Indonesian bbox", () => {
    const filePath = path.resolve(__dirname, "../DB Tahap 1.xlsx");
    const fileBuffer = fs.readFileSync(filePath);
    const result = ingestDbTahap1Buffer(fileBuffer);

    expect(result.totalRows).toBe(532);
    expect(result.reconstructedCoordinateCount).toBe(76);
    expect(result.validCoordinateCount).toBe(532);

    // Verify 100% of parsed records with coordinates fall inside Indonesia territory
    const outOfBounds = result.records.filter(
      (r) => !r.coordinate || !r.coordinate.isValidIndonesianBbox
    );
    expect(outOfBounds.length).toBe(0);

    // Verify outlier area detection (> 500,000 m2)
    expect(result.outlierCount).toBe(2);

    // Verify surveyor vehicle mapping from Surveyor sheet
    expect(Object.keys(result.surveyorVehicles).length).toBeGreaterThan(0);
    expect(result.surveyorVehicles["KETUT AGUS SUDIARTAWAN"]).toBe("DK 4667 TY");
  });
});
