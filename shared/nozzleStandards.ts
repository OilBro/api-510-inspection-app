/**
 * ASME UG-45 Nozzle Minimum Thickness Standards
 * 
 * Minimum thickness allowed for nozzles walls are based on standard
 * pipe thicknesses minus 12.5% or connecting shell/head required thickness
 * whichever is smaller. (ASME Sect VIII, UG-45)
 */

export interface NozzleMinThickness {
  size: string;
  sizeInches: number;
  tminInches: number;
}

/**
 * ASME UG-45 minimum thickness table for standard pipe sizes
 * Based on Schedule 40 pipe minus 12.5%
 */
export const NOZZLE_MIN_THICKNESS_TABLE: NozzleMinThickness[] = [
  { size: '3/4', sizeInches: 0.75, tminInches: 0.100 },
  { size: '1', sizeInches: 1.0, tminInches: 0.116 },
  { size: '1.5', sizeInches: 1.5, tminInches: 0.127 },
  { size: '2', sizeInches: 2.0, tminInches: 0.135 },
  { size: '3', sizeInches: 3.0, tminInches: 0.189 },
  { size: '4', sizeInches: 4.0, tminInches: 0.207 },
  { size: '6', sizeInches: 6.0, tminInches: 0.245 },
  { size: '8', sizeInches: 8.0, tminInches: 0.282 },
  { size: '10', sizeInches: 10.0, tminInches: 0.319 },
  { size: '12', sizeInches: 12.0, tminInches: 0.328 },
  { size: '>12', sizeInches: 999, tminInches: 0.328 },
];

/**
 * Get minimum thickness for a nozzle based on its size
 * @param sizeInches Nozzle size in inches
 * @returns Minimum thickness in inches per ASME UG-45
 */
export function getNozzleMinThickness(sizeInches: number): number {
  // Find the closest size in the table
  for (const entry of NOZZLE_MIN_THICKNESS_TABLE) {
    if (sizeInches <= entry.sizeInches) {
      return entry.tminInches;
    }
  }
  // If larger than 12", use the >12" value
  return NOZZLE_MIN_THICKNESS_TABLE[NOZZLE_MIN_THICKNESS_TABLE.length - 1].tminInches;
}

/**
 * Nozzle TML location angles
 */
export const NOZZLE_TML_LOCATIONS = ['0', '90', '180', '270'] as const;
export type NozzleTMLLocation = typeof NOZZLE_TML_LOCATIONS[number];

/**
 * Calculate nozzle remaining life
 */
export interface NozzleRLCalculation {
  tPrev: number;  // Previous thickness (nominal or last inspection)
  tAct: number;   // Current actual thickness
  tMin: number;   // Minimum required thickness
  age: number;    // Years in service or since last inspection
  Ca: number;     // Corrosion allowance (tAct - tMin)
  Cr: number;     // Corrosion rate (inch/year)
  RL: number;     // Remaining life (years)
}

/**
 * Calculate remaining life for a nozzle
 * @param tPrev Previous thickness (inches)
 * @param tAct Current actual thickness (inches)
 * @param tMin Minimum required thickness (inches)
 * @param age Years since previous reading
 * @returns Calculation results
 */
export function calculateNozzleRL(
  tPrev: number,
  tAct: number,
  tMin: number,
  age: number
): NozzleRLCalculation {
  // Corrosion allowance
  const Ca = tAct - tMin;
  
  // Corrosion rate (inch/year)
  const Cr = age > 0 ? (tPrev - tAct) / age : 0;
  
  // Remaining life (years)
  const RL = Cr > 0 ? Ca / Cr : 999; // 999 = essentially infinite
  
  return {
    tPrev,
    tAct,
    tMin,
    age,
    Ca: Math.max(Ca, 0),
    Cr: Math.max(Cr, 0),
    RL: Math.max(RL, 0),
  };
}

