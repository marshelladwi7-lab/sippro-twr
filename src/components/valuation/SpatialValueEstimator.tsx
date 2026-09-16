"use client";

import React, { useMemo, useState } from "react";
import {
  MarketComparableEntity,
  LegalitasEnum,
  TapakShapeEnum,
} from "@/types/database";
import {
  TrendingUp,
  MapPin,
  Compass,
  DollarSign,
  Layers,
  Printer,
  Copy,
  CheckCircle2,
  ExternalLink,
  Info,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SpatialValueEstimatorProps {
  subjectLocation: {
    latitude: number;
    longitude: number;
    alamat: string;
    luasTanah: number;
    luasBangunan: number;
    legalitas: LegalitasEnum;
    tapak: TapakShapeEnum;
  };
  properties: MarketComparableEntity[];
  radiusKm: number;
  onRadiusChange: (radius: 1 | 2 | 3 | 5) => void;
  onInspectComp: (comp: MarketComparableEntity) => void;
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function SpatialValueEstimator({
  subjectLocation,
  properties,
  radiusKm,
  onRadiusChange,
  onInspectComp,
}: SpatialValueEstimatorProps) {
  const toast = useToast();

  // Building specification inputs
  const [bldgRatePerM2, setBldgRatePerM2] = useState<number>(3500000);
  const [depreciationPercent, setDepreciationPercent] = useState<number>(15);

  // Filter properties within the active radius
  const compsInRadius = useMemo(() => {
    return properties
      .map((p) => {
        const distance = calculateDistanceMeters(
          subjectLocation.latitude,
          subjectLocation.longitude,
          p.latitude,
          p.longitude
        );
        return { ...p, distance_meters: distance };
      })
      .filter((p) => (p.distance_meters || 0) <= radiusKm * 1000)
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
  }, [properties, subjectLocation, radiusKm]);

  // Statistical Price Analysis
  const stats = useMemo(() => {
    const validPrices = compsInRadius
      .map((c) => c.kisaran_nilai_tanah)
      .filter((price): price is number => typeof price === "number" && price > 0)
      .sort((a, b) => a - b);

    if (validPrices.length === 0) {
      return {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
      };
    }

    const count = validPrices.length;
    const min = validPrices[0];
    const max = validPrices[count - 1];
    const sum = validPrices.reduce((acc, v) => acc + v, 0);
    const mean = Math.round(sum / count);

    const mid = Math.floor(count / 2);
    const median =
      count % 2 !== 0
        ? validPrices[mid]
        : Math.round((validPrices[mid - 1] + validPrices[mid]) / 2);

    return {
      count,
      min,
      max,
      mean,
      median,
    };
  }, [compsInRadius]);

  // Value Estimates Calculation
  const valuation = useMemo(() => {
    const unitPrice = stats.median > 0 ? stats.median : stats.mean;
    const totalLandValue = Math.round(unitPrice * subjectLocation.luasTanah);

    // Depreciated building unit price
    const depreciatedBldgRate = Math.round(
      bldgRatePerM2 * (1 - depreciationPercent / 100)
    );
    const totalBuildingValue = Math.round(
      depreciatedBldgRate * subjectLocation.luasBangunan
    );

    const totalPropertyValue = totalLandValue + totalBuildingValue;

    // Conservative (Low -5%) and Optimistic (High +5%)
    const lowEstimate = Math.round(totalPropertyValue * 0.95);
    const highEstimate = Math.round(totalPropertyValue * 1.05);

    return {
      unitLandPrice: unitPrice,
      totalLandValue,
      depreciatedBldgRate,
      totalBuildingValue,
      totalPropertyValue,
      lowEstimate,
      highEstimate,
    };
  }, [stats, subjectLocation, bldgRatePerM2, depreciationPercent]);

  const formatIdr = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  const copySummary = () => {
    const text = `HASIL ESTIMASI NILAI PROPERTI (SIPPRO-TWR)
Alamat: ${subjectLocation.alamat}
Luas Tanah: ${subjectLocation.luasTanah} m² | Luas Bangunan: ${subjectLocation.luasBangunan} m²
Berdasarkan analisis ${stats.count} data pembanding radius ${radiusKm} km:
- Median Harga Tanah: ${formatIdr(valuation.unitLandPrice)}/m²
- Estimasi Nilai Tanah: ${formatIdr(valuation.totalLandValue)}
- Estimasi Nilai Bangunan: ${formatIdr(valuation.totalBuildingValue)}
- TOTAL ESTIMASI NILAI PASAR: ${formatIdr(valuation.totalPropertyValue)}
Rentang Estimasi: ${formatIdr(valuation.lowEstimate)} s/d ${formatIdr(valuation.highEstimate)}`;

    navigator.clipboard.writeText(text);
    toast.success("Ringkasan estimasi disalin ke clipboard");
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Spatial Value Estimator
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Analisis Estimasi Nilai Properti
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subjectLocation.alamat}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Radius Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">
                Radius:
              </span>
              {([1, 2, 3, 5] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => onRadiusChange(r)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                    radiusKm === r
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Salin Ringkasan"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salin Hasil</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Highlight Valuation Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main Total Estimate Card */}
          <div className="md:col-span-1 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/30 dark:border-emerald-500/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-sans">
                Indikasi Estimasi Nilai Pasar
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono mt-1 tracking-tight">
                {formatIdr(valuation.totalPropertyValue)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Rentang Nilai:{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {formatIdr(valuation.lowEstimate)}
                </span>{" "}
                s/d{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {formatIdr(valuation.highEstimate)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Nilai Tanah ({subjectLocation.luasTanah} m²):</span>
                <span className="font-mono font-bold">{formatIdr(valuation.totalLandValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Nilai Bangunan ({subjectLocation.luasBangunan} m²):</span>
                <span className="font-mono font-bold">{formatIdr(valuation.totalBuildingValue)}</span>
              </div>
            </div>
          </div>

          {/* Statistical Benchmarks in Radius */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Statistik Komparasi Pasar (Radius {radiusKm} km)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dihitung dari {stats.count} data pembanding terdekat di area sekitar objek target
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {stats.count} Titik Pembanding
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Harga Terendah
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                  {formatIdr(stats.min)}/m²
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block font-sans font-bold">
                  Nilai Median
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {formatIdr(stats.median)}/m²
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Rata-Rata (Mean)
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                  {formatIdr(stats.mean)}/m²
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                  Harga Tertinggi
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                  {formatIdr(stats.max)}/m²
                </span>
              </div>
            </div>

            {/* Building Spec Adjuster */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Biaya Penggantian Baru Bangunan (RCN/m²)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={bldgRatePerM2}
                  onChange={(e) => setBldgRatePerM2(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tingkat Penyusutan Bangunan ({depreciationPercent}%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={depreciationPercent}
                    onChange={(e) => setDepreciationPercent(Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-xs w-10 text-right">
                    {depreciationPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparable Evidence List Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs space-y-3">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Bukti Pembanding Terdekat ({compsInRadius.length} Data)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data historis pasar yang menjadi rujukan kalkulasi estimasi nilai
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Urut berdasarkan jarak terdekat
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-4">No. DP</th>
                  <th className="py-2.5 px-4">Alamat & Lokasi</th>
                  <th className="py-2.5 px-4">Luas T / B</th>
                  <th className="py-2.5 px-4">Legalitas & Tapak</th>
                  <th className="py-2.5 px-4">Nilai Tanah/m²</th>
                  <th className="py-2.5 px-4">Jarak</th>
                  <th className="py-2.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {compsInRadius.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data pembanding dalam radius {radiusKm} km. Tingkatkan radius pencarian.
                    </td>
                  </tr>
                ) : (
                  compsInRadius.slice(0, 10).map((c) => {
                    const dist = c.distance_meters || 0;
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{c.legacy_no || c.id.slice(-4)}
                        </td>
                        <td className="py-2.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
                            {c.alamat}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {c.kecamatan ? `${c.kecamatan}, ` : ""}
                            {c.kota_kab}
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {c.luas_tanah} m² {c.luas_bangunan ? `/ ${c.luas_bangunan} m²` : ""}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {c.legalitas} • {c.tapak}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {c.kisaran_nilai_tanah
                            ? `Rp ${c.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                            : "N/A"}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(2)} km`}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onInspectComp(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-[11px] transition-all cursor-pointer"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpatialValueEstimator;
