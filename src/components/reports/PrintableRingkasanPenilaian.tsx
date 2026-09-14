"use client";

import React from "react";
import { LiquidationResult } from "@/lib/valuation/liquidation-engine";
import { MarketValuationResult } from "@/lib/valuation/market-approach-engine";

interface PrintableRingkasanPenilaianProps {
  reportNumber: string;
  debiturName: string;
  nop: string;
  alamat: string;
  batas: {
    utara: string;
    selatan: string;
    timur: string;
    barat: string;
  };
  legalitas: string;
  luasTanah: number;
  luasBangunan: number;
  inspectionDate: string;
  reportDate: string;
  surveyorName: string;
  surveyorVehiclePlate?: string;
  reviewerName: string;
  valuationResult: MarketValuationResult;
  liquidationResult: LiquidationResult;
  justificationText?: string;
}

export function PrintableRingkasanPenilaian({
  reportNumber,
  debiturName,
  nop,
  alamat,
  batas,
  legalitas,
  luasTanah,
  luasBangunan,
  inspectionDate,
  reportDate,
  surveyorName,
  surveyorVehiclePlate,
  reviewerName,
  valuationResult,
  liquidationResult,
  justificationText,
}: PrintableRingkasanPenilaianProps) {
  const formatIdr = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto text-slate-900 border border-slate-200 shadow-md print:shadow-none print:border-none print:p-0 font-sans text-xs">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
        <div>
          <div className="text-xl font-black tracking-tight text-slate-900">
            RINGKASAN LAPORAN PENILAIAN PROPERTI (AGUNAN BANK)
          </div>
          <div className="text-[11px] text-slate-600 uppercase font-semibold tracking-wider mt-1">
            Standar Penilaian Indonesia (SPI 101-106, SPI 202) & POJK NO. 40/POJK.03/2019
          </div>
        </div>
        <div className="text-right font-mono text-[11px]">
          <div><span className="text-slate-500">No. Laporan:</span> {reportNumber}</div>
          <div><span className="text-slate-500">Tgl. Laporan:</span> {reportDate}</div>
        </div>
      </div>

      {/* 1. IDENTITAS OBJEK PENILAIAN */}
      <div className="mb-6">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase text-[11px] bg-slate-100 px-2 py-0.5">
          I. Identitas Objek Penilaian & Legalitas
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-2">
          <div><span className="font-semibold text-slate-600">Nama Calon Debitur:</span> {debiturName}</div>
          <div><span className="font-semibold text-slate-600">NOP (18 Digit):</span> <span className="font-mono">{nop}</span></div>
          <div className="col-span-2"><span className="font-semibold text-slate-600">Alamat Properti:</span> {alamat}</div>
          <div><span className="font-semibold text-slate-600">Legalitas Hak:</span> {legalitas}</div>
          <div><span className="font-semibold text-slate-600">Luas Objek:</span> Tanah: {luasTanah} m² | Bangunan: {luasBangunan} m²</div>
          <div className="col-span-2 text-[10px] text-slate-600 mt-1">
            <span className="font-semibold">Batas Properti (SPI 104):</span> U: {batas.utara} | S: {batas.selatan} | T: {batas.timur} | B: {batas.barat}
          </div>
        </div>
      </div>

      {/* 2. HASIL INSPEKSI LAPANGAN */}
      <div className="mb-6">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase text-[11px] bg-slate-100 px-2 py-0.5">
          II. Verifikasi Inspeksi Lapangan (On-The-Spot / OTS)
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 px-2">
          <div><span className="font-semibold text-slate-600">Tanggal Inspeksi (OTS):</span> {inspectionDate}</div>
          <div><span className="font-semibold text-slate-600">Penilai / Surveyor:</span> {surveyorName}</div>
          <div>
            <span className="font-semibold text-slate-600">Kendaraan Operasional Lapangan:</span>{" "}
            <span className="font-mono">{surveyorVehiclePlate || "Kendaraan Kantor Cabang"}</span>
          </div>
          <div><span className="font-semibold text-slate-600">Reviewer / Pengawas:</span> {reviewerName}</div>
        </div>
      </div>

      {/* 3. ANALISIS PENDEKATAN PASAR (SPI 106) */}
      <div className="mb-6">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase text-[11px] bg-slate-100 px-2 py-0.5">
          III. Analisis Penyesuaian Data Pembanding (SPI 106)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-300 p-1.5 text-left">Pembanding</th>
                <th className="border border-slate-300 p-1.5 text-right">Harga Awal / m²</th>
                <th className="border border-slate-300 p-1.5 text-right">Net Penyesuaian</th>
                <th className="border border-slate-300 p-1.5 text-right">Gross Penyesuaian</th>
                <th className="border border-slate-300 p-1.5 text-right">Indikasi Nilai / m²</th>
                <th className="border border-slate-300 p-1.5 text-right">Bobot (wi)</th>
              </tr>
            </thead>
            <tbody>
              {valuationResult.comparables.map((c) => (
                <tr key={c.id}>
                  <td className="border border-slate-300 p-1.5">{c.name}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatIdr(c.baseUnitPrice)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{(c.netAdjustment * 100).toFixed(1)}%</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{(c.grossAdjustment * 100).toFixed(1)}%</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatIdr(c.adjustedUnitPrice)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{(c.weight * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={4} className="border border-slate-300 p-1.5 text-right">
                  Indikasi Nilai Pasar Tanah Tertimbang per m²:
                </td>
                <td colSpan={2} className="border border-slate-300 p-1.5 text-right font-mono text-xs">
                  {formatIdr(valuationResult.indicatedLandUnitPrice)} / m²
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {justificationText && (
          <div className="mt-2 p-2 border border-slate-200 bg-slate-50 text-[10px] text-slate-700">
            <span className="font-semibold">Justifikasi Penilai (Auditor Note):</span> {justificationText}
          </div>
        )}
      </div>

      {/* 4. KESIMPULAN NILAI & LIKUIDASI (SPI 202) */}
      <div className="mb-6">
        <h4 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 uppercase text-[11px] bg-slate-100 px-2 py-0.5">
          IV. Kesimpulan Nilai Pasar & Nilai Likuidasi (SPI 202)
        </h4>
        <table className="w-full border-collapse border border-slate-300 text-xs font-mono">
          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-sans font-medium w-1/2">Nilai Pasar Tanah ({luasTanah} m²)</td>
              <td className="border border-slate-300 p-2 text-right font-bold">{formatIdr(liquidationResult.liquidationBreakdown.landMarketValue)}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-sans font-medium">Nilai Pasar Bangunan ({luasBangunan} m²)</td>
              <td className="border border-slate-300 p-2 text-right font-bold">{formatIdr(liquidationResult.liquidationBreakdown.buildingMarketValue)}</td>
            </tr>
            <tr className="bg-slate-100 text-sm font-bold">
              <td className="border border-slate-300 p-2 font-sans">TOTAL NILAI PASAR (MARKET VALUE)</td>
              <td className="border border-slate-300 p-2 text-right text-slate-900">{formatIdr(liquidationResult.totalMarketValue)}</td>
            </tr>
            <tr className="text-rose-900">
              <td className="border border-slate-300 p-2 font-sans font-medium">
                Potongan Likuidasi Paksa (Haircut SPI 202: {(liquidationResult.haircutPercent * 100).toFixed(0)}%)
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                - {formatIdr(liquidationResult.totalMarketValue - liquidationResult.totalLiquidationValue)}
              </td>
            </tr>
            <tr className="bg-rose-50 text-sm font-bold text-rose-950">
              <td className="border border-slate-300 p-2 font-sans">TOTAL NILAI LIKUIDASI (LIQUIDATION VALUE)</td>
              <td className="border border-slate-300 p-2 text-right">{formatIdr(liquidationResult.totalLiquidationValue)}</td>
            </tr>
            <tr className="bg-sky-50 font-bold text-sky-950">
              <td className="border border-slate-300 p-2 font-sans">REKOMENDASI MAKSIMUM PLAFON KREDIT (LTV 70%)</td>
              <td className="border border-slate-300 p-2 text-right">{formatIdr(liquidationResult.maxLoanCeiling)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. PERNYATAAN PENILAI (KEPI) */}
      <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 uppercase">Pernyataan Penilai Berdasarkan Kode Etik Penilai Indonesia (KEPI):</div>
        <p>
          1. Kami menyatakan bahwa penilaian ini dilaksanakan secara independen, objektif, dan bebas dari benturan kepentingan (conflict of interest) dengan debitur ataupun pihak bank terkait.
        </p>
        <p>
          2. Seluruh fakta dan data dalam laporan ini telah diverifikasi melalui inspeksi fisik langsung dan analisis pasar lokal sesuai Standar Penilaian Indonesia (SPI).
        </p>
        <div className="grid grid-cols-2 gap-8 pt-8 text-center">
          <div>
            <div className="border-b border-slate-400 pb-16"></div>
            <div className="font-bold mt-1 text-slate-800">{surveyorName}</div>
            <div className="text-[9px] text-slate-500">Penilai Properti Terdaftar (MAPPI)</div>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-16"></div>
            <div className="font-bold mt-1 text-slate-800">{reviewerName}</div>
            <div className="text-[9px] text-slate-500">Reviewer / Kepala Cabang KJPP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
