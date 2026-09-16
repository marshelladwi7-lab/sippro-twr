"use client";

import React, { Suspense } from "react";
import { UnifiedLandingLoginPage } from "@/components/landing/UnifiedLandingLoginPage";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-xs text-slate-400">Memuat Portal SIPPRO-TWR...</div>}>
      <UnifiedLandingLoginPage />
    </Suspense>
  );
}
