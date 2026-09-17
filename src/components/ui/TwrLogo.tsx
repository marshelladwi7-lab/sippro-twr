"use client";

import React from "react";

interface TwrLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

export function TwrLogo({ size = "md", showTagline = true, className = "" }: TwrLogoProps) {
  const sizeMap = {
    sm: {
      icon: "w-8 h-8",
      title: "text-base",
      tagline: "text-[9px]",
    },
    md: {
      icon: "w-11 h-11",
      title: "text-xl",
      tagline: "text-[10px]",
    },
    lg: {
      icon: "w-14 h-14",
      title: "text-2xl",
      tagline: "text-[11px]",
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Geometric Architectural TWR Crest Icon */}
      <div className={`relative ${current.icon} shrink-0 flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-amber-500/20 border border-white/10 shadow-lg backdrop-blur-md" />
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-md relative z-10"
        >
          {/* Top Diamond / Isometric Valuation Roof */}
          <path
            d="M24 6L40 15L24 24L8 15L24 6Z"
            fill="url(#twr-grad-gold)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Left Facet / 'T' Column */}
          <path
            d="M8 15.5L24 24.5V42L8 33V15.5Z"
            fill="url(#twr-grad-emerald)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Right Facet / 'W' Column */}
          <path
            d="M40 15.5L24 24.5V42L40 33V15.5Z"
            fill="url(#twr-grad-slate)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Center Cadastral Grid Intersection Indicator */}
          <circle cx="24" cy="24.5" r="2.5" fill="#ffffff" />

          <defs>
            <linearGradient id="twr-grad-gold" x1="8" y1="6" x2="40" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f59e0b" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="twr-grad-emerald" x1="8" y1="15.5" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#059669" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="twr-grad-slate" x1="24" y1="24.5" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e293b" />
              <stop offset="1" stopColor="#0f172a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight text-white leading-none ${current.title}`}>
            SIPPRO
          </span>
          <span className={`font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 leading-none ${current.title}`}>
            TWR
          </span>
        </div>
        {showTagline && (
          <span className={`text-slate-400 font-medium tracking-wide mt-1 leading-tight ${current.tagline}`}>
            KJPP Totok Warsito &amp; Rekan
          </span>
        )}
      </div>
    </div>
  );
}
