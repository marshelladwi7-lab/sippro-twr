import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { ingestDbTahap1Buffer } from "../src/lib/excel/excel-ingestion";
import { getComparablesForValuation } from "../src/lib/services/comps-spatial-service";
import {
  calculateMarketApproach,
  ComparableAdjustmentInput,
} from "../src/lib/valuation/market-approach-engine";
import { calculateCostApproach } from "../src/lib/valuation/cost-approach-engine";
import { calculateLiquidationValue } from "../src/lib/valuation/liquidation-engine";

describe("E2E Integration & Audit Workflow (Phase 5)", () => {
  it("executes complete valuation pipeline from raw Excel to audit conclusions", async () => {
    // 1. Verify Excel Ingestion
    const filePath = path.resolve(__dirname, "../DB Tahap 1.xlsx");
    const buffer = fs.readFileSync(filePath);
    const ingested = ingestDbTahap1Buffer(buffer);
    expect(ingested.totalRows).toBe(532);

    // 2. Select Subject property in Cikarang Pusat (GIIC Industrial area)
    const subject = {
      lat: -6.395972,
      lng: 107.173722,
      luasTanah: 2000,
      luasBangunan: 1000,
      legalitas: "SHM" as const,
      tapak: "PERSEGI" as const,
      rowJalan: 8.0,
      propertyType: "TANAH_BANGUNAN" as const,
    };

    // 3. Load neighboring comparables within 3000m radius
    const nearbyComps = await getComparablesForValuation({
      latitude: subject.lat,
      longitude: subject.lng,
      radiusMeters: 3000,
      limit: 3,
    });
    expect(nearbyComps.length).toBeGreaterThan(0);

    // 4. Perform SPI 106 market approach adjustments
    const compInputs: ComparableAdjustmentInput[] = nearbyComps.map((c, i) => ({
      id: c.id,
      name: `Comparable ${i + 1}`,
      baseUnitPrice: c.kisaran_nilai_tanah || 4500000,
      adjustments: {
        transactionTypeDiscount: -0.10, // 10% offering discount
        timeTrend: 0.0,
        location: 0.0,
        legalDelta: 0.0,
        tapakDelta: 0.0,
        roadAccessDelta: 0.0,
      },
    }));

    const marketValuation = calculateMarketApproach(compInputs);
    expect(marketValuation.indicatedLandUnitPrice).toBeGreaterThan(0);
    expect(marketValuation.allCompliant).toBe(true);

    // 5. Calculate Cost Approach for Building
    const costValuation = calculateCostApproach({
      propertyType: subject.propertyType,
      buildingArea: subject.luasBangunan,
      rcnPerM2: 4500000,
      effectiveAgeYears: 5,
      economicLifeYears: 30,
    });
    expect(costValuation.isBuildingValued).toBe(true);
    expect(costValuation.totalBuildingValue).toBeGreaterThan(0);

    // 6. Calculate SPI 202 Liquidation Value & POJK 40 LTV Limit
    const marketValueLand = Math.round(
      subject.luasTanah * marketValuation.indicatedLandUnitPrice
    );
    const marketValueBuilding = costValuation.totalBuildingValue;

    const liquidation = calculateLiquidationValue({
      propertyType: subject.propertyType,
      tapakShape: subject.tapak,
      marketValueLand,
      marketValueBuilding,
      bankLtvPercent: 0.70,
    });

    expect(liquidation.haircutPercent).toBe(0.20); // Residential 20%
    expect(liquidation.totalMarketValue).toBe(
      marketValueLand + marketValueBuilding
    );
    expect(liquidation.totalLiquidationValue).toBe(
      Math.round(liquidation.totalMarketValue * 0.80)
    );
    expect(liquidation.maxLoanCeiling).toBeLessThanOrEqual(
      liquidation.totalLiquidationValue
    );
  });
});
