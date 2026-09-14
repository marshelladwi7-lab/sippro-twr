"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { ingestDbTahap1Buffer, IngestionResult } from "@/lib/excel/excel-ingestion";
import { validateBankDataSchema, ValidationReport } from "@/lib/excel/bank-data-spec";

interface BatchExcelUploaderProps {
  onIngestionComplete?: (result: IngestionResult) => void;
}

export function BatchExcelUploader({ onIngestionComplete }: BatchExcelUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionStats, setIngestionStats] = useState<IngestionResult | null>(null);
  const [specValidation, setSpecValidation] = useState<ValidationReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setIngestionStats(null);
    setSpecValidation(null);

    try {
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      const wb = XLSX.read(uint8, { type: "array" });

      if (wb.SheetNames.includes("List_DP")) {
        const result = ingestDbTahap1Buffer(uint8);
        setIngestionStats(result);
        if (onIngestionComplete) {
          onIngestionComplete(result);
        }
      } else {
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
            Unggah file DB Tahap 1.xlsx atau LIST BANK DATA.xlsx untuk auto-sanitasi dan validasi skema.
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
          Mendukung DB Tahap 1.xlsx (List_DP, Sheet1, Surveyor) & Format Standar LIST BANK DATA.xlsx
        </p>
      </div>

      {ingestionStats && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs space-y-2">
          <div className="font-bold text-slate-800">Hasil Audit & Sanitasi Data (DB Tahap 1):</div>
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

      {specValidation && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Hasil Validasi Skema Standar (LIST BANK DATA):
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                specValidation.isValid
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {specValidation.isValid ? "Format Sesuai Standar" : "Kolom Belum Lengkap"}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-slate-500 text-[11px]">
              Kolom Dikenali ({specValidation.recognizedFields.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {specValidation.recognizedFields.map((f: string) => (
                <span
                  key={f}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px]"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>

          {specValidation.missingRequired.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-rose-600 text-[11px] font-semibold">
                Kolom Wajib Belum Ada ({specValidation.missingRequired.length}):
              </div>
              <div className="flex flex-wrap gap-1">
                {specValidation.missingRequired.map((f: string) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px]"
                  >
                    ✗ {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {specValidation.hasTransactionDiscountFields && (
            <div className="p-2 bg-sky-50 border border-sky-200 rounded text-sky-800 text-[11px]">
              💡 Field Diskon Transaksi (Harga Penawaran / Harga Transaksi) terdeteksi untuk kalkulasi Δpenawaran otomatis SPI 106.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
