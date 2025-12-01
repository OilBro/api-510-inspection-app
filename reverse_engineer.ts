// From PDF page 19 (Head Evaluation):
// East Head: t_prev=0.555, t_act=0.536, t_min=0.500, y=7.0
// Formula: 2SEt/(D+0.2t) = P
// East Head: t=0.536, P=266.3, MAWP=263.9
// West Head: t=0.537, P=264.9, MAWP=262.5

const D = 70.750;
const t_east = 0.536;
const t_west = 0.537;
const P_east = 266.3;
const P_west = 264.9;
const SH = 6.0;
const SG = 0.92;

// Formula: P = 2SEt / (D + 0.2t)
// Rearranging: SE = P(D + 0.2t) / (2t)

const SE_east = (P_east * (D + 0.2 * t_east)) / (2 * t_east);
const SE_west = (P_west * (D + 0.2 * t_west)) / (2 * t_west);

console.log(`SE from East Head: ${SE_east.toFixed(2)}`);
console.log(`SE from West Head: ${SE_west.toFixed(2)}`);
console.log(`Average SE: ${((SE_east + SE_west) / 2).toFixed(2)}`);

// Now check minimum thickness formula
// t_min = PD / (2SE - 0.2P)
const P_design = 250;
const t_min_target = 0.500;

// Using the SE we calculated
const t_min_calc_east = (P_design * D) / (2 * SE_east - 0.2 * P_design);
const t_min_calc_west = (P_design * D) / (2 * SE_west - 0.2 * P_design);

console.log(`\nt_min from East Head SE: ${t_min_calc_east.toFixed(4)}" (should be 0.500")`);
console.log(`t_min from West Head SE: ${t_min_calc_west.toFixed(4)}" (should be 0.500")`);

// What SE gives exactly 0.500?
// 0.500 = 250 * 70.750 / (2*SE - 0.2*250)
// 0.500 * (2*SE - 50) = 17687.5
// 1*SE - 25 = 17687.5
// 2*SE = 17687.5 + 25
// SE = (17687.5 + 25) / 2

const SE_exact = (P_design * D + 0.2 * P_design * t_min_target) / (2 * t_min_target);
console.log(`\nSE for exact t_min=0.500": ${SE_exact.toFixed(2)}`);

// If S = 20000, what is E?
const S = 20000;
const E_exact = SE_exact / S;
console.log(`E value: ${E_exact.toFixed(6)}`);

// Verify with this E
const t_min_verify = (P_design * D) / (2 * S * E_exact - 0.2 * P_design);
console.log(`\nVerify t_min with E=${E_exact.toFixed(6)}: ${t_min_verify.toFixed(4)}"`);

const P_east_verify = (2 * S * E_exact * t_east) / (D + 0.2 * t_east);
const MAWP_east_verify = P_east_verify - (SH * 0.433 * SG);
console.log(`Verify East Head MAWP: ${MAWP_east_verify.toFixed(1)} psi (should be 263.9)`);

const P_west_verify = (2 * S * E_exact * t_west) / (D + 0.2 * t_west);
const MAWP_west_verify = P_west_verify - (SH * 0.433 * SG);
console.log(`Verify West Head MAWP: ${MAWP_west_verify.toFixed(1)} psi (should be 262.5)`);
