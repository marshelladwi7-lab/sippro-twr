"use client";

import React, { useEffect, useRef } from "react";
import maplibregl, { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { MarketComparableEntity } from "@/types/database";

interface ValuationMapProps {
  subjectLat: number;
  subjectLng: number;
  radiusMeters: number;
  comparables: MarketComparableEntity[];
  selectedCompIds: string[];
  onSelectComp?: (comp: MarketComparableEntity) => void;
  onSubjectMove?: (lat: number, lng: number) => void;
}

export function ValuationMap({
  subjectLat,
  subjectLng,
  radiusMeters,
  comparables,
  selectedCompIds,
  onSelectComp,
  onSubjectMove,
}: ValuationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const subjectMarkerRef = useRef<Marker | null>(null);
  const compMarkersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // $0 Zero-cost open tile style using CARTO Positron
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
      center: [subjectLng, subjectLat],
      zoom: 13,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("click", (e) => {
      if (onSubjectMove) {
        onSubjectMove(e.lngLat.lat, e.lngLat.lng);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update subject property marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (!subjectMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center";
      el.innerHTML = `
        <div class="absolute w-8 h-8 bg-rose-500/30 rounded-full animate-ping"></div>
        <div class="relative w-5 h-5 bg-rose-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-[9px] font-bold text-white">
          A
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat([subjectLng, subjectLat])
        .addTo(mapRef.current);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        if (onSubjectMove) {
          onSubjectMove(lngLat.lat, lngLat.lng);
        }
      });

      subjectMarkerRef.current = marker;
    } else {
      subjectMarkerRef.current.setLngLat([subjectLng, subjectLat]);
    }

    mapRef.current.flyTo({
      center: [subjectLng, subjectLat],
      essential: true,
      duration: 1000,
    });
  }, [subjectLat, subjectLng]);

  // Update comparables markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing comp markers
    compMarkersRef.current.forEach((m) => m.remove());
    compMarkersRef.current = [];

    comparables.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      const isSelected = selectedCompIds.includes(comp.id);
      const el = document.createElement("div");
      el.className = "cursor-pointer transition-transform hover:scale-125";
      el.innerHTML = `
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white ${
          isSelected ? "bg-emerald-600 ring-2 ring-emerald-300 scale-125" : "bg-sky-600"
        }">
          ${comp.legacy_no || "•"}
        </div>
      `;

      const priceFormatted = comp.kisaran_nilai_tanah
        ? `Rp ${(comp.kisaran_nilai_tanah).toLocaleString("id-ID")}/m²`
        : "Pending Review";

      const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
        <div class="p-2 text-xs font-sans max-w-[220px]">
          <div class="font-semibold text-slate-800">${comp.alamat}</div>
          <div class="text-slate-500 mt-1">${comp.kecamatan}, ${comp.kota_kab}</div>
          <div class="mt-2 text-emerald-700 font-bold">${priceFormatted}</div>
          <div class="text-slate-600 mt-0.5">LT: ${comp.luas_tanah} m² | LB: ${comp.luas_bangunan} m²</div>
          ${comp.distance_meters ? `<div class="text-slate-400 mt-0.5 text-[10px]">Jarak: ${comp.distance_meters} m</div>` : ""}
          ${comp.surveyor_name ? `<div class="text-slate-500 mt-1 text-[10px]">Surveyor: ${comp.surveyor_name}</div>` : ""}
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([comp.longitude, comp.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (onSelectComp) {
          onSelectComp(comp);
        }
      });

      compMarkersRef.current.push(marker);
    });
  }, [comparables, selectedCompIds]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-sm border border-slate-200 text-xs font-medium text-slate-700 pointer-events-none flex items-center space-x-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-600"></span>
        <span>Agunan</span>
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-600 ml-2"></span>
        <span>Pembanding (${comparables.length})</span>
        <span className="text-slate-400 ml-2">Radius: {radiusMeters}m</span>
      </div>
    </div>
  );
}
