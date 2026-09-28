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
  {
    field: "SUMBER DATA",
    sourceCategory: "TAMBAHAN",
    isRequired: false,
    description: "Sumber data properti (Broker, Pemilik, Iklan Online, Bank, dsb.)",
  },
  {
    field: "NAMA PEMBERI DATA",
    sourceCategory: "TAMBAHAN",
    isRequired: false,
    description: "Nama narasumber / informan data pembanding",
  },
  {
    field: "NOMOR PEMBERI DATA",
    sourceCategory: "TAMBAHAN",
    isRequired: false,
    description: "Nomor telepon / kontak narasumber pemberi data",
  },
];

export interface ValidationReport {
  isValid: boolean;
  missingRequired: string[];
  recognizedFields: string[];
  unrecognizedFields: string[];
  hasTransactionDiscountFields: boolean;
}

export const FIELD_ALIASES: Record<string, string[]> = {
  "JENIS PROPERTI": ["JENIS PROPERTI", "JENIS_PROPERTI", "JENIS", "TIPE PROPERTI", "TIPE_PROPERTI"],
  "ALAMAT": ["ALAMAT", "ALAMAT LENGKAP", "ALAMAT_LENGKAP", "LOKASI"],
  "TITIK KOORDINAT": ["TITIK KOORDINAT", "TITIK_KOORDINAT", "LATLNG", "LAT_LNG", "KOORDINAT", "COORDINATE"],
  "LUAS TANAH": ["LUAS TANAH", "LUAS_TANAH", "LT", "LUAS TANAH M2", "LUAS_TANAH_M2", "LUAS TANAH (M2)"],
  "LUAS BANGUNAN": ["LUAS BANGUNAN", "LUAS_BANGUNAN", "LB", "LUAS BANGUNAN M2", "LUAS_BANGUNAN_M2", "LUAS BANGUNAN (M2)"],
  "KISARAN NILAI TANAH/M2": [
    "KISARAN NILAI TANAH/M2",
    "KISARAN NILAI TANAH",
    "KISARAN_NILAI_TANAH",
    "NILAI TANAH/M2",
    "NILAI_TANAH",
    "NILAI TANAH",
  ],
  "TANGGAL DATA": ["TANGGAL DATA", "TANGGAL_DATA", "TANGGAL", "TGL"],
  "SURVEYOR": ["SURVEYOR", "SURVEYOR_NAME", "NAMA SURVEYOR"],
  "REVIEWER": ["REVIEWER", "REVIEWER_NAME", "NAMA REVIEWER"],
  "ADMIN": ["ADMIN", "ADMIN_CODE", "KODE ADMIN"],
  "HARGA PENAWARAN": ["HARGA PENAWARAN", "HARGA_PENAWARAN", "PENAWARAN"],
  "HARGA TRANSAKSI": ["HARGA TRANSAKSI", "HARGA_TRANSAKSI", "TRANSAKSI"],
  "SUMBER DATA": ["SUMBER DATA", "SUMBER_DATA", "SUMBER"],
  "NAMA PEMBERI DATA": ["NAMA PEMBERI DATA", "NAMA_PEMBERI_DATA", "PEMBERI DATA", "INFORMAN"],
  "NOMOR PEMBERI DATA": ["NOMOR PEMBERI DATA", "NOMOR_PEMBERI_DATA", "NO PEMBERI DATA", "NO_PEMBERI_DATA", "NO HP PEMBERI DATA", "KONTAK"],
};

export function normalizeHeader(h: string): string {
  return h.toUpperCase().trim().replace(/[\s_]+/g, " ");
}

export function validateBankDataSchema(headers: string[]): ValidationReport {
  const cleanHeaders = headers.map((h) => h.toUpperCase().trim().replace(/[^A-Z0-9]/g, ""));
  const normalizedHeaders = new Set(cleanHeaders);
  const recognizedFields: string[] = [];
  const missingRequired: string[] = [];
  const unrecognizedFields: string[] = [];

  const matchedHeaderSet = new Set<string>();

  for (const spec of BANK_DATA_SPECIFICATIONS) {
    const aliases = FIELD_ALIASES[spec.field] || [spec.field];
    const isMatched = aliases.some((alias) =>
      normalizedHeaders.has(alias.toUpperCase().trim().replace(/[^A-Z0-9]/g, ""))
    );

    if (isMatched) {
      recognizedFields.push(spec.field);
      aliases.forEach((alias) =>
        matchedHeaderSet.add(alias.toUpperCase().trim().replace(/[^A-Z0-9]/g, ""))
      );
    } else if (spec.isRequired) {
      missingRequired.push(spec.field);
    }
  }

  for (const header of headers) {
    const cleanHeader = header.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");
    if (!matchedHeaderSet.has(cleanHeader) && cleanHeader) {
      unrecognizedFields.push(header);
    }
  }

  const hasPenawaran =
    normalizedHeaders.has("HARGAPENAWARAN") || normalizedHeaders.has("PENAWARAN");
  const hasTransaksi =
    normalizedHeaders.has("HARGATRANSAKSI") || normalizedHeaders.has("TRANSAKSI");

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
