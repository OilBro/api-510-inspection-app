# ASME Code Formula Verification Plan
## API 510 Inspection Report Builder

**Document Version:** 1.0  
**Created:** Based on API510InspectionReportBuilderR1.pdf requirements  
**Purpose:** Ensure all calculation formulas match ASME Section VIII Division 1 and API 510 requirements exactly

---

## Executive Summary

This document outlines a systematic approach to verify that all pressure vessel calculation formulas implemented in the API 510 Inspection Report Builder application conform exactly to ASME Boiler and Pressure Vessel Code Section VIII Division 1 and API 510 standards. The verification process includes formula extraction, code cross-referencing, test case development, and discrepancy resolution.

---

## Phase 1: Current Formula Documentation

### Objective
Extract and document all calculation formulas currently implemented in the application, including their location in the codebase and the variables they use.

### Tasks

#### 1.1 Locate Calculation Files
- **Primary file:** `server/componentCalculations.ts`
- **Secondary files:** 
  - `server/professionalReportDb.ts` (database calculation logic)
  - `client/src/components/inspection/ComponentCalculationsTab.tsx` (UI calculations)
  - Any utility files with calculation helpers

#### 1.2 Extract Shell Formulas

**Shell Internal Pressure - Minimum Thickness**
```typescript
Location: componentCalculations.ts
Current Formula: t = (P × R) / (S × E - 0.6 × P) + CA

Variables:
- t = minimum required thickness (inches)
- P = internal design pressure (psi)
- R = inside radius (inches)
- S = maximum allowable stress value (psi)
- E = joint efficiency (dimensionless, 0.0-1.0)
- CA = corrosion allowance (inches)

Expected Code Reference: ASME Section VIII Div 1, UG-27(c)(1)
```

**Shell External Pressure - Minimum Thickness**
```typescript
Location: componentCalculations.ts
Current Formula: [Document if implemented, note if missing]

Expected Method: Iterative calculation using X-Charts
Expected Code Reference: ASME Section VIII Div 1, UG-28 through UG-33
```

**Shell MAWP Calculation**
```typescript
Location: componentCalculations.ts
Current Formula: MAWP = (S × E × t) / (R + 0.6 × t)

Variables:
- MAWP = Maximum Allowable Working Pressure (psi)
- S = maximum allowable stress value (psi)
- E = joint efficiency
- t = actual thickness minus corrosion allowance (inches)
- R = inside radius (inches)

Expected Code Reference: ASME Section VIII Div 1, UG-27(c)(1) rearranged
```

#### 1.3 Extract Head Formulas

**Hemispherical Head**
```typescript
Location: componentCalculations.ts
Current Formula: t = (P × L × W) / (2 × S × E) + CA

Variables:
- t = minimum required thickness (inches)
- P = internal design pressure (psi)
- L = inside spherical or crown radius (inches)
- W = stress intensification factor (1.0 for hemispherical)
- S = maximum allowable stress value (psi)
- E = joint efficiency
- CA = corrosion allowance (inches)

Expected Code Reference: ASME Section VIII Div 1, UG-32(d)
```

**Ellipsoidal Head (2:1 ratio)**
```typescript
Location: componentCalculations.ts
Current Formula: t = (P × D) / (2 × S × E - 0.2 × P) + CA

Variables:
- t = minimum required thickness (inches)
- P = internal design pressure (psi)
- D = inside diameter (inches)
- S = maximum allowable stress value (psi)
- E = joint efficiency
- CA = corrosion allowance (inches)

Expected Code Reference: ASME Section VIII Div 1, UG-32(e)
```

**Torispherical Head**
```typescript
Location: componentCalculations.ts
Current Formula: t = (P × L × M) / (2 × S × E - 0.2 × P) + CA

Variables:
- t = minimum required thickness (inches)
- P = internal design pressure (psi)
- L = inside crown radius (inches)
- M = stress intensification factor = (1/4) × [3 + √(L/r)]
- r = inside knuckle radius (inches)
- S = maximum allowable stress value (psi)
- E = joint efficiency
- CA = corrosion allowance (inches)

Expected Code Reference: ASME Section VIII Div 1, UG-32(f)
```

