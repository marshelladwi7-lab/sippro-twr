"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TwrLogo } from "@/components/ui/TwrLogo";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole, DEMO_USERS } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("penilai");
  const [username, setUsername] = useState(DEMO_USERS.penilai.email);
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleList: { role: UserRole; label: string; desc: string; badge?: string }[] = [
    { role: "penilai", label: "Penilai Properti", desc: "Otoritas Penuh SPI 106" },
    { role: "reviewer", label: "Reviewer Bank", desc: "Verifikasi Jaminan POJK 40" },
    { role: "surveyor", label: "Surveyor Lapangan", desc: "Input Geotag & Titik" },
    { role: "admin", label: "Managing Partner", desc: "Super Admin", badge: "KEPI" },
    { role: "guest", label: "Tamu Eksplorasi", desc: "Sandbox Read-Only" },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setUsername(DEMO_USERS[role].email);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(selectedRole, DEMO_USERS[selectedRole].name);
    setIsLoading(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMessage(res.error || "Gagal melakukan autentikasi");
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-[#050A14] select-none">
      {/* Valuation Cinematic HD Background with Dark Navy Vignette */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <Image
          src="/login-bg.jpg"
          alt="SIPPRO TWR Property Valuation Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-60 contrast-120"
        />
        {/* Multilayered Depth Gradient: Obsidian Navy & Deep Prussian Blue */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040812] via-[#071124]/85 to-[#040812]/90 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-[#060D1D]/70 to-[#03060F]" />
      </div>

      {/* Background Architectural Vector Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Main Authentication Container */}
      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Telemetry Badge Header */}
        <div className="flex items-center justify-between px-2 mb-3 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-300 font-medium">SIPPRO-TWR v0.1.2</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span>1.511 Titik Terdata</span>
            <span>•</span>
            <span className="text-blue-300">SPI 106 &amp; KEPI</span>
          </div>
        </div>

        {/* Floating Card */}
        <div className="backdrop-blur-2xl bg-[#091122]/85 rounded-2xl p-6 sm:p-8 border border-blue-500/20 shadow-[0_25px_60px_-15px_rgba(2,6,23,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-5">
          
          {/* Header & Proportional Logo */}
          <div className="flex flex-col items-center text-center space-y-2.5 pb-1">
            <div className="p-2 rounded-2xl bg-slate-950/80 border border-blue-500/20 shadow-inner">
              <TwrLogo size="md" orientation="horizontal" showTagline={true} />
            </div>

            {/* Exactly 1 Sentence Appraisal Directive */}
            <p className="text-xs text-slate-300 max-w-[42ch] leading-relaxed pt-1 font-sans">
              Pangkalan data spasial terintegrasi untuk pendataan, pemetaan, dan analisis pembanding penilaian properti.
            </p>
          </div>

          {/* Persona Role Selection Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Pilih Peran Akses Sistem
              </label>
              <span className="text-[10px] text-blue-400 font-mono font-semibold">
                Standar MAPPI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              {roleList.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSelect(item.role)}
                    className={`px-2.5 py-2 rounded-xl text-left transition-all duration-150 border cursor-pointer relative ${
                      isSelected
                        ? "bg-blue-600/25 text-white border-blue-400 shadow-sm ring-1 ring-blue-400/40"
                        : "bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800/80"
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {item.badge}
                      </span>
                    )}
                    <div className="font-semibold truncate text-[11px]">{item.label}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-0.5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-0.5">
                ID / Surel Terdaftar
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nama@twr.co.id"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 text-xs">👤</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-0.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
                  title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs text-center font-medium rounded-xl animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-tight shadow-lg shadow-blue-600/30 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Otoritas...</span>
                </>
              ) : (
                <span>Masuk ke Pangkalan Data Spasial</span>
              )}
            </button>
          </form>

          {/* Legal & Compliance Footer */}
          <div className="pt-2 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-[10px] text-slate-400">
              Izin Kantor Jasa Penilai Publik: <span className="font-mono text-slate-300 font-semibold">KMK No. 512/KM.1/2014</span>
            </p>
            <p className="text-[9px] text-slate-400">
              Kerahasiaan data dijamin sesuai KEPI Pasal 5 &amp; POJK 40/POJK.03/2019
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
