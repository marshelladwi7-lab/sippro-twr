"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Compass,
  Database,
  Layers,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/lib/theme/theme-context";
import { UserRole, DEMO_USERS } from "@/lib/auth/session";

interface UnifiedLandingLoginPageProps {
  stats?: {
    totalProperties: number;
    avgPricePerM2: number;
    totalCities: number;
    totalLandArea: number;
  };
}

export function UnifiedLandingLoginPage({ stats }: UnifiedLandingLoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/workstation";

  const { session, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>("penilai");
  const [username, setUsername] = useState(DEMO_USERS.penilai.email);
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [customName, setCustomName] = useState(DEMO_USERS.penilai.name);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayStats = stats || {
    totalProperties: 1512,
    avgPricePerM2: 4298118,
    totalCities: 12,
    totalLandArea: 7954195,
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_USERS[role];
    setUsername(demo.email);
    setCustomName(demo.name);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(selectedRole, customName);
    setIsLoading(false);

    if (res.success) {
      toast.success(`Selamat datang, ${customName}`);
      router.push(from);
    } else {
      setErrorMessage(res.error || "Gagal melakukan autentikasi");
      toast.error(res.error || "Autentikasi gagal");
    }
  };

  const handleQuickSandbox = async () => {
    setIsDemoLoading(true);
    const res = await login("guest", "Tamu Demo Sandbox");
    setIsDemoLoading(false);
    if (res.success) {
      toast.success("Masuk sebagai Tamu Demo Sandbox");
      router.push(from);
    } else {
      toast.error(res.error || "Gagal masuk");
    }
  };

  const formatIdr = (n: number) => `Rp ${Math.round(n).toLocaleString("id-ID")}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 selection:bg-emerald-500 selection:text-white relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  SIPPRO-TWR
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                KJPP Totok Warsito dan Rekan • Pangkalan Data Spasial & Estimasi Nilai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Standards Badges */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 bg-slate-100/60 dark:bg-slate-900/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SPI 106</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>MAPPI Standard</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
              title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Active Session Indicator or Direct Jump */}
            {session && (
              <Link
                href="/workstation"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <span>Buka Workstation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Unified Landing = Login Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Valuation Platform Showcase & Telemetry (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono tracking-wide">
                <Compass className="w-3.5 h-3.5 text-emerald-500" />
                <span>GIS SPASIAL & ESTIMASI NILAI REAL-TIME</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Pangkalan Data Spasial &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-300">
                  Estimasi Nilai Properti
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Platform penelusuran riwayat penilaian terverifikasi, eksplorasi spasial citra satelit dan peta jalan bebas watermark, serta instrumen analisis estimasi nilai properti real-time berstandar SPI 106.
              </p>
            </div>

            {/* Live Telemetry Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Riwayat Data
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {displayStats.totalProperties.toLocaleString("id-ID")}
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">Titik Geotagging</div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Median Nilai
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatIdr(displayStats.avgPricePerM2)}
                </div>
                <div className="text-[9px] text-slate-500">Per m² Tanah</div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Cakupan Area
                </div>
                <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">
                  {displayStats.totalCities} Wilayah
                </div>
                <div className="text-[9px] text-slate-500">Jabar & Jabodetabek</div>
              </div>

              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-1">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Biaya Platform
                </div>
                <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                  Rp 0,-
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium">100% Bebas Biaya</div>
              </div>
            </div>

            {/* Practical Capabilities List */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Peta Spasial GIS Bebas Watermark
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Visualisasi 4 basemap: Terang (CARTO Positron), Gelap (CARTO Dark Matter), Citra Satelit Resolusi Tinggi (Esri World Imagery), dan Vektor (CARTO Voyager).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Alat Analisis Estimasi Nilai Spasial
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kalkulator nilai pasar tanah dan bangunan berdasarkan median harga transaksi sekitarnya dalam radius buffer 1 km s/d 5 km dengan toleransi rentang wajar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Pangkalan Data Riwayat & Ekspor
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Pencarian multi-kriteria NOP, alamat, jenis properti, dan legalitas dengan kemampuan ekspor data ke format Excel dan file spasial KML Google Earth.
                  </p>
                </div>
              </div>
            </div>

            {/* Strix Security & Compliance Badge */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-2 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Strix AI Security Audited
              </span>
              <span>•</span>
              <span>Zero Vulnerabilities</span>
              <span>•</span>
              <span>Sub-45ms Spatial Engine</span>
            </div>
          </div>

          {/* RIGHT COLUMN: The High-Security Access Terminal (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl space-y-5 relative backdrop-blur-sm">
              
              {/* Terminal Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Portal Akses Penilai & Reviewer
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                    RBAC V1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pilih preset peran cepat 1-klik atau masukkan akun resmi terdaftar Anda.
                </p>
              </div>

              {/* 1-Click Role Quick Fill Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Pilih Peran Cepat (1-Click Preset):
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("penilai")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === "penilai"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <span>👔</span>
                      <span>Penilai</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Valuer / Analis</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("reviewer")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === "reviewer"
                        ? "bg-sky-50 dark:bg-sky-950/80 border-sky-500 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/30"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <span>🛡️</span>
                      <span>Reviewer</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Pemeriksa Data</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("surveyor")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === "surveyor"
                        ? "bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <span>📍</span>
                      <span>Surveyor</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Tenaga Lapangan</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("admin")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedRole === "admin"
                        ? "bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/30"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <span>⚡</span>
                      <span>Admin</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Partner KJPP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("guest")}
                    className={`p-2 rounded-xl border text-left transition-all col-span-2 sm:col-span-2 cursor-pointer ${
                      selectedRole === "guest"
                        ? "bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30"
                        : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-xs">
                      <span>🚀</span>
                      <span>Tamu Sandbox</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">Akses Demo Tanpa Batas</div>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Nama Lengkap / Operator
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nama Operator Penilai"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Email Akun Terdaftar
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama@instansi.co.id"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Sistem Penilaian</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Instant Sandbox Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <button
                  type="button"
                  onClick={handleQuickSandbox}
                  disabled={isDemoLoading}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Akses Cepat Tamu Demo (1-Klik Tanpa Ketik)</span>
                </button>

                <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  Sesi aman HTTP-Only Cookie • Kepatuhan SPI 106 • Zero Paid APIs
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div>
            © {new Date().getFullYear()} KJPP Totok Warsito dan Rekan. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3">
            <span>Standar Penilaian Indonesia (SPI 106)</span>
            <span>•</span>
            <span>Kode Etik Penilai Indonesia (KEPI)</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Zero-Cost Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