**Conical Head**
```typescript
Location: componentCalculations.ts
Current Formula: [Document if implemented]

Expected Formula: t = (P × D) / (2 × cos(α) × (S × E - 0.6 × P)) + CA
Where α = half apex angle

Expected Code Reference: ASME Section VIII Div 1, UG-32(g)
```

#### 1.4 Extract Nozzle Formulas

**Nozzle Minimum Thickness (Small Nozzles)**
```typescript
Location: componentCalculations.ts
Current Formula: [Document if implemented]

Expected Method: Lesser of:
a) Standard pipe thickness minus 12.5%
b) Connecting shell/head required thickness

Expected Code Reference: ASME Section VIII Div 1, UG-45
```

**Nozzle Minimum Thickness (Large/High Pressure)**
```typescript
Location: componentCalculations.ts
Current Formula: [Document if implemented]

Expected Formula: t = (P × R) / (S × E - 0.6 × P)

Expected Code Reference: ASME Section VIII Div 1, UG-27
```

#### 1.5 Extract Remaining Life Formulas

**Remaining Life Calculation**
```typescript
Location: componentCalculations.ts or professionalReportDb.ts
Current Formula: RL = (tact - treq) / CR

Variables:
- RL = remaining life (years)
- tact = actual measured thickness (inches)
- treq = minimum required thickness (inches)
- CR = corrosion rate (inches per year)

Expected Code Reference: API 510, Section 7
```

**Corrosion Rate Calculation**
```typescript
Location: professionalReportDb.ts (TML calculations)
Current Formula: CR = (tprev - tcurr) / Δt × 1000

Variables:
- CR = corrosion rate (mpy - mils per year)
- tprev = previous thickness reading (inches)
- tcurr = current thickness reading (inches)
- Δt = time between readings (years)
- 1000 = conversion factor (inches to mils)

Expected Code Reference: API 510, Section 7
```

---

## Phase 2: ASME Code Cross-Reference

### Objective
Compare each implemented formula against the authoritative ASME code requirements and document any deviations.

### 2.1 Code Reference Matrix

| Component | Formula Type | ASME Code Section | Status | Notes |
|-----------|-------------|-------------------|--------|-------|
| Shell | Internal Pressure | UG-27(c)(1) | ⚠️ Verify | Check coefficient values |
| Shell | External Pressure | UG-28 to UG-33 | ❌ Missing | Requires X-Chart implementation |
| Shell | MAWP | UG-27(c)(1) | ⚠️ Verify | Rearranged formula |
| Hemispherical Head | Internal Pressure | UG-32(d) | ⚠️ Verify | Check W factor |
| Ellipsoidal Head | Internal Pressure | UG-32(e) | ⚠️ Verify | Check 2:1 ratio assumption |
| Torispherical Head | Internal Pressure | UG-32(f) | ⚠️ Verify | Check M factor calculation |
| Conical Head | Internal Pressure | UG-32(g) | ❓ Unknown | Check if implemented |
| Nozzle | Small Nozzle | UG-45 | ❓ Unknown | Check implementation |
| Nozzle | Large Nozzle | UG-27 | ❓ Unknown | Check implementation |
| Remaining Life | API 510 | API 510 Section 7 | ⚠️ Verify | Check calculation method |
| Corrosion Rate | API 510 | API 510 Section 7 | ✅ Verified | Implemented correctly |

**Legend:**
- ✅ Verified - Formula matches code exactly
- ⚠️ Verify - Needs verification against code
- ❌ Missing - Not implemented
- ❓ Unknown - Implementation status unclear

### 2.2 Detailed Code Requirements

#### ASME Section VIII Division 1, UG-27(c)(1) - Cylindrical Shells Under Internal Pressure

**Code Formula:**
```
t = PR / (SE - 0.6P)
```

**Applicability:**
- When t does not exceed 0.5R or P does not exceed 0.385SE
- For circumferential stress (longitudinal joints)

**Variables per Code:**
- P = internal design pressure (psi)
- R = inside radius of shell (inches)
- S = maximum allowable stress value (psi) at design temperature
- E = joint efficiency (from UW-12)
- t = minimum required thickness of shell (inches)

