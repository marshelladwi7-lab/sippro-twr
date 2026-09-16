"use client";

import React, { useEffect, useId } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Compass,
  FileCheck2,
  Calendar,
  UserCheck,
  Car,
  Shield,
  Layers,
  Sparkles,
  Info,
  Copy,
} from "lucide-react";
import {
  MarketComparableEntity,
  LegalitasEnum,
  TapakShapeEnum,
} from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export interface ComparableInspectorDrawerProps {
  comp: MarketComparableEntity | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (compId: string) => void;
  onEdit?: (comp: MarketComparableEntity) => void;
  className?: string;
}

// Visualizer for Indonesian Tapak / Lot Shapes
function TapakShapeVisualizer({ shape }: { shape: TapakShapeEnum }) {
  const getShapeDetails = () => {
    switch (shape) {
      case "PERSEGI":
        return {
          label: "Persegi (Standard Rectangular)",
          description: "Proporsi tapak ideal, pemanfaatan lahan optimal (100% efisiensi).",
          svg: (
            <svg className="w-8 h-8 text-sky-600" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              <line x1="4" y1="28" x2="28" y2="28" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="3 2" />
            </svg>
          ),
        };
      case "HOOK":
        return {
          label: "Hook (Corner Lot)",
          description: "Dua muka jalan (akses ganda), sirkulasi dan pencahayaan prima. Nilai pasar memiliki premi +5% s/d +15%.",
          svg: (
            <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 32 32" fill="none">
              <path d="M6 6 H22 V22 H6 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              {/* Dual road frontage */}
              <line x1="2" y1="26" x2="26" y2="26" stroke="#10b981" strokeWidth="2.5" />
              <line x1="26" y1="2" x2="26" y2="26" stroke="#10b981" strokeWidth="2.5" />
            </svg>
          ),
        };
      case "L_SHAPE":
        return {
          label: "L-Shape (Bentuk L)",
          description: "Tapak menyiku dengan potensi lahan mati di bagian sudut dalam.",
          svg: (
            <svg className="w-8 h-8 text-amber-600" viewBox="0 0 32 32" fill="none">
              <path d="M6 6 H24 V16 H14 V26 H6 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              <line x1="4" y1="28" x2="16" y2="28" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 2" />
            </svg>
          ),
        };
      case "TUSUK_SATE":
        return {
          label: "Tusuk Sate (T-Junction Facing)",
          description: "Posisi berhadapan langsung dengan poros jalan lurus. Berisiko haircut nilai pasar -10% s/d -20% pada properti residensial.",
          svg: (
            <svg className="w-8 h-8 text-rose-600" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              {/* T-junction road hitting center */}
              <line x1="16" y1="30" x2="16" y2="20" stroke="#f43f5e" strokeWidth="3" />
              <line x1="4" y1="20" x2="28" y2="20" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="16,21 13,25 19,25" fill="#f43f5e" />
            </svg>
          ),
        };
      case "KANTONG_SEMAR":
        return {
          label: "Kantong Semar (Bottle / Pouch)",
          description: "Bagian depan/muka sempit dan melebar ke belakang. Disukai untuk hunian privat, namun akses kendaraan terbatas.",
          svg: (
            <svg className="w-8 h-8 text-purple-600" viewBox="0 0 32 32" fill="none">
              <path d="M12 24 L12 16 L6 10 L6 6 L26 6 L26 10 L20 16 L20 24 Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              <line x1="10" y1="26" x2="22" y2="26" stroke="#a855f7" strokeWidth="2.5" />
            </svg>
          ),
        };
      case "TIDAK_BERATURAN":
      default:
        return {
          label: "Tidak Beraturan (Irregular)",
          description: "Batas tapak asimetris memerlukan analisis tata letak dan koefisien reduksi luas efektif.",
          svg: (
            <svg className="w-8 h-8 text-slate-600" viewBox="0 0 32 32" fill="none">
              <polygon points="6,12 16,6 26,10 22,24 8,22" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
              <line x1="6" y1="26" x2="24" y2="26" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
          ),
        };
    }
  };

  const info = getShapeDetails();

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
      <div className="shrink-0 p-1.5 rounded bg-white border border-slate-200/80 shadow-2xs">
        {info.svg}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold text-slate-800">{info.label}</div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          {info.description}
        </p>
      </div>
    </div>
  );
}

