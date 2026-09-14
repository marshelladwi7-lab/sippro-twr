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
    const matchesSearch =
      p.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kota_kab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.surveyor_name && p.surveyor_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "ALL" || p.jenis_properti === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari alamat, kota, kecamatan, atau nama surveyor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="text-slate-600 font-medium">Tipe:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white text-xs"
          >
            <option value="ALL">Semua Jenis</option>
            <option value="TANAH_BANGUNAN">Tanah & Bangunan</option>
            <option value="TANAH_KOSONG">Tanah Kosong</option>
            <option value="TANAH_BANGUNAN_DIABAIKAN">Bangunan Diabaikan</option>
          </select>

          <span className="text-slate-400 font-mono text-[11px] ml-2">
            Menampilkan {filtered.length} dari {properties.length} properti
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th className="p-2.5 w-12 text-center">No</th>
              <th className="p-2.5 min-w-[220px]">Alamat Lengkap</th>
              <th className="p-2.5 min-w-[140px]">Kota / Kecamatan</th>
              <th className="p-2.5 w-24">Tipe</th>
              <th className="p-2.5 text-right w-20">LT (m²)</th>
              <th className="p-2.5 text-right w-20">LB (m²)</th>
              <th className="p-2.5 text-right min-w-[120px]">Nilai Tanah/m²</th>
              <th className="p-2.5 w-20">Legalitas</th>
              <th className="p-2.5 min-w-[110px]">Surveyor</th>
              <th className="p-2.5 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400">
                  Tidak ada data yang cocok dengan kriteria pencarian.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <tr
                  key={p.id}
                  className="hover:bg-sky-50/40 transition cursor-pointer"
                  onClick={() => onSelectProperty(p)}
                >
                  <td className="p-2 text-center font-mono text-slate-400 text-[11px]">
                    {p.legacy_no || idx + 1}
                  </td>
                  <td className="p-2 font-medium text-slate-900">{p.alamat}</td>
                  <td className="p-2 text-slate-600">
                    <div>{p.kecamatan}</div>
                    <div className="text-[10px] text-slate-400">{p.kota_kab}</div>
                  </td>
                  <td className="p-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        p.jenis_properti === "TANAH_KOSONG"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {p.jenis_properti === "TANAH_KOSONG" ? "Tanah Kosong" : "T & B"}
                    </span>
                  </td>
                  <td className="p-2 text-right font-mono">{p.luas_tanah}</td>
                  <td className="p-2 text-right font-mono">{p.luas_bangunan}</td>
                  <td className="p-2 text-right font-mono font-bold text-sky-800">
                    {p.kisaran_nilai_tanah
                      ? `Rp ${p.kisaran_nilai_tanah.toLocaleString("id-ID")}`
                      : "-"}
                  </td>
                  <td className="p-2 font-mono text-[11px]">{p.legalitas}</td>
                  <td className="p-2 text-[11px] text-slate-600">{p.surveyor_name || "-"}</td>
                  <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onEditProperty(p)}
                        className="px-2 py-1 bg-slate-100 hover:bg-sky-100 text-sky-700 rounded text-[11px] font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus data properti "${p.alamat}"?`)) {
                            onDeleteProperty(p.id);
                          }
                        }}
                        className="px-1.5 py-1 hover:bg-rose-100 text-rose-600 rounded text-[11px]"
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