**Notes:**
- Corrosion allowance is ADDED to calculated thickness
- Formula assumes thin-wall theory (t ≤ 0.5R)
- For thick-wall vessels, use different formula

#### ASME Section VIII Division 1, UG-28 to UG-33 - Cylindrical Shells Under External Pressure

**Code Method:**
1. Determine L = unsupported length between stiffening rings
2. Assume starting thickness t
3. Calculate L/Do and Do/t ratios
4. From applicable material chart, determine Factor A
5. From applicable material chart, determine Factor B
6. Calculate Pa = 4B / (3 × Do/t)
7. If Pa < design pressure, increase t and repeat
8. Iterate until Pa ≥ design pressure

**Applicability:**
- External pressure or vacuum conditions
- Requires reference to external pressure charts (Figures G, CS-1, CS-2, HA-1, etc.)

**Variables per Code:**
- L = design length (inches)
- Do = outside diameter (inches)
- t = thickness (inches)
- A = factor from applicable material chart
- B = factor from applicable material chart (or E for some materials)
- Pa = allowable external pressure (psi)

**Notes:**
- This is an ITERATIVE process
- Requires X-Chart lookup tables
- Different charts for different materials
- Must account for temperature effects

#### ASME Section VIII Division 1, UG-32 - Formed Heads

**UG-32(d) - Hemispherical Heads:**
```
t = PL / (2SE - 0.2P)
```
When P does not exceed 0.665SE

**UG-32(e) - Ellipsoidal Heads (2:1 ratio):**
```
t = PD / (2SE - 0.2P)
```
When P does not exceed 0.665SE

**UG-32(f) - Torispherical Heads:**
```
t = PLM / (2SE - 0.2P)
```
Where M = (1/4) × [3 + √(L/r)]

**UG-32(g) - Conical Heads:**
```
t = PD / (2 × cos(α) × (SE - 0.6P))
```
Where α = half apex angle (must be ≤ 30°)

**Notes:**
- All formulas assume internal pressure
- External pressure requires different approach
- Corrosion allowance is ADDED to calculated thickness
- Joint efficiency E applies to head-to-shell joint

#### ASME Section VIII Division 1, UG-45 - Nozzle Thickness

**For nozzles not requiring reinforcement:**

Minimum thickness = lesser of:
1. Standard pipe wall thickness minus 12.5% (manufacturing tolerance)
2. Thickness required for connecting shell or head

**Special Cases:**
- Large nozzles (exceeding limits of UG-36)
- High-pressure nozzles
- May require calculation per UG-27 formula

#### API 510, Section 7 - Remaining Life Assessment

**Remaining Life Formula:**
```
Remaining Life (years) = (tactual - trequired) / Corrosion Rate
```

**Corrosion Rate Determination:**
- Based on historical thickness measurements
- Calculated as: (tprevious - tcurrent) / time interval
- May use long-term average or short-term rate
- Inspector judgment required for rate selection

**Notes:**
- Remaining life is an ESTIMATE
- Assumes constant corrosion rate
- May be adjusted based on process changes
- Used to determine next inspection interval

---

## Phase 3: Test Case Development

### Objective
Create comprehensive test cases with known correct results to validate formula implementation.

### 3.1 Test Case Sources

#### Primary Source: Report 54-11-004
- Real-world inspection report with complete calculations
- All input parameters documented
- Expected results available for comparison
- Covers shell and head calculations

#### Secondary Sources:
- ASME Section VIII Division 1 example problems
- API 510 training materials
- Pressure vessel design textbooks
- Online calculation verification tools

### 3.2 Shell Calculation Test Case

**Test Case SC-001: Carbon Steel Vertical Shell**

**Input Parameters:**
```javascript
{
  componentType: 'shell',
  material: 'SA-516 Grade 70',
  designPressure: 100, // psi
  designTemperature: 400, // °F
  insideDiameter: 96, // inches
  corrosionAllowance: 0.125, // inches
  jointEfficiency: 1.0, // RT-1
  stressValue: 20000, // psi at 400°F
}
```

**Expected Results:**
```javascript
{
  minimumThickness: 0.3650, // inches (calculated)
  requiredThickness: 0.4900, // inches (with CA)
  actualThickness: 0.625, // inches (measured)
  mawp: 162.5, // psi (calculated)
  remainingLife: 10.8, // years (with 0.0125 ipy corrosion rate)
}
```

