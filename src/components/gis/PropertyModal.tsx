"use client";

import React, { useState, useEffect } from "react";
import { MarketComparableEntity, LegalitasEnum, TapakShapeEnum, PropertyTypeEnum } from "@/types/database";

interface PropertyModalProps {
  isOpen: boolean;
  property: MarketComparableEntity | null; // null for creating new
  onClose: () => void;
  onSave: (saved: MarketComparableEntity) => void;
}

export function PropertyModal({ isOpen, property, onClose, onSave }: PropertyModalProps) {
  const [formData, setFormData] = useState<Partial<MarketComparableEntity>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData(property);
    } else {
      setFormData({
        alamat: "",
        provinsi: "Jawa Barat",
        kota_kab: "Kab. Bekasi",
        kecamatan: "Cikarang Pusat",
        desa_kelurahan: "",
        latitude: -6.395972,
        longitude: 107.173722,
        jenis_properti: "TANAH_BANGUNAN",
        luas_tanah: 100,
        luas_bangunan: 0,
        kisaran_nilai_tanah: 3000000,
        harga_penawaran: null,
        harga_transaksi: null,
        tanggal_data: new Date().toISOString().split("T")[0],
        surveyor_name: "",
        reviewer_name: "",
        admin_code: "",
        legalitas: "SHM",
        tapak: "PERSEGI",
        row_jalan: 6.0,
        keterangan: "",
      });
    }
  }, [property, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const method = formData.id ? "PUT" : "POST";
      const res = await fetch("/api/properties", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success && json.data) {
        onSave(json.data);
        onClose();
      } else {
        alert(json.error || "Gagal menyimpan data properti");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan saat menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="sticky top-0 bg-slate-900 text-white px-5 py-3 flex items-center justify-between z-10">
          <div>
            <h3 className="text-sm font-bold">
              {formData.id ? `Edit Data Properti (#${formData.legacy_no || formData.id})` : "Tambah Titik Bank Data Baru"}
            </h3>
            <p className="text-[11px] text-slate-400">
              Formulir Atribut Geotagging Penilaian Properti
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Alamat & Wilayah */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              1. Lokasi & Alamat Objek
            </h4>
            <div>
              <label className="text-slate-600 font-medium">Alamat Lengkap / Jalan</label>
              <textarea
                required
                rows={2}
                value={formData.alamat || ""}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Contoh: Kawasan Industri GIIC, Jl. Anggrek No. 12"
                className="w-full mt-1 p-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="text-slate-600 font-medium">Provinsi</label>
                <input
                  type="text"
                  value={formData.provinsi || ""}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={formData.kota_kab || ""}
                  onChange={(e) => setFormData({ ...formData, kota_kab: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Kecamatan</label>
                <input
                  type="text"
                  value={formData.kecamatan || ""}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Desa / Kelurahan</label>
                <input
                  type="text"
                  value={formData.desa_kelurahan || ""}
                  onChange={(e) => setFormData({ ...formData, desa_kelurahan: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
            </div>

            {/* Koordinat Geotag */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <label className="text-slate-700 font-bold">Latitude (Garis Lintang)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude ?? ""}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold">Longitude (Garis Bujur)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude ?? ""}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono bg-white"
                />
              </div>
              <div className="col-span-2 text-[10px] text-slate-500">
                💡 Format desimal standar WGS84. Contoh: -6.395972, 107.173722
              </div>
            </div>
          </div>

          {/* Spesifikasi Fisik & Legalitas */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              2. Karakteristik Fisik & Legalitas
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-600 font-medium">Jenis Properti</label>
                <select
                  value={formData.jenis_properti || "TANAH_BANGUNAN"}
                  onChange={(e) => setFormData({ ...formData, jenis_properti: e.target.value as PropertyTypeEnum })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="TANAH_BANGUNAN">Tanah & Bangunan</option>
                  <option value="TANAH_KOSONG">Tanah Kosong</option>
                  <option value="TANAH_BANGUNAN_DIABAIKAN">Bangunan Diabaikan</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium">Luas Tanah (m²)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.luas_tanah ?? ""}
                  onChange={(e) => setFormData({ ...formData, luas_tanah: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Luas Bangunan (m²)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.luas_bangunan ?? ""}
                  onChange={(e) => setFormData({ ...formData, luas_bangunan: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-600 font-medium">Legalitas Dokumen</label>
                <select
                  value={formData.legalitas || "SHM"}
                  onChange={(e) => setFormData({ ...formData, legalitas: e.target.value as LegalitasEnum })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="SHM">SHM (Sertipikat Hak Milik)</option>
                  <option value="HGB">HGB (Hak Guna Bangunan)</option>
                  <option value="HAK_PAKAI">Hak Pakai</option>
                  <option value="GIRIK_LETTER_C">Girik / Letter C</option>
                  <option value="STRATA_TITLE">Strata Title</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium">Bentuk Tapak</label>
                <select
                  value={formData.tapak || "PERSEGI"}
                  onChange={(e) => setFormData({ ...formData, tapak: e.target.value as TapakShapeEnum })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="PERSEGI">Persegi</option>
                  <option value="HOOK">Hook / Sudut</option>
                  <option value="KANTONG_SEMAR">Kantong Semar</option>
                  <option value="L_SHAPE">L-Shape</option>
                  <option value="TUSUK_SATE">Tusuk Sate</option>
                  <option value="TIDAK_BERATURAN">Tidak Beraturan</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-medium">Lebar ROW Jalan (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.row_jalan ?? 6.0}
                  onChange={(e) => setFormData({ ...formData, row_jalan: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          {/* Nilai Harga Pasar & Penawaran */}
          <div className="space-y-3 border-b border-slate-100 pb-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              3. Data Harga Pasar & Penawaran (IDR)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-700 font-bold">Kisaran Nilai Tanah (Rp/m²)</label>
                <input
                  type="number"
                  value={formData.kisaran_nilai_tanah ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kisaran_nilai_tanah: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Contoh: 3500000"
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Harga Penawaran Total (Rp)</label>
                <input
                  type="number"
                  value={formData.harga_penawaran ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga_penawaran: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Opsional"
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Harga Transaksi Riil (Rp)</label>
                <input
                  type="number"
                  value={formData.harga_transaksi ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga_transaksi: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  placeholder="Opsional"
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>
          </div>

          {/* Metadata & Surveyor */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              4. Sumber Data & Surveyor Lapangan
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-600 font-medium">Nama Surveyor</label>
                <input
                  type="text"
                  value={formData.surveyor_name || ""}
                  onChange={(e) => setFormData({ ...formData, surveyor_name: e.target.value })}
                  placeholder="Surveyor OTS"
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Nama Reviewer</label>
                <input
                  type="text"
                  value={formData.reviewer_name || ""}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                  placeholder="Reviewer Penilai"
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium">Tanggal Data</label>
                <input
                  type="date"
                  value={formData.tanggal_data || ""}
                  onChange={(e) => setFormData({ ...formData, tanggal_data: e.target.value })}
                  className="w-full mt-1 p-1.5 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium">Catatan Objek / Keterangan</label>
              <input
                type="text"
                value={formData.keterangan || ""}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Catatan tambahan, narasumber pasar, kontak broker, dsb."
                className="w-full mt-1 p-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs shadow-sm flex items-center space-x-1"
            >
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Data Properti"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
