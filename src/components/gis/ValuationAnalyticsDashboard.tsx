"use client";

import React, { useMemo } from "react";
import { MarketComparableEntity } from "@/types/database";

interface ValuationAnalyticsDashboardProps {
  properties: MarketComparableEntity[];
  onSelectCityOnMap: (city: string) => void;
  onSelectTypeOnMap: (type: "ALL" | "TANAH_BANGUNAN" | "TANAH_KOSONG") => void;
}

export function ValuationAnalyticsDashboard({
  properties,
  onSelectCityOnMap,
  onSelectTypeOnMap,
}: ValuationAnalyticsDashboardProps) {
  // Aggregate Metrics
  const analytics = useMemo(() => {
    let totalLandArea = 0;
    let totalBuildingArea = 0;
    let totalPriceSum = 0;
    let priceCount = 0;
    let tanahKosongCount = 0;
    let tanahBangunanCount = 0;

    const cityStats: Record<string, { count: number; sumPrice: number; priceCount: number; totalArea: number }> = {};
    const legalityStats: Record<string, number> = { SHM: 0, HGB: 0, "Hak Pakai": 0, Lainnya: 0 };
    const tapakStats: Record<string, number> = { PERSEGI: 0, "L-SHAPE": 0, "TUSUK SATE": 0, "KANTONG SEMAR": 0, LAINNYA: 0 };

    properties.forEach((p) => {
      totalLandArea += p.luas_tanah || 0;
      totalBuildingArea += p.luas_bangunan || 0;

      if (p.kisaran_nilai_tanah && p.kisaran_nilai_tanah > 0) {
        totalPriceSum += p.kisaran_nilai_tanah;
        priceCount++;
      }

      if (p.jenis_properti === "TANAH_KOSONG") {
        tanahKosongCount++;
      } else {
        tanahBangunanCount++;
      }

      // City Aggregation
      const city = p.kota_kab || "Lainnya";
      if (!cityStats[city]) {
        cityStats[city] = { count: 0, sumPrice: 0, priceCount: 0, totalArea: 0 };
      }
      cityStats[city].count++;
      cityStats[city].totalArea += p.luas_tanah || 0;
      if (p.kisaran_nilai_tanah && p.kisaran_nilai_tanah > 0) {
        cityStats[city].sumPrice += p.kisaran_nilai_tanah;
        cityStats[city].priceCount++;
      }

      // Legality Aggregation
      const leg = p.legalitas?.toUpperCase() || "";
      if (leg.includes("SHM") || leg.includes("MILIK")) {
        legalityStats["SHM"]++;
      } else if (leg.includes("HGB") || leg.includes("BANGUNAN")) {
        legalityStats["HGB"]++;
      } else if (leg.includes("PAKAI")) {
        legalityStats["Hak Pakai"]++;
      } else {
        legalityStats["Lainnya"]++;
      }

      // Tapak Aggregation
      const shape = p.tapak?.toUpperCase() || "PERSEGI";
      if (tapakStats[shape] !== undefined) {
        tapakStats[shape]++;
      } else {
        tapakStats["LAINNYA"]++;
      }
    });

    const avgPrice = priceCount > 0 ? Math.round(totalPriceSum / priceCount) : 0;
    const totalEstMarketValue = Math.round(totalPriceSum * (totalLandArea / Math.max(1, priceCount)));

    // Sort Top Cities by Count
    const topCities = Object.entries(cityStats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgPrice: data.priceCount > 0 ? Math.round(data.sumPrice / data.priceCount) : 0,
        totalArea: data.totalArea,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalCount: properties.length,
      totalLandArea,
      totalBuildingArea,
      avgPrice,
      totalEstMarketValue,
      tanahKosongCount,
      tanahBangunanCount,
      topCities,
      legalityStats,
      tapakStats,
    };
  }, [properties]);

  return (
    <div className="flex-1 p-5 md:p-8 overflow-y-auto bg-slate-950 text-slate-100 space-y-7 max-w-7xl mx-auto w-full">
      {/* Top Banner & Appraisal Standards Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              KEPI &amp; SPI 106
            </span>
            <span className="text-xs text-slate-400 font-mono">
              POJK 40/POJK.03/2019 • Haircut &amp; Agunan
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mt-2">
            Dashboard Analisis &amp; Valuasi Spasial
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pemantauan parameter nilai pasar tanah komparasi, mitigasi risiko agunan perbankan, dan sebaran tapak kadastral properti.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Status Pangkalan Data</div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {analytics.totalCount.toLocaleString("id-ID")} Data Terverifikasi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Executive Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-1 hover:border-amber-500/30 transition-all group">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Rata-rata Nilai Tanah
          </span>
          <div className="text-xl md:text-2xl font-black text-amber-400 font-mono tracking-tight group-hover:scale-105 transition-transform">
            Rp {analytics.avgPrice.toLocaleString("id-ID")}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">/m²</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            Dihitung dari indikasi transaksi &amp; penawaran pasar
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-1 hover:border-amber-500/30 transition-all group">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Akumulasi Luas Tanah
          </span>
          <div className="text-xl md:text-2xl font-black text-slate-100 font-mono tracking-tight group-hover:scale-105 transition-transform">
            {analytics.totalLandArea.toLocaleString("id-ID")}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">m²</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            Luas Bangunan: {analytics.totalBuildingArea.toLocaleString("id-ID")} m²
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-1 hover:border-amber-500/30 transition-all group">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Komposisi Tipe Properti
          </span>
          <div className="text-xl md:text-2xl font-black text-sky-400 font-mono tracking-tight">
            {analytics.tanahBangunanCount} <span className="text-xs text-slate-400">T&amp;B</span> / {analytics.tanahKosongCount} <span className="text-xs text-slate-400">Kosong</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex mt-2">
            <div
              className="bg-sky-500 h-full"
              style={{
                width: `${Math.round((analytics.tanahBangunanCount / Math.max(1, analytics.totalCount)) * 100)}%`,
              }}
              title="Tanah & Bangunan"
            />
            <div
              className="bg-amber-500 h-full"
              style={{
                width: `${Math.round((analytics.tanahKosongCount / Math.max(1, analytics.totalCount)) * 100)}%`,
              }}
              title="Tanah Kosong"
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg space-y-1 hover:border-amber-500/30 transition-all group">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Kepemilikan Hak Milik (SHM)
          </span>
          <div className="text-xl md:text-2xl font-black text-amber-300 font-mono tracking-tight">
            {Math.round((analytics.legalityStats.SHM / Math.max(1, analytics.totalCount)) * 100)}%
            <span className="text-xs font-normal text-slate-400 font-sans ml-1.5">
              ({analytics.legalityStats.SHM} Unit)
            </span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1">
            Kategori agunan prioritas bank berisiko rendah
          </p>
        </div>
      </div>

      {/* Grid Row 2: Regional Price Benchmarks & POJK Collateral Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Regional Price Benchmarks (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">
                Peringkat Rata-rata Nilai Tanah Wilayah Terpadat
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nilai per m² dan intensitas pembanding pasar di kota/kabupaten utama
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Top 8 Wilayah</span>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.topCities.map((city) => {
              const maxPrice = Math.max(...analytics.topCities.map((c) => c.avgPrice), 1);
              const barPercent = Math.min(100, Math.round((city.avgPrice / maxPrice) * 100));

              return (
                <div
                  key={city.name}
                  className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/60 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-[140px]">
                    <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300 transition-colors">
                      {city.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {city.count} Data Objek • {city.totalArea.toLocaleString("id-ID")} m²
                    </div>
                  </div>

                  <div className="flex-1 w-full max-w-[160px] hidden md:block">
                    <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-mono font-bold text-amber-400 text-xs whitespace-nowrap">
                      Rp {city.avgPrice.toLocaleString("id-ID")}/m²
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectCityOnMap(city.name)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      Buka Peta ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: POJK 40 Risk & SPI 106 Tapak Geometry (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Box 1: Legalitas Agunan POJK 40 */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Kategori Agunan &amp; Haircut (POJK 40)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mitigasi risiko yuridis &amp; rekomendasi potongan likuidasi
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* SHM */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Sertifikat Hak Milik (SHM)</div>
                    <div className="text-[10px] text-slate-400">Risiko Rendah • Haircut 10-15%</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-amber-300">
                    {analytics.legalityStats.SHM} Data
                  </span>
                  <div className="text-[9px] text-slate-400">
                    {Math.round((analytics.legalityStats.SHM / Math.max(1, analytics.totalCount)) * 100)}%
                  </div>
                </div>
              </div>

              {/* HGB */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Hak Guna Bangunan (HGB)</div>
                    <div className="text-[10px] text-slate-400">Risiko Sedang • Haircut 20-30%</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-sky-300">
                    {analytics.legalityStats.HGB} Data
                  </span>
                  <div className="text-[9px] text-slate-400">
                    {Math.round((analytics.legalityStats.HGB / Math.max(1, analytics.totalCount)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Hak Pakai / Lainnya */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Hak Pakai / Girik / Adat</div>
                    <div className="text-[10px] text-slate-400">Risiko Tinggi • Haircut 40-50%</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-rose-300">
                    {analytics.legalityStats["Hak Pakai"] + analytics.legalityStats.Lainnya} Data
                  </span>
                  <div className="text-[9px] text-slate-400">
                    {Math.round(((analytics.legalityStats["Hak Pakai"] + analytics.legalityStats.Lainnya) / Math.max(1, analytics.totalCount)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Geometri Tapak SPI 106 */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-3">
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Distribusi Bentuk Tapak (SPI 106)
            </h3>
            <p className="text-[11px] text-slate-400">
              Pengaruh bentuk bidang terhadap utilitas lahan dan penyesuaian pasar
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Persegi (Optimal)</span>
                <span className="font-bold text-amber-300 text-sm">{analytics.tapakStats.PERSEGI} Unit</span>
                <span className="text-[9px] text-slate-400 block font-sans mt-0.5">Penyesuaian 0%</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">L-Shape</span>
                <span className="font-bold text-slate-200 text-sm">{analytics.tapakStats["L-SHAPE"]} Unit</span>
                <span className="text-[9px] text-slate-400 block font-sans mt-0.5">Penyesuaian -5%</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Tusuk Sate</span>
                <span className="font-bold text-slate-200 text-sm">{analytics.tapakStats["TUSUK SATE"]} Unit</span>
                <span className="text-[9px] text-slate-400 block font-sans mt-0.5">Penyesuaian -10%</span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60 font-mono">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Kantong Semar</span>
                <span className="font-bold text-slate-200 text-sm">{analytics.tapakStats["KANTONG SEMAR"]} Unit</span>
                <span className="text-[9px] text-slate-400 block font-sans mt-0.5">Komersial vs Residensial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
