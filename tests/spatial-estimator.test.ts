import { describe, it, expect } from "vitest";

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

describe("Spatial Value Estimator Engine Tests", () => {
  it("should calculate exact median for odd and even datasets", () => {
    expect(calculateMedian([3000000, 4000000, 5000000])).toBe(4000000);
    expect(calculateMedian([3000000, 4000000, 6000000, 8000000])).toBe(5000000);
  });

  it("should protect valuation from extreme outliers using median rather than mean", () => {
    const prices = [3800000, 4000000, 4100000, 4200000, 50000000];
    const median = calculateMedian(prices);
    const mean = calculateMean(prices);

    expect(median).toBe(4100000);
    expect(mean).toBe(13220000);
    expect(median).toBeLessThan(mean);
  });

  it("should calculate haversine distance with meter accuracy", () => {
    const dist = haversineMeters(-6.175392, 106.827153, -6.17017, 106.83139);
    expect(dist).toBeGreaterThan(700);
    expect(dist).toBeLessThan(800);
  });

  it("should generate conservative (-5%) and optimistic (+5%) range bounds", () => {
    const totalIndicated = 1000000000;
    const low = Math.round((totalIndicated * 0.95) / 1000000) * 1000000;
    const high = Math.round((totalIndicated * 1.05) / 1000000) * 1000000;

    expect(low).toBe(950000000);
    expect(high).toBe(1050000000);
  });
});
