import { describe, it, expect } from "vitest";
import {
  calculateMarketApproach,
  calculateLegalitasDelta,
  calculateTapakDelta,
  calculateRoadAccessDelta,
  ComparableAdjustmentInput,
} from "../src/lib/valuation/market-approach-engine";
import { calculateCostApproach } from "../src/lib/valuation/cost-approach-engine";
import { calculateLiquidationValue } from "../src/lib/valuation/liquidation-engine";

describe("Valuation Engine (Phase 2 - SPI 101-106, SPI 202, POJK 40)", () => {
  describe("Market Comparison Approach (SPI 106)", () => {
    it("should calculate legalitas delta accurately", () => {
      expect(calculateLegalitasDelta("SHM", "SHM")).toBe(0);
      expect(calculateLegalitasDelta("SHM", "HGB", 25)).toBe(0.03);
      expect(calculateLegalitasDelta("SHM", "HGB", 8)).toBe(0.07);
      expect(calculateLegalitasDelta("SHM", "GIRIK_LETTER_C")).toBe(0.25);
    });

    it("should calculate tapak shape delta accurately", () => {
      expect(calculateTapakDelta("PERSEGI", "PERSEGI")).toBe(0);
      expect(calculateTapakDelta("PERSEGI", "TUSUK_SATE")).toBe(0.07);
      expect(calculateTapakDelta("PERSEGI", "KANTONG_SEMAR")).toBe(-0.05);
    });

    it("should calculate road access delta accurately", () => {
      expect(calculateRoadAccessDelta(6, 6)).toBe(0);
      expect(calculateRoadAccessDelta(3.5, 6)).toBe(-0.10);
      expect(calculateRoadAccessDelta(8, 4)).toBe(0.05);
    });

    it("should perform inverse gross-adjustment weighting correctly", () => {
      const comps: ComparableAdjustmentInput[] = [
        {
          id: "comp-1",
          name: "Comp 1 (Close match)",
          baseUnitPrice: 5000000,
          adjustments: {
            transactionTypeDiscount: -0.05,
            timeTrend: 0,
            location: 0,
            legalDelta: 0,
            tapakDelta: 0,
            roadAccessDelta: 0,
          },
        },
        {
          id: "comp-2",
          name: "Comp 2 (Larger deviation)",
          baseUnitPrice: 4800000,
          adjustments: {
            transactionTypeDiscount: -0.10,
            timeTrend: 0.02,
            location: 0.05,
            legalDelta: 0.03,
            tapakDelta: -0.05,
            roadAccessDelta: 0,
          },
        },
      ];

      const result = calculateMarketApproach(comps);
      expect(result.comparables.length).toBe(2);
      // Comp 1 gross = 0.05, raw weight = 1 / 1.05 = 0.95238
      // Comp 2 gross = 0.25, raw weight = 1 / 1.25 = 0.8
      // Comp 1 should receive higher weight than Comp 2
      expect(result.comparables[0].weight).toBeGreaterThan(
        result.comparables[1].weight
      );
      expect(result.indicatedLandUnitPrice).toBeGreaterThan(4500000);
      expect(result.indicatedLandUnitPrice).toBeLessThan(5500000);
    });

    it("should flag warnings when adjustments exceed SPI 106 thresholds", () => {
      const comps: ComparableAdjustmentInput[] = [
        {
          id: "comp-outlier",
          name: "Outlier Comp",
          baseUnitPrice: 5000000,
          adjustments: {
            transactionTypeDiscount: -0.20, // > 15% single warning
            timeTrend: 0.05,
            location: -0.10,
            legalDelta: 0,
            tapakDelta: 0,
            roadAccessDelta: 0,
          },
        },
      ];

      const result = calculateMarketApproach(comps);
      expect(result.allCompliant).toBe(false);
      expect(result.comparables[0].compliance.netAdjustmentExceeded).toBe(true);
      expect(result.comparables[0].compliance.requiresJustification).toBe(true);
      expect(result.auditNotes.length).toBeGreaterThan(0);
    });
  });

  describe("Cost Approach Engine (SPI 105 & PPI 02)", () => {
    it("should force building value to 0 for TANAH_KOSONG", () => {
      const res = calculateCostApproach({
        propertyType: "TANAH_KOSONG",
        buildingArea: 150,
        rcnPerM2: 4500000,
        effectiveAgeYears: 5,
        economicLifeYears: 30,
      });

      expect(res.isBuildingValued).toBe(false);
      expect(res.totalBuildingValue).toBe(0);
      expect(res.depreciatedBuildingUnitPrice).toBe(0);
    });

    it("should force building value to 0 for TANAH_BANGUNAN_DIABAIKAN", () => {
      const res = calculateCostApproach({
        propertyType: "TANAH_BANGUNAN_DIABAIKAN",
        buildingArea: 200,
        rcnPerM2: 4500000,
        effectiveAgeYears: 20,
        economicLifeYears: 30,
      });

      expect(res.isBuildingValued).toBe(false);
      expect(res.totalBuildingValue).toBe(0);
    });

    it("should correctly compute depreciated replacement cost for TANAH_BANGUNAN", () => {
      const res = calculateCostApproach({
        propertyType: "TANAH_BANGUNAN",
        buildingArea: 100,
        rcnPerM2: 4000000,
        effectiveAgeYears: 6,
        economicLifeYears: 30, // 6/30 = 20% depreciation
      });

      expect(res.isBuildingValued).toBe(true);
      expect(res.physicalDepreciationPercent).toBe(0.2);
      expect(res.depreciatedBuildingUnitPrice).toBe(3200000);
      expect(res.totalBuildingValue).toBe(320000000);
    });
  });

  describe("Liquidation Engine (SPI 202 & POJK 40)", () => {
    it("should apply standard 20% haircut for residential assets", () => {
      const res = calculateLiquidationValue({
        propertyType: "TANAH_BANGUNAN",
        tapakShape: "PERSEGI",
        marketValueLand: 1000000000,
        marketValueBuilding: 500000000,
      });

      expect(res.assetCategory).toBe("RESIDENTIAL");
      expect(res.haircutPercent).toBe(0.20);
      expect(res.totalMarketValue).toBe(1500000000);
      expect(res.totalLiquidationValue).toBe(1200000000);
      // Max loan ceiling 70% of 1.5B = 1.05B <= 1.2B
      expect(res.maxLoanCeiling).toBe(1050000000);
    });

    it("should apply 35% haircut for vacant land or irregular tapak", () => {
      const res = calculateLiquidationValue({
        propertyType: "TANAH_KOSONG",
        tapakShape: "TIDAK_BERATURAN",
        marketValueLand: 1000000000,
        marketValueBuilding: 0,
      });

      expect(res.assetCategory).toBe("VACANT_LAND");
      expect(res.haircutPercent).toBe(0.35);
      expect(res.totalLiquidationValue).toBe(650000000);
    });
  });
});
