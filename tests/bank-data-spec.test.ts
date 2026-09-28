import { describe, it, expect } from "vitest";
import {
  validateBankDataSchema,
  calculateOfferingDiscount,
  BANK_DATA_SPECIFICATIONS,
} from "../src/lib/excel/bank-data-spec";

describe("Bank Data Specification & Validator (LIST BANK DATA.xlsx)", () => {
  it("should have all 15 defined fields in the spec", () => {
    expect(BANK_DATA_SPECIFICATIONS.length).toBe(15);
  });

  it("should validate a complete header set conforming to LIST BANK DATA.xlsx", () => {
    const headers = [
      "JENIS PROPERTI",
      "ALAMAT",
      "TITIK KOORDINAT",
      "LUAS TANAH",
      "LUAS BANGUNAN",
      "KISARAN NILAI TANAH/M2",
      "TANGGAL DATA",
      "SURVEYOR",
      "REVIEWER",
      "ADMIN",
      "HARGA PENAWARAN",
      "HARGA TRANSAKSI",
    ];

    const report = validateBankDataSchema(headers);
    expect(report.isValid).toBe(true);
    expect(report.missingRequired).toHaveLength(0);
    expect(report.hasTransactionDiscountFields).toBe(true);
  });

  it("should recognize new informant headers (SUMBER DATA, NAMA PEMBERI DATA, NOMOR PEMBERI DATA)", () => {
    const headers = [
      "JENIS PROPERTI",
      "ALAMAT",
      "TITIK KOORDINAT",
      "LUAS TANAH",
      "LUAS BANGUNAN",
      "TANGGAL DATA",
      "SUMBER DATA",
      "NAMA PEMBERI DATA",
      "NOMOR PEMBERI DATA",
    ];
    const report = validateBankDataSchema(headers);
    expect(report.isValid).toBe(true);
    expect(report.recognizedFields).toContain("SUMBER DATA");
    expect(report.recognizedFields).toContain("NAMA PEMBERI DATA");
    expect(report.recognizedFields).toContain("NOMOR PEMBERI DATA");
  });

  it("should validate DB Tahap 2 snake_case and latlng headers", () => {
    const dbTahap2Headers = [
      "no",
      "jenis_properti",
      "alamat",
      "provinsi",
      "kota_kab",
      "kecamatan",
      "desa_kelurahan",
      "latlng",
      "luas_tanah",
      "luas_bangunan",
      "kisaran_nilai_tanah",
      "tanggal_data",
      "surveyor",
      "reviewer",
      "admin",
      "sumber_data",
      "nama_pemberi_data",
      "nomor_pemberi_data",
    ];
    const report = validateBankDataSchema(dbTahap2Headers);
    expect(report.isValid).toBe(true);
    expect(report.missingRequired).toHaveLength(0);
    expect(report.recognizedFields).toContain("TITIK KOORDINAT");
    expect(report.recognizedFields).toContain("JENIS PROPERTI");
    expect(report.recognizedFields).toContain("LUAS TANAH");
  });

  it("should detect missing required core fields", () => {
    const incompleteHeaders = ["ALAMAT", "LUAS TANAH"];
    const report = validateBankDataSchema(incompleteHeaders);
    expect(report.isValid).toBe(false);
    expect(report.missingRequired).toContain("JENIS PROPERTI");
    expect(report.missingRequired).toContain("TITIK KOORDINAT");
    expect(report.missingRequired).toContain("TANGGAL DATA");
  });

  it("should calculate offering discount properly", () => {
    // Offering 1,000,000,000, deal at 900,000,000 -> -10%
    const discount = calculateOfferingDiscount(1000000000, 900000000);
    expect(discount).toBe(-0.1);

    // Offering 1,500,000,000, deal at 1,350,000,000 -> -10%
    const discount2 = calculateOfferingDiscount(1500000000, 1350000000);
    expect(discount2).toBe(-0.1);

    // Fallback when values <= 0
    expect(calculateOfferingDiscount(0, 0)).toBe(-0.1);
  });
});
