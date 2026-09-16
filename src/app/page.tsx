import React, { Suspense } from "react";
import { loadLegacyComparables } from "@/lib/services/comps-spatial-service";
import { UnifiedLandingLoginPage } from "@/components/landing/UnifiedLandingLoginPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const properties = loadLegacyComparables();

  let totalArea = 0;
  let totalPriceSum = 0;
  let priceCount = 0;
  const citiesSet = new Set<string>();

  properties.forEach((p) => {
    totalArea += p.luas_tanah || 0;
    if (p.kisaran_nilai_tanah && p.kisaran_nilai_tanah > 0) {
      totalPriceSum += p.kisaran_nilai_tanah;
      priceCount++;
    }
    if (p.kota_kab) citiesSet.add(p.kota_kab);
  });

  const avgPrice = priceCount > 0 ? Math.round(totalPriceSum / priceCount) : 0;

  const stats = {
    totalProperties: properties.length,
    avgPricePerM2: avgPrice,
    totalCities: citiesSet.size,
    totalLandArea: totalArea,
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs text-slate-400">Memuat Portal SIPPRO-TWR...</div>}>
      <UnifiedLandingLoginPage stats={stats} />
    </Suspense>
  );
}
