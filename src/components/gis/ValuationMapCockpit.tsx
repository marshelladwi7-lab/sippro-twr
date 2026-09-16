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
  Globe,
  Compass,
  Layers,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "@/lib/theme/theme-context";

const CARTO_KEY = "cb1_3ky1_1_8c915f3c2e662b82a87023cb";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type BasemapMode = "positron" | "dark" | "satellite" | "voyager";
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
  onAddPointOfInterest?: (coord: { latitude: number; longitude: number }) => void;
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
  onAddPointOfInterest,
  radiusKm: externalRadiusKm,
  onRadiusKmChange,
  className,
}: ValuationMapCockpitProps) {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const subjectMarkerRef = useRef<MapMarker | null>(null);

  // Basemap state: defaults to dark or positron based on active theme
  const [basemap, setBasemap] = useState<BasemapMode>(theme === "dark" ? "dark" : "positron");
  const [internalRadiusKm, setInternalRadiusKm] = useState<RadiusKmOption>(2);
  const activeRadiusKm = externalRadiusKm ?? internalRadiusKm;

  const [activePopupComp, setActivePopupComp] =
    useState<MarketComparableEntity | null>(null);

  // Add Point of Interest (POI) Mode
  const [isAddMode, setIsAddMode] = useState(false);
  const isAddModeRef = useRef(isAddMode);
  isAddModeRef.current = isAddMode;

  const onAddPointOfInterestRef = useRef(onAddPointOfInterest);
  onAddPointOfInterestRef.current = onAddPointOfInterest;

  const propertiesRef = useRef(properties);
  propertiesRef.current = properties;

  const onSelectCompRef = useRef(onSelectComp);
  onSelectCompRef.current = onSelectComp;

  // Sync basemap default when site theme changes, unless user explicitly selected satellite/voyager
  useEffect(() => {
    if (basemap === "dark" && theme === "light") {
      setBasemap("positron");
    } else if (basemap === "positron" && theme === "dark") {
      setBasemap("dark");
    }
  }, [theme]);

  const handleRadiusChange = (r: RadiusKmOption) => {
    setInternalRadiusKm(r);
    onRadiusKmChange?.(r);
  };

  // Update cursor when isAddMode changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = isAddMode ? "crosshair" : "";
  }, [isAddMode]);

  // Initialize Map with Watermark-Free Carto and Esri Satellite
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = [
      subjectLocation.longitude || 115.141356,
      subjectLocation.latitude || -8.846376,
    ];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          "carto-positron": {
            type: "raster",
            tiles: [
              `https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
            ],
            tileSize: 256,
            maxzoom: 20,
          },
          "carto-dark": {
            type: "raster",
            tiles: [
              `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
            ],
            tileSize: 256,
            maxzoom: 20,
          },
          "esri-satellite": {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
          },
          "carto-voyager": {
            type: "raster",
            tiles: [
              `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
              `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${CARTO_KEY}`,
            ],
            tileSize: 256,
            maxzoom: 20,
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
              visibility: basemap === "positron" ? "visible" : "none",
            },
          },
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 20,
            layout: {
              visibility: basemap === "dark" ? "visible" : "none",
            },
          },
          {
            id: "esri-satellite-layer",
            type: "raster",
            source: "esri-satellite",
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: basemap === "satellite" ? "visible" : "none",
            },
          },
          {
            id: "carto-voyager-layer",
            type: "raster",
            source: "carto-voyager",
            minzoom: 0,
            maxzoom: 20,
            layout: {
              visibility: basemap === "voyager" ? "visible" : "none",
            },
          },
        ],
      },
      center: initialCenter,
      zoom: 12.5,
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
          "fill-color": "#10b981",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "subject-radius-line",
        type: "line",
        source: "subject-radius-source",
        paint: {
          "line-color": "#10b981",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
          "line-opacity": 0.8,
        },
      });

      // GeoJSON source for 1,511+ comparables (GPU accelerated WebGL for 60 FPS)
      map.addSource("comparables-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      // Halo layer (outer ring for selected or in-radius)
      map.addLayer({
        id: "comparables-halo",
        type: "circle",
        source: "comparables-source",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "isSelected"], true],
            11,
            ["==", ["get", "isWithinRadius"], true],
            9,
            6,
          ],
          "circle-color": [
            "case",
            ["==", ["get", "isSelected"], true],
            "#10b981",
            ["==", ["get", "isWithinRadius"], true],
            "#0284c7",
            "#64748b",
          ],
          "circle-opacity": [
            "case",
            ["==", ["get", "isSelected"], true],
            0.45,
            ["==", ["get", "isWithinRadius"], true],
            0.3,
            0.15,
          ],
        },
      });

      // Point core layer
      map.addLayer({
        id: "comparables-points",
        type: "circle",
        source: "comparables-source",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "isSelected"], true],
            7.5,
            ["==", ["get", "isWithinRadius"], true],
            6,
            4.5,
          ],
          "circle-color": [
            "case",
            ["==", ["get", "isSelected"], true],
            "#059669",
            ["==", ["get", "isWithinRadius"], true],
            "#0284c7",
            "#475569",
          ],
          "circle-stroke-width": [
            "case",
            ["==", ["get", "isSelected"], true],
            2.5,
            1.5,
          ],
          "circle-stroke-color": "#ffffff",
        },
      });

      // Cursor pointer on comparable hover
      map.on("mouseenter", "comparables-points", () => {
        map.getCanvas().style.cursor = isAddModeRef.current ? "crosshair" : "pointer";
      });
      map.on("mouseleave", "comparables-points", () => {
        map.getCanvas().style.cursor = isAddModeRef.current ? "crosshair" : "";
      });

      // Click on comparable point
      map.on("click", "comparables-points", (e) => {
        if (isAddModeRef.current) return;
        if (e.features && e.features[0]) {
          const compId = e.features[0].properties?.id;
          const found = propertiesRef.current.find((p) => p.id === compId);
          if (found) {
            setActivePopupComp(found);
            onSelectCompRef.current?.(found);
          }
        }
      });
    });

    // Click on map to add POI
    map.on("click", (e) => {
      if (isAddModeRef.current && onAddPointOfInterestRef.current) {
        onAddPointOfInterestRef.current({
          latitude: Number(e.lngLat.lat.toFixed(6)),
          longitude: Number(e.lngLat.lng.toFixed(6)),
        });
        setIsAddMode(false);
      }
    });

    // Right-click (contextmenu) anywhere on map to add POI
    map.on("contextmenu", (e) => {
      e.preventDefault();
      if (onAddPointOfInterestRef.current) {
        onAddPointOfInterestRef.current({
          latitude: Number(e.lngLat.lat.toFixed(6)),
          longitude: Number(e.lngLat.lng.toFixed(6)),
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer Visibility on change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const layers: Record<BasemapMode, string> = {
      positron: "carto-positron-layer",
      dark: "carto-dark-layer",
      satellite: "esri-satellite-layer",
      voyager: "carto-voyager-layer",
    };

    Object.entries(layers).forEach(([mode, layerId]) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          mode === basemap ? "visible" : "none"
        );
      }
    });
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

  // Update Draggable Subject Marker (Single marker, zero DOM thrashing)
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
        <div class="absolute -inset-3 rounded-full bg-emerald-500/30 animate-ping"></div>
        <div class="absolute -inset-1.5 rounded-full bg-emerald-500/20"></div>
        <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-2 ring-emerald-400/80 z-20">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="absolute top-9 px-1.5 py-0.5 rounded bg-slate-900/90 text-[9px] font-bold text-white shadow uppercase tracking-wider whitespace-nowrap pointer-events-none">
          Target Estimasi
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
  }, [subjectLocation.latitude, subjectLocation.longitude, onSubjectCoordinateChange]);

  // Update Comparable Points via WebGL GPU source (Instant 60 FPS, 0 DOM overhead)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource("comparables-source") as GeoJSONSource | undefined;
    if (!source) return;

    const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

    for (let i = 0; i < properties.length; i++) {
      const comp = properties[i];
      if (!comp.latitude || !comp.longitude) continue;

      const isSelected = selectedCompIds.includes(comp.id);
      const distMeters = calculateDistanceMeters(
        subjectLocation.latitude,
        subjectLocation.longitude,
        comp.latitude,
        comp.longitude
      );
      const isWithinRadius = distMeters <= activeRadiusKm * 1000;

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [comp.longitude, comp.latitude],
        },
        properties: {
          id: comp.id,
          legacy_no: comp.legacy_no || "",
          alamat: comp.alamat || "Data Pembanding",
          kisaran_nilai_tanah: comp.kisaran_nilai_tanah || 0,
          isSelected,
          isWithinRadius,
          distMeters,
        },
      });
    }

    source.setData({
      type: "FeatureCollection",
      features,
    });
  }, [
    properties,
    selectedCompIds,
    activeRadiusKm,
    subjectLocation.latitude,
    subjectLocation.longitude,
  ]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [subjectLocation.longitude, subjectLocation.latitude],
      zoom: 14,
      pitch: 0,
      bearing: 0,
      essential: true,
    });
  };

  const activeDistance = useMemo(() => {
    if (!activePopupComp) return null;
    return calculateDistanceMeters(
      subjectLocation.latitude,
      subjectLocation.longitude,
      activePopupComp.latitude,
      activePopupComp.longitude
    );
  }, [activePopupComp, subjectLocation]);

  const isPopupCompSelected = useMemo(() => {
    if (!activePopupComp) return false;
    return selectedCompIds.includes(activePopupComp.id);
  }, [activePopupComp, selectedCompIds]);

  return (
    <div
      className={cn(
        "relative w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-sm",
        className
      )}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Left Cockpit Bar: Watermark-Free Basemap Selector & Radius Pills */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Watermark-Free Basemap Switcher */}
        <div className="flex items-center rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md p-1 text-xs">
          <button
            type="button"
            onClick={() => setBasemap("positron")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
              basemap === "positron"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Peta Terang (CARTO Positron - Bebas Watermark)"
          >
            <Sun className="w-3 h-3 text-amber-500" />
            <span>Terang</span>
          </button>

          <button
            type="button"
            onClick={() => setBasemap("dark")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
              basemap === "dark"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Peta Gelap (CARTO Dark Matter - Bebas Watermark)"
          >
            <Moon className="w-3 h-3 text-sky-400" />
            <span>Gelap</span>
          </button>

          <button
            type="button"
            onClick={() => setBasemap("satellite")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
              basemap === "satellite"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Citra Satelit Resolusi Tinggi (Esri World Imagery - Bebas Watermark)"
          >
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Satelit</span>
          </button>

          <button
            type="button"
            onClick={() => setBasemap("voyager")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer",
              basemap === "voyager"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
            title="Peta Vektor Detail (CARTO Voyager - Bebas Watermark)"
          >
            <Compass className="w-3 h-3 text-teal-400" />
            <span>Vektor</span>
          </button>
        </div>

        {/* Radius Filter Pills */}
        <div className="flex items-center rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md p-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Radius
          </span>
          {([1, 2, 3, 5] as RadiusKmOption[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRadiusChange(r)}
              className={cn(
                "px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] transition-all cursor-pointer",
                activeRadiusKm === r
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Fokuskan ke Target Properti"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ke Target</span>
        </button>

        {/* Region Jumper */}
        <div className="flex items-center rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md p-1 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-500" />
            Wilayah:
          </span>
          <select
            aria-label="Pilih Wilayah Kluster Data"
            onChange={(e) => {
              const val = e.target.value;
              const map = mapRef.current;
              if (!map) return;
              if (val === "bali") {
                map.flyTo({ center: [115.141356, -8.846376], zoom: 12.5 });
                onSubjectCoordinateChange?.(-8.846376, 115.141356);
              } else if (val === "jabodetabek") {
                map.flyTo({ center: [106.8456, -6.2088], zoom: 11.5 });
                onSubjectCoordinateChange?.(-6.2088, 106.8456);
              } else if (val === "bekasi") {
                map.flyTo({ center: [107.173722, -6.395972], zoom: 12 });
                onSubjectCoordinateChange?.(-6.395972, 107.173722);
              } else if (val === "bandung") {
                map.flyTo({ center: [107.6191, -6.9175], zoom: 12 });
                onSubjectCoordinateChange?.(-6.9175, 107.6191);
              } else if (val === "surabaya") {
                map.flyTo({ center: [112.7521, -7.2575], zoom: 12 });
                onSubjectCoordinateChange?.(-7.2575, 112.7521);
              } else if (val === "all") {
                map.fitBounds([[95.3, -8.87], [125.0, 5.89]], { padding: 40 });
              }
            }}
            className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer pr-2 py-0.5"
            defaultValue="bali"
          >
            <option value="bali" className="dark:bg-slate-900">🏝️ Bali (984 Data)</option>
            <option value="jabodetabek" className="dark:bg-slate-900">🏙️ DKI Jakarta (115 Data)</option>
            <option value="bekasi" className="dark:bg-slate-900">🏭 Bekasi (52 Data)</option>
            <option value="bandung" className="dark:bg-slate-900">☕ Bandung (37 Data)</option>
            <option value="surabaya" className="dark:bg-slate-900">⚓ Surabaya (24 Data)</option>
            <option value="all" className="dark:bg-slate-900">🗺️ Seluruh Indonesia (1.511 Data)</option>
          </select>
        </div>

        {/* Fit All Bounds Button */}
        <button
          type="button"
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            map.fitBounds([[95.3, -8.87], [125.0, 5.89]], { padding: 40 });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Tampilkan Seluruh 1.511 Titik Data di Indonesia"
        >
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span>Lihat Semua</span>
        </button>

        {/* Tambah Titik Data (POI) Button */}
        {onAddPointOfInterest && (
          <button
            type="button"
            onClick={() => setIsAddMode((prev) => !prev)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-md text-[11px] font-semibold transition-all cursor-pointer",
              isAddMode
                ? "bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50 shadow-amber-500/20 font-bold"
                : "bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
            title="Tambah Titik Data Baru di Peta (atau Klik Kanan di peta)"
          >
            <PlusCircle className={cn("w-3.5 h-3.5", isAddMode ? "text-slate-950" : "text-amber-500")} />
            <span>{isAddMode ? "Mode Tambah Aktif" : "+ Titik Data"}</span>
          </button>
        )}
      </div>

      {/* Floating Active POI Mode Alert Banner */}
      {isAddMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl shadow-xl font-bold text-xs flex items-center gap-2.5 border border-amber-300 animate-in fade-in slide-in-from-top-2">
          <MapPin className="w-4 h-4 text-slate-950" />
          <span>Klik lokasi mana saja pada peta untuk mendaftarkan titik baru (atau Klik Kanan)</span>
          <button
            type="button"
            onClick={() => setIsAddMode(false)}
            className="ml-2 bg-slate-950 hover:bg-slate-800 text-white px-2.5 py-0.5 rounded-lg text-[11px] transition-all cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Bottom Left Legend & Instruction */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3.5 pointer-events-none">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block ring-1 ring-white" />
          <span className="font-semibold text-slate-900 dark:text-white">Target Estimasi</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block ring-1 ring-white" />
          <span>Radius {activeRadiusKm} km</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block ring-1 ring-white" />
          <span>Data Pembanding ({properties.length})</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800 font-mono hidden sm:inline text-[10px]">
          💡 Drag pin hijau untuk memindahkan titik estimasi
        </div>
      </div>

      {/* Interactive Selected Comparable Floating Card */}
      {activePopupComp && (
        <div className="absolute top-14 right-3 z-20 w-84 max-w-[calc(100vw-2rem)] bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-900 dark:text-slate-100">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                  DP #{activePopupComp.legacy_no || activePopupComp.id}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activePopupComp.tanggal_data || "2026"}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-1 leading-snug">
                {activePopupComp.alamat}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setActivePopupComp(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs font-bold shrink-0 cursor-pointer"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Nilai Tanah Pasar
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">
                {activePopupComp.kisaran_nilai_tanah
                  ? `Rp ${activePopupComp.kisaran_nilai_tanah.toLocaleString("id-ID")}/m²`
                  : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Jarak ke Target
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs tabular-nums">
                {activeDistance !== null
                  ? activeDistance < 1000
                    ? `${activeDistance} m`
                    : `${(activeDistance / 1000).toFixed(2)} km`
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Luas Tanah / Bangunan
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] tabular-nums">
                {activePopupComp.luas_tanah} m² / {activePopupComp.luas_bangunan} m²
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-sans">
                Legalitas & Tapak
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate block">
                {activePopupComp.legalitas} • {activePopupComp.tapak}
              </span>
            </div>
          </div>

          {/* Action Rail */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onInspectComp(activePopupComp)}
              className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span>Detail Properti</span>
            </button>

            {onToggleSelectComp && (
              <button
                type="button"
                onClick={() => onToggleSelectComp(activePopupComp)}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer",
                  isPopupCompSelected
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                )}
              >
                {isPopupCompSelected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus Pilihan</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Pilih Analisis</span>
                  </>
                )}
              </button>
            )}

            <a
              href={`https://www.google.com/maps?q=${activePopupComp.latitude},${activePopupComp.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
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
