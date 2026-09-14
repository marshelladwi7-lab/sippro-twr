"use client";

import React from "react";
import { LiquidationResult } from "@/lib/valuation/liquidation-engine";

interface ExecutiveBankSummaryCardProps {
  liquidationData: LiquidationResult;
  landArea: number;
  buildingArea: number;
  indicatedLandUnitPrice: number;
  buildingDepreciatedUnitPrice: number;
  reportDate: string;
}

export function ExecutiveBankSummaryCard({
  liquidationData,
  landArea,
  buildingArea,
  indicatedLandUnitPrice,
  buildingDepreciatedUnitPrice,
  reportDate,
}: ExecutiveBankSummaryCardProps) {
  // Format Currency IDR
  const formatIdr = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  // POJK 40 Expiry: 18 months from report date
  const validUntilDate = new Date(reportDate);
  validUntilDate.setMonth(validUntilDate.getMonth() + 18);
  const formattedExpiry = validUntilDate.toISOString().split("T")[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Ringkasan Eksekutif Komite Kredit Bank
          </h3>
          <p className="text-xs text-slate-500">
            Kepatuhan Standar Penilaian Indonesia (SPI 202) & POJK 40/POJK.03/2019
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Agunan Layak Diterima
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">Masa Berlaku s/d: {formattedExpiry}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nilai Pasar */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="text-xs font-medium text-slate-500 uppercase">Nilai Pasar (Market Value)</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatIdr(liquidationData.totalMarketValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
            <div>Tanah ({landArea} m²): {formatIdr(liquidationData.liquidationBreakdown.landMarketValue)}</div>
            <div>Bangunan ({buildingArea} m²): {formatIdr(liquidationData.liquidationBreakdown.buildingMarketValue)}</div>
          </div>
        </div>

        {/* Nilai Likuidasi */}
        <div className="p-4 rounded-lg bg-rose-50/60 border border-rose-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800 uppercase">Nilai Likuidasi Agunan</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
              Haircut {(liquidationData.haircutPercent * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-xl font-black text-rose-900 mt-1">
            {formatIdr(liquidationData.totalLiquidationValue)}
          </div>
          <div className="text-[11px] text-rose-700 mt-2 space-y-0.5">
            <div>Likuidasi Tanah: {formatIdr(liquidationData.liquidationBreakdown.landLiquidationValue)}</div>
            <div>Likuidasi Bangunan: {formatIdr(liquidationData.liquidationBreakdown.buildingLiquidationValue)}</div>
          </div>
        </div>

        {/* Plafon Pinjaman Maksimal (LTV) */}
        <div className="p-4 rounded-lg bg-sky-50/60 border border-sky-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800 uppercase">Plafon Kredit Maksimum (LTV 70%)</span>
            <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
              POJK 40 Capped
            </span>
          </div>
          <div className="text-xl font-black text-sky-950 mt-1">
            {formatIdr(liquidationData.maxLoanCeiling)}
          </div>
          <div className="text-[11px] text-sky-800 mt-2">
            Rekomendasi pencairan maksimal bank yang aman terhadap risiko likuidasi paksa (forced sale).
          </div>
        </div>
      </div>
    </div>
  );
}
