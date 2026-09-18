import type { Metadata } from "next";
import "@fontsource/plus-jakarta-sans/300.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
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
      <body className="font-sans antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-blue-200 transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
