# API 510 Inspection App - Audit & Test Plan

## Test Date: January 31, 2025

## Test PDFs Provided
1. **54-11-067OPAIReportReviewandCorrosionAnalysis.pdf** (2025 Report - 55 pages)
   - Vessel Tag: 54-11-067
   - Inspection Date: October 8, 2025
   - Report Type: In-Lieu-Of Inspection with corrosion analysis
   - Contains: Executive summary, vessel data, thickness measurements, calculations, findings, recommendations

2. **54-11-0672017INLIEUOFOPTIMIZEDPRINTED.pdf** (2017 Baseline - 49 pages)
   - Vessel Tag: 54-11-067
   - Inspection Date: June 20, 2017
   - Report Type: In-Service Inspection Report
   - Contains: TABLE A with component calculations, thickness measurements, appendices

## Key Data to Extract

### Vessel Information
- Vessel Tag: 54-11-067
- Service: Methylchloride (Clean)
- Manufacturer: Industrial Service Fabricators
- NB Number: 5653
- Year Built: 2005
- Code: ASME Section VIII, Div. 1 (2004 Ed.)
- Dimensions: 70.750" ID × 216" T-T Length
- MAWP: 250 psi
- Design Temperature: 200°F
- MDMT: -20°F @ 250 psi
- Joint Efficiency (E): 0.85
- Material: SA-240 Type 304 Stainless Steel

### Component Geometry (from 2017 report)
- Shell: Cylindrical, 0.625" nominal thickness
- Heads: 2:1 Ellipsoidal, 0.552" nominal thickness (note: some docs show 0.500")

### Expected Calculations (from 2017 TABLE A)
| Component | Nominal (in) | Actual (in) | Min Required (in) | Design MAWP (psi) | Calculated MAWP (psi) | Remaining Life (years) |
|-----------|--------------|-------------|-------------------|-------------------|----------------------|------------------------|
| Vessel Shell | 0.625 | 0.652 | 0.530 | 250 | 307.5 | >20 |
| East Head | 0.500 | 0.555 | 0.526 | 250 | 263.9 | >20 |
| West Head | 0.500 | 0.552 | 0.526 | 250 | 262.5 | >20 |

### 2025 Thickness Data (from analysis report)
- Shell: t_nom=0.625", t_min=0.530", t_prev=0.625", t_act=0.652"
- East Head: t_nom=0.552", t_min=0.500", t_prev=0.500", t_act=0.536"
- West Head: t_nom=0.552", t_min=0.500", t_act=0.537"

### Corrosion Analysis (2025 report)
- Shell: CR = 0.000 ipy (thickness increased)
- East Head: CR = 0.0008 ipy (negligible)
- West Head: CR = ~0.00075 ipy (negligible)
- General Corrosion Rate: <0.005 ipy

