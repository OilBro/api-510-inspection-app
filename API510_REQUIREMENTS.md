# API 510 Inspection Report Builder - Complete Requirements

## Document Overview
This document captures all requirements from the API510InspectionReportBuilderR1.pdf to ensure the application implements all necessary calculations, sections, and report generation features.

---

## 1. REPORT SECTIONS REQUIRED

### 1.1 Executive Summary
- Vessel identification
- Inspection date and type
- Overall condition assessment
- Key findings summary
- Recommendations summary

### 1.2 Vessel Data Section
- Vessel tag/ID
- Manufacturer
- Year built
- Design code (ASME Section VIII, etc.)
- Design pressure (internal/external)
- Design temperature
- MAWP (Maximum Allowable Working Pressure)
- Operating pressure
- Operating temperature
- Material specification
- Corrosion allowance
- Joint efficiency (E)
- Vessel orientation (vertical/horizontal)
- Vessel type (shell, head, nozzle, etc.)

### 1.3 Component Calculations Section
Must include calculations for:

#### 1.3.1 Shell/Cylinder Calculations
- **Internal Pressure Minimum Thickness**
  - Formula: t = (P×R)/(S×E - 0.6×P) + CA
  - Variables: P (pressure), R (radius), S (stress), E (joint efficiency), CA (corrosion allowance)
  
- **External Pressure Minimum Thickness**
  - Requires iterative calculation using X-Charts
  - Determine L (unsupported length)
  - Determine starting thickness t
  - Calculate L/Do and Do/t ratios
  - Reference applicable X-Chart (CS-1, CS-2, HA-1, etc.)
  - Determine Factor A from X-Chart
  - Determine Factor B (or E) from material X-Chart
  - Iterate until calculated Pa ≥ design Pa
  
- **Static Head (SH) Calculation**
  - For vertical vessels: liquid height from bottom
  - For horizontal vessels: height from bottom to liquid level
  - Specific Gravity (SG) input
  
- **Remaining Life Calculation**
  - Formula: RL = (tact - treq) / CR
  - Variables: tact (actual thickness), treq (required thickness), CR (corrosion rate)
  
- **Internal MAWP Calculation**
  - Based on actual measured thickness
  - Accounts for corrosion allowance
  
- **Corrosion Rate Calculation**
  - Based on thickness loss over time
  - User-defined override option

#### 1.3.2 Head Calculations (Formed Heads)
- **Torispherical Head**
- **Elliptical Head** 
- **Hemispherical Head**
- **Conical Head**

Each head type requires:
- Internal pressure minimum thickness
- External pressure minimum thickness (with X-Chart iterations)
- Static head consideration
- Material selection with stress values
- Joint efficiency (E) determination
- L & R values (spherical/crown radius, knuckle radius)

**Special Requirements:**
- Full vacuum vessels: 15 psi external pressure
- External Pressure Source = Design Int. Vacuum + Jacket MAWP
- Joint Efficiency values:
  - E = 1.0 for RT-1 or RT-2 seamless heads
  - E = 0.85 for non-RT heads or Category A/B welds (Type 3,4,5,6 per UW-12)

#### 1.3.3 Nozzle Calculations
- **Nozzle Minimum Thickness per ASME UG-45**
  - Standard pipe thickness minus 12.5%, OR
  - Connecting shell/head required thickness (whichever is smaller)
  
- **Large Nozzle/High Pressure Nozzles per ASME UG-27**
  - Formula: PR/SE-0.6P = t
  - When tmin > results of standard calculation

- **Nozzle Evaluation Table**
  - Multiple nozzles per report
  - Size, type, location
  - Minimum thickness required
  - Actual thickness measured
  - Acceptable/Not Acceptable status
  - Color coding (green = acceptable, red = not acceptable)

#### 1.3.4 Material Selection & Stress Values
- **Material Database**
  - ASME Section II Part D materials
  - User-definable materials
  - Material specification entry
  
- **Stress (S) Values**
  - [98 S] button: 4x safety factor (pre-1999 vessels)
  - [00 S] button: 3.5x safety factor (post-1999 vessels)
  - Temperature-dependent stress values
  - User must note material "S" at design temperature

**NOTE:** API-510 allows use of current code values. If vessel tmin/remaining life is limited using '98 S' values, user may use '00 S' values at temperature to gain operating time.

### 1.4 Thickness Readings Section
- Ultrasonic thickness measurement (UT) data
- TML (Thickness Measurement Location) identification
- Grid/location mapping
- Historical thickness data
- Minimum/maximum/average readings
- Thickness loss trends

### 1.5 Findings Section
- Finding ID/number
- Location/component
- Severity level (Critical, High, Medium, Low)
- Description
- Damage mechanism
- Photos/documentation
- Recommendations linkage

### 1.6 Recommendations Section
- Recommendation ID
- Priority
- Description
- Required action
- Timeline
- Responsible party
- Status tracking

### 1.7 Photos Section
- Photo upload/management
- Location tagging
- Description/caption
- Date taken
- Link to findings

