import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bank Data Valuation System (Indonesia) | MAPPI & SPI 106",
  description:
    "Zero-cost Indonesian Property Valuation & Bank Collateral Appraisal System adhering to SPI 101-106, SPI 202, and POJK 40.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
