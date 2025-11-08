# Phase 1: Formula Extraction and Documentation
## API 510 Inspection Report Builder - Formula Verification

**Date:** Current  
**Status:** Complete  
**Source File:** `server/componentCalculations.ts`

---

## 1. SHELL CALCULATIONS

### 1.1 Shell Minimum Required Thickness (Internal Pressure)

**Location:** Lines 94-104  
**Function:** `calculateShellMinThickness()`

**Implemented Formula:**
```typescript
t = (P × R) / (S × E - 0.6 × P) + CA
```

**Code Implementation:**
```typescript
const t = (pressure * radius) / (allowableStress * jointEfficiency - 0.6 * pressure);
return t + corrosionAllowance;
```

**Variables:**
- `pressure` (P) - Internal design pressure (psi)
- `radius` (R) - Inside radius (inches) [Note: Calculated as ID/2 on line 219]
- `allowableStress` (S) - Maximum allowable stress value (psi) at design temperature
- `jointEfficiency` (E) - Joint efficiency (0.0 to 1.0)
- `corrosionAllowance` (CA) - Corrosion allowance (inches)
- `t` - Minimum required thickness (inches)

**Expected ASME Reference:** UG-27(c)(1)

**Verification Status:** ⚠️ **NEEDS VERIFICATION**
- Formula structure appears correct
- Coefficient 0.6 is correct per UG-27(c)(1)
- Corrosion allowance is properly added
- Need to verify: applicability limits (t ≤ 0.5R, P ≤ 0.385SE)

---

### 1.2 Shell MAWP (Maximum Allowable Working Pressure)

**Location:** Lines 141-151  
**Function:** `calculateShellMAWP()`

**Implemented Formula:**
```typescript
MAWP = (S × E × t) / (R + 0.6 × t)
```

**Code Implementation:**
```typescript
const t = thickness - corrosionAllowance;
return (allowableStress * jointEfficiency * t) / (radius + 0.6 * t);
```

**Variables:**
- `thickness` - Actual measured thickness (inches)
- `corrosionAllowance` (CA) - Corrosion allowance (inches)
- `t` - Effective thickness = actual thickness - CA (inches)
- `allowableStress` (S) - Maximum allowable stress value (psi)
- `jointEfficiency` (E) - Joint efficiency (0.0 to 1.0)
- `radius` (R) - Inside radius (inches)

**Expected ASME Reference:** UG-27(c)(1) rearranged

**Verification Status:** ⚠️ **NEEDS VERIFICATION**
- Formula is correctly rearranged from minimum thickness formula
- Properly subtracts CA before calculation
- Coefficient 0.6 is correct
- Need to verify: result matches hand calculations

---

## 2. HEAD CALCULATIONS

### 2.1 Head Minimum Required Thickness (Internal Pressure)

**Location:** Lines 110-136  
**Function:** `calculateHeadMinThickness()`

**Implemented Formula:**
```typescript
t = (P × L × factor) / (2 × S × E - 0.2 × P) + CA
```

**Code Implementation:**
```typescript
// Factor determination
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

// For ellipsoidal: L = D (diameter)
const t = (pressure * radius * 2 * factor) / (2 * allowableStress * jointEfficiency - 0.2 * pressure);
return t + corrosionAllowance;
```

**Variables:**
- `pressure` (P) - Internal design pressure (psi)
- `radius` (R) - Inside radius (inches)
- `L` - Calculated as `radius * 2` = diameter (inches)
- `factor` - Head type factor (0.5, 1.0, or 1.77)
- `allowableStress` (S) - Maximum allowable stress value (psi)
- `jointEfficiency` (E) - Joint efficiency (0.0 to 1.0)
- `corrosionAllowance` (CA) - Corrosion allowance (inches)

**Expected ASME References:**
- Hemispherical: UG-32(d)
- Ellipsoidal: UG-32(e)
- Torispherical: UG-32(f)

**Verification Status:** ⚠️ **CRITICAL ISSUES FOUND**

#### Issue 1: Hemispherical Head Formula
**Problem:** Using factor = 0.5 in wrong formula structure

**ASME UG-32(d) Formula:**
```
t = (P × L) / (2 × S × E - 0.2 × P)
```

**Current Implementation:**
```typescript
t = (P × R × 2 × 0.5) / (2 × S × E - 0.2 × P)
// Simplifies to: t = (P × R) / (2 × S × E - 0.2 × P)
```