### 1.8 Inspection Checklist Section
- Pre-inspection checklist
- During inspection checklist
- Post-inspection checklist
- Regulatory compliance items
- Safety requirements

### 1.9 FFS Assessment Section (API 579)
- Assessment Level (Level 1, 2, or 3)
- Damage type (General Metal Loss, LTA, Pitting, etc.)
- Remaining thickness
- Minimum required thickness
- Future corrosion allowance
- Acceptable/Not Acceptable determination
- Remaining life calculation
- Next inspection date
- Assessment notes
- Recommendations

### 1.10 In-Lieu-Of Internal Inspection Qualification (API 510 Section 6.4)
- **Qualification Criteria:**
  - Clean service (non-corrosive)
  - No history of corrosion
  - Effective external inspection program
  - Process monitoring in place
  - Thickness monitoring program
  
- **Qualification Results:**
  - Qualified/Not Qualified
  - Maximum interval (years)
  - Next internal inspection due date
  - Justification text
  - Monitoring plan

---

## 2. CALCULATION ENGINE REQUIREMENTS

### 2.1 Core Calculation Features
- **Real-time calculation** as user enters data
- **Validation** of input parameters
- **Iteration support** for external pressure calculations
- **X-Chart integration** (CS-1, CS-2, HA-1, etc.)
- **Material stress table lookup**
- **Temperature interpolation** for stress values
- **User-defined overrides** for special cases

### 2.2 Calculation Workflow
1. User enters vessel base data
2. System auto-populates from material database
3. User performs component calculations
4. System validates results (green = pass, red = fail)
5. User saves calculations to global database
6. Calculations available for other sections (heads, nozzles, executive summary)

### 2.3 Data Persistence
- **Global database** for vessel data
- **Cross-reference** between sections
- **Update propagation** when base data changes
- **Calculation history** tracking
- **Version control** for report revisions

---

## 3. REPORT GENERATION REQUIREMENTS

### 3.1 Report Output Formats
- **PDF** (primary format)
- **Print-ready** formatting
- **Professional layout** with company branding
- **Section numbering** and table of contents
- **Page headers/footers** with report metadata

### 3.2 Report Content Structure
```
1.0 Executive Summary
2.0 Vessel Identification and Data
3.0 Inspection Scope and Methods
4.0 Component Calculations
    4.1 Shell Calculations
    4.2 Head Calculations
    4.3 Nozzle Calculations
5.0 Vessel Data Summary Table
6.0 Ultrasonic Thickness Measurements
7.0 Inspection Findings
8.0 Recommendations
9.0 Fitness-for-Service Assessment (API 579)
10.0 In-Lieu-Of Internal Inspection Qualification (API 510 Section 6.4)
11.0 Inspection Photos
12.0 Inspection Checklist
Appendix A: Calculation Details
Appendix B: X-Charts Referenced
Appendix C: Material Specifications
```

### 3.3 Report Templates
- **Full Technical Report** - All sections
- **Executive Summary Only** - Sections 1, 7, 8
- **Client Summary** - Sections 1, 2, 6, 7, 8, 11
- **Technical Only** - Sections 2, 4, 5, 6, 9, 10
- **Compliance Report** - Sections 1, 2, 4, 9, 10, 12
- **Custom Template** - User-selectable sections

### 3.4 Report Generation Features
- **Section filtering** based on template
- **Automatic page numbering**
- **Cross-references** between sections
- **Calculation result embedding**
- **Photo/diagram inclusion**
- **Watermarking** (Draft/Final/Confidential)
- **Digital signatures** (future enhancement)

---

## 4. DATA IMPORT/EXPORT REQUIREMENTS

### 4.1 Import Sources
- **Docupipe API** - Existing implementation
- **Manus Parser** - Existing implementation
- **Manual entry** - Form-based input
- **Excel/CSV import** - Thickness data, vessel data
- **Previous reports** - Historical data

### 4.2 Export Formats
- **PDF** - Primary report format
- **Excel** - Calculation worksheets
- **CSV** - Thickness data, findings
- **JSON** - API integration
- **AutoCAD DWG** - Vessel drawings (optional)

---

## 5. USER INTERFACE REQUIREMENTS

### 5.1 Navigation Structure
- **Dashboard** - Active inspections list
- **Inspection Detail** - Tabbed interface
  - Report Info
  - Calculations
  - Findings
  - Recommendations
  - Photos
  - Checklist
  - FFS Assessment
  - In-Lieu-Of Qualification

### 5.2 Calculation Interface
- **Step-by-step wizard** for complex calculations
- **Variable definitions** accessible via tooltip/modal
- **X-Chart viewer** integrated into calculation flow
- **Material selector** with search/filter
- **Validation indicators** (green/red highlighting)
- **Save prompts** before navigation
- **Calculation history** view

### 5.3 Data Entry Features
- **Auto-save** on field blur
- **Validation** on input
- **Unit conversion** support
- **Copy from previous** inspection
- **Bulk import** for thickness data
- **Photo upload** with drag-drop

