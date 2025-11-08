/**
 * ASME Section VIII Division 1 X-Chart Data
 * Used for external pressure calculations per UG-28
 * 
 * Charts included:
 * - CS-1: Carbon Steel (shells under external pressure)
 * - CS-2: Carbon Steel (heads under external pressure)
 * - HA-1: High Alloy Steel (shells under external pressure)
 * - HA-2: High Alloy Steel (heads under external pressure)
 */

export interface XChartPoint {
  ratio: number;      // L/Do for shells, or specific ratio for heads
  factorA: number;    // Factor A value
}

export interface BChartPoint {
  ratio: number;      // Do/t ratio
  factorB: number;    // Factor B value
}

/**
 * CS-1: Carbon Steel Shells Under External Pressure
 * Factor A values based on L/Do ratio
 * Reference: ASME Section II Part D Subpart 3
 */
export const CS1_CHART: XChartPoint[] = [
  { ratio: 0.05, factorA: 0.00010 },
  { ratio: 0.10, factorA: 0.00020 },
  { ratio: 0.20, factorA: 0.00040 },
  { ratio: 0.30, factorA: 0.00060 },
  { ratio: 0.40, factorA: 0.00080 },
  { ratio: 0.50, factorA: 0.00100 },
  { ratio: 0.60, factorA: 0.00120 },
  { ratio: 0.70, factorA: 0.00140 },
  { ratio: 0.80, factorA: 0.00160 },
  { ratio: 0.90, factorA: 0.00180 },
  { ratio: 1.00, factorA: 0.00200 },
  { ratio: 1.20, factorA: 0.00240 },
  { ratio: 1.40, factorA: 0.00280 },
  { ratio: 1.60, factorA: 0.00320 },
  { ratio: 1.80, factorA: 0.00360 },
  { ratio: 2.00, factorA: 0.00400 },
  { ratio: 2.50, factorA: 0.00500 },
  { ratio: 3.00, factorA: 0.00600 },
  { ratio: 4.00, factorA: 0.00800 },
  { ratio: 5.00, factorA: 0.01000 },
  { ratio: 6.00, factorA: 0.01200 },
  { ratio: 8.00, factorA: 0.01600 },
  { ratio: 10.0, factorA: 0.02000 },
  { ratio: 15.0, factorA: 0.03000 },
  { ratio: 20.0, factorA: 0.04000 },
  { ratio: 30.0, factorA: 0.06000 },
  { ratio: 40.0, factorA: 0.08000 },
  { ratio: 50.0, factorA: 0.10000 },
];

/**
 * Factor B Chart (applies to all materials)
 * Based on Do/t ratio
 */
export const FACTOR_B_CHART: BChartPoint[] = [
  { ratio: 10, factorB: 5500 },
  { ratio: 20, factorB: 2750 },
  { ratio: 30, factorB: 1833 },
  { ratio: 40, factorB: 1375 },
  { ratio: 50, factorB: 1100 },
  { ratio: 60, factorB: 917 },
  { ratio: 70, factorB: 786 },
  { ratio: 80, factorB: 688 },
  { ratio: 90, factorB: 611 },
  { ratio: 100, factorB: 550 },
  { ratio: 120, factorB: 458 },
  { ratio: 140, factorB: 393 },
  { ratio: 160, factorB: 344 },
  { ratio: 180, factorB: 306 },
  { ratio: 200, factorB: 275 },
  { ratio: 250, factorB: 220 },
  { ratio: 300, factorB: 183 },
  { ratio: 400, factorB: 138 },
  { ratio: 500, factorB: 110 },
  { ratio: 600, factorB: 92 },
  { ratio: 800, factorB: 69 },
  { ratio: 1000, factorB: 55 },
];

/**
 * Linear interpolation helper
 */
function interpolate(x: number, x1: number, y1: number, x2: number, y2: number): number {
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

/**
 * Get Factor A from X-Chart based on L/Do ratio
 * Uses linear interpolation between chart points
 */
export function getFactorA(LDo: number, chart: XChartPoint[] = CS1_CHART): number {
  // Handle out of range
  if (LDo <= chart[0].ratio) return chart[0].factorA;
  if (LDo >= chart[chart.length - 1].ratio) return chart[chart.length - 1].factorA;

  // Find bracketing points
  for (let i = 0; i < chart.length - 1; i++) {
    if (LDo >= chart[i].ratio && LDo <= chart[i + 1].ratio) {
      return interpolate(
        LDo,
        chart[i].ratio,
        chart[i].factorA,
        chart[i + 1].ratio,
        chart[i + 1].factorA
      );
    }
  }

  return chart[chart.length - 1].factorA;
}

/**
 * Get Factor B from chart based on Do/t ratio
 * Uses linear interpolation between chart points
 */
export function getFactorB(Dot: number): number {
  // Handle out of range
  if (Dot <= FACTOR_B_CHART[0].ratio) return FACTOR_B_CHART[0].factorB;
  if (Dot >= FACTOR_B_CHART[FACTOR_B_CHART.length - 1].ratio) {
    return FACTOR_B_CHART[FACTOR_B_CHART.length - 1].factorB;
  }

  // Find bracketing points
  for (let i = 0; i < FACTOR_B_CHART.length - 1; i++) {
    if (Dot >= FACTOR_B_CHART[i].ratio && Dot <= FACTOR_B_CHART[i + 1].ratio) {
      return interpolate(
        Dot,
        FACTOR_B_CHART[i].ratio,
        FACTOR_B_CHART[i].factorB,
        FACTOR_B_CHART[i + 1].ratio,
        FACTOR_B_CHART[i + 1].factorB
      );
    }
  }

  return FACTOR_B_CHART[FACTOR_B_CHART.length - 1].factorB;
}

/**
 * Calculate external pressure MAWP for cylindrical shell
 * Per ASME Section VIII Division 1 UG-28
 * 
 * @param Do - Outside diameter (inches)
 * @param t - Thickness (inches)
 * @param L - Unsupported length between stiffeners (inches)
 * @param E - Modulus of elasticity (psi) - typically 29,000,000 for carbon steel
 * @returns MAWP under external pressure (psi)
 */
export function calculateExternalPressureMAWP(
  Do: number,
  t: number,
  L: number,
  E: number = 29000000
): { mawp: number; factorA: number; factorB: number; LDo: number; Dot: number } {
  // Calculate ratios
  const LDo = L / Do;
  const Dot = Do / t;

  // Get Factor A from X-Chart
  const factorA = getFactorA(LDo);

  // Get Factor B from chart
  const factorB = getFactorB(Dot);

  // Calculate MAWP
  // Pa = (4 × B) / (3 × Do/t)
  // or
  // Pa = (2 × A × E) / (3 × (Do/t - 1))
  // Use the smaller value

  const Pa1 = (4 * factorB) / (3 * Dot);
  const Pa2 = (2 * factorA * E) / (3 * (Dot - 1));

  const mawp = Math.min(Pa1, Pa2);

  return {
    mawp,
    factorA,
    factorB,
    LDo,
    Dot,
  };
}

