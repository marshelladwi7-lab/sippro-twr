import { PropertyTypeEnum, TapakShapeEnum } from "@/types/database";

export type AssetCategory = "RESIDENTIAL" | "COMMERCIAL_RUKO" | "VACANT_LAND";

export interface LiquidationInput {
  propertyType: PropertyTypeEnum;
  tapakShape: TapakShapeEnum;
  isCommercialOrRuko?: boolean;
  marketValueLand: number;
  marketValueBuilding: number;
  customHaircutPercent?: number; // Override if auditor supplies specific haircut
  bankLtvPercent?: number; // Default 70% (0.70)
}

export interface LiquidationResult {
  assetCategory: AssetCategory;
  haircutPercent: number; // e.g. 0.20
  totalMarketValue: number;
  totalLiquidationValue: number;
  maxLoanCeiling: number; // Based on Bank LTV
  liquidationBreakdown: {
    landMarketValue: number;
    buildingMarketValue: number;
    landLiquidationValue: number;
    buildingLiquidationValue: number;
  };
}

export function determineStandardHaircut(
  propertyType: PropertyTypeEnum,
  tapakShape: TapakShapeEnum,
  isCommercialOrRuko = false
): { category: AssetCategory; haircut: number } {
  if (propertyType === "TANAH_KOSONG" || tapakShape === "TIDAK_BERATURAN" || tapakShape === "TUSUK_SATE") {
    return {
      category: "VACANT_LAND",
      haircut: 0.35, // 35% for vacant / irregular shape
    };
  }

  if (isCommercialOrRuko) {
    return {
      category: "COMMERCIAL_RUKO",
      haircut: 0.30, // 30% for commercial/ruko
    };
  }

  return {
    category: "RESIDENTIAL",
    haircut: 0.20, // 20% for standard residential
  };
}

export function calculateLiquidationValue(
  input: LiquidationInput
): LiquidationResult {
  const { category, haircut: standardHaircut } = determineStandardHaircut(
    input.propertyType,
    input.tapakShape,
    input.isCommercialOrRuko
  );

  const finalHaircut =
    input.customHaircutPercent !== undefined
      ? input.customHaircutPercent
      : standardHaircut;

  const totalMarketValue = input.marketValueLand + input.marketValueBuilding;
  const landLiquidation = Math.round(input.marketValueLand * (1 - finalHaircut));
  const buildingLiquidation = Math.round(
    input.marketValueBuilding * (1 - finalHaircut)
  );
  const totalLiquidationValue = landLiquidation + buildingLiquidation;

  const ltvRatio = input.bankLtvPercent ?? 0.70; // POJK 40 default 70% LTV
  const maxLoanCeiling = Math.min(
    Math.round(totalMarketValue * ltvRatio),
    totalLiquidationValue
  );

  return {
    assetCategory: category,
    haircutPercent: finalHaircut,
    totalMarketValue,
    totalLiquidationValue,
    maxLoanCeiling,
    liquidationBreakdown: {
      landMarketValue: input.marketValueLand,
      buildingMarketValue: input.marketValueBuilding,
      landLiquidationValue: landLiquidation,
      buildingLiquidationValue: buildingLiquidation,
    },
  };
}
