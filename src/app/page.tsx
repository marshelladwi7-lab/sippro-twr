import React, { Suspense } from "react";
import { loadLegacyComparables } from "@/lib/services/comps-spatial-service";
import { DashboardClient } from "@/components/gis/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const properties = loadLegacyComparables();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
          Memuat Pangkalan Data SIPPRO-TWR...
        </div>
      }
    >
      <DashboardClient initialProperties={properties} />
    </Suspense>
  );
}

