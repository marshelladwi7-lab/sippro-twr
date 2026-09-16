"use client";

import React, { useState } from "react";
import { MarketComparableEntity } from "@/types/database";

interface PropertyTableViewProps {
  properties: MarketComparableEntity[];
  onSelectProperty: (property: MarketComparableEntity) => void;
  onEditProperty: (property: MarketComparableEntity) => void;
  onDeleteProperty: (id: string) => void;
}

export function PropertyTableView({
  properties,
  onSelectProperty,
  onEditProperty,
  onDeleteProperty,
}: PropertyTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = properties.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      p.alamat.toLowerCase().includes(q) ||
      p.kota_kab.toLowerCase().includes(q) ||
      p.kecamatan.toLowerCase().includes(q) ||
      (p.surveyor_name && p.surveyor_name.toLowerCase().includes(q));

    const matchesType = filterType === "ALL" || p.jenis_properti === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full text-slate-800 dark:text-slate-200 transition-colors duration-150">
      {/* Search and Filters Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Cari alamat, kota, kecamatan, atau nama surveyor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <label className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tipe:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="ALL">Semua Jenis Properti</option>
              <option value="TANAH_BANGUNAN">Tanah & Bangunan</option>
              <option value="TANAH_KOSONG">Tanah Kosong</option>
              <option value="TANAH_BANGUNAN_DIABAIKAN">Bangunan Diabaikan</option>
            </select>
          </div>

          <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px] bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
            {filtered.length.toLocaleString("id-ID")} dari {properties.length.toLocaleString("id-ID")} Titik
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-800 z-10 backdrop-blur-xs">
            <tr>
              <th className="p-3.5 w-12 text-center font-mono text-[10px] uppercase tracking-wider">No</th>
              <th className="p-3.5 min-w-[220px] text-[10px] uppercase tracking-wider">Alamat Objek</th>
              <th className="p-3.5 min-w-[140px] text-[10px] uppercase tracking-wider">Kota / Kecamatan</th>
              <th className="p-3.5 w-28 text-[10px] uppercase tracking-wider">Tipe</th>
              <th className="p-3.5 text-right w-24 font-mono text-[10px] uppercase tracking-wider">LT (m²)</th>
              <th className="p-3.5 text-right w-24 font-mono text-[10px] uppercase tracking-wider">LB (m²)</th>
              <th className="p-3.5 text-right min-w-[140px] font-mono text-[10px] uppercase tracking-wider">Nilai Tanah/m²</th>
              <th className="p-3.5 w-20 text-[10px] uppercase tracking-wider">Legalitas</th>
              <th className="p-3.5 min-w-[120px] text-[10px] uppercase tracking-wider">Surveyor</th>
              <th className="p-3.5 text-center w-28 text-[10px] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-sans text-slate-700 dark:text-slate-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-16 text-center text-slate-400">
                  <div className="text-sm font-semibold">Tidak ada data ditemukan</div>
                  <div className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau ubah filter tipe properti.</div>
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => onSelectProperty(p)}
                >
                  <td className="p-3.5 text-center font-mono text-slate-400 text-[11px] group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    {p.legacy_no || idx + 1}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-snug">
                    {p.alamat}
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    <div className="text-slate-800 dark:text-slate-300 font-medium">{p.kecamatan || "-"}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{p.kota_kab}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.jenis_properti === "TANAH_KOSONG"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800/80"
                          : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/80 dark:text-sky-400 dark:border-sky-800/80"
                      }`}
                    >
                      {p.jenis_properti === "TANAH_KOSONG" ? "Tanah Kosong" : "Tanah & Bangunan"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700 dark:text-slate-300">{p.luas_tanah?.toLocaleString("id-ID")}</td>
                  <td className="p-3.5 text-right font-mono text-slate-400">{p.luas_bangunan ? p.luas_bangunan.toLocaleString("id-ID") : "-"}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {p.kisaran_nilai_tanah
                      ? `Rp ${p.kisaran_nilai_tanah.toLocaleString("id-ID")}`
                      : "-"}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{p.legalitas || "-"}</td>
                  <td className="p-3.5 text-[11px] text-slate-500 dark:text-slate-400">{p.surveyor_name || "-"}</td>
                  <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onEditProperty(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition active:scale-[0.98] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data properti "${p.alamat}"?`)) {
                            onDeleteProperty(p.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/80 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition active:scale-[0.98] cursor-pointer"
                        title="Hapus Data"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropertyTableView;
