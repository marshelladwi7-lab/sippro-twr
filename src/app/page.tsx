"use client";

import React, { useState, useEffect } from "react";
import { ValuationMap } from "@/components/gis/ValuationMap";
import { PropertyTableView } from "@/components/gis/PropertyTableView";
import { PropertyModal } from "@/components/gis/PropertyModal";
import { BatchExcelUploader } from "@/components/excel/BatchExcelUploader";
import { MarketComparableEntity } from "@/types/database";

export default function BankDataDashboard() {
  const [properties, setProperties] = useState<MarketComparableEntity[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<MarketComparableEntity | null>(null);
  const [editingProperty, setEditingProperty] = useState<MarketComparableEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "table" | "import">("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load all properties from API
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (json.success && json.data) {
        setProperties(json.data);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSaveProperty = (saved: MarketComparableEntity) => {
    setProperties((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setSelectedProperty(saved);
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/properties?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
        if (selectedProperty?.id === id) {
          setSelectedProperty(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  const handleAddAtCoordinate = (lat: number, lng: number) => {
    setEditingProperty({
      id: "",
      legacy_no: properties.length + 1,
      jenis_properti: "TANAH_BANGUNAN",
      alamat: "",
      provinsi: "Jawa Barat",
      kota_kab: "Kab. Bekasi",
      kecamatan: "",
      desa_kelurahan: "",
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      luas_tanah: 100,
      luas_bangunan: 0,
      kisaran_nilai_tanah: null,
      harga_penawaran: null,
      harga_transaksi: null,
      tanggal_data: new Date().toISOString().split("T")[0],
      surveyor_name: "",
      reviewer_name: "",
      admin_code: "",
      legalitas: "SHM",
      tapak: "PERSEGI",
      row_jalan: 6.0,
      keterangan: "",
    });
    setIsModalOpen(true);
  };

  // Filtered list for sidebar
  const filteredProperties = properties.filter((p) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.alamat.toLowerCase().includes(q) ||
      p.kota_kab.toLowerCase().includes(q) ||
      p.kecamatan.toLowerCase().includes(q) ||
      (p.surveyor_name && p.surveyor_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans select-none overflow-hidden">
      {/* Top App Header */}
      <header className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-sm shadow-xs">
            BD
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              BANK DATA PENILAIAN PROPERTI
            </h1>
            <p className="text-[10px] text-slate-400">
              Sistem Geotagging & Penyimpanan Data Pembanding Pasar Indonesia
            </p>
          </div>
          <span className="hidden md:inline-flex ml-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-sky-400 border border-slate-700">
            {properties.length} Titik Tersimpan
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* View Toggles */}
          <div className="bg-slate-800 p-0.5 rounded-lg flex space-x-1 text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1 rounded font-medium transition ${
                viewMode === "map"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🗺️ Peta
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded font-medium transition ${
                viewMode === "table"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📋 Tabel
            </button>
            <button
              onClick={() => setViewMode("import")}
              className={`px-3 py-1 rounded font-medium transition ${
                viewMode === "import"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📤 Import
            </button>
          </div>

          {/* Add New Property */}
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center space-x-1"
          >
            <span>➕ Tambah Data</span>
          </button>

          {/* Export Actions */}
          <a
            href="/api/export-excel"
            download="Bank_Data_Penilaian_Properti.xlsx"
            className="hidden sm:flex px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition border border-slate-700 items-center space-x-1"
          >
            <span>📊 Excel</span>
          </a>
          <a
            href="/api/export-kml"
            download="Bank_Data_Properti_GoogleMyMaps.kml"
            className="hidden sm:flex px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition border border-slate-700 items-center space-x-1"
          >
            <span>📍 KML</span>
          </a>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === "import" && (
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50 max-w-4xl mx-auto w-full">
            <BatchExcelUploader
              onIngestionComplete={() => {
                fetchProperties();
                setViewMode("map");
              }}
            />
          </div>
        )}

        {viewMode === "table" && (
          <div className="flex-1 p-4 overflow-hidden bg-slate-100">
            <PropertyTableView
              properties={properties}
              onSelectProperty={(p) => {
                setSelectedProperty(p);
                setViewMode("map");
              }}
              onEditProperty={(p) => {
                setEditingProperty(p);
                setIsModalOpen(true);
              }}
              onDeleteProperty={handleDeleteProperty}
            />
          </div>
        )}

        {viewMode === "map" && (
          <>
            {/* Left Sidebar: Property Search & Quick Browser (Google My Maps Style) */}
            <aside className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col z-10 shrink-0 shadow-sm">
              {/* Sidebar Search Bar */}
              <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
                <input
                  type="text"
                  placeholder="Cari alamat, kota, surveyor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Daftar Titik ({filteredProperties.length})</span>
                  <span className="text-[10px] text-slate-400">Klik untuk zoom</span>
                </div>
              </div>

              {/* Sidebar Cards List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                {filteredProperties.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Tidak ada data yang cocok.
                  </div>
                ) : (
                  filteredProperties.map((p) => {
                    const isSelected = selectedProperty?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProperty(p)}
                        className={`p-3 rounded-lg cursor-pointer transition text-xs space-y-1 ${
                          isSelected
                            ? "bg-sky-50 border-l-4 border-sky-600 shadow-xs"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {p.legacy_no ? `#${p.legacy_no} ` : ""}
                            {p.alamat}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.jenis_properti === "TANAH_KOSONG"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {p.jenis_properti === "TANAH_KOSONG" ? "Tanah" : "T&B"}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {p.kecamatan}, {p.kota_kab}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono font-bold text-sky-800 text-[11px]">
                            {p.kisaran_nilai_tanah
                              ? `Rp ${p.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                              : "Pending Nilai"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            LT: {p.luas_tanah}m²
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Main Interactive Map Screen */}
            <main className="flex-1 relative h-full">
              <ValuationMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onSelectProperty={(p) => setSelectedProperty(p)}
                onAddAtCoordinate={handleAddAtCoordinate}
                onEditProperty={(p) => {
                  setEditingProperty(p);
                  setIsModalOpen(true);
                }}
              />
            </main>
          </>
        )}
      </div>

      {/* Modal for Adding / Editing Geotagged Data */}
      <PropertyModal
        isOpen={isModalOpen}
        property={editingProperty}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
      />
    </div>
  );
}
