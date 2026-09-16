import { LegalitasEnum, TapakShapeEnum } from "@/types/database";

export interface ValuationAdjustmentParams {
  transactionTypeDiscount: number; // e.g. -0.10 for offering, 0 for transaction
  timeTrend: number; // e.g. 0.02 for +2%
  location: number; // e.g. -0.05 to +0.05
  legalDelta: number; // e.g. 0 (SHM), -0.03 (HGB > 20y), -0.07 (HGB < 10y), -0.25 (Girik)
  tapakDelta: number; // e.g. 0 (Persegi), -0.07 (Tusuk Sate), +0.05 (Kantong Semar/Hook)
  roadAccessDelta: number; // e.g. -0.10 (ROW < 4m), +0.05 (ROW >= 8m)
}

export interface ComparableAdjustmentInput {
  id: string;
  name: string;
  baseUnitPrice: number; // IDR per m2
  adjustments: ValuationAdjustmentParams;
}

export interface SPIComplianceFlag {
  isCompliant: boolean;
  requiresJustification: boolean;
  singleParameterWarnings: string[];
  netAdjustmentExceeded: boolean;
  grossAdjustmentExceeded: boolean;
}

export interface ComparableAdjustmentResult {
  id: string;
  name: string;
  baseUnitPrice: number;
  adjustments: ValuationAdjustmentParams;
  netAdjustment: number;
  grossAdjustment: number;
  adjustedUnitPrice: number;
  weight: number; // inverse gross adjustment
  compliance: SPIComplianceFlag;
}

export interface MarketValuationResult {
  comparables: ComparableAdjustmentResult[];
  indicatedLandUnitPrice: number; // Indikasi Nilai Pasar Tanah / m2
  totalWeight: number;
  allCompliant: boolean;
  auditNotes: string[];
}

export function calculateLegalitasDelta(
  subjectLegal: LegalitasEnum,
  compLegal: LegalitasEnum,
  compHgbRemainingYears?: number
): number {
  if (subjectLegal === compLegal) return 0.0;

  // Benchmark weights relative to SHM (1.0)
  const getWeight = (l: LegalitasEnum, hgbYears = 25): number => {
    switch (l) {
      case "SHM":
        return 1.0;
      case "HGB":
        return hgbYears < 10 ? 0.93 : 0.97;
      case "HAK_PAKAI":
        return 0.85;
      case "GIRIK_LETTER_C":
        return 0.75;
      case "STRATA_TITLE":
        return 0.95;
      default:
        return 1.0;
    }
  };

  const subjectW = getWeight(subjectLegal);
  const compW = getWeight(compLegal, compHgbRemainingYears);
  return Number((subjectW - compW).toFixed(4));
}

export function calculateTapakDelta(
  subjectTapak: TapakShapeEnum,
  compTapak: TapakShapeEnum
): number {
  if (subjectTapak === compTapak) return 0.0;

  const tapakWeight = (t: TapakShapeEnum): number => {
    switch (t) {
      case "PERSEGI":
        return 1.0;
      case "KANTONG_SEMAR":
        return 1.05;
      case "HOOK":
        return 1.05;
      case "L_SHAPE":
        return 0.98;
      case "TIDAK_BERATURAN":
        return 0.95;
      case "TUSUK_SATE":
        return 0.93;
      default:
        return 1.0;
    }
  };

  return Number((tapakWeight(subjectTapak) - tapakWeight(compTapak)).toFixed(4));
}

export function calculateRoadAccessDelta(
  subjectRow: number,
  compRow: number
): number {
  if (subjectRow === compRow) return 0.0;
  let delta = 0.0;
  if (subjectRow < 4.0 && compRow >= 4.0) delta -= 0.10;
  else if (subjectRow >= 8.0 && compRow < 8.0) delta += 0.05;
  else if (subjectRow >= 6.0 && compRow < 4.0) delta += 0.05;
  else if (subjectRow < 6.0 && compRow >= 8.0) delta -= 0.05;
  return Number(delta.toFixed(4));
}

