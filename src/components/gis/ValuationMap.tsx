"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { MarketComparableEntity } from "@/types/database";

interface ValuationMapProps {
  properties: MarketComparableEntity[];
  selectedProperty: MarketComparableEntity | null;
  onSelectProperty: (property: MarketComparableEntity) => void;
  onAddAtCoordinate: (lat: number, lng: number) => void;
  onEditProperty: (property: MarketComparableEntity) => void;
}

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_KEY || "cb1_3ky1_1_8c915f3c2e662b82a87023cb";

type BaseLayerId = "positron" | "dark" | "satellite" | "voyager";

export function ValuationMap({
  properties,
  selectedProperty,
  onSelectProperty,
  onAddAtCoordinate,
  onEditProperty,
}: ValuationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [activePopupProperty, setActivePopupProperty] = useState<MarketComparableEntity | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerId>("positron");

  // Switch Active Map Layer
  const handleLayerChange = (newLayer: BaseLayerId) => {
    setActiveBaseLayer(newLayer);
    const map = mapRef.current;
    if (!map) return;

    const layerMapping: Record<BaseLayerId, string> = {
      positron: "carto-positron-layer",
      dark: "carto-dark-layer",
      satellite: "esri-satellite-layer",
      voyager: "carto-voyager-layer",
    };

    Object.entries(layerMapping).forEach(([key, layerId]) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          key === newLayer ? "visible" : "none"
        );
      }
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [107.173722, -6.395972]; // Jakarta / Bekasi default

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-positron-source": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "&copy; CARTO &copy; OpenStreetMap",
            maxzoom: 20,
          },
          "carto-dark-source": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "&copy; CARTO &copy; OpenStreetMap",
            maxzoom: 20,
          },
          "carto-voyager-source": {
            type: "raster",
            tiles: [
              `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
              `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
              `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
            ],
            tileSize: 256,
            attribution: "&copy; CARTO &copy; OpenStreetMap",
            maxzoom: 20,
          },
          "esri-satellite-source": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "&copy; Esri &mdash; World Imagery",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "carto-positron-layer",
            type: "raster",
            source: "carto-positron-source",
            layout: { visibility: "visible" },
            minzoom: 0,
            maxzoom: 20,
          },
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark-source",
            layout: { visibility: "none" },
            minzoom: 0,
            maxzoom: 20,
          },
          {
            id: "esri-satellite-layer",
            type: "raster",
            source: "esri-satellite-source",
            layout: { visibility: "none" },
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: "carto-voyager-layer",
            type: "raster",
            source: "carto-voyager-source",
            layout: { visibility: "none" },
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: initialCenter,
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Click map to drop new geotag pin
    map.on("contextmenu", (e) => {
      onAddAtCoordinate(e.lngLat.lat, e.lngLat.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    properties.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const isSelected = selectedProperty?.id === p.id;
      const isKosong = p.jenis_properti === "TANAH_KOSONG";

      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform hover:scale-125 select-none";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${
            isSelected
              ? '<div class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></div>'
              : ""
          }
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-white ${
            isSelected
              ? "bg-rose-600 ring-2 ring-rose-400 scale-125 z-20"
              : isKosong
              ? "bg-amber-600 hover:bg-amber-500"
              : "bg-sky-600 hover:bg-sky-500"
          }">
            ${p.legacy_no ? p.legacy_no : "•"}
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectProperty(p);
        setActivePopupProperty(p);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.longitude, p.latitude])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [properties, selectedProperty]);

  // Fly to selected property
  useEffect(() => {
    if (!mapRef.current || !selectedProperty) return;
    if (selectedProperty.latitude && selectedProperty.longitude) {
      mapRef.current.flyTo({
        center: [selectedProperty.longitude, selectedProperty.latitude],
        zoom: 15,
        duration: 1200,
        essential: true,
      });
      setActivePopupProperty(selectedProperty);
    }
  }, [selectedProperty]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Geotag Hint */}
      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-800 text-xs font-medium text-slate-300 flex items-center space-x-3 pointer-events-none z-10">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shadow-xs shadow-sky-500/50"></span>
          <span className="text-[11px] font-semibold text-slate-200">Tanah & Bangunan</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs shadow-amber-500/50"></span>
          <span className="text-[11px] font-semibold text-slate-200">Tanah Kosong</span>
        </div>
        <div className="text-slate-500 text-[10px] pl-2 border-l border-slate-800 font-mono">
          📍 Klik kanan peta untuk tambah titik
        </div>
      </div>

      {/* Base Layer Switcher (CARTO Voyager, OSM, Satelit) */}
      <div className="absolute top-3 right-14 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-800 flex items-center space-x-1 z-10">
        <button
          type="button"
          onClick={() => handleLayerChange("voyager")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === "voyager"
              ? "bg-slate-800 text-white shadow-xs border border-slate-700"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
          title="CARTO Voyager (Bebas Watermark)"
        >
          🗺️ Voyager
        </button>
        <button
          type="button"
          onClick={() => handleLayerChange("satellite")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeBaseLayer === "satellite"
              ? "bg-slate-800 text-white shadow-xs border border-slate-700"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
          title="Foto Satelit Esri World Imagery"
        >
          🛰️ Satelit
        </button>
      </div>

      {/* Selected Property Inspector Card (Bottom-Left Drawer) */}
      {activePopupProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-800 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  activePopupProperty.jenis_properti === "TANAH_KOSONG"
                    ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                    : "bg-sky-950/80 text-sky-400 border-sky-800/80"
                }`}
              >
                Data #{activePopupProperty.legacy_no || activePopupProperty.id} • {activePopupProperty.jenis_properti}
              </span>
              <h4 className="text-sm font-bold text-slate-100 mt-1.5 line-clamp-2 leading-snug">
                {activePopupProperty.alamat}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {activePopupProperty.desa_kelurahan ? `${activePopupProperty.desa_kelurahan}, ` : ""}
                {activePopupProperty.kecamatan}, {activePopupProperty.kota_kab}
              </p>
            </div>
            <button
              onClick={() => setActivePopupProperty(null)}
              className="text-slate-500 hover:text-slate-200 font-bold p-1 text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Kisaran Nilai Tanah</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {activePopupProperty.kisaran_nilai_tanah
                  ? `Rp ${activePopupProperty.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                  : "Belum Dinilai"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Luas Tanah / Bangunan</span>
              <span className="font-bold text-slate-200 font-mono">
                {activePopupProperty.luas_tanah} m² / {activePopupProperty.luas_bangunan} m²
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Legalitas / Tapak</span>
              <span className="font-medium text-slate-300">
                {activePopupProperty.legalitas} ({activePopupProperty.tapak})
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block">Surveyor / Tanggal</span>
              <span className="font-medium text-slate-300">
                {activePopupProperty.surveyor_name || "-"} ({activePopupProperty.tanggal_data})
              </span>
            </div>
          </div>

          {activePopupProperty.keterangan && (
            <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
              {activePopupProperty.keterangan}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onEditProperty(activePopupProperty)}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>✏️</span>
              <span>Edit Data</span>
            </button>
            <a
              href={`https://www.google.com/maps?q=${activePopupProperty.latitude},${activePopupProperty.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              Buka Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
