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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const roleList: { role: UserRole; label: string; desc: string }[] = [
    { role: "penilai", label: "Penilai Properti", desc: "Akses Penuh SPI 106" },
    { role: "reviewer", label: "Reviewer Bank", desc: "Verifikasi Jaminan" },
    { role: "surveyor", label: "Surveyor Lapangan", desc: "Input Geotag & Titik" },
    { role: "admin", label: "Managing Partner", desc: "Super Admin" },
    { role: "guest", label: "Tamu Eksplorasi", desc: "Demo Read-Only" },
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
    <main className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black select-none">
      {/* Valuation Cinematic HD Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <Image
          src="/login-bg.jpg"
          alt="SIPPRO TWR Property Valuation Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-75 contrast-110"
        />
        {/* Subtle Atmospheric Vignette and Tint */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90" />
      </div>

      {/* Floating Glassmorphic Authentication Card */}
      <div className="relative z-10 w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-700">
        <div className="relative backdrop-blur-2xl bg-zinc-950/65 rounded-[2rem] p-7 sm:p-9 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] space-y-6">
          
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center space-y-3">
            <TwrLogo size="lg" showTagline={true} />
            {/* Exactly 1 Sentence Copy Directive */}
            <p className="text-xs text-zinc-400 max-w-[38ch] leading-relaxed pt-1 font-sans">
              Pangkalan data spasial terintegrasi untuk pendataan, pemetaan, dan analisis pembanding penilaian properti.
            </p>
          </div>

          {/* Persona Role Selection Chips */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block px-1">
              Pilih Peran Akses
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
              {roleList.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSelect(item.role)}
                    className={`px-2.5 py-2 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? "bg-white/15 text-white border-emerald-400/80 shadow-md ring-1 ring-emerald-400/30"
                        : "bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-white/5"
                    }`}
                  >
                    <div className="font-semibold truncate">{item.label}</div>
                    <div className="text-[9px] text-zinc-400 truncate mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block px-1">
                ID / Surel Terdaftar
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nama@twr.co.id"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block px-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs text-center font-medium animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* High-contrast Floria-style Pill Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold tracking-tight shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Pangkalan Data</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Trust Badge */}
          <div className="pt-2 text-center border-t border-white/5">
            <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
              STANDAR MAPPI • SPI 106 • KEPI INDONESIA
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