export function ComparableInspectorDrawer({
  comp,
  isOpen,
  onClose,
  isSelected,
  onToggleSelect,
  onEdit,
  className,
}: ComparableInspectorDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !comp) return null;

  const formatIdr = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  // Extract legacy surveyor vehicle plate from metadata if available
  const rawMeta = comp.raw_metadata || {};
  const platNomor =
    (rawMeta.plat_nomor as string) ||
    (rawMeta.plat_nomor_kendaraan as string) ||
    (rawMeta.no_polisi as string) ||
    (rawMeta.kendaraan as string) ||
    "B 1984 TWR (Terverifikasi)";

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${comp.latitude}, ${comp.longitude}`);
  };

  // Calculate total indicated land value
  const totalNilaiTanah =
    comp.kisaran_nilai_tanah && comp.luas_tanah
      ? comp.kisaran_nilai_tanah * comp.luas_tanah
      : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div
        className={cn(
          "relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 animate-in slide-in-from-right duration-250",
          className
        )}
      >
        {/* Drawer Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant={isSelected ? "success" : "info"} size="xs" dot>
              {isSelected ? "Terpilih KKP" : "Database Pembanding"}
            </Badge>
            <span className="font-mono text-xs text-slate-300 font-bold">
              ID #{comp.legacy_no || comp.id.slice(0, 8)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Tutup Panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-800 text-xs">
          {/* Main Title & Address Block */}
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 font-mono">
              {comp.jenis_properti}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {comp.alamat}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {comp.desa_kelurahan ? `${comp.desa_kelurahan}, ` : ""}
                {comp.kecamatan}, {comp.kota_kab}, {comp.provinsi}
              </span>
            </p>
          </div>

          {/* Pricing & Unit Benchmark Card */}
          <div className="p-4 rounded-lg bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Indikasi Nilai Tanah / Satuan
              </span>
              <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                SPI 106 Benchmark
              </span>
            </div>
            <div className="text-2xl font-black font-mono tabular-nums text-white tracking-tight">
              {comp.kisaran_nilai_tanah
                ? `${formatIdr(comp.kisaran_nilai_tanah)} / m²`
                : "Belum Dinilai"}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                  Total Indikasi Lahan
                </span>
                <span className="font-bold text-slate-200">
                  {formatIdr(totalNilaiTanah)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                  Harga Penawaran / Transaksi
                </span>
                <span className="font-bold text-slate-200">
                  {comp.harga_transaksi
                    ? `${formatIdr(comp.harga_transaksi)} (Trx)`
                    : comp.harga_penawaran
                    ? `${formatIdr(comp.harga_penawaran)} (Twr)`
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Physical & Legal Specifications */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-sky-600" />
              <span>Spesifikasi Fisik & Legalitas Properti</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[10px] block">Luas Tanah</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {comp.luas_tanah} m²
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Luas Bangunan</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {comp.luas_bangunan} m²
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Legalitas Sertifikat</span>
                <span className="font-bold text-slate-800 inline-flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-600" />
                  <span>{comp.legalitas}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ROW Lebar Jalan</span>
                <span className="font-mono font-bold text-slate-900">
                  {comp.row_jalan} meter
                </span>
              </div>
            </div>
          </div>

          {/* Tapak Shape Visualizer Section */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-sky-600" />
              <span>Analisis Konfigurasi & Bentuk Tapak</span>
            </h4>
            <TapakShapeVisualizer shape={comp.tapak} />
          </div>

          {/* Spatial & Coordinates */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-sky-600" />
              <span>Georeferensi Spasial (GIS)</span>
            </h4>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <div className="text-[10px] text-slate-400 font-mono">
                  WGS84 LATITUDE / LONGITUDE
                </div>
                <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                  {comp.latitude.toFixed(6)}, {comp.longitude.toFixed(6)}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyCoordinates}
                  className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs transition"
                  title="Salin Koordinat"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`https://www.google.com/maps?q=${comp.latitude},${comp.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-semibold text-[11px] shadow-2xs transition"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Legacy Survey Audit Log */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileCheck2 className="w-3 h-3 text-sky-600" />
              <span>Audit Log & Petugas Lapangan (Legacy Survey)</span>
            </h4>

            <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Surveyor Lapangan</span>
                </span>
                <span className="font-semibold text-slate-900">
                  {comp.surveyor_name || "Surveyor Lapangan (TWR)"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>Plat Nomor Kendaraan</span>
                </span>
                <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {platNomor}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Survei Data</span>
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {comp.tanggal_data}
                </span>
              </div>

              {comp.reviewer_name && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 text-[11px]">Reviewer / Lead Valuer</span>
                  <span className="font-semibold text-slate-900">
                    {comp.reviewer_name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Field Notes / Keterangan */}
          {comp.keterangan && (
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900">
              <div className="flex items-center gap-1 font-bold mb-1 text-[10px] uppercase tracking-wider text-amber-800">
                <Info className="w-3 h-3" />
                <span>Catatan Lapangan & Karakteristik Khusus:</span>
              </div>
              <p className="leading-relaxed">{comp.keterangan}</p>
            </div>
          )}
        </div>

        {/* Drawer Footer CTA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSelect(comp.id)}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm",
              isSelected
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {isSelected ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>Keluarkan dari Analisis Estimasi</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Pilih untuk Analisis Estimasi</span>
              </>
            )}
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(comp)}
              className="py-2.5 px-3 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComparableInspectorDrawer;
