import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export interface KpiMetricProps {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: {
    value: number;
    label?: string;
    invertTrend?: boolean;
  };
  deltaText?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  variant?: "default" | "emerald" | "amber" | "rose" | "sky";
  size?: "compact" | "normal";
  className?: string;
  onClick?: () => void;
}

const variantBorderStyles: Record<string, string> = {
  default: "border-slate-200/90 hover:border-slate-300",
  emerald: "border-emerald-200/90 bg-emerald-50/20 hover:border-emerald-300",
  amber: "border-amber-200/90 bg-amber-50/20 hover:border-amber-300",
  rose: "border-rose-200/90 bg-rose-50/20 hover:border-rose-300",
  sky: "border-sky-200/90 bg-sky-50/20 hover:border-sky-300",
};

export function KpiMetric({
  label,
  value,
  subtext,
  delta,
  deltaText,
  deltaType,
  icon,
  badge,
  variant = "default",
  size = "normal",
  className,
  onClick,
}: KpiMetricProps) {
  // Determine delta details
  let isPositive = false;
  let isNegative = false;
  let formattedDelta = deltaText;

  if (delta !== undefined) {
    isPositive = delta.value > 0;
    isNegative = delta.value < 0;
    const sign = isPositive ? "+" : "";
    formattedDelta = `${sign}${delta.value.toFixed(1)}%`;
  } else if (deltaType) {
    isPositive = deltaType === "positive";
    isNegative = deltaType === "negative";
  }

  const isGood = delta?.invertTrend ? isNegative : isPositive;
  const isBad = delta?.invertTrend ? isPositive : isNegative;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-white shadow-2xs transition-all",
        size === "compact" ? "p-3" : "p-4",
        variantBorderStyles[variant] || variantBorderStyles.default,
        onClick && "cursor-pointer hover:shadow-xs",
        className
      )}
    >
      {/* Header: Label & Icon/Badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && (
            <span className="text-slate-400 shrink-0 flex items-center">
              {icon}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {label}
          </span>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Main Metric Value */}
      <div
        className={cn(
          "font-bold font-mono tabular-nums text-slate-900 tracking-tight leading-tight",
          size === "compact" ? "text-lg" : "text-2xl"
        )}
      >
        {value}
      </div>

      {/* Delta & Subtext */}
      {(formattedDelta || subtext) && (
        <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-100/80 text-[11px] min-w-0">
          {formattedDelta && (
            <div
              className={cn(
                "inline-flex items-center gap-0.5 font-mono font-semibold tabular-nums px-1 py-0.25 rounded text-[10px] shrink-0",
                isGood && "bg-emerald-50 text-emerald-700",
                isBad && "bg-rose-50 text-rose-700",
                !isGood && !isBad && "bg-slate-100 text-slate-600"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              <span>{formattedDelta}</span>
              {delta?.label && (
                <span className="text-[9px] font-normal opacity-80 ml-0.5">
                  {delta.label}
                </span>
              )}
            </div>
          )}
          {subtext && (
            <span className="text-slate-500 truncate text-[11px]">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default KpiMetric;
