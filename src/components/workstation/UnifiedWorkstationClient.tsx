"use client";

import React, { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MarketComparableEntity,
  LegalitasEnum,
  TapakShapeEnum,
} from "@/types/database";
import { WorkstationTopNav, WorkstationTab } from "./WorkstationTopNav";
import { SpatialValueEstimator } from "@/components/valuation/SpatialValueEstimator";
import { PropertyTableView } from "@/components/gis/PropertyTableView";
import { BatchExcelUploader } from "@/components/excel/BatchExcelUploader";
import { PropertyModal } from "@/components/gis/PropertyModal";
import { ComparableInspectorDrawer } from "@/components/inspector/ComparableInspectorDrawer";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/lib/theme/theme-context";

// Dynamic import for MapLibre GIS Cockpit to prevent SSR window hydration issues
const ValuationMapCockpit = dynamic(
  () =>
    import("@/components/gis/ValuationMapCockpit").then(
      (m) => m.ValuationMapCockpit
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs min-h-[500px]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Memuat Peta Spasial Bebas Watermark...
        </span>
        <span className="text-[11px] text-slate-400 mt-1">
          CARTO Positron, Dark Matter & Citra Satelit Esri
        </span>
      </div>
    ),
  }
);

interface UnifiedWorkstationProps {
  initialProperties: MarketComparableEntity[];
}

