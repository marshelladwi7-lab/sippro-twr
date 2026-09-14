-- Enable PostGIS spatial engine
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enumerations complying with Indonesian real estate & appraisal standards
DO $$ BEGIN
  CREATE TYPE property_type_enum AS ENUM (
    'TANAH_BANGUNAN', 
    'TANAH_KOSONG', 
    'TANAH_BANGUNAN_DIABAIKAN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE legalitas_enum AS ENUM (
    'SHM', 
    'HGB', 
    'HAK_PAKAI', 
    'GIRIK_LETTER_C', 
    'STRATA_TITLE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tapak_shape_enum AS ENUM (
    'PERSEGI', 
    'L_SHAPE', 
    'TUSUK_SATE', 
    'KANTONG_SEMAR', 
    'HOOK', 
    'TIDAK_BERATURAN'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE valuation_status_enum AS ENUM (
    'DRAFT', 
    'PENDING_REVIEW', 
    'APPROVED_INTERNAL', 
    'APPROVED_FINAL', 
    'EXPIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. Core Market Comparables Table (Direct mapping from DB Tahap 1 List_DP)
CREATE TABLE IF NOT EXISTS market_comparables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_no INT,
  jenis_properti property_type_enum NOT NULL,
  alamat TEXT NOT NULL,
  provinsi VARCHAR(100) NOT NULL,
  kota_kab VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  desa_kelurahan VARCHAR(100) NOT NULL,
  geom GEOMETRY(Point, 4326) NOT NULL,
  luas_tanah NUMERIC(12,2) NOT NULL,
  luas_bangunan NUMERIC(12,2) DEFAULT 0,
  kisaran_nilai_tanah NUMERIC(15,2), -- Nullable for pending field reviews
  tanggal_data DATE NOT NULL,
  surveyor_name VARCHAR(100),
  reviewer_name VARCHAR(100),
  admin_code VARCHAR(10),
  legalitas legalitas_enum DEFAULT 'SHM',
  tapak tapak_shape_enum DEFAULT 'PERSEGI',
  row_jalan NUMERIC(5,2) DEFAULT 6.0,
  raw_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial & Wilayah Indexes for sub-150ms comps search
CREATE INDEX IF NOT EXISTS idx_market_comparables_geom ON market_comparables USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_market_comparables_wilayah ON market_comparables (provinsi, kota_kab, kecamatan);

-- 2. Bank Collateral Properties (Subject Properties to be Appraised)
CREATE TABLE IF NOT EXISTS properties_agunan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nop CHAR(18) NOT NULL CHECK (nop ~ '^[0-9]{18}$'),
  nama_debitur VARCHAR(255) NOT NULL,
  nomor_rekening_fasilitas VARCHAR(50),
  geom GEOMETRY(Point, 4326) NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  batas_utara TEXT NOT NULL,   -- Mandatory SPI 104
  batas_selatan TEXT NOT NULL, -- Mandatory SPI 104
  batas_timur TEXT NOT NULL,   -- Mandatory SPI 104
  batas_barat TEXT NOT NULL,   -- Mandatory SPI 104
  luas_tanah NUMERIC(12,2) NOT NULL,
  luas_bangunan NUMERIC(12,2) DEFAULT 0,
  legalitas legalitas_enum NOT NULL,
  hgb_expiration_date DATE,
  tapak tapak_shape_enum DEFAULT 'PERSEGI',
  row_jalan NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_agunan_geom ON properties_agunan USING GIST (geom);

-- 3. Valuations & Appraisal Reports (SPI 202 & POJK 40 Compliant)
CREATE TABLE IF NOT EXISTS valuation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties_agunan(id) ON DELETE RESTRICT,
  valuer_user_id UUID,
  reviewer_user_id UUID,
  status valuation_status_enum DEFAULT 'DRAFT',
  tanggal_inspeksi DATE NOT NULL,
  tanggal_laporan DATE NOT NULL,
  berlaku_hingga DATE NOT NULL, -- POJK 40 revaluation limit (max 18-24 months)
  nilai_pasar_tanah_m2 NUMERIC(15,2) NOT NULL,
  nilai_pasar_tanah_total NUMERIC(15,2) NOT NULL,
  nilai_pasar_bangunan_total NUMERIC(15,2) NOT NULL,
  nilai_pasar_objek_total NUMERIC(15,2) NOT NULL,
  haircut_likuidasi_persen NUMERIC(5,2) NOT NULL,
  nilai_likuidasi_total NUMERIC(15,2) NOT NULL,
  comparables_selected UUID[] NOT NULL,
  calculation_breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
