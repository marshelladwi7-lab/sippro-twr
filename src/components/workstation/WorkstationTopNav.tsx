"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  TrendingUp,
  Table,
  Upload,
  Sun,
  Moon,
  LogOut,
  Radio,
  Database,
  Layers,
  Compass,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/lib/auth/auth-context";
import { useTheme } from "@/lib/theme/theme-context";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type WorkstationTab = "map" | "estimator" | "records" | "importer";

export interface WorkstationTopNavProps {
  activeTab: WorkstationTab;
  onTabChange: (tab: WorkstationTab) => void;
  totalComparables?: number;
  medianPrice?: number;
  totalCities?: number;
  className?: string;
}

export function WorkstationTopNav({
  activeTab,
  onTabChange,
  totalComparables = 1512,
  medianPrice = 4250000,
  totalCities = 12,
  className,
}: WorkstationTopNavProps) {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const formatCurrency = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const tabs: Array<{ id: WorkstationTab; label: string; icon: React.ReactNode; count?: number }> = [
    {
      id: "map",
      label: "Peta Spasial GIS",
      icon: <MapPin className="w-3.5 h-3.5 text-emerald-500" />,
      count: totalComparables,
    },
    {
      id: "estimator",
      label: "Analisis Estimasi Nilai",
      icon: <TrendingUp className="w-3.5 h-3.5 text-sky-500" />,
    },
    {
      id: "records",
      label: "Pangkalan Data Riwayat",
      icon: <Table className="w-3.5 h-3.5 text-teal-500" />,
    },
    {
      id: "importer",
      label: "Batch Excel Importer",
      icon: <Upload className="w-3.5 h-3.5 text-slate-400" />,
    },
  ];

  return (
    <header
      className={cn(
        "w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 select-none transition-colors duration-150",
        className
      )}
    >
      {/* Top Layer: Branding + Real Data Telemetry + Theme Switcher + User Profile */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Brand & Institution Tag */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-all"
          >
            <Building2 className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                SIPPRO-TWR
              </h1>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                GIS Pangkalan Data Riwayat
              </span>
              <span className="text-[9px] px-1.5 py-0.25 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono">
                100% Watermark-Free
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden md:block">
              KJPP Totok Warsito dan Rekan • Pangkalan Data & Alat Estimasi Nilai Properti
            </p>
          </div>
        </div>

        {/* Data Telemetry Strip */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto py-0.5">
          {/* Total Points */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
            <Layers className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Total Data:
            </span>
            <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
              {totalComparables.toLocaleString("id-ID")} Titik
            </span>
          </div>

          {/* Median Land Price */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
            <Database className="w-3 h-3 text-sky-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Median Nilai:
            </span>
            <span className="font-mono tabular-nums font-bold text-sky-600 dark:text-sky-400">
              {formatCurrency(medianPrice)}/m²
            </span>
          </div>

          {/* City Coverage */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px]">
            <Compass className="w-3 h-3 text-teal-500" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Cakupan:
            </span>
            <span className="font-mono tabular-nums font-bold text-teal-600 dark:text-teal-400">
              {totalCities} Kota / Kab
            </span>
          </div>

          <div className="flex items-center pl-1">
            <Badge variant="success" size="xs" dot>
              Sistem Aktif
            </Badge>
          </div>
        </div>

        {/* Action Controls: Theme Switcher & User Profile */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs"
            title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-semibold">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline text-[11px] font-semibold">Gelap</span>
              </>
            )}
          </button>

          {/* User Session Profile Chip */}
          {session ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                {session.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[130px]">
                  {session.name}
                </div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {session.roleTitle}
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Keluar dari Sistem (Logout)"
                className="ml-1 p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Layer: Navigation Tabs */}
      <div className="px-4 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Workstation Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 bg-emerald-50/50 dark:bg-slate-800/40"
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/20"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sub-label */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 shrink-0 pl-4">
          <span className="font-mono">Pangkalan Data & Analisis Spasial TWR</span>
        </div>
      </div>
    </header>
  );
}

export default WorkstationTopNav;
