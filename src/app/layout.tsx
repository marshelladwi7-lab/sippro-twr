import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastProvider } from "@/components/ui/Toast";

import { ThemeProvider } from "@/lib/theme/theme-context";

export const metadata: Metadata = {
  title: "SIPPRO-TWR | Pangkalan Data Riwayat & Estimasi Nilai Properti",
  description:
    "Sistem Informasi Geografis Pangkalan Data Riwayat Penilaian & Analisis Estimasi Nilai Properti KJPP Totok Warsito dan Rekan. Pemetaan spasial akurat dan analisis nilai berbasis komparasi pasar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
