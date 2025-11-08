/**
 * API 510 Component Calculations Module
 * Implements ASME Section VIII calculations for pressure vessels
 */

interface ComponentData {
  // Design parameters
  designPressure: number; // P (psi)
  designTemperature: number; // T (°F)
  insideDiameter: number; // ID (inches)
  materialSpec: string;
  
  // Thickness data
  nominalThickness: number; // tn (inches)
  actualThickness: number; // ta (inches) - minimum measured
  corrosionAllowance: number; // CA (inches)
  
  // Weld data
  jointEfficiency: number; // E (0.0 - 1.0)
  
  // For heads
  componentType: "shell" | "head";
  headType?: "hemispherical" | "ellipsoidal" | "torispherical";
  knuckleRadius?: number; // r (inches) - for torispherical heads
  
  // Static head (for liquid-filled vessels)
  liquidService?: boolean; // Is vessel in liquid service?
  specificGravity?: number; // SG (dimensionless, water = 1.0)
  liquidHeight?: number; // h (feet) - height of liquid above component
  
  // Corrosion data
  corrosionRate?: number; // mpy (mils per year)
  previousThickness?: number;
  previousInspectionDate?: Date;
  currentInspectionDate?: Date;
}

interface CalculationResults {
  // Input summary
  component: string;
  designPressure: number;
  designTemperature: number;
  material: string;
  allowableStress: number;
  
  // Static head (if applicable)
  staticHeadPressure?: number; // psi
  totalDesignPressure?: number; // Design + Static Head (psi)
  
  // Thickness calculations
  minimumRequiredThickness: number; // tmin (inches)
  actualThickness: number; // ta (inches)
  corrosionAllowance: number; // CA (inches)
  
  // Pressure calculations
  mawp: number; // Maximum Allowable Working Pressure (psi)
  
  // Life calculations
  corrosionRate: number; // mpy
  remainingLife: number; // years
  nextInspectionDate: string; // ISO date string
  
  // Status
  status: "acceptable" | "monitoring" | "critical";
  statusReason: string;
}

/**
 * Calculate static head pressure for liquid-filled vessels
 * Formula: P_static = (SG × h × 0.433 psi/ft) where:
 * - SG = specific gravity (dimensionless, water = 1.0)
 * - h = liquid height above component (feet)
 * - 0.433 = conversion factor (psi per foot of water)
 */
function calculateStaticHeadPressure(
  specificGravity: number,
  liquidHeight: number
): number {
  // P_static = SG × h × 0.433 psi/ft
  return specificGravity * liquidHeight * 0.433;
}

/**
 * Get allowable stress from ASME Section II Part D
 * Simplified lookup - in production, use full ASME tables
 */
function getAllowableStress(materialSpec: string, temperature: number): number {
  // Common pressure vessel materials
  const stressData: Record<string, { baseStress: number, tempFactor: (t: number) => number }> = {
    "SA-515-70": {
      baseStress: 17100,
      tempFactor: (t) => t <= 650 ? 1.0 : (t <= 750 ? 0.95 : 0.85)
    },
    "SA-516-70": {
      baseStress: 17100,
      tempFactor: (t) => t <= 650 ? 1.0 : (t <= 750 ? 0.95 : 0.85)
    },
    "SA-285-C": {
      baseStress: 13750,
      tempFactor: (t) => t <= 650 ? 1.0 : 0.90
    },
    "SA-36": {
      baseStress: 14400,
      tempFactor: (t) => t <= 650 ? 1.0 : 0.90
    },
  };
  
  // Normalize material spec
  const normalized = materialSpec.toUpperCase().replace(/\s+/g, "-");
  const data = stressData[normalized] || stressData["SA-516-70"]; // Default
  
  return data.baseStress * data.tempFactor(temperature);
}

/**
 * Calculate minimum required thickness for cylindrical shell
 * Per ASME Section VIII Div 1, UG-27
 */
function calculateShellMinThickness(
  pressure: number,
  radius: number,
  allowableStress: number,
  jointEfficiency: number,
  corrosionAllowance: number
): number {
  // t = (P × R) / (S × E - 0.6 × P) + CA
  const t = (pressure * radius) / (allowableStress * jointEfficiency - 0.6 * pressure);
  return t + corrosionAllowance;
}

