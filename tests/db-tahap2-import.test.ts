import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ingestDbTahap1Buffer } from "../src/lib/excel/excel-ingestion";

describe("DB Tahap 2 & Template Ingestion Diagnostic", () => {
  it("ingests DB Tahap 2.xlsx parsing with valid coordinates and attributes", () => {
    const filePath = path.resolve(process.cwd(), "DB Tahap 2.xlsx");
    if (!fs.existsSync(filePath)) {
      return;
    }
    const buffer = fs.readFileSync(filePath);
    const result = ingestDbTahap1Buffer(buffer);
    expect(result.totalRows).toBe(437);
    expect(result.validCoordinateCount).toBeGreaterThan(400);
    expect(result.records[0].alamat).toBe("Jalan Raya Perancis");
    expect(result.records[0].coordinate?.latitude).toBeCloseTo(-6.103561, 4);
    expect(result.records[0].coordinate?.longitude).toBeCloseTo(106.683589, 4);
    expect(result.records[0].sumberData).toBe("Agen/Broker");
    expect(result.records[0].namaPemberiData).toBe("Ibu Anna");
    expect(result.records[0].nomorPemberiData).toBe("0812-8062-9363");
  });

  it("ingests Template_Import_Bank_Data_TWR.xlsx parsing with full schema fidelity", () => {
    const filePath = path.resolve(process.cwd(), "Template_Import_Bank_Data_TWR.xlsx");
    if (!fs.existsSync(filePath)) {
      return;
    }
    const buffer = fs.readFileSync(filePath);
    const result = ingestDbTahap1Buffer(buffer);
    expect(result.totalRows).toBe(437);
    expect(result.validCoordinateCount).toBeGreaterThan(400);
    expect(result.records[0].alamat).toBe("Jalan Raya Perancis");
    expect(result.records[0].coordinate?.latitude).toBeCloseTo(-6.103561, 4);
    expect(result.records[0].coordinate?.longitude).toBeCloseTo(106.683589, 4);
    expect(result.records[0].sumberData).toBe("Agen/Broker");
    expect(result.records[0].namaPemberiData).toBe("Ibu Anna");
    expect(result.records[0].nomorPemberiData).toBe("0812-8062-9363");
  });
});
