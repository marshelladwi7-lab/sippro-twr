"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Compass,
  Table,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/lib/theme/theme-context";
import { UserRole } from "@/lib/auth/session";

interface LandingPageProps {
  stats: {
    totalProperties: number;
    avgPricePerM2: number;
    totalCities: number;
    totalLandArea: number;
  };
}

export function LandingPageClient({ stats }: LandingPageProps) {
  const router = useRouter();
  const { session, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleQuickDemo = async (role: UserRole = "guest") => {
    setIsDemoLoading(true);
    const res = await login(role);
    setIsDemoLoading(false);
    if (res.success) {
      toast.success("Berhasil masuk sebagai " + role.toUpperCase());
      router.push("/workstation");
    } else {
      toast.error(res.error || "Gagal masuk");
    }
  };

  const formatIdr = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col font-sans transition-colors duration-150">
      {/* Top Floating Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  SIPPRO-TWR
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  GIS & Estimasi Nilai
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                KJPP Totok Warsito dan Rekan • Pangkalan Data Riwayat Properti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {session ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{session.name}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{session.roleTitle}</div>
                </div>
                <Link
                  href="/workstation"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <span>Buka Workstation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickDemo("guest")}
                  disabled={isDemoLoading}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all active:scale-95 cursor-pointer hidden sm:flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo 1-Klik</span>
                </button>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk Portal</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/60 bg-gradient-to-b from-slate-100/60 via-slate-50 to-white dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 font-mono tracking-wide shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% PETA BEBAS WATERMARK • SATELIT ESRI & VEKTOR CARTO</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Pangkalan Data Spasial &{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-300">
              Estimasi Nilai Properti
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Platform praktis dan terfokus KJPP Totok Warsito dan Rekan untuk penjelajahan riwayat penilaian pasar 1.500+ titik data, visualisasi spasial multi-lapisan, dan estimasi nilai properti real-time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Buka Peta & Alat Estimasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => handleQuickDemo("penilai")}
              disabled={isDemoLoading}
              className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700/80 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Coba Akun Penilai</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Citra Satelit Resolusi Tinggi Bebas Watermark
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1.512 Titik Riwayat Penilaian
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Mode Terang & Gelap Terpadu
            </span>
          </div>
        </div>
      </section>

      {/* Live Metrics Strip */}
      <section className="bg-white/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Total Riwayat Data
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {stats.totalProperties.toLocaleString("id-ID")}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Titik Geotagging Terverifikasi</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Median Nilai Tanah
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatIdr(stats.avgPricePerM2)}/m²
            </div>
            <div className="text-[10px] text-slate-500">Baseline Harga Pasar Aktif</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Cakupan Wilayah
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
              {stats.totalCities} Wilayah
            </div>
            <div className="text-[10px] text-slate-500">Jawa Barat & Jabodetabek</div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Lisensi Peta & API
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
              Rp 0,-
            </div>
            <div className="text-[10px] text-slate-500">MapLibre, CARTO & Esri Satelit</div>
          </div>
        </div>
      </section>

      {/* 3 Focused Core Features */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
            Fitur Praktis & Terfokus
          </h2>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Eksplorasi Spasial & Analisis Nilai Tanpa Hambatan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Peta GIS Bebas Watermark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Navigasi peta MapLibre GL dengan 4 pilihan lapisan bersih: Satelit Esri resolusi tinggi, CARTO Positron (Terang), CARTO Dark Matter (Gelap), dan CARTO Voyager.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Spatial Value Estimator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Kalkulator estimasi nilai properti otomatis berdasarkan kedekatan radius (1–5 km). Menyajikan median nilai tanah, nilai bangunan terdepresiasi, dan rentang estimasi.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Spreadsheet & Batch Importer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pencarian dan pemfilteran cepat pada 1.512 data penilaian properti. Dilengkapi ekspor Excel/KML dan batch uploader file baru dengan sanitasi otomatis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              T
            </div>
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                KJPP Totok Warsito dan Rekan
              </div>
              <div className="text-[10px]">Pangkalan Data & Sistem Informasi Geografis Penilaian Properti</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Portal Masuk
            </Link>
            <Link href="/workstation" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              Workstation Peta & Estimasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