/**
 * Calculate minimum required thickness for head
 * Per ASME Section VIII Div 1, UG-32
 */
export function calculateHeadMinThickness(
  pressure: number,
  radius: number,
  allowableStress: number,
  jointEfficiency: number,
  corrosionAllowance: number,
  headType: string = "ellipsoidal",
  knuckleRadius?: number // Required for torispherical heads
): number {
  let L: number; // Crown radius or characteristic dimension
  let factor: number;
  
  switch (headType) {
    case "hemispherical":
      // ASME UG-32(d): t = (P × L) / (2 × S × E - 0.2 × P)
      // For hemispherical, L = R (inside crown radius)
      L = radius;
      factor = 1.0;
      break;
      
    case "ellipsoidal":
      // ASME UG-32(e): t = (P × D) / (2 × S × E - 0.2 × P)
      // For 2:1 ellipsoidal, L = D (inside diameter)
      L = radius * 2;
      factor = 1.0;
      break;
      
    case "torispherical":
      // ASME UG-32(f): t = (P × L × M) / (2 × S × E - 0.2 × P)
      // where M = (1/4) × [3 + √(L/r)]
      // L = inside crown radius (typically same as shell radius)
      // r = inside knuckle radius
      L = radius;
      
      if (!knuckleRadius || knuckleRadius <= 0) {
        // Default to ASME flanged and dished head proportions
        // For standard F&D: r = 0.06D, L = D
        // This gives M ≈ 1.77 for typical proportions
        knuckleRadius = radius * 2 * 0.06; // 6% of diameter
      }
      
      // Calculate M factor per ASME UG-32(f)
      const M = 0.25 * (3 + Math.sqrt(L / knuckleRadius));
      factor = M;
      break;
      
    default:
      // Default to ellipsoidal
      L = radius * 2;
      factor = 1.0;
  }
  
  // ASME formula: t = (P × L × factor) / (2 × S × E - 0.2 × P) + CA
  const t = (pressure * L * factor) / (2 * allowableStress * jointEfficiency - 0.2 * pressure);
  return t + corrosionAllowance;
}

/**
 * Calculate MAWP for cylindrical shell
 */
function calculateShellMAWP(
  thickness: number,
  radius: number,
  allowableStress: number,
  jointEfficiency: number,
  corrosionAllowance: number
): number {
  const t = thickness - corrosionAllowance;
  // MAWP = (S × E × t) / (R + 0.6 × t)
  return (allowableStress * jointEfficiency * t) / (radius + 0.6 * t);
}

/**
 * Calculate MAWP for head
 */
function calculateHeadMAWP(
  thickness: number,
  radius: number,
  allowableStress: number,
  jointEfficiency: number,
  corrosionAllowance: number,
  headType: string = "ellipsoidal",
  knuckleRadius?: number // Required for torispherical heads
): number {
  const t = thickness - corrosionAllowance;
  let L: number; // Crown radius or characteristic dimension
  let factor: number;
  
  switch (headType) {
    case "hemispherical":
      // For hemispherical, L = R (inside crown radius)
      L = radius;
      factor = 1.0;
      break;
      
    case "ellipsoidal":
      // For 2:1 ellipsoidal, L = D (inside diameter)
      L = radius * 2;
      factor = 1.0;
      break;
      
    case "torispherical":
      // L = inside crown radius
      L = radius;
      
      if (!knuckleRadius || knuckleRadius <= 0) {
        // Default to ASME flanged and dished head proportions
        knuckleRadius = radius * 2 * 0.06; // 6% of diameter
      }
      
      // Calculate M factor per ASME UG-32(f)
      const M = 0.25 * (3 + Math.sqrt(L / knuckleRadius));
      factor = M;
      break;
      
    default:
      // Default to ellipsoidal
      L = radius * 2;
      factor = 1.0;
  }
  
  // MAWP = (2 × S × E × t) / (L × factor + 0.2 × t)
  return (2 * allowableStress * jointEfficiency * t) / (L * factor + 0.2 * t);
}

