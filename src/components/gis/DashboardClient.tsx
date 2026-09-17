"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PropertyTableView } from "@/components/gis/PropertyTableView";
import { PropertyModal } from "@/components/gis/PropertyModal";
import { BatchExcelUploader } from "@/components/excel/BatchExcelUploader";
import { MarketComparableEntity } from "@/types/database";
import { TwrLogo } from "@/components/ui/TwrLogo";
import { ValuationAnalyticsDashboard } from "@/components/gis/ValuationAnalyticsDashboard";
import { UserManagementModal } from "@/components/auth/UserManagementModal";
import { useAuth } from "@/lib/auth/auth-context";

// Lazy-load MapLibre GL on client-side only (prevents SSR hydration crash)
const ValuationMap = dynamic(
  () => import("@/components/gis/ValuationMap").then((m) => m.ValuationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 text-xs min-h-[450px]">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span>Memuat Peta Spasial (Esri & OpenStreetMap)...</span>
      </div>
    ),
  }
);

interface DashboardClientProps {
  initialProperties: MarketComparableEntity[];
}

export function DashboardClient({ initialProperties }: DashboardClientProps) {
  const { session } = useAuth();
  const [properties, setProperties] = useState<MarketComparableEntity[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<MarketComparableEntity | null>(
    initialProperties.length > 0 ? initialProperties[0] : null
  );
  const [editingProperty, setEditingProperty] = useState<MarketComparableEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "table" | "import" | "analytics">("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterRegion, setFilterRegion] = useState<string>("ALL");

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

  const refreshProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (json.success && json.data) {
        setProperties(json.data);
      }
    } catch (err) {
      console.error("Error refreshing properties:", err);
    }
  };

  // High-level summary metrics
  const metrics = useMemo(() => {
    let totalArea = 0;
    let totalPriceSum = 0;
    let priceCount = 0;
    const citiesSet = new Set<string>();

    properties.forEach((p) => {
      totalArea += p.luas_tanah || 0;
      if (p.kisaran_nilai_tanah && p.kisaran_nilai_tanah > 0) {
        totalPriceSum += p.kisaran_nilai_tanah;
        priceCount++;
      }
      if (p.kota_kab) citiesSet.add(p.kota_kab);
    });

    const avgPrice = priceCount > 0 ? Math.round(totalPriceSum / priceCount) : 0;

    return {
      totalCount: properties.length,
      totalArea: Math.round(totalArea),
      avgPrice,
      totalCities: citiesSet.size,
    };
  }, [properties]);

  // Unique provinces for filter
  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.provinsi) set.add(p.provinsi);
    });
    return Array.from(set).sort();
  }, [properties]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (p.alamat && p.alamat.toLowerCase().includes(q)) ||
        (p.kota_kab && p.kota_kab.toLowerCase().includes(q)) ||
        (p.kecamatan && p.kecamatan.toLowerCase().includes(q)) ||
        (p.desa_kelurahan && p.desa_kelurahan.toLowerCase().includes(q)) ||
        (p.legacy_no && String(p.legacy_no).includes(q)) ||
        (p.surveyor_name && p.surveyor_name.toLowerCase().includes(q));

      const matchesType = filterType === "ALL" || p.jenis_properti === filterType;
      const matchesRegion = filterRegion === "ALL" || p.provinsi === filterRegion;

      return matchesSearch && matchesType && matchesRegion;
    });
  }, [properties, searchTerm, filterType, filterRegion]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 font-sans overflow-hidden text-slate-100">
      {/* Top Application Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-5 py-2.5 flex items-center justify-between shadow-xl z-30 shrink-0">
        <div className="flex items-center space-x-3.5">
          <TwrLogo size="sm" showTagline={true} />
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
            SPI 106 &amp; KEPI
          </span>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-2">
          {/* Segmented View Toggles */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex space-x-1 text-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === "map"
                  ? "bg-slate-800 text-amber-300 shadow-xs border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <span>🗺️</span>
              <span className="hidden md:inline">Peta Spasial</span>
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === "analytics"
                  ? "bg-slate-800 text-amber-300 shadow-xs border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <span>📊</span>
              <span className="hidden md:inline">Dashboard Analisis</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-800 text-amber-300 shadow-xs border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <span>📋</span>
              <span className="hidden md:inline">Spreadsheet</span>
            </button>
            <button
              onClick={() => setViewMode("import")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                viewMode === "import"
                  ? "bg-slate-800 text-amber-300 shadow-xs border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <span>📤</span>
              <span className="hidden md:inline">Import File</span>
            </button>
          </div>

          {/* Add New Property Button */}
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-950/40 active:scale-[0.98] flex items-center space-x-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span className="hidden sm:inline">Tambah Data</span>
          </button>

          {/* Export Buttons */}
          <a
            href="/api/export-excel"
            download="Bank_Data_Penilaian_Properti_TWR.xlsx"
            title="Download Spreadsheet Excel (.xlsx)"
            className="hidden sm:flex px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700 items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span>📊</span>
            <span>Excel</span>
          </a>
          <a
            href="/api/export-kml"
            download="Bank_Data_Properti_GoogleMyMaps_TWR.kml"
            title="Download Google My Maps KML (.kml)"
            className="hidden sm:flex px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700 items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
          >
            <span>📍</span>
            <span>KML</span>
          </a>

          {/* User & Role Management Button */}
          <button
            onClick={() => setIsUserModalOpen(true)}
            title="Kelola Peran & Akses Pengguna (RBAC)"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-semibold transition-all border border-amber-500/30 shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>👥</span>
            <span className="hidden xl:inline">Tim &amp; Akses</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            title="Keluar dari Portal"
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-medium transition-all border border-slate-800 hover:border-rose-900/60 flex items-center space-x-1 cursor-pointer"
          >
            <span>🚪</span>
            <span className="hidden lg:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Summary Metrics Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-5 py-2 flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 text-[11px] font-medium">Total Titik:</span>
            <span className="font-extrabold text-slate-100 font-mono text-sm">
              {metrics.totalCount.toLocaleString("id-ID")} Data
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="text-slate-500 text-[11px] font-medium">Rata-rata Nilai Tanah:</span>
            <span className="font-extrabold text-amber-400 font-mono text-sm">
              Rp {metrics.avgPrice.toLocaleString("id-ID")}/m²
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-slate-500 text-[11px] font-medium">Total Akumulasi Luas:</span>
            <span className="font-extrabold text-slate-300 font-mono text-sm">
              {metrics.totalArea.toLocaleString("id-ID")} m²
            </span>
          </div>
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-slate-500 text-[11px] font-medium">Cakupan Wilayah:</span>
            <span className="font-semibold text-slate-300 text-xs">
              {metrics.totalCities} Kota / Kabupaten
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 shrink-0 font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
          <span>Pangkalan Data Aktif ({properties.length.toLocaleString("id-ID")} Record)</span>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 0: VALUATION & SPATIAL ANALYTICS DASHBOARD */}
        {viewMode === "analytics" && (
          <ValuationAnalyticsDashboard
            properties={properties}
            onSelectCityOnMap={(city) => {
              setSearchTerm(city);
              setViewMode("map");
            }}
            onSelectTypeOnMap={(type) => {
              setFilterType(type);
              setViewMode("map");
            }}
          />
        )}

        {/* VIEW 1: IMPORT */}
        {viewMode === "import" && (
          <div className="flex-1 p-8 overflow-y-auto bg-slate-950 max-w-4xl mx-auto w-full">
            <BatchExcelUploader
              onIngestionComplete={() => {
                refreshProperties();
                setViewMode("map");
              }}
            />
          </div>
        )}

        {/* VIEW 2: TABLE SPREADSHEET */}
        {viewMode === "table" && (
          <div className="flex-1 p-4 overflow-hidden bg-slate-950">
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

        {/* VIEW 3: INTERACTIVE GEOTAGGED MAP */}
        {viewMode === "map" && (
          <>
            {/* Left Sidebar: Property Browser */}
            <aside className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col z-10 shrink-0 shadow-xl">
              {/* Search & Filter Header */}
              <div className="p-3.5 border-b border-slate-800 space-y-2.5 bg-slate-900/95">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari jalan, kelurahan, surveyor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center space-x-1.5 text-[11px] overflow-x-auto pb-1">
                  <button
                    onClick={() => setFilterType("ALL")}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterType === "ALL"
                        ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Semua ({properties.length})
                  </button>
                  <button
                    onClick={() => setFilterType("TANAH_BANGUNAN")}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterType === "TANAH_BANGUNAN"
                        ? "bg-sky-950 text-sky-400 border border-sky-800 shadow-xs"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Tanah & Bangunan
                  </button>
                  <button
                    onClick={() => setFilterType("TANAH_KOSONG")}
                    className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterType === "TANAH_KOSONG"
                        ? "bg-amber-950 text-amber-400 border border-amber-800 shadow-xs"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Tanah Kosong
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Daftar Titik ({filteredProperties.length})</span>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="bg-slate-950 border border-slate-700/80 rounded-lg text-[11px] px-2.5 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Provinsi</option>
                    {regionOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Cards List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-1.5 space-y-1">
                {filteredProperties.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    Tidak ada data yang cocok dengan pencarian.
                  </div>
                ) : (
                  filteredProperties.map((p) => {
                    const isSelected = selectedProperty?.id === p.id;
                    const isKosong = p.jenis_properti === "TANAH_KOSONG";
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProperty(p)}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-150 text-xs space-y-1.5 border-l-2 ${
                          isSelected
                            ? "bg-slate-800/90 border-amber-400 shadow-md ring-1 ring-slate-700/60"
                            : "hover:bg-slate-800/40 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-100 line-clamp-1 leading-snug">
                            {p.legacy_no ? `#${p.legacy_no} ` : ""}
                            {p.alamat}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                              isKosong
                                ? "bg-amber-950/80 text-amber-400 border-amber-800/60"
                                : "bg-sky-950/80 text-sky-400 border-sky-800/60"
                            }`}
                          >
                            {isKosong ? "Tanah" : "T & B"}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 truncate">
                          {p.kecamatan ? `${p.kecamatan}, ` : ""}
                          {p.kota_kab} ({p.provinsi})
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <span>📍</span>
                          <span>{p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {p.kisaran_nilai_tanah
                              ? `Rp ${p.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                              : "Belum Dinilai"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            LT: {p.luas_tanah} m² {p.luas_bangunan ? `| LB: ${p.luas_bangunan} m²` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Main Interactive Map Canvas */}
            <main className="flex-1 relative h-full min-h-[400px]">
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

      {/* Geotagged Property Creation & Edit Modal */}
      <PropertyModal
        isOpen={isModalOpen}
        property={editingProperty}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
      />

      {/* RBAC Governance & User Management Modal */}
      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={session}
      />
    </div>
  );
}
