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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [107.173722, -6.395972]; // Jakarta / Bekasi default

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-positron": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          },
        },
        layers: [
          {
            id: "carto-positron-layer",
            type: "raster",
            source: "carto-positron",
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
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Geotag Hint */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 flex items-center space-x-3 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-600 inline-block"></span>
          <span className="text-[11px]">Tanah & Bangunan</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block"></span>
          <span className="text-[11px]">Tanah Kosong</span>
        </div>
        <div className="text-slate-400 text-[10px] pl-2 border-l border-slate-200">
          📍 Klik kanan peta untuk tambah titik
        </div>
      </div>

      {/* Selected Property Inspector Card (Bottom-Left Drawer) */}
      {activePopupProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-slate-200 z-20 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                Data #{activePopupProperty.legacy_no || activePopupProperty.id} • {activePopupProperty.jenis_properti}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                {activePopupProperty.alamat}
              </h4>
              <p className="text-xs text-slate-500">
                {activePopupProperty.desa_kelurahan ? `${activePopupProperty.desa_kelurahan}, ` : ""}
                {activePopupProperty.kecamatan}, {activePopupProperty.kota_kab}
              </p>
            </div>
            <button
              onClick={() => setActivePopupProperty(null)}
              className="text-slate-400 hover:text-slate-600 font-bold p-1 text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 text-[10px] block">Kisaran Nilai Tanah</span>
              <span className="font-bold text-sky-800 font-mono text-sm">
                {activePopupProperty.kisaran_nilai_tanah
                  ? `Rp ${activePopupProperty.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                  : "Belum Dinilai"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Luas Tanah / Bangunan</span>
              <span className="font-bold text-slate-800 font-mono">
                {activePopupProperty.luas_tanah} m² / {activePopupProperty.luas_bangunan} m²
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Legalitas / Tapak</span>
              <span className="font-medium text-slate-700">
                {activePopupProperty.legalitas} ({activePopupProperty.tapak})
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Surveyor / Tanggal</span>
              <span className="font-medium text-slate-700">
                {activePopupProperty.surveyor_name || "-"} ({activePopupProperty.tanggal_data})
              </span>
            </div>
          </div>

          {activePopupProperty.keterangan && (
            <div className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">
              {activePopupProperty.keterangan}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => onEditProperty(activePopupProperty)}
              className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
            >
              <span>✏️ Edit Data</span>
            </button>
            <a
              href={`https://www.google.com/maps?q=${activePopupProperty.latitude},${activePopupProperty.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition"
            >
              Buka Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
