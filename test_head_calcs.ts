import { evaluateHead, HeadCalculationInputs } from './server/professionalCalculations';

// Test data from PDF page 3
// East Head: Actual=0.536", Min Required=0.500", MAWP=263.9 psi
// West Head: Actual=0.537", Min Required=0.500", MAWP=262.5 psi

const eastHeadInputs: HeadCalculationInputs = {
  headType: 'ellipsoidal',
  P: 250,           // Design pressure
  S: 20000,         // Allowable stress for stainless steel at 200°F
  E: 0.85,          // Joint efficiency
  D: 70.750,        // Inside diameter
  t_nom: 0.552,     // Nominal thickness from PDF
  t_prev: 0.552,    // Previous = nominal (no prior inspection)
  t_act: 0.536,     // Actual measured thickness
  Y: 12,            // Years since last inspection (2025 - 2013 or similar)
  Yn: 10,           // Years to next inspection
  SH: 6.0,          // Static head
  SG: 0.92,         // Specific gravity
};

const westHeadInputs: HeadCalculationInputs = {
  ...eastHeadInputs,
  t_act: 0.537,     // West head actual thickness
};

console.log('=== EAST HEAD CALCULATION ===');
const eastResult = evaluateHead(eastHeadInputs);
console.log(`Minimum Required Thickness: ${eastResult.t_min.toFixed(3)}" (should be 0.500")`);
console.log(`Calculated MAWP: ${eastResult.MAWP.toFixed(1)} psi (should be 263.9 psi)`);
console.log(`Remaining Life: ${eastResult.RL > 100 ? '>20' : eastResult.RL.toFixed(0)} years (should be >13 years)`);
console.log('');

console.log('=== WEST HEAD CALCULATION ===');
const westResult = evaluateHead(westHeadInputs);
console.log(`Minimum Required Thickness: ${westResult.t_min.toFixed(3)}" (should be 0.500")`);
console.log(`Calculated MAWP: ${westResult.MAWP.toFixed(1)} psi (should be 262.5 psi)`);
console.log(`Remaining Life: ${westResult.RL > 100 ? '>20' : westResult.RL.toFixed(0)} years (should be >15 years)`);
console.log('');

console.log('=== ANALYSIS ===');
console.log(`East Head t_min error: ${((eastResult.t_min - 0.500) * 1000).toFixed(1)} mils`);
console.log(`East Head MAWP error: ${(eastResult.MAWP - 263.9).toFixed(1)} psi`);
console.log(`West Head t_min error: ${((westResult.t_min - 0.500) * 1000).toFixed(1)} mils`);
console.log(`West Head MAWP error: ${(westResult.MAWP - 262.5).toFixed(1)} psi`);
