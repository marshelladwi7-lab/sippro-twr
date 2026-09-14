"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import maplibregl, {
  Map as MapLibreMap,
  Marker as MapMarker,
  GeoJSONSource,
} from "maplibre-gl";
import { MarketComparableEntity } from "@/types/database";
import {
  Sun,
  Moon,
  Crosshair,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Maximize2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type BasemapMode = "light" | "dark";
export type RadiusKmOption = 1 | 2 | 3 | 5;

export interface SubjectLocation {
  latitude: number;
  longitude: number;
  alamat?: string;
  label?: string;
}

export interface ValuationMapCockpitProps {
  subjectLocation: SubjectLocation;
  properties: MarketComparableEntity[];
  selectedCompIds: string[];
  onSelectComp?: (comp: MarketComparableEntity) => void;
  onToggleSelectComp?: (comp: MarketComparableEntity) => void;
  onInspectComp: (comp: MarketComparableEntity) => void;
  onSubjectCoordinateChange?: (lat: number, lng: number) => void;
  radiusKm?: RadiusKmOption;
  onRadiusKmChange?: (radiusKm: RadiusKmOption) => void;
  className?: string;
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function generateCircleGeoJson(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const kmToDegreeLat = 1 / 110.574;
  const kmToDegreeLng = 1 / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const lat = centerLat + Math.sin(angle) * radiusKm * kmToDegreeLat;
    const lng = centerLng + Math.cos(angle) * radiusKm * kmToDegreeLng;
    coords.push([lng, lat]);
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coords],
    },
    properties: {
      radiusKm,
    },
  };
}

