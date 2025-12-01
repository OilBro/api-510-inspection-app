// Working backwards from PDF results to find correct formula

// Given from PDF:
const P = 250;  // Design pressure
const D = 70.750;  // Inside diameter
const t_min_target = 0.500;  // Target minimum thickness
const t_act_east = 0.536;
const t_act_west = 0.537;
const MAWP_east_target = 263.9;
const MAWP_west_target = 262.5;
const SH = 6.0;
const SG = 0.92;

// Formula for 2:1 ellipsoidal head minimum thickness:
// t = PD / (2SE - 0.2P)

// Rearranging to solve for SE:
// t(2SE - 0.2P) = PD
// 2SEt - 0.2Pt = PD
// 2SEt = PD + 0.2Pt
// SE = (PD + 0.2Pt) / (2t)

const SE_from_tmin = (P * D + 0.2 * P * t_min_target) / (2 * t_min_target);
console.log(`SE value from t_min: ${SE_from_tmin.toFixed(1)}`);

// If S = 20000, then E = SE / S
const S = 20000;
const E_calc = SE_from_tmin / S;
console.log(`Calculated E: ${E_calc.toFixed(4)}`);

// Now check MAWP formula
// P = 2SEt / (D + 0.2t)
// But MAWP = P - (SH * 0.433 * SG)

const static_head_pressure = SH * 0.433 * SG;
console.log(`Static head pressure: ${static_head_pressure.toFixed(2)} psi`);

// So P_next = MAWP + static_head_pressure
const P_next_east = MAWP_east_target + static_head_pressure;
const P_next_west = MAWP_west_target + static_head_pressure;
console.log(`P_next East (before static head): ${P_next_east.toFixed(2)} psi`);
console.log(`P_next West (before static head): ${P_next_west.toFixed(2)} psi`);

// Now solve for what t_next should be:
// P = 2SEt / (D + 0.2t)
// P(D + 0.2t) = 2SEt
// PD + 0.2Pt = 2SEt
// PD = 2SEt - 0.2Pt
// PD = t(2SE - 0.2P)
// t = PD / (2SE - 0.2P)

const t_next_east_calc = (P_next_east * D) / (2 * SE_from_tmin - 0.2 * P_next_east);
const t_next_west_calc = (P_next_west * D) / (2 * SE_from_tmin - 0.2 * P_next_west);
console.log(`t_next East calculated: ${t_next_east_calc.toFixed(4)}"`);
console.log(`t_next West calculated: ${t_next_west_calc.toFixed(4)}"`);

// Check if this matches t_act (assuming Cr = 0)
console.log(`t_act East: ${t_act_east}"`);
console.log(`t_act West: ${t_act_west}"`);
console.log(`Difference East: ${(t_act_east - t_next_east_calc).toFixed(4)}"`);
console.log(`Difference West: ${(t_act_west - t_next_west_calc).toFixed(4)}"`);

// Try with E = 1.0 instead
console.log('\n=== TRYING E = 1.0 ===');
const SE_1 = S * 1.0;
const t_min_E1 = (P * D) / (2 * SE_1 - 0.2 * P);
console.log(`t_min with E=1.0: ${t_min_E1.toFixed(4)}"`);

const P_next_east_E1 = (2 * SE_1 * t_act_east) / (D + 0.2 * t_act_east);
const MAWP_east_E1 = P_next_east_E1 - static_head_pressure;
console.log(`MAWP East with E=1.0: ${MAWP_east_E1.toFixed(1)} psi`);

const P_next_west_E1 = (2 * SE_1 * t_act_west) / (D + 0.2 * t_act_west);
const MAWP_west_E1 = P_next_west_E1 - static_head_pressure;
console.log(`MAWP West with E=1.0: ${MAWP_west_E1.toFixed(1)} psi`);