### Nozzles (2025 report)
- N1 (Manway, 24"): Actual 0.379" vs Required 0.328" - OK
- N2 (Relief, 3"): Actual 0.195" vs Required 0.189" - OK
- N3-N12: Small bore nozzles (1"-2"), all 0.124"-0.160", exceeding minimums

## Test Scenarios

### Scenario 1: Import 2017 Baseline Report
**Objective:** Validate baseline data extraction and calculation generation

**Steps:**
1. Navigate to "Import from PDF (AI)" or "Import Data" (Manus parser)
2. Upload `54-11-0672017INLIEUOFOPTIMIZEDPRINTED.pdf`
3. Wait for processing

**Expected Results:**
- ✅ Vessel data extracted (tag, manufacturer, year, MAWP, etc.)
- ✅ Component calculations auto-created for Shell, East Head, West Head
- ✅ TABLE A values match PDF: t_min, MAWP, remaining life
- ✅ TML readings extracted from Appendix A
- ✅ Nozzle data extracted
- ✅ Findings and recommendations captured
- ✅ Professional report auto-created

### Scenario 2: Import 2025 Updated Report
**Objective:** Test duplicate prevention and updated thickness data

**Steps:**
1. Import `54-11-067OPAIReportReviewandCorrosionAnalysis.pdf`
2. Verify vessel matching (same tag 54-11-067)

**Expected Results:**
- ✅ Duplicate prevention: deletes existing TML, calculations, nozzles before import
- ✅ New thickness measurements imported
- ✅ Corrosion rates calculated using actual time between inspections (2017→2025 = ~8 years)
- ✅ Component calculations updated with 2025 data
- ✅ Findings extracted (PSV discrepancy, In-Lieu-Of justification)
- ✅ Recommendations extracted

### Scenario 3: Generate Professional Report
**Objective:** Validate PDF generation matches professional format

**Steps:**
1. Navigate to Professional Report tab
2. Click "Generate Full Report"
3. Download and compare with original PDFs

**Expected Results:**
- ✅ Executive Summary TABLE A displays all components
- ✅ No dashes in critical fields
- ✅ Shell Evaluation section with header table (Report No., Client, Inspector, Date)
- ✅ Head Evaluation section with calculations
- ✅ Nozzle Evaluation table with one row per nozzle
- ✅ Findings section populated
- ✅ Recommendations section populated
- ✅ All calculations accurate

### Scenario 4: PDF Comparison View
**Objective:** Test side-by-side comparison feature

**Steps:**
1. Navigate to Professional Report → Comparison tab
2. View original PDF vs generated report

**Expected Results:**
- ✅ Original PDF loads on left
- ✅ Generated PDF loads on right
- ✅ Zoom controls work
- ✅ Can scroll both PDFs independently

### Scenario 5: Validation Dashboard
**Objective:** Test calculation validation feature

**Steps:**
1. Click "Validate Calculations" button in Professional Report
2. Review comparison data

**Expected Results:**
- ✅ Validation dashboard loads
- ✅ Shows comparison for Shell, East Head, West Head
- ✅ Displays app-calculated vs PDF original values
- ✅ Color-coded status indicators (green/yellow/red)
- ✅ Discrepancy percentages calculated
- ✅ Warning shown if PDF original values not stored

### Scenario 6: Recalculate Feature
**Objective:** Test manual recalculation trigger

**Steps:**
1. Navigate to Professional Report → Calculations tab
2. Click "Recalculate" button

**Expected Results:**
- ✅ Component calculations regenerated
- ✅ Shell, East Head, West Head all recalculated
- ✅ Values match expected formulas
- ✅ Success message displayed

## Critical Validation Points

### Calculation Formulas
- **Shell (cylinder):** t_min = PR/(SE - 0.6P)
- **Heads (2:1 ellipsoidal):** t_min = PR/(2SE - 0.2P)
- **MAWP:** P = (SE × t)/(R + 0.6t) for shell, P = (2SE × t)/(R + 0.2t) for heads
- **Corrosion Rate:** CR = (t_prev - t_act) / Years
- **Remaining Life:** RL = (t_act - t_min) / CR

### Parameters
- S (Allowable Stress): 20,000 psi for SA-240 304 SS at 200°F
- E (Joint Efficiency): 0.85
- R (Inside Radius): 35.375" (70.750"/2)
- P (Design Pressure): 250 psi (+ static head if applicable)

## Known Issues to Monitor
1. TypeScript errors (non-critical, don't affect runtime)
2. PDF original values not auto-extracted (manual entry required for validation)
3. Static head not included in pressure calculations (minor discrepancy)

## Success Criteria
- [ ] Both PDFs import successfully
- [ ] All vessel data extracted correctly
- [ ] Component calculations auto-generate
- [ ] Generated PDF matches professional format
- [ ] No missing data (dashes) in critical fields
- [ ] Calculations accurate within 5% of PDF values
- [ ] Duplicate prevention works correctly
- [ ] Validation dashboard displays comparison data
