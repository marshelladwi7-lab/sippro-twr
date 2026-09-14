import { PropertyTypeEnum } from "@/types/database";

export interface CostApproachInput {
  propertyType: PropertyTypeEnum;
  buildingArea: number; // Luas Bangunan in m2
  rcnPerM2: number; // Rencana Biaya Penggantian Baru (RCN) per m2 in IDR
  effectiveAgeYears: number; // Umur Efektif
  economicLifeYears: number; // Umur Ekonomis (Standard residential = 30 to 50 years)
  functionalObsolescencePercent?: number; // Kemunduran Fungsional (0 - 100%)
  economicObsolescencePercent?: number; // Kemunduran Ekonomis (0 - 100%)
}

export interface CostApproachResult {
  isBuildingValued: boolean;
  buildingArea: number;
  rcnPerM2: number;
  totalRcn: number;
  physicalDepreciationPercent: number;
  functionalDepreciationPercent: number;
  economicDepreciationPercent: number;
  totalDepreciationPercent: number;
  depreciatedBuildingUnitPrice: number;
  totalBuildingValue: number;
}

export function calculateCostApproach(
  input: CostApproachInput
): CostApproachResult {
  // If property is TANAH_KOSONG or TANAH_BANGUNAN_DIABAIKAN: force building value to 0
  if (
    input.propertyType === "TANAH_KOSONG" ||
    input.propertyType === "TANAH_BANGUNAN_DIABAIKAN" ||
    input.buildingArea <= 0
  ) {
    return {
      isBuildingValued: false,
      buildingArea: input.buildingArea,
      rcnPerM2: 0,
      totalRcn: 0,
      physicalDepreciationPercent: 1.0,
      functionalDepreciationPercent: 0,
      economicDepreciationPercent: 0,
      totalDepreciationPercent: 1.0,
      depreciatedBuildingUnitPrice: 0,
      totalBuildingValue: 0,
    };
  }

  const economicLife = Math.max(1, input.economicLifeYears || 30);
  const physicalDeprec = Math.min(
    1.0,
    Math.max(0, input.effectiveAgeYears / economicLife)
  );

  const functionalDeprec = Math.min(
    1.0,
    Math.max(0, (input.functionalObsolescencePercent || 0) / 100)
  );

  const economicDeprec = Math.min(
    1.0,
    Math.max(0, (input.economicObsolescencePercent || 0) / 100)
  );

  // Compounded or cumulative depreciation capped at 90% (salvage value 10%)
  const totalDeprecPercent = Math.min(
    0.90,
    Number((physicalDeprec + functionalDeprec + economicDeprec).toFixed(4))
  );

  const totalRcn = Math.round(input.buildingArea * input.rcnPerM2);
  const depreciatedUnitPrice = Math.round(
    input.rcnPerM2 * (1 - totalDeprecPercent)
  );
  const totalBuildingValue = Math.round(
    input.buildingArea * depreciatedUnitPrice
  );

  return {
    isBuildingValued: true,
    buildingArea: input.buildingArea,
    rcnPerM2: input.rcnPerM2,
    totalRcn,
    physicalDepreciationPercent: Number(physicalDeprec.toFixed(4)),
    functionalDepreciationPercent: Number(functionalDeprec.toFixed(4)),
    economicDepreciationPercent: Number(economicDeprec.toFixed(4)),
    totalDepreciationPercent: totalDeprecPercent,
    depreciatedBuildingUnitPrice: depreciatedUnitPrice,
    totalBuildingValue,
  };
}
