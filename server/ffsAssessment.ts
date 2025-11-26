/**
 * Fitness-for-Service (FFS) Assessment Module
 * Per API 579-1/ASME FFS-1
 */

export interface FfsLevel1Input {
  // Current condition
  remainingThickness: number; // inches
  minimumRequiredThickness: number; // inches (from design calculations)
  futureCorrosionAllowance: number; // inches
  
  // Operating conditions
  designPressure: number; // psig
  operatingPressure: number; // psig
  designTemperature: number; // °F
  
  // Material properties
  allowableStress: number; // psi
  jointEfficiency: number;
  
  // Damage characterization
  damageType: "general_metal_loss" | "local_thin_area" | "pitting";
  corrosionRate: number; // mpy (mils per year)
}

export interface FfsLevel1Result {
  acceptable: boolean;
  remainingLife: number; // years
  nextInspectionInterval: number; // years
  mawp: number; // psig
  recommendations: string[];
  warnings: string[];
}

/**
 * FFS Level 1 Assessment - General Metal Loss
 * Per API 579-1 Part 4
 */
export function assessGeneralMetalLoss(input: FfsLevel1Input): FfsLevel1Result {
  const {
    remainingThickness,
    minimumRequiredThickness,
    futureCorrosionAllowance,
    designPressure,
    operatingPressure,
    corrosionRate,
  } = input;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Step 1: Check if remaining thickness meets minimum requirements
  const tmm = minimumRequiredThickness + futureCorrosionAllowance;
  
  if (remainingThickness < minimumRequiredThickness) {
    return {
      acceptable: false,
      remainingLife: 0,
      nextInspectionInterval: 0,
      mawp: 0,
      recommendations: [
        "IMMEDIATE ACTION REQUIRED: Current thickness below minimum required thickness",
        "Vessel is NOT fit for service",
        "Recommend immediate shutdown and repair/replacement",
      ],
      warnings: ["CRITICAL SAFETY ISSUE"],
    };
  }

  // Step 2: Calculate remaining life
  const excessThickness = remainingThickness - tmm;
  const remainingLife = corrosionRate > 0 ? excessThickness / (corrosionRate / 1000) : Infinity;

  // Step 3: Determine next inspection interval per API 510
  // Lesser of: half remaining life, or 10 years
  const halfLife = remainingLife / 2;
  const nextInspectionInterval = Math.min(halfLife, 10);

  // Step 4: Calculate MAWP with remaining thickness
  // Simplified - actual calculation depends on component geometry
  const mawp = (input.allowableStress * input.jointEfficiency * remainingThickness) / 
               (input.designPressure > 0 ? input.designPressure : 1);

  // Step 5: Generate recommendations
  if (remainingLife < 2) {
    warnings.push("Less than 2 years remaining life");
    recommendations.push("Plan for vessel replacement or repair within next inspection interval");
  } else if (remainingLife < 5) {
    warnings.push("Less than 5 years remaining life");
    recommendations.push("Monitor closely and plan for future replacement");
  }

  if (nextInspectionInterval < 1) {
    warnings.push("Next inspection due within 1 year");
    recommendations.push("Schedule inspection immediately");
  }

  if (operatingPressure > mawp * 0.9) {
    warnings.push("Operating pressure approaching MAWP");
    recommendations.push("Consider reducing operating pressure or repairing vessel");
  }

  const acceptable = remainingThickness >= tmm && remainingLife > 0;

  return {
    acceptable,
    remainingLife: Math.max(0, remainingLife),
    nextInspectionInterval: Math.max(0, nextInspectionInterval),
    mawp,
    recommendations,
    warnings,
  };
}

/**
 * FFS Level 1 Assessment - Local Thin Area (LTA)
 * Per API 579-1 Part 5
 */
export function assessLocalThinArea(input: FfsLevel1Input & {
  ltaLength: number; // inches
  ltaWidth: number; // inches
  shellDiameter: number; // inches
}): FfsLevel1Result {
  const {
    remainingThickness,
    minimumRequiredThickness,
    ltaLength,
    ltaWidth,
    shellDiameter,
  } = input;

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Simplified LTA screening criteria
  // Full assessment requires detailed calculations per API 579-1 Part 5

  // Check if LTA is small enough for Level 1
  const circumference = Math.PI * shellDiameter;
  const ltaCircumferentialExtent = (ltaWidth / circumference) * 360; // degrees

  if (ltaCircumferentialExtent > 180) {
    warnings.push("LTA circumferential extent exceeds 180°");
    recommendations.push("Level 2 or Level 3 assessment required");
    return {
      acceptable: false,
      remainingLife: 0,
      nextInspectionInterval: 0,
      mawp: 0,
      recommendations,
      warnings,
    };
  }

  // Use general metal loss assessment as baseline
  const baseAssessment = assessGeneralMetalLoss(input);

  // Add LTA-specific warnings
  if (ltaLength > shellDiameter) {
    warnings.push("LTA length exceeds shell diameter");
    recommendations.push("Detailed Level 2 assessment recommended");
  }

  return {
    ...baseAssessment,
    warnings: [...baseAssessment.warnings, ...warnings],
    recommendations: [...baseAssessment.recommendations, ...recommendations],
  };
}

