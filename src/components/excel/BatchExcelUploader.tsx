"use client";

import React, { useState, useRef } from "react";
import { ingestDbTahap1Buffer, IngestionResult } from "@/lib/excel/excel-ingestion";

interface BatchExcelUploaderProps {
  onIngestionComplete?: (result: IngestionResult) => void;
}

export function BatchExcelUploader({ onIngestionComplete }: BatchExcelUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionStats, setIngestionStats] = useState<IngestionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = ingestDbTahap1Buffer(new Uint8Array(buffer));
      setIngestionStats(result);
      if (onIngestionComplete) {
        onIngestionComplete(result);
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
      alert("Gagal membaca file Excel. Pastikan format sesuai standar DB Bank Data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Batch Excel Importer & Sanitizer
          </h3>
          <p className="text-xs text-slate-500">
            Unggah file DB Tahap 1.xlsx untuk auto-sanitasi koordinat dan deteksi outlier luas tanah.
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-sky-50/30"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <div className="text-xs font-semibold text-slate-700">
          {isProcessing ? "Memproses Data & Sanitasi Koordinat..." : "Tarik & Lepas File .xlsx di sini, atau Klik untuk Memilih"}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Mendukung format multi-sheet: List_DP, Sheet1, Surveyor, Analis
        </p>
      </div>

      {ingestionStats && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800">Hasil Audit & Sanitasi Data:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-600">
            <div className="p-2 bg-white rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Total Data Properti</span>
              <span className="text-base font-black text-slate-800">{ingestionStats.totalRows}</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Koordinat Valid</span>
              <span className="text-base font-black text-emerald-700">{ingestionStats.validCoordinateCount}</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Rekonstruksi Koordinat</span>
              <span className="text-base font-black text-sky-700">{ingestionStats.reconstructedCoordinateCount}</span>
            </div>
            <div className="p-2 bg-white rounded border border-slate-100">
              <span className="text-slate-400 text-[10px] block">Outlier Luas (&gt;500rb m²)</span>
              <span className="text-base font-black text-amber-700">{ingestionStats.outlierCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