/**
 * Calculate remaining life and next inspection date
 */
function calculateRemainingLife(
  actualThickness: number,
  minThickness: number,
  corrosionRate: number
): { remainingLife: number, nextInspectionDate: Date } {
  if (corrosionRate <= 0) {
    // No corrosion detected
    return {
      remainingLife: 999, // Effectively unlimited
      nextInspectionDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
    };
  }
  
  // Convert mpy to inches per year
  const corrosionRateInches = corrosionRate / 1000;
  
  // Remaining life = (ta - tmin) / corrosion rate
  const remainingLife = (actualThickness - minThickness) / corrosionRateInches;
  
  // Next inspection = Current date + (Remaining Life / 2) per API 510
  const halfLife = Math.max(remainingLife / 2, 1); // At least 1 year
  const nextInspection = new Date(Date.now() + halfLife * 365 * 24 * 60 * 60 * 1000);
  
  return {
    remainingLife: Math.max(remainingLife, 0),
    nextInspectionDate: nextInspection
  };
}

/**
 * Main calculation function
 */
export function calculateComponent(data: ComponentData): CalculationResults {
  const radius = data.insideDiameter / 2;
  const allowableStress = getAllowableStress(data.materialSpec, data.designTemperature);
  
  // Calculate static head pressure if applicable
  let staticHeadPressure = 0;
  let totalDesignPressure = data.designPressure;
  
  if (data.liquidService && data.specificGravity && data.liquidHeight) {
    staticHeadPressure = calculateStaticHeadPressure(
      data.specificGravity,
      data.liquidHeight
    );
    totalDesignPressure = data.designPressure + staticHeadPressure;
  }
  
  // Use total design pressure (including static head) for calculations
  const effectivePressure = totalDesignPressure;
  
  // Calculate minimum required thickness
  let minThickness: number;
  let mawp: number;
  
  if (data.componentType === "shell") {
    minThickness = calculateShellMinThickness(
      effectivePressure,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance
    );
    mawp = calculateShellMAWP(
      data.actualThickness,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance
    );
  } else {
    minThickness = calculateHeadMinThickness(
      effectivePressure,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance,
      data.headType,
      data.knuckleRadius
    );
    mawp = calculateHeadMAWP(
      data.actualThickness,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance,
      data.headType,
      data.knuckleRadius
    );
  }
  
  // Calculate remaining life
  const corrosionRate = data.corrosionRate || 0;
  const { remainingLife, nextInspectionDate } = calculateRemainingLife(
    data.actualThickness,
    minThickness,
    corrosionRate
  );
  
  // Determine status
  let status: "acceptable" | "monitoring" | "critical";
  let statusReason: string;
  
  if (data.actualThickness < minThickness) {
    status = "critical";
    statusReason = `Actual thickness (${data.actualThickness.toFixed(4)}") is below minimum required (${minThickness.toFixed(4)}")`;
  } else if (data.actualThickness < minThickness + data.corrosionAllowance * 0.5) {
    status = "monitoring";
    statusReason = `Actual thickness (${data.actualThickness.toFixed(4)}") is within 50% of minimum required (${minThickness.toFixed(4)}")`;
  } else {
    status = "acceptable";
    statusReason = `Actual thickness (${data.actualThickness.toFixed(4)}") exceeds minimum required (${minThickness.toFixed(4)}")`;
  }
  
  return {
    component: data.componentType === "shell" ? "Cylindrical Shell" : `${data.headType || "Ellipsoidal"} Head`,
    designPressure: data.designPressure,
    designTemperature: data.designTemperature,
    material: data.materialSpec,
    allowableStress,
    staticHeadPressure: staticHeadPressure > 0 ? staticHeadPressure : undefined,
    totalDesignPressure: staticHeadPressure > 0 ? totalDesignPressure : undefined,
    minimumRequiredThickness: minThickness,
    actualThickness: data.actualThickness,
    corrosionAllowance: data.corrosionAllowance,
    mawp,
    corrosionRate,
    remainingLife,
    nextInspectionDate: nextInspectionDate.toISOString(),
    status,
    statusReason
  };
}

