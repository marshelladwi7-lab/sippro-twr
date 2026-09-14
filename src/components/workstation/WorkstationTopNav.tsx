import React from "react";
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
  Printer,
  Activity,
  Database,
  Layers,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type WorkstationTab = "kkp" | "importer" | "report";

export interface WorkstationTopNavProps {
  activeTab: WorkstationTab;
  onTabChange: (tab: WorkstationTab) => void;
  biRate?: number; // e.g. 6.00
  zntMedian?: number; // e.g. 4250000
  collateralCount?: number; // e.g. 1
  comparablesCount?: number;
  complianceStatus?: "COMPLIANT" | "WARNING" | "NON_COMPLIANT";
  lastSyncTime?: string;
  className?: string;
}

export function WorkstationTopNav({
  activeTab,
  onTabChange,
  biRate = 6.0,
  zntMedian = 4250000,
  collateralCount = 1,
  comparablesCount,
  complianceStatus = "COMPLIANT",
  lastSyncTime = "Realtime",
  className,
}: WorkstationTopNavProps) {
  const formatCurrency = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const tabs: Array<{ id: WorkstationTab; label: string; icon: React.ReactNode; count?: number }> = [
    {
      id: "kkp",
      label: "Workstation KKP",
      icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
    },
    {
      id: "importer",
      label: "Batch Importer",
      icon: <Upload className="w-3.5 h-3.5" />,
      count: comparablesCount,
    },
    {
      id: "report",
      label: "Laporan Cetak (PDF)",
      icon: <Printer className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header
      className={cn(
        "w-full bg-slate-900 text-slate-100 border-b border-slate-800 select-none",
        className
      )}
    >
      {/* Top Layer: Branding + Macro-Telemetry Rail */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        {/* Brand & Institution Tag */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-sky-600/20 border border-sky-500/40 text-sky-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-tight text-white uppercase font-sans">
                TWR Bank Data
              </h1>
              <span className="text-[10px] text-slate-400 font-mono">
                Valuation System
              </span>
              <span className="text-[9px] px-1.5 py-0.25 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono uppercase">
                POJK 40 / SPI 106
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Kantor Jasa Penilai Publik (KJPP) & Bank Collateral Workstation
            </p>
          </div>
        </div>

        {/* Macro-Telemetry Metrics Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* BI 7-Day Reverse Repo Rate */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-[11px]">
            <Activity className="w-3 h-3 text-sky-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              BI 7D-RRR:
            </span>
            <span className="font-mono tabular-nums font-bold text-sky-300">
              {biRate.toFixed(2)}%
            </span>
          </div>

          {/* ZNT Index Median */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-[11px]">
            <Database className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              ZNT Median:
            </span>
            <span className="font-mono tabular-nums font-bold text-amber-300">
              {formatCurrency(zntMedian)}/m²
            </span>
          </div>

          {/* Collateral Count */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-[11px]">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Agunan:
            </span>
            <span className="font-mono tabular-nums font-bold text-emerald-300">
              {collateralCount} Aktif
            </span>
          </div>

          {/* SPI 106 Compliance Chip */}
          <div className="flex items-center pl-1">
            {complianceStatus === "COMPLIANT" ? (
              <Badge variant="success" size="xs" dot>
                SPI 106 Patuh
              </Badge>
            ) : complianceStatus === "WARNING" ? (
              <Badge variant="warning" size="xs" dot>
                SPI 106 Reviu
              </Badge>
            ) : (
              <Badge variant="danger" size="xs" dot>
                Non-Komplian
              </Badge>
            )}
          </div>

          {/* Live Heartbeat */}
          <div className="hidden lg:flex items-center gap-1 text-[9px] text-slate-500 font-mono pl-2 border-l border-slate-800">
            <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
            <span>{lastSyncTime}</span>
          </div>
        </div>
      </div>

      {/* Bottom Layer: Navigation Tabs */}
      <div className="px-4 bg-slate-900/90 flex items-center justify-between">
        <nav className="flex items-center gap-1" aria-label="Workstation Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold tracking-wide transition-all border-b-2",
                  isActive
                    ? "text-sky-400 border-sky-400 bg-slate-800/40"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/20"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Operational Scope Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-sky-400" />
          <span className="font-mono">KEPI & SPI 2018 Certified</span>
        </div>
      </div>
    </header>
  );
}

export default WorkstationTopNav;
