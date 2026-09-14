"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ValuationMap } from "@/components/gis/ValuationMap";
import { KkpAdjustmentGrid } from "@/components/valuation/KkpAdjustmentGrid";
import { ExecutiveBankSummaryCard } from "@/components/valuation/ExecutiveBankSummaryCard";
import { BatchExcelUploader } from "@/components/excel/BatchExcelUploader";
import { PrintableRingkasanPenilaian } from "@/components/reports/PrintableRingkasanPenilaian";
import { MarketComparableEntity, LegalitasEnum, TapakShapeEnum, PropertyTypeEnum } from "@/types/database";
import { calculateMarketApproach, ComparableAdjustmentInput } from "@/lib/valuation/market-approach-engine";
import { calculateCostApproach } from "@/lib/valuation/cost-approach-engine";
import { calculateLiquidationValue } from "@/lib/valuation/liquidation-engine";

export default function WorkstationPage() {
  // 1. Subject Property State (Default to Cikarang Pusat / Bekasi GIIC Area from DB Tahap 1)
  const [subject, setSubject] = useState({
    debiturName: "PT Graha Indah Logistik",
    nop: "321601000100200030",
    alamat: "Kawasan Industri GIIC Cikarang Pusat, Bekasi",
    latitude: -6.395972,
    longitude: 107.173722,
    luasTanah: 2500,
    luasBangunan: 1200,
    legalitas: "SHM" as LegalitasEnum,
    tapak: "PERSEGI" as TapakShapeEnum,
    rowJalan: 8.0,
    propertyType: "TANAH_BANGUNAN" as PropertyTypeEnum,
    batasUtara: "Jalan Kawasan ROW 12m",
    batasSelatan: "Kavling Industri PT Surya",
    batasTimur: "Kavling Industri PT Cipta",
    batasBarat: "Saluran Drainase Primer",
  });

  // 2. Spatial Query State
  const [radiusMeters, setRadiusMeters] = useState(3000);
  const [allComps, setAllComps] = useState<MarketComparableEntity[]>([]);
  const [nearbyComps, setNearbyComps] = useState<MarketComparableEntity[]>([]);
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>([]);
  const [isLoadingComps, setIsLoadingComps] = useState(true);

  // 3. Adjustments & Justifications State
  const [adjustments, setAdjustments] = useState<Record<string, any>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"kkp" | "uploader" | "report">("kkp");

  // Fetch comparables from API
  useEffect(() => {
    async function fetchComps() {
      setIsLoadingComps(true);
      try {
        const res = await fetch(
          `/api/comparables?lat=${subject.latitude}&lng=${subject.longitude}&radius=${radiusMeters}`
        );
        const json = await res.json();
        if (json.success && json.data) {
          setNearbyComps(json.data);
          // Auto-select first 3 comps if none selected
          if (selectedCompIds.length === 0 && json.data.length >= 3) {
            setSelectedCompIds([json.data[0].id, json.data[1].id, json.data[2].id]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch comps:", err);
      } finally {
        setIsLoadingComps(false);
      }
    }
    fetchComps();
  }, [subject.latitude, subject.longitude, radiusMeters]);

  // Selected Comparables array
  const selectedComps = useMemo(() => {
    return nearbyComps.filter((c) => selectedCompIds.includes(c.id));
  }, [nearbyComps, selectedCompIds]);

  const handleToggleComp = (comp: MarketComparableEntity) => {
    if (selectedCompIds.includes(comp.id)) {
      setSelectedCompIds(selectedCompIds.filter((id) => id !== comp.id));
    } else {
      if (selectedCompIds.length >= 4) {
        alert("Maksimal 4 pembanding untuk lembar KKP standar.");
        return;
      }
      setSelectedCompIds([...selectedCompIds, comp.id]);
    }
  };

  const handleAdjustmentChange = (compId: string, field: string, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [compId]: {
        ...(prev[compId] || {
          transactionTypeDiscount: -0.1,
          timeTrend: 0,
          location: 0,
          legalDelta: 0,
          tapakDelta: 0,
          roadAccessDelta: 0,
        }),
        [field]: value,
      },
    }));
  };

  const handleJustificationChange = (compId: string, text: string) => {
    setJustifications((prev) => ({ ...prev, [compId]: text }));
  };

  // 4. Calculations (SPI 106 Market Approach + SPI 105 Cost + SPI 202 Liquidation)
  const compInputs: ComparableAdjustmentInput[] = useMemo(() => {
    return selectedComps.map((c) => ({
      id: c.id,
      name: `DP #${c.legacy_no || c.id.slice(0, 5)}`,
      baseUnitPrice: c.kisaran_nilai_tanah || 5000000,
      adjustments: adjustments[c.id] || {
        transactionTypeDiscount: -0.1,
        timeTrend: 0,
        location: 0,
        legalDelta: 0,
        tapakDelta: 0,
        roadAccessDelta: 0,
      },
    }));
  }, [selectedComps, adjustments]);

  const valuationMarketResult = useMemo(() => {
    return calculateMarketApproach(compInputs);
  }, [compInputs]);

  const costResult = useMemo(() => {
    return calculateCostApproach({
      propertyType: subject.propertyType,
      buildingArea: subject.luasBangunan,
      rcnPerM2: 4500000, // Standard RCN per m2
      effectiveAgeYears: 5,
      economicLifeYears: 30,
    });
  }, [subject.propertyType, subject.luasBangunan]);

  const totalMarketLand = Math.round(
    subject.luasTanah * (valuationMarketResult.indicatedLandUnitPrice || 5000000)
  );
  const totalMarketBuilding = costResult.totalBuildingValue;

  const liquidationResult = useMemo(() => {
    return calculateLiquidationValue({
      propertyType: subject.propertyType,
      tapakShape: subject.tapak,
      marketValueLand: totalMarketLand,
      marketValueBuilding: totalMarketBuilding,
      bankLtvPercent: 0.7,
    });
  }, [subject.propertyType, subject.tapak, totalMarketLand, totalMarketBuilding]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30 no-print">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center font-black text-sm">
            TWR
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              SISTEM BANK DATA PENILAIAN PROPERTI (INDONESIA)
            </h1>
            <p className="text-[10px] text-slate-400">
              KEPI • SPI 101-106 • SPI 202 • POJK NO. 40/POJK.03/2019 • $0 Free-Tier
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab("kkp")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === "kkp" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Workstation KKP
          </button>
          <button
            onClick={() => setActiveTab("uploader")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === "uploader" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Batch Excel Importer
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === "report" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Laporan Cetak (PDF)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {activeTab === "uploader" && (
          <div className="space-y-6">
            <BatchExcelUploader
              onIngestionComplete={(res) => {
                alert(`Berhasil memuat ${res.totalRows} data properti dari DB Tahap 1.xlsx!`);
              }}
            />
          </div>
        )}

        {activeTab === "report" && (
          <div className="space-y-4">
            <div className="flex justify-end no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded shadow hover:bg-slate-800 flex items-center space-x-1"
              >
                <span>🖨️ Cetak / Simpan PDF</span>
              </button>
            </div>
            <PrintableRingkasanPenilaian
              reportNumber="RPT/TWR/2026/09/001"
              debiturName={subject.debiturName}
              nop={subject.nop}
              alamat={subject.alamat}
              batas={{
                utara: subject.batasUtara,
                selatan: subject.batasSelatan,
                timur: subject.batasTimur,
                barat: subject.batasBarat,
              }}
              legalitas={subject.legalitas}
              luasTanah={subject.luasTanah}
              luasBangunan={subject.luasBangunan}
              inspectionDate="14 September 2026"
              reportDate="15 September 2026"
              surveyorName="Ketut Agus Sudiartawan"
              surveyorVehiclePlate="DK 4667 TY"
              reviewerName="I Komang Adi Juniarta"
              valuationResult={valuationMarketResult}
              liquidationResult={liquidationResult}
              justificationText={justifications["general"]}
            />
          </div>
        )}

        {activeTab === "kkp" && (
          <div className="space-y-6">
            {/* Executive Bank Summary Headline */}
            <ExecutiveBankSummaryCard
              liquidationData={liquidationResult}
              landArea={subject.luasTanah}
              buildingArea={subject.luasBangunan}
              indicatedLandUnitPrice={valuationMarketResult.indicatedLandUnitPrice}
              buildingDepreciatedUnitPrice={costResult.depreciatedBuildingUnitPrice}
              reportDate="2026-09-15"
            />

            {/* Split Screen: GIS Map & Comps Selection + Subject Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Map & Radius */}
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Peta Spasial PostGIS ($0 CARTO Positron)
                    </h2>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-500">Radius:</span>
                      {[1000, 2000, 3000, 5000].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRadiusMeters(r)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            radiusMeters === r
                              ? "bg-sky-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {r / 1000}km
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[380px] w-full">
                    <ValuationMap
                      subjectLat={subject.latitude}
                      subjectLng={subject.longitude}
                      radiusMeters={radiusMeters}
                      comparables={nearbyComps}
                      selectedCompIds={selectedCompIds}
                      onSelectComp={handleToggleComp}
                      onSubjectMove={(lat, lng) =>
                        setSubject((s) => ({ ...s, latitude: lat, longitude: lng }))
                      }
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 Geser marker merah atau klik peta untuk memindahkan lokasi agunan. Klik marker biru/hijau untuk memilih pembanding ke dalam lembar KKP.
                  </p>
                </div>
              </div>

              {/* Right Column: Subject Property Parameters Form */}
              <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Parameter Objek Agunan (Subject)
                </h2>

                <div className="space-y-2 text-xs font-sans">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600">Nama Calon Debitur</label>
                    <input
                      type="text"
                      value={subject.debiturName}
                      onChange={(e) => setSubject({ ...subject, debiturName: e.target.value })}
                      className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">NOP (18 Digit)</label>
                    <input
                      type="text"
                      maxLength={18}
                      value={subject.nop}
                      onChange={(e) => setSubject({ ...subject, nop: e.target.value })}
                      className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600">Alamat Objek Agunan</label>
                    <input
                      type="text"
                      value={subject.alamat}
                      onChange={(e) => setSubject({ ...subject, alamat: e.target.value })}
                      className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Luas Tanah (m²)</label>
                      <input
                        type="number"
                        value={subject.luasTanah}
                        onChange={(e) =>
                          setSubject({ ...subject, luasTanah: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Luas Bangunan (m²)</label>
                      <input
                        type="number"
                        value={subject.luasBangunan}
                        onChange={(e) =>
                          setSubject({ ...subject, luasBangunan: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Legalitas</label>
                      <select
                        value={subject.legalitas}
                        onChange={(e) =>
                          setSubject({ ...subject, legalitas: e.target.value as LegalitasEnum })
                        }
                        className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs bg-white"
                      >
                        <option value="SHM">SHM</option>
                        <option value="HGB">HGB</option>
                        <option value="HAK_PAKAI">Hak Pakai</option>
                        <option value="GIRIK_LETTER_C">Girik / Letter C</option>
                        <option value="STRATA_TITLE">Strata Title</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600">Bentuk Tapak</label>
                      <select
                        value={subject.tapak}
                        onChange={(e) =>
                          setSubject({ ...subject, tapak: e.target.value as TapakShapeEnum })
                        }
                        className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs bg-white"
                      >
                        <option value="PERSEGI">Persegi</option>
                        <option value="HOOK">Hook</option>
                        <option value="KANTONG_SEMAR">Kantong Semar</option>
                        <option value="L_SHAPE">L-Shape</option>
                        <option value="TUSUK_SATE">Tusuk Sate</option>
                        <option value="TIDAK_BERATURAN">Tidak Beraturan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-600">ROW Jalan (m)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={subject.rowJalan}
                        onChange={(e) =>
                          setSubject({ ...subject, rowJalan: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 p-1.5 border border-slate-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: MAPPI KKP Adjustment Grid */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Kertas Kerja Penilaian (KKP) Metode Perbandingan Data Pasar (SPI 106)
                </h2>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedComps.length} Pembanding Terpilih
                </span>
              </div>

              <KkpAdjustmentGrid
                subjectData={{
                  alamat: subject.alamat,
                  luasTanah: subject.luasTanah,
                  luasBangunan: subject.luasBangunan,
                  legalitas: subject.legalitas,
                  tapak: subject.tapak,
                  rowJalan: subject.rowJalan,
                }}
                selectedComps={selectedComps}
                adjustments={adjustments}
                onAdjustmentChange={handleAdjustmentChange}
                justifications={justifications}
                onJustificationChange={handleJustificationChange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
