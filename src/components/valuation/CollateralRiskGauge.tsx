"use client";

import React, { useState, useMemo } from "react";
import { LiquidationResult } from "@/lib/valuation/liquidation-engine";
import { ShieldCheck, AlertTriangle, TrendingDown, DollarSign, Clock, Scale } from "lucide-react";

interface CollateralRiskGaugeProps {
  liquidationData: LiquidationResult;
  landArea: number;
  buildingArea: number;
  indicatedLandUnitPrice: number;
  buildingDepreciatedUnitPrice: number;
  reportDate: string;
}

export function CollateralRiskGauge({
  liquidationData,
  landArea,
  buildingArea,
  indicatedLandUnitPrice,
  buildingDepreciatedUnitPrice,
  reportDate,
}: CollateralRiskGaugeProps) {
  // Format Currency IDR
  const formatIdr = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  // Interactive Haircut Sensitivity Modifier (Default from engine, can be adjusted for stress-testing)
  const [customHaircut, setCustomHaircut] = useState<number | null>(null);

  const effectiveHaircut = customHaircut !== null ? customHaircut : liquidationData.haircutPercent;
  const simulatedLiquidationValue = Math.round(liquidationData.totalMarketValue * (1 - effectiveHaircut));
  const simulatedPlafon = Math.round(simulatedLiquidationValue * 0.7);
  const safetyBuffer = simulatedLiquidationValue - simulatedPlafon;
  const safetyRatio = (safetyBuffer / simulatedLiquidationValue) * 100;

  // POJK 40 Expiry: 18 months from report date
  const validUntilDate = useMemo(() => {
    const d = new Date(reportDate);
    d.setMonth(d.getMonth() + 18);
    return d.toISOString().split("T")[0];
  }, [reportDate]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-100 shadow-xl space-y-4 font-sans">
      {/* Header with Risk Committee Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Konsol Risiko Agunan Bank (POJK 40/POJK.03/2019)
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                Tier-1 Eligible
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Simulasi haircut likuidasi paksa (forced sale) & limit plafon kredit independen
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div className="text-[10px]">
            <span className="text-slate-400">Masa Berlaku Penilaian:</span>
            <span className="ml-1 font-mono font-bold text-slate-200">{validUntilDate}</span>
          </div>
          <div className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Maks 18 Bulan</span>
          </div>
        </div>
      </div>

      {/* 4-Pillar Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Nilai Pasar */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider">
            <span>Nilai Pasar (MV)</span>
            <Scale className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {formatIdr(liquidationData.totalMarketValue)}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 font-mono border-t border-slate-800/60 pt-1.5">
            <div className="flex justify-between">
              <span>Tanah ({landArea}m²):</span>
              <span className="text-slate-200">
                {formatIdr(liquidationData.liquidationBreakdown.landMarketValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bangunan ({buildingArea}m²):</span>
              <span className="text-slate-200">
                {formatIdr(liquidationData.liquidationBreakdown.buildingMarketValue)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Haircut Likuidasi Slider */}
        <div className="bg-slate-950/60 border border-rose-950/50 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-rose-400 uppercase tracking-wider">
            <span>Haircut Likuidasi</span>
            <span className="font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded text-[10px]">
              {(effectiveHaircut * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2">
            <input
              type="range"
              min="0.10"
              max="0.50"
              step="0.05"
              value={effectiveHaircut}
              onChange={(e) => setCustomHaircut(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
            <span>10% (Min)</span>
            <span>Default: {(liquidationData.haircutPercent * 100).toFixed(0)}%</span>
            <span>50% (Stress)</span>
          </div>
          <div className="mt-1 text-[9px] text-rose-300/80 italic">
            Faktor: Tapak, marketability, & depresiasi waktu likuidasi &lt;180 hari
          </div>
        </div>

        {/* 3. Nilai Likuidasi */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-amber-400 uppercase tracking-wider">
            <span>Nilai Likuidasi (LV)</span>
            <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-1">
            {formatIdr(simulatedLiquidationValue)}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 font-mono border-t border-slate-800/60 pt-1.5">
            <div className="flex justify-between">
              <span>Likuidasi Tanah:</span>
              <span className="text-slate-200">
                {formatIdr(simulatedLiquidationValue * (liquidationData.liquidationBreakdown.landMarketValue / liquidationData.totalMarketValue))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Likuidasi Bangunan:</span>
              <span className="text-slate-200">
                {formatIdr(simulatedLiquidationValue * (liquidationData.liquidationBreakdown.buildingMarketValue / liquidationData.totalMarketValue))}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Plafon Kredit Maksimal */}
        <div className="bg-slate-950/60 border border-emerald-950/50 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 uppercase tracking-wider">
            <span>Plafon Maksimal (LTV 70%)</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-300 mt-1">
            {formatIdr(simulatedPlafon)}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 font-mono border-t border-slate-800/60 pt-1.5">
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Safety Headroom:</span>
              <span>{formatIdr(safetyBuffer)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Coverage Ratio:</span>
              <span>{safetyRatio.toFixed(1)}% buffer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Liquidation Waterfall & Headroom Progress */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded p-3 space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-semibold uppercase tracking-wider">Waterfall Dekomposisi Risiko Agunan</span>
          <span className="font-mono">
            Plafon ({formatIdr(simulatedPlafon)}) &le; Likuidasi ({formatIdr(simulatedLiquidationValue)}) &le; Pasar ({formatIdr(liquidationData.totalMarketValue)})
          </span>
        </div>

        <div className="h-3 w-full bg-slate-800 rounded overflow-hidden flex">
          {/* Plafon bar (LTV portion) */}
          <div
            style={{ width: `${(simulatedPlafon / liquidationData.totalMarketValue) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-300"
            title="Plafon Kredit Maksimal"
          />
          {/* Buffer bar (Liquidation headroom) */}
          <div
            style={{ width: `${((simulatedLiquidationValue - simulatedPlafon) / liquidationData.totalMarketValue) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title="Safety Headroom"
          />
          {/* Haircut bar (Discount lost) */}
          <div
            style={{ width: `${(effectiveHaircut) * 100}%` }}
            className="bg-rose-600/80 h-full transition-all duration-300"
            title="Forced Sale Haircut"
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Plafon Pinjaman ({((simulatedPlafon / liquidationData.totalMarketValue) * 100).toFixed(0)}%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Safety Margin ({(((simulatedLiquidationValue - simulatedPlafon) / liquidationData.totalMarketValue) * 100).toFixed(0)}%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
              <span>Haircut Likuidasi ({(effectiveHaircut * 100).toFixed(0)}%)</span>
            </span>
          </div>
          <span className="text-slate-500 font-mono">100% Nilai Pasar</span>
        </div>
      </div>
    </div>
  );
}
