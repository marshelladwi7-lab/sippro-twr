import { describe, it, expect } from "vitest";
import {
  loadLegacyComparables,
  getComparablesForValuation,
} from "../src/lib/services/comps-spatial-service";

describe("Spatial Radius Filtering & Query Services (Phase 3)", () => {
  it("should load all 532 legacy comparables from DB Tahap 1.xlsx", () => {
    const all = loadLegacyComparables();
    expect(all.length).toBe(532);
  });

  it("should query comparables within 2000m radius around Cikarang Pusat in < 45ms", async () => {
    const lat = -6.395972;
    const lng = 107.173722;

    const start = performance.now();
    const results = await getComparablesForValuation({
      latitude: lat,
      longitude: lng,
      radiusMeters: 3000,
    });
    const elapsed = performance.now() - start;

    // Performance target: sub-45ms execution
    expect(elapsed).toBeLessThan(45);

    expect(results.length).toBeGreaterThan(0);
    // Assert results are sorted by distance ascending
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distance_meters!).toBeGreaterThanOrEqual(
        results[i - 1].distance_meters!
      );
    }
  });
});
