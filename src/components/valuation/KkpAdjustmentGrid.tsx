"use client";

import React, { useMemo } from "react";
import {
  calculateMarketApproach,
  ComparableAdjustmentInput,
  MarketValuationResult,
} from "@/lib/valuation/market-approach-engine";
import { MarketComparableEntity } from "@/types/database";

interface KkpAdjustmentGridProps {
  subjectData: {
    alamat: string;
    luasTanah: number;
    luasBangunan: number;
    legalitas: string;
    tapak: string;
    rowJalan: number;
  };
  selectedComps: MarketComparableEntity[];
  adjustments: Record<string, any>;
  onAdjustmentChange: (compId: string, field: string, value: number) => void;
  justifications: Record<string, string>;
  onJustificationChange: (compId: string, text: string) => void;
}

export function KkpAdjustmentGrid({
  subjectData,
  selectedComps,
  adjustments,
  onAdjustmentChange,
  justifications,
  onJustificationChange,
}: KkpAdjustmentGridProps) {
  const compInputs: ComparableAdjustmentInput[] = useMemo(() => {
    return selectedComps.map((c) => {
      const adj = adjustments[c.id] || {
        transactionTypeDiscount: -0.10, // Default 10% discount for offering
        timeTrend: 0.0,
        location: 0.0,
        legalDelta: 0.0,
        tapakDelta: 0.0,
        roadAccessDelta: 0.0,
      };

      return {
        id: c.id,
        name: `DP #${c.legacy_no || c.id.slice(0, 5)}`,
        baseUnitPrice: c.kisaran_nilai_tanah || 5000000,
        adjustments: adj,
      };
    });
  }, [selectedComps, adjustments]);

  const valuationResult: MarketValuationResult = useMemo(() => {
    return calculateMarketApproach(compInputs);
  }, [compInputs]);

  if (selectedComps.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 text-slate-500">
        <p className="text-sm font-medium">Belum ada data pembanding yang dipilih.</p>
        <p className="text-xs text-slate-400 mt-1">
          Klik pin data pembanding pada peta atau pilih dari daftar untuk memuat KKP.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="p-2.5 font-semibold w-48 sticky left-0 bg-slate-100/90 z-10">
                Parameter Penilaian (SPI 106)
              </th>
              <th className="p-2.5 font-semibold bg-rose-50 text-rose-900 border-r border-slate-200 w-56">
                Objek Penilaian (Agunan)
              </th>
              {valuationResult.comparables.map((c, idx) => (
                <th key={c.id} className="p-2.5 font-semibold text-slate-900 border-r border-slate-200 min-w-[200px]">
                  Pembanding {idx + 1} ({c.name})
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
            {/* Alamat & Wilayah */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-medium font-sans sticky left-0 bg-white">Alamat Lengkap</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">{subjectData.alamat}</td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200 font-sans">
                  {c.alamat} ({c.kecamatan})
                </td>
              ))}
            </tr>

            {/* Luas Tanah */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-medium font-sans sticky left-0 bg-white">Luas Tanah (m²)</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200 font-bold">{subjectData.luasTanah} m²</td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">{c.luas_tanah} m²</td>
              ))}
            </tr>

            {/* Legalitas */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-medium font-sans sticky left-0 bg-white">Legalitas Hak</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">{subjectData.legalitas}</td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">{c.legalitas}</td>
              ))}
            </tr>

            {/* Bentuk Tapak */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-medium font-sans sticky left-0 bg-white">Bentuk Tapak</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">{subjectData.tapak}</td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">{c.tapak}</td>
              ))}
            </tr>

            {/* Lebar Jalan ROW */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-medium font-sans sticky left-0 bg-white">Lebar Jalan (ROW)</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">{subjectData.rowJalan} meter</td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">{c.row_jalan} meter</td>
              ))}
            </tr>

            {/* Harga Dasar per m2 */}
            <tr className="bg-slate-50 font-bold text-slate-900">
              <td className="p-2 font-sans sticky left-0 bg-slate-50">Harga Satuan Awal (Rp/m²)</td>
              <td className="p-2 bg-rose-50/60 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200 text-sky-700">
                  Rp {c.baseUnitPrice.toLocaleString("id-ID")}
                </td>
              ))}
            </tr>

            {/* Penyesuaian Penawaran */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Penawaran / Transaksi</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.transactionTypeDiscount * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "transactionTypeDiscount", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Penyesuaian Waktu */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Waktu / Pasar</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.timeTrend * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "timeTrend", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Penyesuaian Lokasi */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Lokasi & Aksesibilitas</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.location * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "location", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Penyesuaian Legalitas */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Dokumen Legalitas</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.legalDelta * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "legalDelta", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Penyesuaian Tapak */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Bentuk Tapak</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.tapakDelta * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "tapakDelta", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Penyesuaian ROW */}
            <tr className="hover:bg-slate-50">
              <td className="p-2 font-sans sticky left-0 bg-white">Δ Lebar Jalan Masuk</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  <input
                    type="number"
                    step="1"
                    value={Math.round(c.adjustments.roadAccessDelta * 100)}
                    onChange={(e) =>
                      onAdjustmentChange(c.id, "roadAccessDelta", parseFloat(e.target.value) / 100 || 0)
                    }
                    className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-right bg-white"
                  />
                  <span className="ml-1 text-slate-500">%</span>
                </td>
              ))}
            </tr>

            {/* Total Net Adjustment */}
            <tr className="bg-slate-50/70 font-semibold">
              <td className="p-2 font-sans sticky left-0 bg-slate-50">Net Penyesuaian (%)</td>
              <td className="p-2 bg-rose-50/50 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td
                  key={c.id}
                  className={`p-2 border-r border-slate-200 ${
                    Math.abs(c.netAdjustment) > 0.20 ? "text-rose-600 font-bold" : "text-emerald-700"
                  }`}
                >
                  {(c.netAdjustment * 100).toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* Total Gross Adjustment */}
            <tr className="bg-slate-50/70 font-semibold">
              <td className="p-2 font-sans sticky left-0 bg-slate-50">Gross Penyesuaian (%)</td>
              <td className="p-2 bg-rose-50/50 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td
                  key={c.id}
                  className={`p-2 border-r border-slate-200 ${
                    c.grossAdjustment > 0.30 ? "text-rose-600 font-bold" : "text-emerald-700"
                  }`}
                >
                  {(c.grossAdjustment * 100).toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* Indikasi Harga Satuan Terkoreksi */}
            <tr className="bg-sky-50 font-bold text-sky-950">
              <td className="p-2 font-sans sticky left-0 bg-sky-50">Nilai Indikasi Tanah (Rp/m²)</td>
              <td className="p-2 bg-rose-100/50 border-r border-slate-200 text-rose-900">
                Rp {valuationResult.indicatedLandUnitPrice.toLocaleString("id-ID")}/m²
              </td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200">
                  Rp {c.adjustedUnitPrice.toLocaleString("id-ID")}
                </td>
              ))}
            </tr>

            {/* Bobot Kontribusi */}
            <tr className="bg-slate-100/70 font-medium">
              <td className="p-2 font-sans sticky left-0 bg-slate-100">Bobot Kontribusi (wi)</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">100.0%</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200 text-slate-800">
                  {(c.weight * 100).toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* SPI 106 Compliance Status */}
            <tr>
              <td className="p-2 font-sans sticky left-0 bg-white">Status Kepatuhan SPI 106</td>
              <td className="p-2 bg-rose-50/40 border-r border-slate-200">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-200 font-sans">
                  {c.compliance.isCompliant ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      Memenuhi Standar SPI
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                      Melebihi Batas &gt;20%/30%
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mandatory Justification Box for Auditors */}
      {valuationResult.auditNotes.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs text-amber-900">
          <div className="font-semibold flex items-center space-x-1">
            <span>⚠️ Justifikasi Tertulis Penilai Wajib (SPI 106 & POJK 40):</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
            {valuationResult.auditNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
          <div className="pt-2">
            <textarea
              className="w-full p-2 border border-amber-300 rounded text-xs bg-white text-slate-800"
              rows={2}
              placeholder="Masukkan alasan deviasi penyesuaian pasar (contoh: minimnya pasokan ruko di radius 1km)..."
              value={justifications["general"] || ""}
              onChange={(e) => onJustificationChange("general", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