export function UnifiedWorkstationClient({
  initialProperties,
}: UnifiedWorkstationProps) {
  const toast = useToast();
  const { theme } = useTheme();

  // Active View Tab: "map" | "estimator" | "records" | "importer"
  const [activeTab, setActiveTab] = useState<WorkstationTab>("map");

  // Database Properties
  const [properties, setProperties] = useState<MarketComparableEntity[]>(initialProperties);

  // Target Valuation Property State
  const [subjectData, setSubjectData] = useState({
    alamat: "Jl. Raya Cikarang Cibarusah No. 45, Cikarang Selatan, Bekasi",
    latitude: -6.395972,
    longitude: 107.173722,
    luasTanah: 350,
    luasBangunan: 220,
    legalitas: "SHM" as LegalitasEnum,
    tapak: "PERSEGI" as TapakShapeEnum,
    rowJalan: 8.0,
  });

  // Radius for spatial query
  const [radiusKm, setRadiusKm] = useState<1 | 2 | 3 | 5>(2);

  // Selected Comparables for deep inspection
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>(() => {
    return initialProperties.slice(0, 3).map((p) => p.id);
  });

  // Inspector Drawer State
  const [inspectedComp, setInspectedComp] = useState<MarketComparableEntity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Property Create/Edit Modal State
  const [editingProperty, setEditingProperty] = useState<MarketComparableEntity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle selection of a comparable
  const handleToggleSelectComp = useCallback(
    (comp: MarketComparableEntity) => {
      setSelectedCompIds((prev) => {
        const exists = prev.includes(comp.id);
        if (exists) {
          toast.info(`Pembanding #${comp.legacy_no || comp.id} dilepas dari pilihan`);
          return prev.filter((id) => id !== comp.id);
        } else {
          toast.success(`Pembanding #${comp.legacy_no || comp.id} dipilih untuk analisis`);
          return [...prev, comp.id];
        }
      });
    },
    [toast]
  );

  // Inspect comp in drawer
  const handleInspectComp = useCallback((comp: MarketComparableEntity) => {
    setInspectedComp(comp);
    setIsDrawerOpen(true);
  }, []);

  // Refresh properties from server API
  const refreshProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const json = await res.json();
      if (json.success && json.data) {
        setProperties(json.data);
      }
    } catch (err) {
      console.error("Failed to refresh properties:", err);
    }
  };

  // High-level metrics for top telemetry
  const telemetry = useMemo(() => {
    let totalPriceSum = 0;
    let priceCount = 0;
    const citiesSet = new Set<string>();

    properties.forEach((p) => {
      if (p.kisaran_nilai_tanah && p.kisaran_nilai_tanah > 0) {
        totalPriceSum += p.kisaran_nilai_tanah;
        priceCount++;
      }
      if (p.kota_kab) citiesSet.add(p.kota_kab);
    });

    const median = priceCount > 0 ? Math.round(totalPriceSum / priceCount) : 4250000;
    return {
      totalComparables: properties.length,
      medianPrice: median,
      totalCities: citiesSet.size || 12,
    };
  }, [properties]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-150">
      {/* Top Workstation Bar */}
      <WorkstationTopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalComparables={telemetry.totalComparables}
        medianPrice={telemetry.medianPrice}
        totalCities={telemetry.totalCities}
      />

      {/* Main Tab Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* TAB 1: PETA SPASIAL GIS COCKPIT */}
        {activeTab === "map" && (
          <div className="w-full h-full relative">
            <ValuationMapCockpit
              subjectLocation={{
                latitude: subjectData.latitude,
                longitude: subjectData.longitude,
                alamat: subjectData.alamat,
                label: "Target Estimasi Nilai",
              }}
              properties={properties}
              selectedCompIds={selectedCompIds}
              radiusKm={radiusKm}
              onRadiusKmChange={setRadiusKm}
              onSubjectCoordinateChange={(lat, lng) => {
                setSubjectData((prev) => ({
                  ...prev,
                  latitude: Number(lat.toFixed(6)),
                  longitude: Number(lng.toFixed(6)),
                }));
                toast.info(`Koordinat target diubah: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
              }}
              onToggleSelectComp={handleToggleSelectComp}
              onInspectComp={handleInspectComp}
            />
          </div>
        )}

        {/* TAB 2: ANALISIS ESTIMASI NILAI (SPATIAL VALUE ESTIMATOR) */}
        {activeTab === "estimator" && (
          <SpatialValueEstimator
            subjectLocation={subjectData}
            properties={properties}
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            onInspectComp={handleInspectComp}
          />
        )}

        {/* TAB 3: PANGKALAN DATA RIWAYAT & SPREADSHEET */}
        {activeTab === "records" && (
          <div className="w-full h-full flex flex-col p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 rounded-2xl shadow-xs gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pangkalan Data Riwayat Penilaian ({properties.length.toLocaleString("id-ID")} Data)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data pembanding pasar tergeotagging lengkap dengan koordinat, luas tanah/bangunan, dan harga pasar.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/export-excel"
                  download="Pangkalan_Data_Penilaian_TWR.xlsx"
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Download Excel (.xlsx)
                </a>
                <a
                  href="/api/export-kml"
                  download="Pangkalan_Data_GoogleMyMaps_TWR.kml"
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Download KML
                </a>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <PropertyTableView
                properties={properties}
                onSelectProperty={(p) => {
                  setInspectedComp(p);
                  setIsDrawerOpen(true);
                }}
                onEditProperty={(p) => {
                  setEditingProperty(p);
                  setIsModalOpen(true);
                }}
                onDeleteProperty={async (id) => {
                  try {
                    const res = await fetch(`/api/properties?id=${id}`, { method: "DELETE" });
                    const json = await res.json();
                    if (json.success) {
                      setProperties((prev) => prev.filter((p) => p.id !== id));
                      toast.success("Data berhasil dihapus");
                    }
                  } catch {
                    toast.error("Gagal menghapus data");
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 4: BATCH EXCEL IMPORTER */}
        {activeTab === "importer" && (
          <div className="w-full h-full overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Unggah Batch Spreadsheet Excel
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Unggah file Excel (seperti <code className="font-mono text-emerald-600 dark:text-emerald-400">DB Tahap 1.xlsx</code>) untuk melakukan penambahan data secara massal. Sistem otomatis melakukan sanitasi koordinat lintang/bujur dan mendeteksi duplikasi.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <BatchExcelUploader
                  onIngestionComplete={() => {
                    refreshProperties();
                    setActiveTab("map");
                    toast.success("Batch impor berhasil ditambahkan ke pangkalan data");
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slide-out Comparable Inspector Drawer */}
      <ComparableInspectorDrawer
        comp={inspectedComp}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isSelected={inspectedComp ? selectedCompIds.includes(inspectedComp.id) : false}
        onToggleSelect={(compId) => {
          const comp = properties.find((p) => p.id === compId);
          if (comp) handleToggleSelectComp(comp);
        }}
        onEdit={(comp) => {
          setIsDrawerOpen(false);
          setEditingProperty(comp);
          setIsModalOpen(true);
        }}
      />

      {/* Modal for adding/editing property */}
      <PropertyModal
        isOpen={isModalOpen}
        property={editingProperty}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={(saved) => {
          setProperties((prev) => {
            const idx = prev.findIndex((p) => p.id === saved.id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = saved;
              return updated;
            }
            return [saved, ...prev];
          });
          toast.success("Data properti berhasil disimpan");
        }}
      />
    </div>
  );
}

export default UnifiedWorkstationClient;
