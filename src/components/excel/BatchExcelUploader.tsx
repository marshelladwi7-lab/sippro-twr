"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { IngestionResult } from "@/lib/excel/excel-ingestion";
import { validateBankDataSchema, ValidationReport } from "@/lib/excel/bank-data-spec";

interface BatchExcelUploaderProps {
  onIngestionComplete?: (result: { importedCount: number; totalCount: number }) => void;
}

export function BatchExcelUploader({ onIngestionComplete }: BatchExcelUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    importedCount: number;
    totalCount: number;
    fileName: string;
  } | null>(null);
  const [specValidation, setSpecValidation] = useState<ValidationReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setImportSummary(null);
    setSpecValidation(null);

    try {
      // 1. Client schema check if it's an Excel file
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const uint8 = new Uint8Array(buffer);
        const wb = XLSX.read(uint8, { type: "array" });
        if (!wb.SheetNames.includes("List_DP")) {
          const firstSheet = wb.Sheets[wb.SheetNames[0]];
          const rawJson: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          const headers: string[] = [];
          for (const row of rawJson) {
            for (const cell of row) {
              if (typeof cell === "string" && cell.trim()) {
                headers.push(cell.trim());
              }
            }
          }
          const validation = validateBankDataSchema(headers);
          setSpecValidation(validation);
        }
      }

      // 2. Upload to /api/import for server persistence
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setImportSummary({
          importedCount: json.importedCount,
          totalCount: json.totalCount,
          fileName: file.name,
        });
        if (onIngestionComplete) {
          onIngestionComplete({
            importedCount: json.importedCount,
            totalCount: json.totalCount,
          });
        }
      } else {
        alert(json.error || "Gagal mengimpor file.");
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
      alert("Gagal membaca file. Pastikan format file sesuai.");
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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Import Data & Pangkalan Data Properti</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
              SIPPRO-TWR
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Unggah file Excel (.xlsx / .xls) atau Google My Maps (.kml) untuk menambahkan data ke pangkalan data.
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-slate-950/60 hover:bg-emerald-950/20 group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          accept=".xlsx, .xls, .kml"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-xl group-hover:scale-110 group-hover:border-emerald-500 transition-all shadow-xs">
          📥
        </div>
        <div className="text-sm font-bold text-slate-200">
          {isProcessing ? "Menyimpan ke Pangkalan Data..." : "Tarik & Lepas File ke Sini, atau Klik untuk Memilih"}
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Mendukung format multi-sheet (DB Tahap 1), LIST BANK DATA, dan Google My Maps (.kml)
        </p>
      </div>

      {importSummary && (
        <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
            <span>✅ Berhasil Menyimpan ke Database!</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-900/60 shadow-xs">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-semibold">File Sumber</span>
              <span className="text-xs font-bold text-slate-200 truncate block mt-0.5">{importSummary.fileName}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-900/60 shadow-xs">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-semibold">Data Baru Ditambahkan</span>
              <span className="text-lg font-black text-emerald-400 font-mono block mt-0.5">+{importSummary.importedCount}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-900/60 shadow-xs">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-semibold">Total Pangkalan Data</span>
              <span className="text-lg font-black text-slate-100 font-mono block mt-0.5">{importSummary.totalCount.toLocaleString("id-ID")} Titik</span>
            </div>
          </div>
        </div>
      )}

      {specValidation && (
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-300">
              Validasi Skema Standar (LIST BANK DATA):
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                specValidation.isValid
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-amber-950 text-amber-400 border border-amber-800"
              }`}
            >
              {specValidation.isValid ? "Format Sesuai Standar" : "Kolom Belum Lengkap"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-slate-400 text-[11px]">
              Kolom Terdeteksi ({specValidation.recognizedFields.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {specValidation.recognizedFields.map((f: string) => (
                <span
                  key={f}
                  className="px-2 py-0.5 bg-slate-900 text-emerald-400 border border-slate-800 rounded text-[10px] font-mono"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
