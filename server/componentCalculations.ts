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
function calculateHeadMinThickness(
  pressure: number,
  radius: number,
  allowableStress: number,
  jointEfficiency: number,
  corrosionAllowance: number,
  headType: string = "ellipsoidal"
): number {
  let factor = 1.0;
  
  switch (headType) {
    case "hemispherical":
      factor = 0.5;
      break;
    case "ellipsoidal":
      factor = 1.0; // 2:1 ellipsoidal
      break;
    case "torispherical":
      factor = 1.77; // ASME flanged and dished
      break;
  }
  
  // t = (P × L × factor) / (2 × S × E - 0.2 × P) + CA
  // For ellipsoidal: L = D (diameter)
  const t = (pressure * radius * 2 * factor) / (2 * allowableStress * jointEfficiency - 0.2 * pressure);
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
  headType: string = "ellipsoidal"
): number {
  const t = thickness - corrosionAllowance;
  let factor = 1.0;
  
  switch (headType) {
    case "hemispherical":
      factor = 0.5;
      break;
    case "ellipsoidal":
      factor = 1.0;
      break;
    case "torispherical":
      factor = 1.77;
      break;
  }
  
  // MAWP = (2 × S × E × t) / (L × factor + 0.2 × t)
  return (2 * allowableStress * jointEfficiency * t) / (radius * 2 * factor + 0.2 * t);
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
  
  // Calculate minimum required thickness
  let minThickness: number;
  let mawp: number;
  
  if (data.componentType === "shell") {
    minThickness = calculateShellMinThickness(
      data.designPressure,
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
      data.designPressure,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance,
      data.headType
    );
    mawp = calculateHeadMAWP(
      data.actualThickness,
      radius,
      allowableStress,
      data.jointEfficiency,
      data.corrosionAllowance,
      data.headType
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

