import { loadLegacyComparables } from "@/lib/services/comps-spatial-service";
import { UnifiedWorkstationClient } from "@/components/workstation/UnifiedWorkstationClient";

export const dynamic = "force-dynamic";

export default async function WorkstationPage() {
  const initialProperties = loadLegacyComparables();
  return <UnifiedWorkstationClient initialProperties={initialProperties} />;
}