**Calculation Steps:**
1. t = (100 × 48) / (20000 × 1.0 - 0.6 × 100)
2. t = 4800 / (20000 - 60)
3. t = 4800 / 19940
4. t = 0.2407 inches
5. t_required = 0.2407 + 0.125 = 0.3657 inches

**Tolerance:** ±0.001 inches for thickness, ±1 psi for pressure

### 3.3 Head Calculation Test Case

**Test Case HC-001: 2:1 Ellipsoidal Head**

**Input Parameters:**
```javascript
{
  componentType: 'head',
  headType: 'ellipsoidal',
  material: 'SA-516 Grade 70',
  designPressure: 100, // psi
  designTemperature: 400, // °F
  insideDiameter: 96, // inches
  corrosionAllowance: 0.125, // inches
  jointEfficiency: 1.0,
  stressValue: 20000, // psi
}
```

**Expected Results:**
```javascript
{
  minimumThickness: 0.2405, // inches
  requiredThickness: 0.3655, // inches (with CA)
  actualThickness: 0.500, // inches
  mawp: 166.7, // psi
}
```

**Calculation Steps:**
1. t = (100 × 96) / (2 × 20000 × 1.0 - 0.2 × 100)
2. t = 9600 / (40000 - 20)
3. t = 9600 / 39980
4. t = 0.2401 inches
5. t_required = 0.2401 + 0.125 = 0.3651 inches

### 3.4 Nozzle Calculation Test Case

**Test Case NC-001: 6-inch Nozzle**

**Input Parameters:**
```javascript
{
  nozzleSize: '6 inch',
  nozzleSchedule: 'STD',
  standardThickness: 0.280, // inches
  shellRequiredThickness: 0.365, // inches
  manufacturingTolerance: 0.125, // 12.5%
}
```

**Expected Results:**
```javascript
{
  minThicknessOption1: 0.245, // inches (pipe - 12.5%)
  minThicknessOption2: 0.365, // inches (shell thickness)
  minimumRequired: 0.245, // inches (lesser of two)
  actualThickness: 0.280, // inches
  acceptable: true,
}
```

### 3.5 Remaining Life Test Case

**Test Case RL-001: Shell with Historical Data**

**Input Parameters:**
```javascript
{
  actualThickness: 0.500, // inches (current reading)
  requiredThickness: 0.365, // inches
  previousThickness: 0.625, // inches (10 years ago)
  timeInterval: 10, // years
}
```

**Expected Results:**
```javascript
{
  thicknessLoss: 0.125, // inches
  corrosionRate: 0.0125, // inches per year (12.5 mpy)
  remainingLife: 10.8, // years
}
```

**Calculation Steps:**
1. CR = (0.625 - 0.500) / 10 = 0.0125 ipy
2. RL = (0.500 - 0.365) / 0.0125 = 10.8 years

---

## Phase 4: Formula Verification Execution

### Objective
Systematically verify each formula by running test cases and comparing results.

### 4.1 Verification Checklist

#### Shell Formulas
- [ ] **SC-001:** Run shell internal pressure test case
  - [ ] Compare calculated thickness to expected (tolerance ±0.001 in)
  - [ ] Verify MAWP calculation (tolerance ±1 psi)
  - [ ] Check that CA is properly added
  - [ ] Verify coefficient 0.6 is correct (not 0.4 or other value)
  
- [ ] **SC-002:** Test edge case - high pressure
  - [ ] Input: P = 1000 psi, verify formula still applies
  - [ ] Check if P > 0.385SE condition is enforced
  
- [ ] **SC-003:** Test edge case - thick wall
  - [ ] Input: t > 0.5R, verify warning or alternate formula
  
- [ ] **SC-004:** External pressure calculation
  - [ ] Verify iteration logic exists
  - [ ] Check X-Chart lookup implementation
  - [ ] Test convergence on known result

#### Head Formulas
- [ ] **HC-001:** Run ellipsoidal head test case
  - [ ] Compare calculated thickness to expected
  - [ ] Verify coefficient 0.2 (not 0.6)
  