export function calculateMarketApproach(
  comps: ComparableAdjustmentInput[]
): MarketValuationResult {
  if (comps.length === 0) {
    return {
      comparables: [],
      indicatedLandUnitPrice: 0,
      totalWeight: 0,
      allCompliant: false,
      auditNotes: ["Tidak ada data pembanding yang dipilih."],
    };
  }

  const rawResults = comps.map((c) => {
    const adj = c.adjustments;
    const netAdjustment = Number(
      (
        adj.transactionTypeDiscount +
        adj.timeTrend +
        adj.location +
        adj.legalDelta +
        adj.tapakDelta +
        adj.roadAccessDelta
      ).toFixed(4)
    );

    const grossAdjustment = Number(
      (
        Math.abs(adj.transactionTypeDiscount) +
        Math.abs(adj.timeTrend) +
        Math.abs(adj.location) +
        Math.abs(adj.legalDelta) +
        Math.abs(adj.tapakDelta) +
        Math.abs(adj.roadAccessDelta)
      ).toFixed(4)
    );

    const adjustedUnitPrice = Math.round(c.baseUnitPrice * (1 + netAdjustment));

    // Automated KEPI / SPI 106 Guardrails
    const warnings: string[] = [];
    if (Math.abs(adj.transactionTypeDiscount) > 0.15)
      warnings.push("Penyesuaian Penawaran > 15%");
    if (Math.abs(adj.timeTrend) > 0.15)
      warnings.push("Penyesuaian Waktu > 15%");
    if (Math.abs(adj.location) > 0.15)
      warnings.push("Penyesuaian Lokasi > 15%");
    if (Math.abs(adj.legalDelta) > 0.15)
      warnings.push("Penyesuaian Legalitas > 15%");
    if (Math.abs(adj.tapakDelta) > 0.15)
      warnings.push("Penyesuaian Tapak > 15%");
    if (Math.abs(adj.roadAccessDelta) > 0.15)
      warnings.push("Penyesuaian Akses Jalan > 15%");

    const netExceeded = Math.abs(netAdjustment) > 0.20;
    const grossExceeded = grossAdjustment > 0.30;
    const isCompliant = !netExceeded && !grossExceeded && warnings.length === 0;

    return {
      id: c.id,
      name: c.name,
      baseUnitPrice: c.baseUnitPrice,
      adjustments: adj,
      netAdjustment,
      grossAdjustment,
      adjustedUnitPrice,
      // Raw inverse gross weight: 1 / (1 + grossAdjustment)
      rawWeight: 1 / (1 + grossAdjustment),
      compliance: {
        isCompliant,
        requiresJustification: netExceeded || grossExceeded,
        singleParameterWarnings: warnings,
        netAdjustmentExceeded: netExceeded,
        grossAdjustmentExceeded: grossExceeded,
      },
    };
  });

  // Normalize weights so sum(weights) = 1.0
  const sumRawWeights = rawResults.reduce((acc, r) => acc + r.rawWeight, 0);
  const auditNotes: string[] = [];

  const comparables: ComparableAdjustmentResult[] = rawResults.map((r) => {
    const normalizedWeight = Number((r.rawWeight / sumRawWeights).toFixed(4));
    if (r.compliance.requiresJustification) {
      auditNotes.push(
        `Pembanding ${r.name}: Penyesuaian melampaui batas SPI 106 (Net: ${(r.netAdjustment * 100).toFixed(1)}%, Gross: ${(r.grossAdjustment * 100).toFixed(1)}%). Wajib justifikasi tertulis.`
      );
    }
    return {
      id: r.id,
      name: r.name,
      baseUnitPrice: r.baseUnitPrice,
      adjustments: r.adjustments,
      netAdjustment: r.netAdjustment,
      grossAdjustment: r.grossAdjustment,
      adjustedUnitPrice: r.adjustedUnitPrice,
      weight: normalizedWeight,
      compliance: r.compliance,
    };
  });

  // Calculate indicated unit price
  const indicatedLandUnitPrice = Math.round(
    comparables.reduce((acc, c) => acc + c.adjustedUnitPrice * c.weight, 0)
  );

  const allCompliant =
    comparables.length > 0 &&
    comparables.every((c) => c.compliance.isCompliant);

  return {
    comparables,
    indicatedLandUnitPrice,
    totalWeight: comparables.length > 0 ? 1.0 : 0,
    allCompliant,
    auditNotes,
  };
}
