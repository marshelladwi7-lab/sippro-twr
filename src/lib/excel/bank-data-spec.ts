/**
 * Specification and validator derived from LIST BANK DATA.xlsx
 * Defines the required and optional data fields for Indonesian bank collateral property datasets.
 */

export interface BankDataFieldSpec {
  field: string;
  sourceCategory: "CORE" | "BANK_DATA_BAPAKNYA" | "TAMBAHAN";
  isRequired: boolean;
  description: string;
}

export const BANK_DATA_SPECIFICATIONS: BankDataFieldSpec[] = [
  {
    field: "JENIS PROPERTI",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Tanah & Bangunan, Tanah Kosong, atau Tanah & Bangunan Diabaikan",
  },
  {
    field: "ALAMAT",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Alamat lengkap objek pembanding / agunan",
  },
  {
    field: "TITIK KOORDINAT",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Format koordinat latitude, longitude (WGS84 EPSG:4326)",
  },
  {
    field: "LUAS TANAH",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Luas tanah dalam satuan m²",
  },
  {
    field: "LUAS BANGUNAN",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Luas bangunan dalam satuan m²",
  },
  {
    field: "KISARAN NILAI TANAH/M2",
    sourceCategory: "CORE",
    isRequired: false,
    description: "Indikasi nilai pasar tanah per m² (IDR)",
  },
  {
    field: "TANGGAL DATA",
    sourceCategory: "CORE",
    isRequired: true,
    description: "Tanggal data survei / penawaran / transaksi",
  },
  {
    field: "SURVEYOR",
    sourceCategory: "BANK_DATA_BAPAKNYA",
    isRequired: false,
    description: "Nama penilai / surveyor lapangan",
  },
  {
    field: "REVIEWER",
    sourceCategory: "BANK_DATA_BAPAKNYA",
    isRequired: false,
    description: "Nama reviewer laporan penilaian",
  },
  {
    field: "ADMIN",
    sourceCategory: "BANK_DATA_BAPAKNYA",
    isRequired: false,
    description: "Kode / nama petugas administrasi data bank",
  },
  {
    field: "HARGA PENAWARAN",
    sourceCategory: "TAMBAHAN",
    isRequired: false,
    description: "Harga penawaran properti pembanding sebelum diskon transaksi (IDR)",
  },
  {
    field: "HARGA TRANSAKSI",
    sourceCategory: "TAMBAHAN",
    isRequired: false,
    description: "Harga transaksi riil properti pembanding (IDR)",
  },
];

export interface ValidationReport {
  isValid: boolean;
  missingRequired: string[];
  recognizedFields: string[];
  unrecognizedFields: string[];
  hasTransactionDiscountFields: boolean;
}

export function normalizeHeader(h: string): string {
  return h.toUpperCase().trim().replace(/\s+/g, " ");
}

export function validateBankDataSchema(headers: string[]): ValidationReport {
  const normalizedHeaders = new Set(headers.map(normalizeHeader));
  const recognizedFields: string[] = [];
  const missingRequired: string[] = [];
  const unrecognizedFields: string[] = [];

  const specFieldMap = new Map<string, BankDataFieldSpec>();
  for (const spec of BANK_DATA_SPECIFICATIONS) {
    specFieldMap.set(normalizeHeader(spec.field), spec);
  }

  for (const spec of BANK_DATA_SPECIFICATIONS) {
    const norm = normalizeHeader(spec.field);
    if (normalizedHeaders.has(norm)) {
      recognizedFields.push(spec.field);
    } else if (spec.isRequired) {
      missingRequired.push(spec.field);
    }
  }

  for (const header of headers) {
    const norm = normalizeHeader(header);
    if (!specFieldMap.has(norm)) {
      unrecognizedFields.push(header);
    }
  }

  const hasPenawaran = normalizedHeaders.has("HARGA PENAWARAN");
  const hasTransaksi = normalizedHeaders.has("HARGA TRANSAKSI");

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    recognizedFields,
    unrecognizedFields,
    hasTransactionDiscountFields: hasPenawaran || hasTransaksi,
  };
}

/**
 * Calculates transaction discount percentage if offering and transaction prices are provided.
 * Standard SPI 106 range: -5% to -15%.
 */
export function calculateOfferingDiscount(
  offeringPrice: number,
  transactionPrice: number
): number {
  if (offeringPrice <= 0 || transactionPrice <= 0) return -0.10; // Default -10% per SPI 106
  const discount = (transactionPrice - offeringPrice) / offeringPrice;
  return Math.round(discount * 1000) / 1000;
}
