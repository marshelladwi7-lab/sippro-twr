export type PropertyTypeEnum =
  | "TANAH_BANGUNAN"
  | "TANAH_KOSONG"
  | "TANAH_BANGUNAN_DIABAIKAN";

export type LegalitasEnum =
  | "SHM"
  | "HGB"
  | "HAK_PAKAI"
  | "GIRIK_LETTER_C"
  | "STRATA_TITLE";

export type TapakShapeEnum =
  | "PERSEGI"
  | "L_SHAPE"
  | "TUSUK_SATE"
  | "KANTONG_SEMAR"
  | "HOOK"
  | "TIDAK_BERATURAN";

export type ValuationStatusEnum =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED_INTERNAL"
  | "APPROVED_FINAL"
  | "EXPIRED";

export interface MarketComparableEntity {
  id: string;
  legacy_no: number | null;
  jenis_properti: PropertyTypeEnum;
  alamat: string;
  provinsi: string;
  kota_kab: string;
  kecamatan: string;
  desa_kelurahan: string;
  latitude: number;
  longitude: number;
  luas_tanah: number;
  luas_bangunan: number;
  kisaran_nilai_tanah: number | null;
  tanggal_data: string;
  surveyor_name: string | null;
  reviewer_name: string | null;
  admin_code: string | null;
  legalitas: LegalitasEnum;
  tapak: TapakShapeEnum;
  row_jalan: number;
  raw_metadata?: Record<string, any>;
  distance_meters?: number;
  created_at?: string;
}

export interface PropertyAgunanEntity {
  id: string;
  nop: string; // 18 digits regex
  nama_debitur: string;
  nomor_rekening_fasilitas?: string;
  latitude: number;
  longitude: number;
  alamat_lengkap: string;
  batas_utara: string;
  batas_selatan: string;
  batas_timur: string;
  batas_barat: string;
  luas_tanah: number;
  luas_bangunan: number;
  legalitas: LegalitasEnum;
  hgb_expiration_date?: string;
  tapak: TapakShapeEnum;
  row_jalan: number;
  created_at?: string;
}

export interface ValuationReportEntity {
  id: string;
  property_id: string;
  valuer_user_id?: string;
  reviewer_user_id?: string;
  status: ValuationStatusEnum;
  tanggal_inspeksi: string;
  tanggal_laporan: string;
  berlaku_hingga: string; // POJK 40
  nilai_pasar_tanah_m2: number;
  nilai_pasar_tanah_total: number;
  nilai_pasar_bangunan_total: number;
  nilai_pasar_objek_total: number;
  haircut_likuidasi_persen: number;
  nilai_likuidasi_total: number;
  comparables_selected: string[];
  calculation_breakdown: Record<string, any>;
  created_at?: string;
}