- [ ] **HC-002:** Run hemispherical head test case
  - [ ] Verify formula uses L (radius) not D (diameter)
  - [ ] Check stress intensification factor W = 1.0
  
- [ ] **HC-003:** Run torispherical head test case
  - [ ] Verify M factor calculation: M = (1/4) × [3 + √(L/r)]
  - [ ] Check that both L and r are used correctly
  
- [ ] **HC-004:** Run conical head test case (if implemented)
  - [ ] Verify cos(α) term is present
  - [ ] Check angle limit (α ≤ 30°)

#### Nozzle Formulas
- [ ] **NC-001:** Run small nozzle test case
  - [ ] Verify 12.5% reduction is applied
  - [ ] Check that lesser of two values is selected
  
- [ ] **NC-002:** Run large nozzle test case
  - [ ] Verify UG-27 formula is used
  - [ ] Check pressure limit enforcement

#### Remaining Life Formulas
- [ ] **RL-001:** Run remaining life test case
  - [ ] Verify subtraction order: (actual - required)
  - [ ] Check division by corrosion rate
  - [ ] Verify units are consistent (years)
  
- [ ] **RL-002:** Test corrosion rate calculation
  - [ ] Verify: (previous - current) / time
  - [ ] Check conversion to mpy (×1000)

### 4.2 Automated Test Script

Create `test-formula-verification.ts`:

```typescript
import { calculateShellThickness, calculateHeadThickness, calculateMAWP, calculateRemainingLife } from './server/componentCalculations';

interface TestCase {
  name: string;
  inputs: any;
  expected: any;
  tolerance: number;
}

const testCases: TestCase[] = [
  {
    name: 'SC-001: Shell Internal Pressure',
    inputs: {
      designPressure: 100,
      insideRadius: 48,
      stressValue: 20000,
      jointEfficiency: 1.0,
      corrosionAllowance: 0.125,
    },
    expected: {
      minimumThickness: 0.2407,
      requiredThickness: 0.3657,
    },
    tolerance: 0.001,
  },
  // Add more test cases...
];

function runTests() {
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    const result = calculateShellThickness(test.inputs);
    const diff = Math.abs(result.minimumThickness - test.expected.minimumThickness);
    
    if (diff <= test.tolerance) {
      console.log(`✅ ${test.name} PASSED`);
      passed++;
    } else {
      console.log(`❌ ${test.name} FAILED`);
      console.log(`   Expected: ${test.expected.minimumThickness}`);
      console.log(`   Got: ${result.minimumThickness}`);
      console.log(`   Difference: ${diff}`);
      failed++;
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
}

runTests();
```

---

## Phase 5: Discrepancy Resolution

### Objective
Fix any formulas that don't match ASME code requirements and re-test.

### 5.1 Common Issues to Check

#### Issue 1: Incorrect Coefficients
- **Problem:** Using 0.4 instead of 0.6 in shell formula
- **Fix:** Update coefficient to match UG-27(c)(1)
- **Verification:** Re-run SC-001 test case

#### Issue 2: Missing Corrosion Allowance
- **Problem:** Not adding CA to calculated thickness
- **Fix:** Ensure CA is added after formula calculation
- **Verification:** Check that requiredThickness = minimumThickness + CA

#### Issue 3: Wrong Variable (Diameter vs Radius)
- **Problem:** Using diameter where radius is required
- **Fix:** Convert D to R (R = D/2) before calculation
- **Verification:** Results should match code examples

#### Issue 4: Joint Efficiency Not Applied
- **Problem:** Formula doesn't multiply by E
- **Fix:** Ensure E is in denominator (SE term)
- **Verification:** Test with E = 0.85 vs E = 1.0

#### Issue 5: External Pressure Not Implemented
- **Problem:** No iteration logic for X-Charts
- **Fix:** Implement full UG-28 to UG-33 procedure
- **Verification:** Compare to handbook example

### 5.2 Fix Documentation Template

