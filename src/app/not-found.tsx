import React from "react";
import Link from "next/link";
import { Compass, Home, Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto text-sky-400">
          <Compass className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/60">
            HTTP 404 • Halaman Tidak Ditemukan
          </span>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Koordinat Tidak Terdaftar
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Halaman atau entitas pangkalan data yang Anda akses tidak ditemukan pada sistem penamaan SIPPRO-TWR.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/workstation"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Ke Workstation</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all border border-slate-700 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
