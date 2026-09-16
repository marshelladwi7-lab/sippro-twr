import { describe, it, expect } from "vitest";
import nextConfig from "../next.config";
import strixConfig from "../strix.config.json";
import { calculateMarketApproach } from "../src/lib/valuation/market-approach-engine";
import { calculateCostApproach } from "../src/lib/valuation/cost-approach-engine";
import { calculateLiquidationValue } from "../src/lib/valuation/liquidation-engine";

describe("Strix Security & Hardening Compliance", () => {
  it("verifies next.config headers contain mandatory OWASP protection", async () => {
    if (typeof nextConfig.headers === "function") {
      const headersConfig = await nextConfig.headers();
      expect(headersConfig.length).toBeGreaterThan(0);

      const headerKeys = headersConfig[0].headers.map((h: any) => h.key);
      expect(headerKeys).toContain("Content-Security-Policy");
      expect(headerKeys).toContain("X-Frame-Options");
      expect(headerKeys).toContain("X-Content-Type-Options");
      expect(headerKeys).toContain("Strict-Transport-Security");
      expect(headerKeys).toContain("Referrer-Policy");
    }
  });

  it("verifies strix.config.json defines OWASP Top 10 scanner rules", () => {
    expect(strixConfig.engine).toBe("strix");
    expect(strixConfig.scanners.owaspTop10.injection.enabled).toBe(true);
    expect(strixConfig.scanners.owaspTop10.brokenAuthentication.enabled).toBe(true);
    expect(strixConfig.roles.length).toBe(6);
  });

  it("ensures Market Approach engine handles 0 or empty inputs without throwing", () => {
    const res = calculateMarketApproach([]);
    expect(res.comparables).toEqual([]);
    expect(res.indicatedLandUnitPrice).toBe(0);
    expect(res.allCompliant).toBe(false);
  });

  it("ensures Cost Approach engine gracefully suppresses building value when building area is 0", () => {
    const res = calculateCostApproach({
      propertyType: "TANAH_KOSONG",
      buildingArea: 0,
      rcnPerM2: 4000000,
      effectiveAgeYears: 0,
      economicLifeYears: 30,
    });
    expect(res.totalBuildingValue).toBe(0);
    expect(res.isBuildingValued).toBe(false);
  });

  it("ensures Liquidation engine handles 0 market values without negative numbers", () => {
    const res = calculateLiquidationValue({
      propertyType: "TANAH_BANGUNAN",
      tapakShape: "PERSEGI",
      marketValueLand: 0,
      marketValueBuilding: 0,
    });
    expect(res.totalLiquidationValue).toBe(0);
    expect(res.maxLoanCeiling).toBe(0);
  });
});
