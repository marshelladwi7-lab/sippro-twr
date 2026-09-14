"use client";

import React, { useMemo } from "react";
import {
  calculateMarketApproach,
  ComparableAdjustmentInput,
  MarketValuationResult,
} from "@/lib/valuation/market-approach-engine";
import { MarketComparableEntity } from "@/types/database";
import { ShieldCheck, AlertCircle, FileSpreadsheet, Percent, Info } from "lucide-react";

interface HighDensityKkpGridProps {
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
  onInspectComp?: (comp: MarketComparableEntity) => void;
}

export function HighDensityKkpGrid({
  subjectData,
  selectedComps,
  adjustments,
  onAdjustmentChange,
  justifications,
  onJustificationChange,
  onInspectComp,
}: HighDensityKkpGridProps) {
  // 1. Prepare comp adjustment inputs
  const compInputs: ComparableAdjustmentInput[] = useMemo(() => {
    return selectedComps.map((c) => {
      const adj = adjustments[c.id] || {
        transactionTypeDiscount: -0.10, // Standard 10% offering discount
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

  // 2. Run SPI 106 mathematical engine
  const valuationResult: MarketValuationResult = useMemo(() => {
    return calculateMarketApproach(compInputs);
  }, [compInputs]);

  // Format Currency
  const formatIdr = (val: number) => `Rp ${Math.round(val).toLocaleString("id-ID")}`;

  if (selectedComps.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/60 text-slate-400 font-sans">
        <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        <p className="text-xs font-semibold text-slate-300">Belum ada data pembanding yang dipilih.</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Pilih minimal 3 data pembanding dari peta spasial atau daftar bank data untuk memuat lembar KKP SPI 106.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg text-slate-200 overflow-hidden shadow-xl font-sans">
      {/* KKP Header Bar */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-100">
            Kertas Kerja Penilaian (KKP) — Pendekatan Pasar (SPI 106)
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {selectedComps.length} Pembanding
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-slate-400">Indikasi Rekonsiliasi:</span>
            <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              {formatIdr(valuationResult.indicatedLandUnitPrice)}/m²
            </span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-[10px]">Standar Deviasi: Rp {Math.round((valuationResult as any).standardDeviation || 0).toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* High-Density Spreadsheet Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="sticky top-0 z-20 bg-slate-950 border-b border-slate-800 shadow-sm">
            <tr>
              <th className="p-2.5 text-[11px] font-semibold text-slate-400 w-52 sticky left-0 bg-slate-950 z-30 border-r border-slate-800">
                Elemen Perbandingan
              </th>
              <th className="p-2.5 text-[11px] font-bold text-rose-300 bg-rose-950/40 w-60 border-r border-slate-800">
                Objek Penilaian (Agunan)
              </th>
              {selectedComps.map((c, idx) => (
                <th key={c.id} className="p-2.5 text-[11px] font-semibold text-slate-200 border-r border-slate-800 min-w-[210px]">
                  <div className="flex items-center justify-between">
                    <span>Pembanding {idx + 1}</span>
                    {onInspectComp && (
                      <button
                        onClick={() => onInspectComp(c)}
                        className="text-[10px] text-sky-400 hover:text-sky-300 font-mono underline"
                      >
                        Inspeksi
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal">
                    DP #{c.legacy_no || c.id.slice(0, 6)} • {c.distance_meters || 0}m
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
            {/* 1. Alamat */}
            <tr className="hover:bg-slate-800/40">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Lokasi / Alamat
              </td>
              <td className="p-2 font-sans text-rose-200 bg-rose-950/20 border-r border-slate-800">
                {subjectData.alamat}
              </td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 font-sans text-slate-300 border-r border-slate-800">
                  {c.alamat}
                </td>
              ))}
            </tr>

            {/* 2. Luas Tanah */}
            <tr className="hover:bg-slate-800/40">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Luas Tanah (LT)
              </td>
              <td className="p-2 font-bold text-rose-200 bg-rose-950/20 border-r border-slate-800">
                {subjectData.luasTanah.toLocaleString("id-ID")} m²
              </td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  {c.luas_tanah?.toLocaleString("id-ID") || "-"} m²
                </td>
              ))}
            </tr>

            {/* 3. Legalitas */}
            <tr className="hover:bg-slate-800/40">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Legalitas Sertifikat
              </td>
              <td className="p-2 font-semibold text-rose-200 bg-rose-950/20 border-r border-slate-800">
                {subjectData.legalitas}
              </td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  {c.legalitas}
                </td>
              ))}
            </tr>

            {/* 4. Bentuk Tapak */}
            <tr className="hover:bg-slate-800/40">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Bentuk Tapak
              </td>
              <td className="p-2 text-rose-200 bg-rose-950/20 border-r border-slate-800">
                {subjectData.tapak}
              </td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  {c.tapak}
                </td>
              ))}
            </tr>

            {/* 5. Lebar ROW Jalan */}
            <tr className="hover:bg-slate-800/40">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Lebar Jalan Masuk (ROW)
              </td>
              <td className="p-2 text-rose-200 bg-rose-950/20 border-r border-slate-800">
                {subjectData.rowJalan} meter
              </td>
              {selectedComps.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  {c.row_jalan ? `${c.row_jalan} meter` : "-"}
                </td>
              ))}
            </tr>

            {/* 6. Harga Satuan Awal */}
            <tr className="bg-slate-950/90 font-bold">
              <td className="p-2 font-sans text-slate-200 sticky left-0 bg-slate-950 border-r border-slate-800">
                Harga Penawaran / Satuan
              </td>
              <td className="p-2 bg-rose-950/40 text-rose-300 border-r border-slate-800">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 text-sky-400 border-r border-slate-800">
                  {formatIdr(c.baseUnitPrice)}/m²
                </td>
              ))}
            </tr>

            {/* ADJUSTMENT SECTION HEADER */}
            <tr className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 font-sans font-bold">
              <td colSpan={2 + selectedComps.length} className="p-1.5 px-3 bg-slate-950 border-y border-slate-800">
                Tabel Penyesuaian Bobot (Adjustment Matrix SPI 106)
              </td>
            </tr>

            {/* 7. Δ Diskon Penawaran */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Diskon Penawaran Transaksi
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.transactionTypeDiscount * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "transactionTypeDiscount", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 8. Δ Waktu */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Tren Waktu / Kondisi Pasar
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.timeTrend * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "timeTrend", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 9. Δ Lokasi */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Lokasi & Aksesibilitas
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.location * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "location", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 10. Δ Legalitas */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Sertifikat & Legalitas
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.legalDelta * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "legalDelta", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 11. Δ Bentuk Tapak */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Bentuk Tapak (Shape)
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.tapakDelta * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "tapakDelta", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 12. Δ Lebar Jalan ROW */}
            <tr className="hover:bg-slate-800/30">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-900 border-r border-slate-800">
                Δ Akses Jalan (ROW)
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      value={Math.round(c.adjustments.roadAccessDelta * 100)}
                      onChange={(e) =>
                        onAdjustmentChange(c.id, "roadAccessDelta", (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-white text-[11px] focus:border-sky-500 outline-none"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 13. TOTAL NET ADJUSTMENT */}
            <tr className="bg-slate-950/80 font-bold">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-950 border-r border-slate-800">
                Total Penyesuaian Bersih (Net)
              </td>
              <td className="p-2 bg-rose-950/30 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => {
                const isHigh = Math.abs(c.netAdjustment) > 0.20;
                return (
                  <td
                    key={c.id}
                    className={`p-2 border-r border-slate-800 ${
                      isHigh ? "text-rose-400 font-black" : "text-emerald-400"
                    }`}
                  >
                    {(c.netAdjustment * 100).toFixed(1)}%
                    {isHigh && <span className="ml-1 text-[9px] text-rose-400">(&gt;20%)</span>}
                  </td>
                );
              })}
            </tr>

            {/* 14. TOTAL GROSS ADJUSTMENT */}
            <tr className="bg-slate-950/80 font-bold">
              <td className="p-2 font-sans text-slate-300 sticky left-0 bg-slate-950 border-r border-slate-800">
                Total Penyesuaian Mutlak (Gross)
              </td>
              <td className="p-2 bg-rose-950/30 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => {
                const isBreach = c.grossAdjustment > 0.30;
                return (
                  <td
                    key={c.id}
                    className={`p-2 border-r border-slate-800 ${
                      isBreach ? "text-amber-400 font-black" : "text-slate-300"
                    }`}
                  >
                    {(c.grossAdjustment * 100).toFixed(1)}%
                    {isBreach && <span className="ml-1 text-[9px] text-amber-400">(&gt;30%)</span>}
                  </td>
                );
              })}
            </tr>

            {/* 15. ADJUSTED UNIT PRICE */}
            <tr className="bg-emerald-950/40 font-bold text-white text-xs">
              <td className="p-2 font-sans text-emerald-300 sticky left-0 bg-emerald-950/80 border-r border-slate-800">
                Nilai Indikasi Terkoreksi (Rp/m²)
              </td>
              <td className="p-2 bg-rose-900/40 text-rose-200 border-r border-slate-800 font-mono">
                {formatIdr(valuationResult.indicatedLandUnitPrice)}/m²
              </td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 text-emerald-300 border-r border-slate-800">
                  {formatIdr(c.adjustedUnitPrice)}/m²
                </td>
              ))}
            </tr>

            {/* 16. WEIGHT CONTRIBUTION BAR */}
            <tr className="bg-slate-950/90 text-[10px]">
              <td className="p-2 font-sans font-medium text-slate-400 sticky left-0 bg-slate-950 border-r border-slate-800">
                Bobot Kontribusi Rekonsiliasi (wi)
              </td>
              <td className="p-2 bg-rose-950/20 text-rose-300 border-r border-slate-800 font-mono">100.0%</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-200 font-bold">{(c.weight * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded overflow-hidden mt-1">
                    <div
                      style={{ width: `${c.weight * 100}%` }}
                      className="bg-emerald-400 h-full rounded"
                    />
                  </div>
                </td>
              ))}
            </tr>

            {/* 17. SPI 106 COMPLIANCE STATUS */}
            <tr className="bg-slate-900">
              <td className="p-2 font-sans text-slate-400 sticky left-0 bg-slate-900 border-r border-slate-800">
                Kepatuhan Standar SPI 106
              </td>
              <td className="p-2 bg-rose-950/20 border-r border-slate-800 text-slate-500">-</td>
              {valuationResult.comparables.map((c) => (
                <td key={c.id} className="p-2 border-r border-slate-800">
                  {c.compliance.isCompliant ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                      ✓ Patuh SPI
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      ⚠ Deviasi Tinggi
                    </span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mandatory Auditor & Risk Committee Justification Box */}
      {valuationResult.auditNotes.length > 0 && (
        <div className="p-3 bg-amber-950/30 border-t border-amber-800/40 text-xs text-amber-200 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Catatan Kepatuhan Penilai Independen (Wajib menurut SPI 106 & POJK 40):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-300/90 font-mono">
            {valuationResult.auditNotes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
          <div>
            <textarea
              className="w-full p-2 bg-slate-950 border border-amber-700/50 rounded text-xs text-slate-200 font-sans focus:border-amber-400 outline-none"
              rows={2}
              placeholder="Berikan alasan profesional penilai terkait deviasi bobot atau penyesuaian pasar di atas 20%..."
              value={justifications["general"] || ""}
              onChange={(e) => onJustificationChange("general", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
