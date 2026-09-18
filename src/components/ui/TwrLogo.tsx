"use client";

import React from "react";

interface TwrLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function TwrLogo({
  size = "md",
  showTagline = true,
  orientation = "horizontal",
  className = "",
}: TwrLogoProps) {
  const sizeMap = {
    sm: {
      icon: "w-7 h-7",
      title: "text-xs",
      tagline: "text-[8px]",
    },
    md: {
      icon: "w-9 h-9",
      title: "text-sm",
      tagline: "text-[9px]",
    },
    lg: {
      icon: "w-11 h-11",
      title: "text-lg",
      tagline: "text-[10px]",
    },
  };

  const current = sizeMap[size];
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`select-none flex ${
        isVertical ? "flex-col items-center text-center gap-2" : "flex-row items-center gap-2.5"
      } ${className}`}
    >
      {/* Precision Isometric Valuation Apex Crest */}
      <div className={`relative ${current.icon} shrink-0 flex items-center justify-center`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/30 via-slate-900 to-indigo-950/50 border border-blue-500/30 shadow-md shadow-blue-950/50 backdrop-blur-sm" />
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 drop-shadow-sm relative z-10"
        >
          {/* Top Isometric Valuation Apex */}
          <path
            d="M24 6L40 15L24 24L8 15L24 6Z"
            fill="url(#twr-grad-blue-top)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Left Facet: 'T' Foundation Pillar */}
          <path
            d="M8 15.5L24 24.5V42L8 33V15.5Z"
            fill="url(#twr-grad-blue-left)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Right Facet: 'W' Valuation Facet */}
          <path
            d="M40 15.5L24 24.5V42L40 33V15.5Z"
            fill="url(#twr-grad-obsidian-right)"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Center Precision Geotag Node with subtle crimson accent */}
          <circle cx="24" cy="24.5" r="2.2" fill="#E11D48" stroke="#ffffff" strokeWidth="0.8" />

          <defs>
            <linearGradient id="twr-grad-blue-top" x1="8" y1="6" x2="40" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="twr-grad-blue-left" x1="8" y1="15.5" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1D4ED8" />
              <stop offset="1" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="twr-grad-obsidian-right" x1="24" y1="24.5" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E293B" />
              <stop offset="1" stopColor="#0B1120" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography Lockup */}
      <div className={`flex flex-col ${isVertical ? "items-center" : ""}`}>
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight text-white leading-none ${current.title}`}>
            SIPPRO
          </span>
          <span
            className={`font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 leading-none ${current.title}`}
          >
            TWR
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-slate-400 font-medium tracking-wide mt-0.5 leading-tight ${current.tagline}`}
          >
            KJPP Totok Warsito &amp; Rekan
          </span>
        )}
      </div>
    </div>
  );
}