export function ValuationMapCockpit({
  subjectLocation,
  properties,
  selectedCompIds,
  onSelectComp,
  onToggleSelectComp,
  onInspectComp,
  onSubjectCoordinateChange,
  radiusKm: externalRadiusKm,
  onRadiusKmChange,
  className,
}: ValuationMapCockpitProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const subjectMarkerRef = useRef<MapMarker | null>(null);
  const compMarkersRef = useRef<MapMarker[]>([]);

  const [basemap, setBasemap] = useState<BasemapMode>("light");
  const [internalRadiusKm, setInternalRadiusKm] = useState<RadiusKmOption>(2);
  const activeRadiusKm = externalRadiusKm ?? internalRadiusKm;

  const [activePopupComp, setActivePopupComp] =
    useState<MarketComparableEntity | null>(null);

  const handleRadiusChange = (r: RadiusKmOption) => {
    setInternalRadiusKm(r);
    onRadiusKmChange?.(r);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [
      subjectLocation.longitude || 107.173722,
      subjectLocation.latitude || -6.395972,
    ];

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
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
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
            layout: {
              visibility: "visible",
            },
          },
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 20,
            layout: {
              visibility: "none",
            },
          },
        ],
      },
      center: initialCenter,
      zoom: 13.5,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      "top-right"
    );

    map.on("load", () => {
      // Add GeoJSON radius circle source & layer
      const circleData = generateCircleGeoJson(
        subjectLocation.latitude,
        subjectLocation.longitude,
        activeRadiusKm
      );

      map.addSource("subject-radius-source", {
        type: "geojson",
        data: circleData,
      });

      map.addLayer({
        id: "subject-radius-fill",
        type: "fill",
        source: "subject-radius-source",
        paint: {
          "fill-color": "#0284c7",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "subject-radius-line",
        type: "line",
        source: "subject-radius-source",
        paint: {
          "line-color": "#0284c7",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
          "line-opacity": 0.8,
        },
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer Visibility
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (map.getLayer("carto-positron-layer") && map.getLayer("carto-dark-layer")) {
      map.setLayoutProperty(
        "carto-positron-layer",
        "visibility",
        basemap === "light" ? "visible" : "none"
      );
      map.setLayoutProperty(
        "carto-dark-layer",
        "visibility",
        basemap === "dark" ? "visible" : "none"
      );
    }
  }, [basemap]);

  // Update Radius Circle GeoJSON when Subject or Radius Changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource("subject-radius-source") as GeoJSONSource | undefined;
    if (source) {
      const circleData = generateCircleGeoJson(
        subjectLocation.latitude,
        subjectLocation.longitude,
        activeRadiusKm
      );
      source.setData(circleData);
    }
  }, [subjectLocation.latitude, subjectLocation.longitude, activeRadiusKm]);

  // Update Draggable Subject Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (subjectMarkerRef.current) {
      subjectMarkerRef.current.remove();
      subjectMarkerRef.current = null;
    }

    const subjectEl = document.createElement("div");
    subjectEl.className = "group relative cursor-grab active:cursor-grabbing select-none";
    subjectEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-3 rounded-full bg-rose-500/30 animate-ping"></div>
        <div class="absolute -inset-1.5 rounded-full bg-rose-500/20"></div>
        <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-2 ring-rose-400/80 z-20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="absolute top-9 px-1.5 py-0.5 rounded bg-slate-900/90 text-[9px] font-bold text-white shadow uppercase tracking-wider whitespace-nowrap pointer-events-none">
          Agunan (Subject)
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: subjectEl,
      draggable: true,
    })
      .setLngLat([subjectLocation.longitude, subjectLocation.latitude])
      .addTo(mapRef.current);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onSubjectCoordinateChange?.(lngLat.lat, lngLat.lng);
    });

    subjectMarkerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [subjectLocation.latitude, subjectLocation.longitude, onSubjectCoordinateChange]);

  // Update Comparable Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous comp markers
    compMarkersRef.current.forEach((m) => m.remove());
    compMarkersRef.current = [];

    properties.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      const isSelected = selectedCompIds.includes(comp.id);
      const selectedIndex = isSelected
        ? selectedCompIds.indexOf(comp.id) + 1
        : null;

      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform hover:scale-110 select-none";

      if (isSelected) {
        // Emerald numbered pin for selected comps
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center font-mono font-bold text-white text-[10px] ring-2 ring-emerald-400 z-10">
              DP${selectedIndex}
            </div>
          </div>
        `;
      } else {
        // Sky blue pin for unselected market comps
        const displayLabel = comp.legacy_no ? `#${comp.legacy_no}` : "•";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-sky-600 hover:bg-sky-500 border-2 border-white shadow-md flex items-center justify-center font-mono font-bold text-white text-[9px] ring-1 ring-sky-300">
              ${displayLabel}
            </div>
          </div>
        `;
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setActivePopupComp(comp);
        onSelectComp?.(comp);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([comp.longitude, comp.latitude])
        .addTo(mapRef.current!);

      compMarkersRef.current.push(marker);
    });
  }, [properties, selectedCompIds, onSelectComp]);

  // Re-center on Subject
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [subjectLocation.longitude, subjectLocation.latitude],
      zoom: 14,
      duration: 1000,
      essential: true,
    });
  }, [subjectLocation]);

  // Distance of active popup comp to subject
  const activeDistance = useMemo(() => {
    if (!activePopupComp || !activePopupComp.latitude || !activePopupComp.longitude) {
      return null;
    }
    return calculateDistanceMeters(
      subjectLocation.latitude,
      subjectLocation.longitude,
      activePopupComp.latitude,
      activePopupComp.longitude
    );
  }, [activePopupComp, subjectLocation]);

  const isPopupCompSelected = activePopupComp
    ? selectedCompIds.includes(activePopupComp.id)
    : false;

  return (
    <div
      className={cn(
        "relative w-full h-[520px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs",
        className
      )}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Cockpit Bar: Basemap Toggle & Radius Pills */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Basemap Toggle */}
        <div className="flex items-center rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setBasemap("light")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded font-semibold text-[11px] transition-colors",
              basemap === "light"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
            title="CARTO Positron (Light)"
          >
            <Sun className="w-3 h-3" />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setBasemap("dark")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded font-semibold text-[11px] transition-colors",
              basemap === "dark"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
            title="CARTO Dark Matter"
          >
            <Moon className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>

        {/* Radius Filter Pills */}
        <div className="flex items-center rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs p-0.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Radius
          </span>
          {([1, 2, 3, 5] as RadiusKmOption[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRadiusChange(r)}
              className={cn(
                "px-2 py-1 rounded font-mono font-bold text-[11px] transition-colors",
                activeRadiusKm === r
                  ? "bg-sky-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {r}km
            </button>
          ))}
        </div>

        {/* Re-center Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xs text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          title="Fokuskan ke Agunan (Subject)"
        >
          <Crosshair className="w-3.5 h-3.5 text-rose-600" />
          <span>Ke Subject</span>
        </button>
      </div>

      {/* Bottom Left Legend & Instruction */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-md border border-slate-200 shadow-xs text-[10px] text-slate-600 flex flex-wrap items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block ring-1 ring-white" />
          <span className="font-semibold text-slate-800">Agunan (Subject)</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block ring-1 ring-white" />
          <span>Terpilih KKP ({selectedCompIds.length})</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block ring-1 ring-white" />
          <span>Pembanding Pasar ({properties.length})</span>
        </div>
        <div className="text-slate-400 pl-2 border-l border-slate-200 font-mono hidden sm:inline">
          💡 Drag pin merah untuk kalibrasi koordinat
        </div>
      </div>

      {/* Interactive Selected Comparable Floating Card */}
      {activePopupComp && (
        <div className="absolute top-14 right-3 z-20 w-84 max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-md rounded-lg shadow-xl border border-slate-200/90 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={isPopupCompSelected ? "success" : "info"} size="xs">
                  {isPopupCompSelected
                    ? `KKP DP #${selectedCompIds.indexOf(activePopupComp.id) + 1}`
                    : `Data #${activePopupComp.legacy_no || activePopupComp.id.slice(0, 5)}`}
                </Badge>
                <span className="text-[10px] font-mono text-slate-400">
                  {activePopupComp.jenis_properti}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                {activePopupComp.alamat}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">
                {activePopupComp.kecamatan}, {activePopupComp.kota_kab}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePopupComp(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 text-xs font-bold shrink-0"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono">
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Indikasi Nilai Tanah
              </span>
              <span className="font-bold text-sky-800 text-xs tabular-nums">
                {activePopupComp.kisaran_nilai_tanah
                  ? `Rp ${activePopupComp.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Jarak ke Subject
              </span>
              <span className="font-bold text-slate-800 text-xs tabular-nums">
                {activeDistance !== null
                  ? activeDistance < 1000
                    ? `${activeDistance} m`
                    : `${(activeDistance / 1000).toFixed(2)} km`
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Luas T / B
              </span>
              <span className="font-semibold text-slate-700 text-[11px] tabular-nums">
                {activePopupComp.luas_tanah} m² / {activePopupComp.luas_bangunan} m²
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Legalitas & Tapak
              </span>
              <span className="font-semibold text-slate-700 text-[11px] truncate block">
                {activePopupComp.legalitas} • {activePopupComp.tapak}
              </span>
            </div>
          </div>

          {/* Action Rail */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => onInspectComp(activePopupComp)}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition flex items-center justify-center gap-1 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Buka Detail</span>
            </button>

            {onToggleSelectComp && (
              <button
                type="button"
                onClick={() => onToggleSelectComp(activePopupComp)}
                className={cn(
                  "py-1.5 px-2.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 border",
                  isPopupCompSelected
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                )}
              >
                {isPopupCompSelected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Lepas KKP</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pilih KKP</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`https://www.google.com/maps?q=${activePopupComp.latitude},${activePopupComp.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded border border-slate-200 transition"
              title="Buka di Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValuationMapCockpit;
