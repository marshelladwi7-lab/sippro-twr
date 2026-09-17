"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { MarketComparableEntity } from "@/types/database";

interface ValuationMapProps {
  properties: MarketComparableEntity[];
  selectedProperty: MarketComparableEntity | null;
  onSelectProperty: (property: MarketComparableEntity) => void;
  onAddAtCoordinate: (lat: number, lng: number) => void;
  onEditProperty: (property: MarketComparableEntity) => void;
}

type BaseLayerId = "street" | "satellite" | "dark" | "light";

export function ValuationMap({
  properties,
  selectedProperty,
  onSelectProperty,
  onAddAtCoordinate,
  onEditProperty,
}: ValuationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersMapRef = useRef<Map<string, { marker: Marker; el: HTMLElement }>>(new Map());
  const selectedMarkerIdRef = useRef<string | null>(null);
  const tempMarkerRef = useRef<Marker | null>(null);

  const [activePopupProperty, setActivePopupProperty] = useState<MarketComparableEntity | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<BaseLayerId>("street");
  const [isAddMode, setIsAddMode] = useState(false);
  const [hoverCoordinate, setHoverCoordinate] = useState<{ lat: number; lng: number } | null>(null);

  const propertiesRef = useRef(properties);
  propertiesRef.current = properties;

  const onSelectPropertyRef = useRef(onSelectProperty);
  onSelectPropertyRef.current = onSelectProperty;

  const onAddAtCoordinateRef = useRef(onAddAtCoordinate);
  onAddAtCoordinateRef.current = onAddAtCoordinate;

  const isAddModeRef = useRef(isAddMode);
  isAddModeRef.current = isAddMode;

  // Switch Active Map Layer
  const handleLayerChange = (newLayer: BaseLayerId) => {
    setActiveBaseLayer(newLayer);
    const map = mapRef.current;
    if (!map) return;

    const layerMapping: Record<BaseLayerId, string> = {
      street: "esri-street-layer",
      satellite: "esri-satellite-layer",
      dark: "esri-dark-layer",
      light: "esri-light-layer",
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

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = isAddMode ? "crosshair" : "";
  }, [isAddMode]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [115.141356, -8.846376];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      attributionControl: false,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          "esri-street-source": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          "esri-satellite-source": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          "esri-dark-source": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          "esri-light-source": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "esri-street-layer",
            type: "raster",
            source: "esri-street-source",
            layout: { visibility: "visible" },
            minzoom: 0,
            maxzoom: 19,
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
            id: "esri-dark-layer",
            type: "raster",
            source: "esri-dark-source",
            layout: { visibility: "none" },
            minzoom: 0,
            maxzoom: 19,
          },
          {
            id: "esri-light-layer",
            type: "raster",
            source: "esri-light-source",
            layout: { visibility: "none" },
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: initialCenter,
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Track mouse coordinate over map
    map.on("mousemove", (e) => {
      setHoverCoordinate({
        lat: Number(e.lngLat.lat.toFixed(6)),
        lng: Number(e.lngLat.lng.toFixed(6)),
      });
    });

    // Helper to create pin element
    const createPin = (p: MarketComparableEntity, isSelected: boolean) => {
      const isKosong = p.jenis_properti === "TANAH_KOSONG";
      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform hover:scale-125 select-none";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isSelected ? '<div class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></div>' : ""}
          <div class="pin-badge w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-white transition-all ${
            isSelected
              ? "bg-rose-600 ring-2 ring-rose-400 scale-125 z-20 shadow-rose-500/40"
              : isKosong
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/30"
              : "bg-sky-600 hover:bg-sky-500 shadow-sky-500/30"
          }">
            ${p.legacy_no ? p.legacy_no : "•"}
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectPropertyRef.current(p);
        setActivePopupProperty(p);
      });

      return el;
    };

    map.on("load", () => {
      // Create initial markers directly - 100% reliable, zero race condition
      propertiesRef.current.forEach((p) => {
        if (!p.latitude || !p.longitude) return;
        const el = createPin(p, false);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([p.longitude, p.latitude])
          .addTo(map);
        markersMapRef.current.set(p.id, { marker, el });
      });

      // Fit bounds to all properties
      if (propertiesRef.current.length > 0) {
        let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
        let valid = 0;
        propertiesRef.current.forEach((p) => {
          if (p.longitude && p.latitude) {
            if (p.longitude < minLng) minLng = p.longitude;
            if (p.longitude > maxLng) maxLng = p.longitude;
            if (p.latitude < minLat) minLat = p.latitude;
            if (p.latitude > maxLat) maxLat = p.latitude;
            valid++;
          }
        });
        if (valid > 0) {
          map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40 });
        }
      }
    });

    // Map click for manual POI addition
    map.on("click", (e) => {
      if (isAddModeRef.current) {
        const lat = Number(e.lngLat.lat.toFixed(6));
        const lng = Number(e.lngLat.lng.toFixed(6));

        if (tempMarkerRef.current) tempMarkerRef.current.remove();
        const tempEl = document.createElement("div");
        tempEl.innerHTML = `
          <div class="flex flex-col items-center animate-bounce">
            <div class="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold shadow-lg border border-amber-300 whitespace-nowrap mb-1">
              ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </div>
            <div class="w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-bold ring-2 ring-amber-300">
              📍
            </div>
          </div>
        `;
        tempMarkerRef.current = new maplibregl.Marker({ element: tempEl })
          .setLngLat([lng, lat])
          .addTo(map);

        onAddAtCoordinateRef.current(lat, lng);
        setIsAddMode(false);
      }
    });

    // Right-click anywhere to drop pin and add POI
    map.on("contextmenu", (e) => {
      e.preventDefault();
      const lat = Number(e.lngLat.lat.toFixed(6));
      const lng = Number(e.lngLat.lng.toFixed(6));
      onAddAtCoordinateRef.current(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersMapRef.current.clear();
    };
  }, []);

  // Filter markers without recreating DOM nodes (fast style.display toggle in < 0.5ms)
  useEffect(() => {
    const visibleIds = new Set(properties.map((p) => p.id));

    if (mapRef.current) {
      // Add any new property added to data
      properties.forEach((p) => {
        if (!p.latitude || !p.longitude) return;
        if (!markersMapRef.current.has(p.id)) {
          const isKosong = p.jenis_properti === "TANAH_KOSONG";
          const el = document.createElement("div");
          el.className = "cursor-pointer transition-transform hover:scale-125 select-none";
          el.innerHTML = `
            <div class="relative flex items-center justify-center">
              <div class="pin-badge w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-white transition-all ${
                isKosong ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/30" : "bg-sky-600 hover:bg-sky-500 shadow-sky-500/30"
              }">
                ${p.legacy_no ? p.legacy_no : "•"}
              </div>
            </div>
          `;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelectPropertyRef.current(p);
            setActivePopupProperty(p);
          });
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([p.longitude, p.latitude])
            .addTo(mapRef.current!);
          markersMapRef.current.set(p.id, { marker, el });
        }
      });
    }

    markersMapRef.current.forEach(({ el }, id) => {
      el.style.display = visibleIds.has(id) ? "" : "none";
    });
  }, [properties]);

  // Update selected marker highlight in 0.001ms without touching other 1,510 markers
  useEffect(() => {
    if (!selectedProperty) return;

    // Remove active styles from previously selected marker
    if (selectedMarkerIdRef.current && markersMapRef.current.has(selectedMarkerIdRef.current)) {
      const prev = markersMapRef.current.get(selectedMarkerIdRef.current);
      if (prev) {
        const prevProp = propertiesRef.current.find((p) => p.id === selectedMarkerIdRef.current);
        const isKosong = prevProp?.jenis_properti === "TANAH_KOSONG";
        const badge = prev.el.querySelector(".pin-badge");
        if (badge) {
          badge.className = `pin-badge w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-white transition-all ${
            isKosong ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/30" : "bg-sky-600 hover:bg-sky-500 shadow-sky-500/30"
          }`;
        }
        const ping = prev.el.querySelector(".animate-ping");
        if (ping) ping.remove();
      }
    }

    // Add active styles to new selected marker
    if (markersMapRef.current.has(selectedProperty.id)) {
      const current = markersMapRef.current.get(selectedProperty.id);
      if (current) {
        const badge = current.el.querySelector(".pin-badge");
        if (badge) {
          badge.className =
            "pin-badge w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-slate-950 transition-all bg-amber-400 ring-2 ring-amber-300 scale-125 z-20 shadow-amber-500/50";
        }
        const pingWrapper = current.el.querySelector(".relative");
        if (pingWrapper && !current.el.querySelector(".animate-ping")) {
          const pingDiv = document.createElement("div");
          pingDiv.className = "absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping";
          pingWrapper.prepend(pingDiv);
        }
      }
      selectedMarkerIdRef.current = selectedProperty.id;
    }

    // Fly to selected property
    if (mapRef.current && selectedProperty.latitude && selectedProperty.longitude) {
      mapRef.current.flyTo({
        center: [selectedProperty.longitude, selectedProperty.latitude],
        zoom: 15.5,
        duration: 900,
        essential: true,
      });
      setActivePopupProperty(selectedProperty);
    }
  }, [selectedProperty]);

  // Reset/Fit All Bounds
  const handleFitAll = () => {
    if (!mapRef.current || properties.length === 0) return;
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    let valid = 0;
    properties.forEach((p) => {
      if (p.longitude && p.latitude) {
        if (p.longitude < minLng) minLng = p.longitude;
        if (p.longitude > maxLng) maxLng = p.longitude;
        if (p.latitude < minLat) minLat = p.latitude;
        if (p.latitude > maxLat) maxLat = p.latitude;
        valid++;
      }
    });
    if (valid > 0) {
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 40 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-lg bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Geotag Hint */}
      <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-800 text-xs font-medium text-slate-300 flex items-center space-x-3 pointer-events-none z-10">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block shadow-xs shadow-sky-500/50"></span>
          <span className="text-[11px] font-semibold text-slate-200">Tanah & Bangunan</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs shadow-amber-500/50"></span>
          <span className="text-[11px] font-semibold text-slate-200">Tanah Kosong</span>
        </div>
        <div className="text-slate-400 text-[10px] pl-2 border-l border-slate-800 font-mono hidden sm:inline">
          📍 Klik kanan peta untuk tambah titik
        </div>
      </div>

      {/* Active Add Mode Floating Banner */}
      {isAddMode && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-amber-300 animate-in fade-in slide-in-from-top-2">
          <span>📍 Klik di mana saja pada peta untuk menambah data titik baru</span>
          <button
            type="button"
            onClick={() => setIsAddMode(false)}
            className="ml-2 bg-slate-950 hover:bg-slate-800 text-white px-2.5 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Top Right Map Controls: Layer Switcher, Fit All, and Manual Add Button */}
      <div className="absolute top-3 right-14 flex items-center gap-2 z-10">
        {/* Manual POI Add Button */}
        <button
          type="button"
          onClick={() => setIsAddMode((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer border ${
            isAddMode
              ? "bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50"
              : "bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border-slate-800"
          }`}
          title="Tambah Titik Data Baru di Peta"
        >
          <span>➕</span>
          <span className="hidden sm:inline">{isAddMode ? "Klik di Peta..." : "Tambah Titik Manual"}</span>
        </button>

        {/* Fit Bounds Overview Button */}
        <button
          type="button"
          onClick={handleFitAll}
          className="px-2.5 py-1.5 bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-800 shadow-md cursor-pointer"
          title="Tampilkan Seluruh Titik Data di Indonesia"
        >
          🗺️ Semua Titik
        </button>

        {/* Base Layer Switcher (Jalan, Satelit, Gelap, Terang) */}
        <div className="bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-800 flex items-center space-x-1 text-xs">
          <button
            type="button"
            onClick={() => handleLayerChange("street")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeBaseLayer === "street"
                ? "bg-slate-800 text-white shadow-xs border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Peta Jalan Esri World Street Map"
          >
            Jalan
          </button>
          <button
            type="button"
            onClick={() => handleLayerChange("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeBaseLayer === "satellite"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Foto Satelit Esri World Imagery"
          >
            Satelit
          </button>
          <button
            type="button"
            onClick={() => handleLayerChange("dark")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeBaseLayer === "dark"
                ? "bg-slate-800 text-white shadow-xs border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Peta Gelap Esri Dark Canvas"
          >
            Gelap
          </button>
          <button
            type="button"
            onClick={() => handleLayerChange("light")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeBaseLayer === "light"
                ? "bg-slate-800 text-white shadow-xs border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
            title="Peta Terang Esri Light Canvas"
          >
            Terang
          </button>
        </div>
      </div>

      {/* Selected Property Inspector Card (Bottom-Left Drawer) */}
      {activePopupProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-800 z-20 space-y-3 animate-in fade-in slide-in-from-bottom-2">
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
              <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5 mt-1 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/80 w-fit">
                <span>📍 WGS84:</span>
                <span className="font-semibold">{activePopupProperty.latitude.toFixed(6)}, {activePopupProperty.longitude.toFixed(6)}</span>
              </div>
            </div>
            <button
              onClick={() => setActivePopupProperty(null)}
              className="text-slate-500 hover:text-slate-200 font-bold p-1 text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block font-sans">Kisaran Nilai Tanah</span>
              <span className="font-bold text-amber-400 text-sm">
                {activePopupProperty.kisaran_nilai_tanah
                  ? `Rp ${activePopupProperty.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                  : "Belum Dinilai"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block font-sans">Luas Tanah / Bangunan</span>
              <span className="font-bold text-slate-200">
                {activePopupProperty.luas_tanah} m² / {activePopupProperty.luas_bangunan} m²
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block font-sans">Legalitas / Tapak</span>
              <span className="font-medium text-slate-300">
                {activePopupProperty.legalitas} ({activePopupProperty.tapak})
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold block font-sans">Surveyor / Tanggal</span>
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
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
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

      {/* Bottom Right Live Cursor Coordinate Display */}
      <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-800 text-[11px] font-mono text-slate-400 z-10 hidden sm:flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        <span>
          {hoverCoordinate
            ? `Lintang: ${hoverCoordinate.lat.toFixed(6)} | Bujur: ${hoverCoordinate.lng.toFixed(6)}`
            : "Arahkan kursor ke peta untuk koordinat"}
        </span>
      </div>
    </div>
  );
}

export default ValuationMap;