**Expected Implementation:**
```typescript
// For hemispherical, L = R (radius, not diameter)
t = (P × R) / (2 × S × E - 0.2 × P)
```

**Status:** ❌ **INCORRECT** - Formula accidentally correct due to factor cancellation, but conceptually wrong

#### Issue 2: Ellipsoidal Head Formula
**Problem:** Using diameter where ASME uses diameter

**ASME UG-32(e) Formula:**
```
t = (P × D) / (2 × S × E - 0.2 × P)
```

**Current Implementation:**
```typescript
t = (P × R × 2 × 1.0) / (2 × S × E - 0.2 × P)
// Simplifies to: t = (P × D) / (2 × S × E - 0.2 × P) where D = R × 2
```

**Status:** ✅ **CORRECT** - Formula is correct

#### Issue 3: Torispherical Head Formula
**Problem:** Using simplified factor instead of proper M calculation

**ASME UG-32(f) Formula:**
```
t = (P × L × M) / (2 × S × E - 0.2 × P)
where M = (1/4) × [3 + √(L/r)]
```

**Current Implementation:**
```typescript
factor = 1.77; // Fixed value
t = (P × R × 2 × 1.77) / (2 × S × E - 0.2 × P)
```

**Status:** ❌ **INCORRECT** - Using fixed factor instead of calculating M based on L/r ratio

**Required Fix:**
```typescript
// Need to add knuckle radius (r) as input parameter
// Then calculate: M = 0.25 * (3 + Math.sqrt(L / r))
```

---

### 2.2 Head MAWP

**Location:** Lines 156-181  
**Function:** `calculateHeadMAWP()`

**Implemented Formula:**
```typescript
MAWP = (2 × S × E × t) / (L × factor + 0.2 × t)
```

**Code Implementation:**
```typescript
const t = thickness - corrosionAllowance;
// ... factor determination same as above ...
return (2 * allowableStress * jointEfficiency * t) / (radius * 2 * factor + 0.2 * t);
```

**Verification Status:** ⚠️ **NEEDS VERIFICATION**
- Formula is rearranged from minimum thickness formula
- Same factor issues as minimum thickness calculation
- Need to fix torispherical M calculation

---

## 3. REMAINING LIFE CALCULATIONS

### 3.1 Remaining Life

**Location:** Lines 186-213  
**Function:** `calculateRemainingLife()`

**Implemented Formula:**
```typescript
remainingLife = (ta - tmin) / corrosionRate
```

**Code Implementation:**
```typescript
// Convert mpy to inches per year
const corrosionRateInches = corrosionRate / 1000;

// Remaining life = (ta - tmin) / corrosion rate
const remainingLife = (actualThickness - minThickness) / corrosionRateInches;
```

**Variables:**
- `actualThickness` (ta) - Current measured thickness (inches)
- `minThickness` (tmin) - Minimum required thickness (inches)
- `corrosionRate` - Corrosion rate (mpy - mils per year)
- `corrosionRateInches` - Corrosion rate converted to inches per year
- `remainingLife` - Remaining life (years)

**Expected API 510 Reference:** Section 7

**Verification Status:** ✅ **CORRECT**
- Formula is correct per API 510
- Proper unit conversion (mpy to ipy)
- Handles zero/negative corrosion rate appropriately

---

### 3.2 Next Inspection Date

**Location:** Lines 206-207  
**Function:** `calculateRemainingLife()` (same function)

**Implemented Logic:**
```typescript
// Next inspection = Current date + (Remaining Life / 2) per API 510
const halfLife = Math.max(remainingLife / 2, 1); // At least 1 year
const nextInspection = new Date(Date.now() + halfLife * 365 * 24 * 60 * 60 * 1000);
```

**Expected API 510 Reference:** Section 7 (half-life rule)

**Verification Status:** ✅ **CORRECT**
- Properly implements half-life rule
- Minimum 1-year interval enforced
- Handles unlimited life case (line 195: 10-year default)

---

## 4. MATERIAL STRESS VALUES

### 4.1 Allowable Stress Lookup

**Location:** Lines 62-88  
**Function:** `getAllowableStress()`

**Implemented Materials:**
```typescript
"SA-515-70": baseStress: 17100 psi
"SA-516-70": baseStress: 17100 psi
"SA-285-C":  baseStress: 13750 psi
"SA-36":     baseStress: 14400 psi
```