---

## 6. VALIDATION & COMPLIANCE REQUIREMENTS

### 6.1 Calculation Validation
- **Range checks** on input values
- **Formula verification** against ASME code
- **Result reasonableness** checks
- **Iteration convergence** monitoring
- **User override** with justification required

### 6.2 Code Compliance
- **ASME Section VIII Division 1** - Pressure vessel design
- **API 510** - Pressure vessel inspection
- **API 579-1/ASME FFS-1** - Fitness-for-Service
- **ASME Section II Part D** - Material properties
- **ASME UG-27, UG-45** - Nozzle requirements

### 6.3 Audit Trail
- **Calculation history** with timestamps
- **User attribution** for all changes
- **Version control** for reports
- **Change log** for critical data
- **Approval workflow** (future enhancement)

---

## 7. CURRENT IMPLEMENTATION STATUS

### 7.1 ✅ Completed Features
- Basic vessel data entry
- Dual parser integration (Docupipe + Manus)
- Multi-source import capability
- Component calculations (shell, head, nozzle)
- Thickness readings management
- Findings section
- Recommendations section
- Photos section
- Checklist section
- FFS Assessment section (UI + backend + PDF)
- In-Lieu-Of section (UI + backend + PDF)
- Professional PDF generation
- Customizable report templates
- Section filtering for reports

### 7.2 ⚠️ Partially Implemented
- External pressure calculations (needs X-Chart integration)
- Material database (needs expansion)
- Nozzle evaluation table (needs UI enhancement)
- Calculation iteration workflow (needs UX improvement)

### 7.3 ❌ Missing Features
- X-Chart viewer/integration
- Material stress table lookup automation
- Calculation wizard/step-by-step guide
- AutoCAD drawing integration
- Excel/CSV import for thickness data
- Bulk nozzle evaluation
- Historical data trending
- Approval workflow
- Digital signatures

---

## 8. PRIORITY IMPLEMENTATION ROADMAP

### Phase 1: Critical Calculations (Current)
1. ✅ Fix FFS and In-Lieu-Of save persistence
2. ⚠️ Implement X-Chart lookup system
3. ⚠️ Add material stress table automation
4. ⚠️ Build external pressure iteration workflow
5. ⚠️ Create nozzle evaluation table UI

### Phase 2: Data Management
1. Excel/CSV import for thickness data
2. Historical data trending charts
3. Calculation history viewer
4. Copy from previous inspection
5. Bulk data operations

### Phase 3: Advanced Features
1. AutoCAD drawing integration
2. Calculation wizard/guided workflow
3. Variable definitions help system
4. X-Chart interactive viewer
5. Material database expansion

### Phase 4: Workflow & Compliance
1. Approval workflow
2. Digital signatures
3. Audit trail enhancements
4. User role management
5. Compliance reporting

---

## 9. TESTING REQUIREMENTS

### 9.1 Calculation Verification
- **Test cases** for each calculation type
- **Comparison** with manual calculations
- **Edge cases** (vacuum, high pressure, exotic materials)
- **Iteration convergence** testing
- **X-Chart accuracy** verification

### 9.2 Data Persistence Testing
- **Save/load** for all sections
- **Cross-section** data integrity
- **Report generation** with all combinations
- **Import/export** round-trip testing
- **Concurrent user** scenarios

### 9.3 Report Quality Testing
- **PDF rendering** accuracy
- **Section filtering** correctness
- **Calculation embedding** verification
- **Photo/diagram** placement
- **Page break** optimization

---

## 10. NOTES & SPECIAL CONSIDERATIONS

### 10.1 Design Code Variations
- Pre-1999 vessels use 4x safety factor (98 S)
- Post-1999 vessels use 3.5x safety factor (00 S)
- User can switch between codes for remaining life optimization
- Must document which code was used in report

### 10.2 Joint Efficiency (E)
- E = 1.0 for RT-1 or RT-2 stamped vessels
- E = 0.85 for non-RT or Category A/B welds (Type 3,4,5,6)
- Many existing vessels designed with E=1 regardless of RT
- User must verify from U1 data sheet

### 10.3 External Pressure Special Cases
- Full vacuum = 15 psi external pressure
- Jacketed vessels: External Pressure = Int. Vacuum + Jacket MAWP
- Requires iterative calculation with X-Charts
- Must converge to calculated Pa ≥ design Pa

### 10.4 Temperature Considerations
- User may need to discuss temperature variances with Operations
- Vessel may operate at lower temperature than design
- Affects allowable stress values
- Impacts remaining life calculations

### 10.5 User-Defined Overrides
- Alternate tmin (yellow cell in remaining life box)
- Alternate corrosion rate (yellow cell in remaining life box)
- Custom material entry
- Manual X-Chart value entry
- All overrides must be documented in report

---

## END OF REQUIREMENTS DOCUMENT

**Document Version:** 1.0  
**Last Updated:** Based on API510InspectionReportBuilderR1.pdf  
**Status:** Comprehensive requirements captured for full implementation

