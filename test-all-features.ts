/**
 * Comprehensive test for all new features:
 * 1. Material database expansion (SA-106, SA-105, SA-240, SA-387)
 * 2. External pressure calculations with X-Charts
 * 3. Static head pressure
 */

import { calculateComponent } from "./server/componentCalculations";
import { calculateExternalPressureMAWP, getFactorA, getFactorB } from "./server/xChartData";

console.log("=".repeat(80));
console.log("COMPREHENSIVE FEATURE TEST");
console.log("=".repeat(80));

// Test 1: Material Database Expansion
console.log("\n1. MATERIAL DATABASE EXPANSION TEST");
console.log("-".repeat(80));

const newMaterials = [
  { spec: "SA-106-B", temp: 500, expected: "~15000 psi" },
  { spec: "SA-105", temp: 600, expected: "~15000 psi" },
  { spec: "SA-240-304", temp: 400, expected: "~15865 psi" },
  { spec: "SA-240-316", temp: 400, expected: "~15865 psi" },
  { spec: "SA-387-11-2", temp: 800, expected: "~13500 psi" },
  { spec: "SA-387-22-2", temp: 850, expected: "~13800 psi" },
];

newMaterials.forEach((mat) => {
  try {
    const result = calculateComponent({
      designPressure: 100,
      designTemperature: mat.temp,
      insideDiameter: 96,
      materialSpec: mat.spec,
      nominalThickness: 0.5,
      actualThickness: 0.48,
      corrosionAllowance: 0.125,
      jointEfficiency: 1.0,
      componentType: "shell",
    });
    console.log(`✓ ${mat.spec} @ ${mat.temp}°F: S = ${result.allowableStress} psi (expected ${mat.expected})`);
  } catch (error: any) {
    console.log(`✗ ${mat.spec}: ${error.message}`);
  }
});

// Test 2: External Pressure Calculations
console.log("\n2. EXTERNAL PRESSURE CALCULATIONS TEST");
console.log("-".repeat(80));

// Test X-Chart lookups
console.log("\nX-Chart Factor A Lookups:");
const LDoTests = [0.5, 1.0, 2.0, 5.0, 10.0];
LDoTests.forEach((LDo) => {
  const factorA = getFactorA(LDo);
  console.log(`  L/Do = ${LDo.toFixed(2)} → Factor A = ${factorA.toFixed(6)}`);
});

console.log("\nFactor B Lookups:");
const DotTests = [20, 50, 100, 200, 500];
DotTests.forEach((Dot) => {
  const factorB = getFactorB(Dot);
  console.log(`  Do/t = ${Dot} → Factor B = ${factorB.toFixed(0)}`);
});

// Test external pressure MAWP calculation
console.log("\nExternal Pressure MAWP Calculation:");
const externalPressureTest = {
  Do: 96.5,      // 96" ID + 0.5" wall = 96.5" OD
  t: 0.25,       // 0.25" wall thickness
  L: 120,        // 120" unsupported length
};

const extResult = calculateExternalPressureMAWP(
  externalPressureTest.Do,
  externalPressureTest.t,
  externalPressureTest.L
);

console.log(`  Vessel: Do = ${externalPressureTest.Do}", t = ${externalPressureTest.t}", L = ${externalPressureTest.L}"`);
console.log(`  L/Do = ${extResult.LDo.toFixed(3)}`);
console.log(`  Do/t = ${extResult.Dot.toFixed(1)}`);
console.log(`  Factor A = ${extResult.factorA.toFixed(6)}`);
console.log(`  Factor B = ${extResult.factorB.toFixed(0)}`);
console.log(`  External Pressure MAWP = ${extResult.mawp.toFixed(1)} psi`);

// Test 3: Static Head Pressure
console.log("\n3. STATIC HEAD PRESSURE TEST");
console.log("-".repeat(80));

const staticHeadTest = {
  designPressure: 100,
  designTemperature: 300,
  insideDiameter: 96,
  materialSpec: "SA-516-70",
  nominalThickness: 0.5,
  actualThickness: 0.48,
  corrosionAllowance: 0.125,
  jointEfficiency: 1.0,
  componentType: "shell" as const,
  liquidService: true,
  specificGravity: 1.0,  // Water
  liquidHeight: 50,      // 50 feet of liquid
};

const staticResult = calculateComponent(staticHeadTest);

console.log(`Vertical vessel with liquid service:`);
console.log(`  Liquid: Water (SG = ${staticHeadTest.specificGravity})`);
console.log(`  Liquid height: ${staticHeadTest.liquidHeight} ft`);
console.log(`  Design pressure: ${staticHeadTest.designPressure} psi`);
console.log(`  Static head pressure: ${staticResult.staticHeadPressure?.toFixed(2)} psi`);
console.log(`  Total design pressure: ${staticResult.totalDesignPressure?.toFixed(2)} psi`);
console.log(`  Minimum required thickness: ${staticResult.minimumRequiredThickness.toFixed(4)}"`);
console.log(`  Impact: ${((staticResult.staticHeadPressure! / staticHeadTest.designPressure) * 100).toFixed(1)}% increase in design pressure`);

// Test 4: Combined External Pressure + Component Calculation
console.log("\n4. EXTERNAL PRESSURE COMPONENT CALCULATION TEST");
console.log("-".repeat(80));

const vacuumVessel = {
  designPressure: 15,  // Full vacuum
  designTemperature: 300,
  insideDiameter: 96,
  materialSpec: "SA-516-70",
  nominalThickness: 0.375,
  actualThickness: 0.365,
  corrosionAllowance: 0.0625,
  jointEfficiency: 1.0,
  componentType: "shell" as const,
  externalPressure: true,
  unsupportedLength: 120,  // 10 feet between stiffeners
};

const vacuumResult = calculateComponent(vacuumVessel);

console.log(`Vacuum vessel under external pressure:`);
console.log(`  Unsupported length: ${vacuumVessel.unsupportedLength}"`);
console.log(`  Actual thickness: ${vacuumVessel.actualThickness}"`);
console.log(`  External pressure MAWP: ${vacuumResult.externalPressureMAWP?.toFixed(1)} psi`);
console.log(`  Factor A: ${vacuumResult.factorA?.toFixed(6)}`);
console.log(`  Factor B: ${vacuumResult.factorB?.toFixed(0)}`);
console.log(`  Status: ${vacuumResult.status}`);

console.log("\n" + "=".repeat(80));
console.log("ALL TESTS COMPLETE");
console.log("=".repeat(80));