For each fix:
```markdown
**Fix #001: Shell Formula Coefficient**

Date: [Date]
Component: Shell Internal Pressure
Issue: Using coefficient 0.4 instead of 0.6
Code Reference: ASME Section VIII Div 1, UG-27(c)(1)

Original Formula:
t = (P × R) / (S × E - 0.4 × P) + CA

Corrected Formula:
t = (P × R) / (S × E - 0.6 × P) + CA

Test Results Before Fix:
- SC-001: Expected 0.2407, Got 0.2500 (FAIL)

Test Results After Fix:
- SC-001: Expected 0.2407, Got 0.2407 (PASS)

Files Changed:
- server/componentCalculations.ts (line 45)

Verified By: [Name]
```

---

## Phase 6: Final Documentation

### Objective
Create comprehensive documentation of all verified formulas for future reference.

### 6.1 Formula Reference Document

Create `FORMULAS.md` with:
- Complete list of all formulas
- ASME code section references
- Variable definitions
- Applicability limits
- Example calculations
- Test case results

### 6.2 Code Comments

Add inline comments to all calculation functions:
```typescript
/**
 * Calculate minimum required thickness for cylindrical shell under internal pressure
 * 
 * Formula: t = (P × R) / (S × E - 0.6 × P)
 * 
 * Reference: ASME Section VIII Division 1, UG-27(c)(1)
 * 
 * Applicability:
 * - t ≤ 0.5R (thin-wall theory)
 * - P ≤ 0.385SE
 * 
 * @param P - Internal design pressure (psi)
 * @param R - Inside radius (inches)
 * @param S - Maximum allowable stress (psi) at design temperature
 * @param E - Joint efficiency (0.0 to 1.0)
 * @param CA - Corrosion allowance (inches)
 * @returns Minimum required thickness including CA (inches)
 */
export function calculateShellThickness(P: number, R: number, S: number, E: number, CA: number): number {
  // Check applicability limits
  const t_calc = (P * R) / (S * E - 0.6 * P);
  
  if (t_calc > 0.5 * R) {
    throw new Error('Thick-wall formula required (t > 0.5R)');
  }
  
  if (P > 0.385 * S * E) {
    throw new Error('Pressure exceeds formula limit (P > 0.385SE)');
  }
  
  return t_calc + CA;
}
```

### 6.3 User Documentation

Create user guide section explaining:
- What each calculation does
- When to use each formula
- Input requirements
- Interpretation of results
- Limitations and warnings

---

## Success Criteria

The formula verification is complete when:

1. ✅ All formulas are documented with code references
2. ✅ All test cases pass within tolerance
3. ✅ All ASME code sections are cross-referenced
4. ✅ All discrepancies are resolved and documented
5. ✅ Code comments include formula sources
6. ✅ User documentation is updated
7. ✅ Automated test suite is created
8. ✅ Verification report is published

---

## Timeline Estimate

- **Phase 1:** 4 hours - Formula documentation
- **Phase 2:** 4 hours - Code cross-reference
- **Phase 3:** 6 hours - Test case development
- **Phase 4:** 8 hours - Verification execution
- **Phase 5:** 6 hours - Discrepancy resolution
- **Phase 6:** 4 hours - Final documentation

**Total:** 32 hours (4 working days)

---

## Appendix A: ASME Code Section Quick Reference

| Code Section | Topic | Page Reference |
|--------------|-------|----------------|
| UG-27 | Thickness of Shells Under Internal Pressure | VIII-1, pg. 17 |
| UG-28 | Thickness of Shells Under External Pressure | VIII-1, pg. 18 |
| UG-32 | Formed Heads | VIII-1, pg. 21 |
| UG-45 | Nozzle Reinforcement | VIII-1, pg. 35 |
| UW-12 | Joint Efficiency | VIII-1, pg. 58 |

---

## Appendix B: Formula Quick Reference Card

### Shell - Internal Pressure
```
t = (P × R) / (S × E - 0.6 × P) + CA
```

### Shell - MAWP
```
MAWP = (S × E × t) / (R + 0.6 × t)
```

### Ellipsoidal Head
```
t = (P × D) / (2 × S × E - 0.2 × P) + CA
```

### Torispherical Head
```
t = (P × L × M) / (2 × S × E - 0.2 × P) + CA
where M = (1/4) × [3 + √(L/r)]
```

### Remaining Life
```
RL = (t_actual - t_required) / CR
```

---

**END OF VERIFICATION PLAN**

