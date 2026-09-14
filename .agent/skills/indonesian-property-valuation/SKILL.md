---
name: indonesian-property-valuation
description: Applies Indonesian appraisal standards (SPI/MAPPI), real estate adjustment matrices, land/building specs (LT, LB, NOP, ZNT, KDB/KLB), and market comparison formulas. Activates on property valuation, appraisal formulas, or real estate data models.
---

# Indonesian Property Valuation Engine (SPI Standards)

## Core Calculation: Market Comparison Approach (Metode Perbandingan Data Pasar - SPI 106)
1. Indication of Value:
   $$V_{\text{indicated}} = P_{\text{comps}} \times (1 + \sum \text{Adjustments})$$
2. Adjustment Grid Dimensions:
   - Transaction Type (Penawaran vs Transaksi: default discount -5% to -15%)
   - Time/Market Trend (Perubahan Pasar per tahun/bulan)
   - Legal Title (SHM = 1.0; HGB = -5% to -10% depending on remaining expiration; Girik/Letter C = -15% to -25%)
   - Location & Access (Lebar jalan depan/ROW, drainase, bebas banjir)
   - Physical Land (Bentuk tapak: tusuk sate [-5% to -10%], kantong semar [+5%], rasio lebar depan terhadap panjang)
   - Topography (Rata vs berkontur, elevasi terhadap muka jalan)
   - Planning Controls (KDB, KLB, GSB berdasarkan RDTR)

## Database Schema Model (PostgreSQL / Drizzle / Prisma)
Ensure property entities include:
- `nop`: CHAR(18) (Nomor Objek Pajak standard: PP.DD.KKK.SSS.BBB-UUUU.E)
- `coordinate`: GEOMETRY(Point, 4326)
- `land_area`: DECIMAL (Luas Tanah in m²)
- `building_area`: DECIMAL (Luas Bangunan in m²)
- `legal_status`: ENUM ('SHM', 'HGB', 'HAK_PAKAI', 'GIRIK', 'STRATA_TITLE')
- `site_shape`: ENUM ('REGULAR', 'IRREGULAR', 'T_JUNCTION_TUSUK_SATE', 'CORNER_HOOK', 'BOTTLE_KANTONG_SEMAR')
- `znt_code`: VARCHAR(2) (Zona Nilai Tanah polygon identifier)
- `market_price_raw`: BIGINT (Transaction / offering price in IDR)
- `adjusted_unit_price`: BIGINT (Indicated value per m²)