**Temperature Factors:**
- T ≤ 650°F: 1.0 (full stress)
- 650°F < T ≤ 750°F: 0.95 (5% reduction)
- T > 750°F: 0.85 (15% reduction)

**Verification Status:** ⚠️ **NEEDS EXPANSION**
- Limited material database (only 4 materials)
- Simplified temperature factors (need full ASME Section II Part D tables)
- Missing many common materials
- No interpolation between temperature points

**Expected ASME Reference:** Section II Part D, Table 1A

---

## 5. MISSING CALCULATIONS

### 5.1 External Pressure (Shell)
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** ASME Section VIII Div 1, UG-28 to UG-33
**Complexity:** High - requires iterative calculation with X-Charts

### 5.2 External Pressure (Head)
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** ASME Section VIII Div 1, UG-33
**Complexity:** High - requires X-Chart lookup

### 5.3 Nozzle Minimum Thickness
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** ASME Section VIII Div 1, UG-45
**Complexity:** Medium - requires pipe schedule lookup

### 5.4 Nozzle Reinforcement
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** ASME Section VIII Div 1, UG-37 to UG-42
**Complexity:** High - complex area calculation

### 5.5 Conical Head
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** ASME Section VIII Div 1, UG-32(g)
**Complexity:** Medium - requires half-apex angle

### 5.6 Static Head Pressure
**Status:** ❌ **NOT IMPLEMENTED**
**Required:** Hydrostatic pressure calculation
**Complexity:** Low - simple calculation

---

## 6. SUMMARY OF FINDINGS

### ✅ Correctly Implemented (3)
1. Shell internal pressure minimum thickness
2. Remaining life calculation
3. Next inspection date calculation

### ⚠️ Needs Verification (3)
1. Shell MAWP calculation
2. Ellipsoidal head calculations
3. Material stress values

### ❌ Incorrectly Implemented (2)
1. Hemispherical head (conceptually wrong, but accidentally correct result)
2. Torispherical head (using fixed factor instead of calculated M)

### ❌ Not Implemented (6)
1. External pressure (shell)
2. External pressure (head)
3. Nozzle minimum thickness
4. Nozzle reinforcement
5. Conical head
6. Static head pressure

---

## 7. PRIORITY FIXES REQUIRED

### Priority 1: Critical Errors
1. **Fix torispherical head M calculation**
   - Add knuckle radius (r) parameter
   - Calculate M = 0.25 × [3 + √(L/r)]
   - Update both minimum thickness and MAWP functions

2. **Fix hemispherical head conceptual error**
   - Use L = R (radius) instead of L = D (diameter)
   - Remove factor = 0.5 approach
   - Implement proper UG-32(d) formula

### Priority 2: Missing Features
3. **Implement external pressure calculations**
   - Add X-Chart data tables
   - Implement iteration logic
   - Add convergence checking

4. **Implement nozzle calculations**
   - Add pipe schedule database
   - Implement UG-45 logic
   - Add nozzle reinforcement (UG-37 to UG-42)

### Priority 3: Enhancements
5. **Expand material database**
   - Add full ASME Section II Part D materials
   - Implement proper temperature interpolation
   - Add material property lookup API

6. **Add missing head types**
   - Implement conical head (UG-32(g))
   - Add validation for half-apex angle

---

## 8. NEXT STEPS (Phase 2)

1. Cross-reference each formula against ASME code
2. Create test cases with known correct results
3. Run verification tests
4. Fix identified issues
5. Re-test after fixes

---

**Phase 1 Status:** ✅ **COMPLETE**  
**Critical Issues Found:** 2  
**Missing Features:** 6  
**Ready for Phase 2:** YES

---

## APPENDIX A: Code Line Reference

| Component | Function | Lines | Status |
|-----------|----------|-------|--------|
| Shell Min Thickness | `calculateShellMinThickness()` | 94-104 | ✅ Correct |
| Shell MAWP | `calculateShellMAWP()` | 141-151 | ⚠️ Verify |
| Head Min Thickness | `calculateHeadMinThickness()` | 110-136 | ❌ Errors |
| Head MAWP | `calculateHeadMAWP()` | 156-181 | ❌ Errors |
| Remaining Life | `calculateRemainingLife()` | 186-213 | ✅ Correct |
| Allowable Stress | `getAllowableStress()` | 62-88 | ⚠️ Expand |
| Main Calculator | `calculateComponent()` | 218-299 | ⚠️ Review |

---

**END OF PHASE 1 DOCUMENTATION**

