/**
 * Nozzle Pressure Design Calculations per ASME Section VIII Division 1
 * UG-27: Thickness of Shells Under Internal Pressure
 * 
 * For nozzles, we calculate the required thickness based on the nozzle's
 * inside diameter and the vessel's design pressure, similar to how we would
 * calculate shell thickness.
 */

export interface NozzlePressureCalcInput {
  nominalSize: string; // e.g., "2", "6", "12"
  outsideDiameter: number; // inches (from pipe schedule)
  wallThickness: number; // inches (from pipe schedule)
  designPressure: number; // psig
  designTemperature: number; // °F
  materialSpec?: string; // e.g., "SA-106 Grade B"
}

export interface NozzlePressureCalcResult {
  insideDiameter: number; // inches
  insideRadius: number; // inches
  allowableStress: number; // psi
  weldJointEfficiency: number; // typically 1.0 for seamless pipe
  requiredThickness: number; // inches (per UG-27)
  pipeNominalThickness: number; // inches
  pipeMinusTolerance: number; // inches (12.5% tolerance)
  minimumRequired: number; // inches (greater of required or pipe minus tolerance)
  governingCriterion: 'pressure_design' | 'pipe_schedule';
}

/**
 * Get allowable stress for common pipe materials at temperature
 * Reference: ASME Section II Part D - Material Properties
 */
function getAllowableStress(materialSpec: string | undefined, temperature: number): number {
  // Simplified allowable stress values (psi) at various temperatures
  // In production, this should reference ASME Section II Part D tables
  
  const material = (materialSpec || 'SA-106 Grade B').toUpperCase();
  
  // Carbon Steel (SA-106 Grade B, SA-53 Grade B) - most common for nozzles
  if (material.includes('SA-106') || material.includes('SA-53')) {
    if (temperature <= 650) return 15000;
    if (temperature <= 700) return 15000;
    if (temperature <= 750) return 14700;
    if (temperature <= 800) return 14200;
    return 13500; // >800°F
  }
  
  // Stainless Steel 304/304L
  if (material.includes('304')) {
    if (temperature <= 650) return 16700;
    if (temperature <= 700) return 15900;
    if (temperature <= 750) return 15300;
    return 14800; // >750°F
  }
  
  // Stainless Steel 316/316L
  if (material.includes('316')) {
    if (temperature <= 650) return 16700;
    if (temperature <= 700) return 16400;
    if (temperature <= 750) return 16100;
    return 15700; // >750°F
  }
  
  // Default to conservative carbon steel value
  return 15000;
}

/**
 * Calculate nozzle minimum thickness per ASME UG-27
 * Formula: t = (P × R) / (S × E - 0.6 × P)
 * 
 * Where:
 * t = minimum required thickness (inches)
 * P = internal design pressure (psig)
 * R = inside radius (inches)
 * S = maximum allowable stress (psi)
 * E = weld joint efficiency (1.0 for seamless pipe)
 */
export function calculateNozzlePressureThickness(
  input: NozzlePressureCalcInput
): NozzlePressureCalcResult {
  // Calculate inside diameter
  const insideDiameter = input.outsideDiameter - (2 * input.wallThickness);
  const insideRadius = insideDiameter / 2;
  
  // Get allowable stress for material at design temperature
  const allowableStress = getAllowableStress(input.materialSpec, input.designTemperature);
  
  // Weld joint efficiency (1.0 for seamless pipe, which is standard for nozzles)
  const weldJointEfficiency = 1.0;
  
  // Calculate required thickness per UG-27
  // t = (P × R) / (S × E - 0.6 × P)
  const P = input.designPressure;
  const R = insideRadius;
  const S = allowableStress;
  const E = weldJointEfficiency;
  
  const requiredThickness = (P * R) / (S * E - 0.6 * P);
  
  // Pipe schedule thickness minus 12.5% manufacturing tolerance
  const pipeMinusTolerance = input.wallThickness * (1 - 0.125);
  
  // Minimum required is the greater of:
  // 1. Pressure design thickness
  // 2. Pipe schedule minus tolerance
  let minimumRequired: number;
  let governingCriterion: 'pressure_design' | 'pipe_schedule';
  
  if (requiredThickness > pipeMinusTolerance) {
    minimumRequired = requiredThickness;
    governingCriterion = 'pressure_design';
  } else {
    minimumRequired = pipeMinusTolerance;
    governingCriterion = 'pipe_schedule';
  }
  
  return {
    insideDiameter,
    insideRadius,
    allowableStress,
    weldJointEfficiency,
    requiredThickness,
    pipeNominalThickness: input.wallThickness,
    pipeMinusTolerance,
    minimumRequired,
    governingCriterion,
  };
}

