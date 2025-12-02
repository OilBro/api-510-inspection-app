# API 510 Inspection App - Implementation Checklist

## Database Schema
- [x] Inspections table
- [x] Calculations table
- [x] TML readings table
- [x] External inspections table
- [x] Internal inspections table
- [x] Nozzle evaluations table
- [x] Professional reports table
- [x] Photos table
- [x] Field mappings table
- [x] Unmatched data table
- [x] Imported files table

## Server-Side Features
- [x] Inspection CRUD operations
- [x] Calculation engine (thickness, MAWP, remaining life)
- [x] TML reading management
- [x] Nozzle evaluation system
- [x] Professional report generation
- [x] PDF export functionality
- [x] Excel/PDF import parsers
- [x] Photo upload and storage
- [x] Field mapping system
- [x] Report comparison

## Client-Side Features
- [x] Home page/dashboard
- [x] Inspection list view
- [x] Inspection detail view
- [x] New inspection form
- [x] Vessel data tab
- [x] Calculations tab
- [x] Thickness analysis tab
- [x] Professional report tab
- [x] Photos section with annotation
- [x] Nozzle evaluation section
- [x] FFS assessment section
- [x] In-lieu-of inspection section
- [x] Findings section
- [x] Recommendations section
- [x] Data import interface
- [x] Report comparison view

## Shared Code
- [x] Constants and types
- [x] Nozzle standards
- [x] Photo templates
- [x] Error handling

## Testing & Deployment
- [ ] Test all calculations
- [ ] Test photo upload
- [ ] Test PDF generation
- [ ] Test data import
- [x] Create deployment checkpoint
- [x] Configure DOCUPIPE integration

## Integrations Configured
- [x] DOCUPIPE API Key configured and validated
- [x] DOCUPIPE Schema ID configured (qhJtc0co)
- [x] Manus LLM parser (built-in)

## Known Issues
- Some TypeScript type warnings (non-critical)
- Some LLM message content type mismatches (non-critical)

## Bugs to Fix
- [ ] Complete flexible PDF parser integration (parser created, needs router integration)
- [ ] Fix TML readings insertion to handle variable PDF field names

## New Feature: Intelligent PDF Import System
- [x] Create flexible PDF parser (two-stage: extract + map)
- [x] Implement AI-powered field mapping using LLM
- [x] Add confidence scores for AI mappings
- [ ] Integrate flexible parser into PDF import router
- [ ] Handle variable field names in TML readings mapping
- [ ] Create "Unmatched Data" review interface
- [ ] Add dropdown field selector for manual data mapping
- [ ] Implement learning system to store successful mappings
- [ ] Support incremental data import from multiple sources

## Urgent Bugs
- [x] Fix missing pdfjs-dist dependency for Manus PDF parser

- [x] Fix TML readings database insertion - values showing as 'default' instead of actual parsed data (fixed in routers.ts line 686-688)

- [ ] Investigate why code changes to TML insert aren't taking effect (possible caching/build issue)

- [x] Add status field to TML record creation (set to 'good' by default)
- [x] Add field length truncation to prevent 'Data too long' errors

- [x] Fix Professional Report tab error after PDF import (added missing userId field)

- [x] Add missing userId column to professionalReports table in database schema

## Sentry Integration
- [ ] Install Sentry SDK packages
- [ ] Configure Sentry DSN in environment
- [ ] Add Sentry initialization to server
- [ ] Add Sentry initialization to client
- [ ] Test error capture
- [ ] Use Sentry to debug Professional Report error

## Professional Report Issues
- [ ] Fix executive summary Table A to display previous thickness values instead of dashes
- [ ] Verify PDF import captures previousThickness field correctly
- [ ] Ensure executive summary pulls data from correct TML reading fields

## Vision LLM PDF Parsing for Scanned Documents
- [x] Install pdf-to-image conversion library (pdf2pic)
- [x] Install GraphicsMagick system package
- [x] Create vision LLM parser that converts PDF pages to images
- [x] Send images to GPT-4 Vision for data extraction
- [x] Update PDF import router to use vision parser
- [ ] Test with scanned PDFs containing thickness measurement tables
- [ ] Verify previousThickness values are correctly extracted

## UI Fix - Vision Parser Missing from Dropdown
- [x] Add "Vision Parser" option to import page parser selection dropdown

## Vision Parser PDF Conversion Error
- [x] Fix "Failed to convert PDF pages to images" error in vision parser
- [x] Verify GraphicsMagick is properly configured
- [x] Test pdf2pic library integration
- [x] Replace pdf2pic with pure JavaScript solution (pdfjs-dist) for production compatibility

## PDF Import Auto-Population Issue
- [x] Investigate why imported data doesn't auto-populate Calculations page
- [x] Add auto-creation of calculations record during PDF import
- [ ] Investigate why imported data doesn't auto-populate Nozzles page
- [ ] Add auto-creation of nozzle records when nozzle data is in PDF
- [ ] Ensure vessel data, TML readings, and nozzle data are properly linked

## Publishing Issue
- [x] Fix timestamp-related error during publishing (removed canvas library with native dependencies)
- [x] Rewrite vision parser to upload PDF to S3 and send URL to LLM instead of rendering locally

## Vision Parser Error
- [x] Fix "Cannot read properties of undefined (reading '0')" error in vision parser
- [x] Add proper error handling for LLM response
- [x] Add detailed logging to diagnose LLM request/response issues
- [x] LLM doesn't support PDF via file_url - need to convert PDF to images first
- [x] Use pdf-to-png-converter library to convert PDF pages to images
- [x] Upload images to S3 and send image URLs to vision LLM

## Vision Parser Page Limit
- [x] Increase vision parser page limit from 10 to 50 pages

## PDF to PNG Conversion Issue
- [ ] pdf-to-png-converter requires system dependencies (poppler) not available in production
- [ ] Need pure JavaScript PDF rendering solution
- [ ] Consider using pdfjs-dist with node-canvas-webgl or similar

## Parser Enhancement for Previous Thickness
- [x] Investigate what data Docupipe parser currently extracts
- [x] Investigate what data Manus parser currently extracts
- [x] Add extraction logic for previous thickness values
- [x] Add extraction logic for other missing TML fields (cmlNumber, tmlId, nominalThickness, tml1-4, etc.)
- [x] Enhanced LLM prompt to specifically target previous thickness extraction
- [ ] Test with real inspection PDFs

## Auto-populate Calculations and Nozzles from Import
- [x] Update PDF import to populate calculations record with vessel data (pressure, temperature, material spec, corrosion allowance, etc.)
- [ ] Extract nozzle data from PDFs if present
- [ ] Create nozzle evaluation records during import
- [ ] Test that all three pages (Report Data, Calculations, Nozzles) populate after import

## Debug Calculations Not Populating
- [x] Check server logs to see if calculations record is being created
- [x] Verify calculations record exists in database (confirmed: it does)
- [x] Discovered: Professional Report Calculations uses componentCalculations table, not calculations table
- [x] Create componentCalculations record during PDF import (linked to professional report)
- [x] Auto-create professional report if it doesn't exist during import
- [x] Populate component calculation with material spec and thickness averages from TML readings
- [ ] Remove Docupipe parser option from UI (user converting all PDFs to text-based)
- [ ] Test that enhanced calculations show up with all fields populated

## Component Calculation Formulas
- [x] Calculate minimum thickness using ASME formula (P*R/(S*E-0.6*P) + CA)
- [x] Calculate corrosion rate from previous and current thickness
- [x] Calculate remaining life from corrosion rate and current thickness
- [x] Set next inspection interval (half of remaining life or 5 years default)
- [ ] Test calculations with real imported PDF data

## Fix Minimum Thickness Calculation
- [ ] Debug why minimum thickness calculation is incorrect
- [ ] Verify ASME Section VIII formula is correct
- [ ] Check if corrosion allowance should be included or separate

## Add Nozzle Auto-Population
- [x] Enhance PDF parser to extract nozzle data
- [x] Add nozzles array to ParsedVesselData interface
- [x] Add nozzles to LLM extraction schema
- [x] Update LLM prompt to extract nozzle information
- [x] Create nozzle evaluation records during import
- [x] Add createNozzleEvaluation function to db.ts
- [x] Add nozzle creation logic to PDF import flow
- [ ] Test nozzle data shows in Nozzles tab

## Fix Calculation Accuracy to Professional Standards
- [x] Fix shell minimum thickness formula: t_min = PR/(SE - 0.6P)
- [ ] Fix torispherical head minimum thickness formula: t_min = PLM/(2SE - 0.2P)
- [x] Save inspection date from PDF import
- [ ] Calculate actual time between inspections from dates (currently using 10-year default)
- [x] Fix corrosion rate calculation: Cr = (t_prev - t_act) / Years
- [x] Fix remaining life calculation: RL = Ca / Cr where Ca = t_act - t_min
- [ ] Fix MAWP at next inspection projection
- [ ] Add support for importing updated UT readings to existing inspections
- [ ] Calculate separate component calculations for shell, east head, west head
- [ ] Flag components below minimum thickness as critical findings

## Vessel Matching for Updated UT Readings
- [x] Check if vessel tag matching logic exists in import flow
- [x] When importing, look for existing inspection with same vessel tag number
- [x] If found, update existing inspection instead of creating new one
- [x] Add new TML readings to existing inspection (don't replace old ones)
- [ ] Calculate time between inspections using inspection dates
- [ ] Test with 2017 baseline report and 2025 UT readings

## Match Professional Report Calculations
- [x] Formula correct: t_min = PR/(SE - 0.6P)
- [x] Fixed S=20000 psi, E=0.85
- [ ] Fix pressure to include static head (262.4 psi not 250 psi)
- [ ] Fix radius (should be 36.375 inches not 35.5 inches)
- [ ] Create separate calculations for Shell, East Head, West Head
- [ ] Use actual years between inspections (8.26 years for 2017→2025)
- [ ] Extract head type (ellipsoidal) and use correct formula
- [ ] Test with 2017 baseline + 2025 UT readings

## Debug 2025 UT Readings Upload Error
- [ ] Check server logs for error message
- [ ] Identify what's causing the upload failure
- [ ] Fix the error
- [ ] Test uploading 2017 baseline + 2025 UT readings successfully

## New UT Results Upload Feature
- [x] Create UI for uploading new UT results to existing reports
- [x] Add report selection dropdown/interface for choosing target report
- [x] Backend procedure to accept UT data and target report ID
- [x] Parse uploaded UT data (PDF/Excel) and extract thickness readings
- [x] Add new TML readings to selected report (append, don't replace)
- [ ] Recalculate component calculations with new UT data
- [ ] Update corrosion rates using time between inspections
- [ ] Update remaining life calculations based on new readings
- [ ] Show before/after comparison of thickness readings
- [ ] Test with 2017 baseline report + 2025 UT readings scenario

## UT Upload Bugs to Fix
- [x] Fix contentType error in file upload (missing parameter in mutation call)
- [x] Improve UT data parsing to correctly extract CML numbers and locations
- [x] Implement intelligent CML matching to link new readings with existing TML records
- [x] Update existing TML records instead of creating duplicates when CML matches
- [x] Calculate corrosion rates using actual time between inspection dates
- [ ] Test with real UT upload PDFs to validate parsing accuracy

## P0 - Critical Issues (Must Fix Immediately)
- [x] Fix Executive Summary table - show Nominal Thickness (not Previous), Min Required, Calculated MAWP columns
- [x] Fix Executive Summary - Vessel Shell actual thickness showing blank (now pulls from component calculations)
- [ ] Fix head MAWP calculations - East Head should be 263.9 psi (PDF has internal inconsistencies, see CALCULATION_ANALYSIS.md)
- [ ] Fix head MAWP calculations - West Head should be 262.5 psi (PDF has internal inconsistencies, see CALCULATION_ANALYSIS.md)
- [ ] Fix minimum required thickness for heads - should be 0.500" (depends on E value, see CALCULATION_ANALYSIS.md)
- [ ] Fix remaining life for East Head - should be >13 years (depends on correct thickness values)
- [ ] Fix remaining life for West Head - should be >15 years (depends on correct thickness values)

## P1 - High Priority Data Issues
- [ ] Fix PDF extraction to correctly parse multi-page thickness tables
- [x] Fix CML duplicate entries in thickness measurements
- [ ] Organize thickness readings by component type (Shell, East Head, West Head, Nozzles)
- [ ] Extract nozzle sizes from descriptions (24", 3", 2", 1")
- [ ] Extract nozzle types (Manway, Relief, Vapor Out, Sight Gauge, Reactor Feed, Gauge, Vapor In, Out)
- [x] Add missing vessel data fields: MDMT, Operating Temp, Product, Construction Code, Vessel Config, Head Type, Insulation
- [ ] Fix component name truncation ("Vessel..." should show full "Vessel Shell")
- [ ] Add tmin column to thickness measurements table
- [ ] Calculate and display corrosion rates in thickness table

## P2 - Medium Priority Quality Issues
- [ ] Extract Section 3.0 Inspection Results (Foundation, Shell, Heads, Appurtenances findings)
- [ ] Extract Section 4.0 Recommendations from PDF
- [ ] Add references to Appendices A-G
- [ ] Improve CML matching logic to handle multi-angle readings per CML
- [ ] Group East Head seam readings (CML 6-7) separately from spot readings
- [ ] Group West Head seam readings (CML 16-17) separately from spot readings
- [ ] Add East Head spot readings by clock position (12, 3, 6, 9 o'clock)
- [ ] Add West Head spot readings by clock position (12, 3, 6, 9 o'clock)

## P3 - Low Priority Enhancements
- [ ] Extract and display photographs from PDF
- [ ] Extract inspection checklist items
- [ ] Add manufacturer data sheet references
- [ ] Improve report formatting to match professional PDF layout
- [ ] Add thickness trend charts/visualizations

## P0 - CRITICAL BUGS (User Reported)
- [x] Fix "View Report" button showing "Error: Page Not Found" after PDF import
- [x] Implement proper nozzle evaluation table format (one row per nozzle with calculations, not all TML readings)
- [x] Fix missing data (dashes) in Manus import - enhanced extraction prompt with specific guidelines
- [x] Nozzle table should use minimum thickness from all readings for calculations
- [x] Nozzle table needs columns: CML, Noz ID, Size, Material, Age, t prev, t act, t min, Ca, Cr, RL
- [x] Automatically create nozzle records from TML readings with nozzle keywords (Manway, Relief, etc.)

## P0 - URGENT: Missing Data in Generated PDF (User Reported)
- [x] Analyze generated PDF to identify all fields showing dashes instead of actual data
- [x] Fix PDF generator to pull all available data from inspection record
- [x] Ensure Manus import parser extracts all fields from source PDF
- [x] Verify vessel metadata (MDMT, Operating Temp, Product, etc.) displays correctly
- [x] Check component calculations populate properly in executive summary - added East Head and West Head calculations
- [x] Validate nozzle table shows all extracted nozzle data

## P0 - COMPREHENSIVE FIXES (All Remaining Issues)
- [x] Add "Recalculate" button to regenerate component calculations for existing inspections
- [x] Fix Shell Evaluation header table - populate Report No., Client, Inspector, Date from inspection data
- [x] Fix Nozzle Evaluation header table - populate Report No., Client, Inspector, Vessel, Date
- [x] Fix all PDF header tables to use actual inspection data instead of dashes
- [ ] Verify all vessel metadata fields display correctly in PDF (MDMT, Operating Temp, Product, etc.)
- [ ] Test complete import → generate PDF workflow with user's actual PDF
- [ ] Validate TABLE A shows all three components with calculated values (no dashes)
- [ ] Ensure nozzle table displays properly with calculations
- [ ] Fix any remaining calculation accuracy issues

## P0 - URGENT: Add Recalculate Button UI
- [x] Add "Recalculate" button to inspection detail page
- [x] Wire button to professionalReport.recalculate mutation
- [x] Show loading state during recalculation
- [x] Show success/error toast after recalculation
- [x] Refresh component calculations display after recalculation
- [x] Analyze user's PDF to identify remaining dash issues
- [x] Fix any remaining data fields showing dashes - added clientName extraction during import

## P0 - CRITICAL: Fix Recalculate Button Error
- [x] Fix "handleRecalculate is not defined" error in ComponentCalculationsSection
- [x] Ensure recalculate mutation and state are properly defined in component scope
- [ ] Test recalculate button click functionality

## P0 - CRITICAL: Fix Recalculate Parameter Mismatch
- [x] Fix recalculate mutation - expects inspectionId but receiving reportId
- [x] Get inspectionId from report data and pass to recalculate mutation
- [ ] Test recalculate button with correct parameters

## P1 - PDF Comparison View Feature
- [x] Design side-by-side comparison layout (original PDF on left, generated report on right)
- [x] Create PDFComparisonView component with split-screen layout
- [x] Add backend procedure to retrieve original uploaded PDF URL from imported files
- [x] Integrate comparison view as new tab in Professional Report section
- [x] Add zoom and sync scroll functionality for easier comparison
- [ ] Test comparison view with real inspection data

## P0 - CRITICAL FIXES (User Analysis)
- [x] Fix PDF generation "String not matching" error - addTable call in generateNozzleEvaluation passing widths array instead of title string
- [x] Add previousThickness field to Zod schema in AI import to prevent data loss
- [x] Sanitize inputs in addTable toStr helper to prevent crashes from non-ASCII characters
- [x] Fix t_next calculation logic - currently using 2*Yn*Cr, should be Yn*Cr

## P0 - COMPREHENSIVE FIXES (User Document)
- [x] Fix data linkage - findings/recommendations saved under inspectionId but PDF looks for reportId
- [x] Update getInspectionFindings to check both reportId and inspectionId
- [x] Update getRecommendations to check both reportId and inspectionId
- [ ] Prevent duplicates on import - clear existing data before inserting new data
- [x] Auto-generate component calculations after import
- [x] Add generateDefaultCalculations helper function
- [ ] Update PDF generator to handle missing data gracefully
- [ ] Fix nozzle evaluation table generation
## P0 - FINAL TASKS (User Request)
- [x] Push comprehensive fixes to GitHub repository
- [x] Implement duplicate prevention - delete existing data before re-import
- [ ] Test PDF import with 54-11-0672025REVIEW.pdf using AI parser
- [ ] Test PDF import with 54-11-0672025REVIEW.pdf using Manus parser
- [ ] Validate findings appear in reports
- [ ] Validate component calculations auto-generate
- [ ] Validate all data displays correctly in generated PDFs

## P0 - CALCULATION VALIDATION DASHBOARD
- [x] Create backend procedure to extract PDF original values
- [x] Create backend procedure to get app-calculated values
- [x] Create comparison logic with discrepancy detection
- [x] Build ValidationDashboard page component
- [x] Add side-by-side comparison tables for Shell, East Head, West Head
- [x] Add color-coded indicators for discrepancies (green=match, yellow=minor, red=major)
- [x] Display comparison for: t_min, MAWP, corrosion rate, remaining life
- [x] Add navigation link from Professional Report tab
- [ ] Test with real inspection data
- [ ] Add manual PDF value entry interface for inspections without stored PDF data

## P0 - AUDIT FIXES (Critical Issues from Comprehensive Audit)
- [x] Fix TypeScript error: professionalReportRouters.ts line 742 - add type annotations to sort function parameters
- [x] Fix TypeScript error: routers.ts line 469 - correct updateInternalInspection function name mismatch
- [x] Fix TypeScript error: routers.ts line 578 - resolve number vs string type mismatch
- [x] Implement auto-extraction of PDF original calculation values (TABLE A) during import
- [x] Add pdfOriginalValues field to componentCalculations table to store PDF values for validation
- [x] Modify PDF import to parse and store original t_min, MAWP, CR, RL from TABLE A
- [ ] Update validation dashboard to auto-populate PDF values from database instead of manual entry
- [ ] Add static head pressure calculation based on vessel orientation (horizontal/vertical)
- [ ] Include static head in MAWP calculations for horizontal vessels
- [ ] Verify Shell t_min formula matches ASME: PR/(SE - 0.6P)
- [ ] Verify Head t_min formula matches ASME: PR/(2SE - 0.2P) for 2:1 ellipsoidal
- [ ] Verify Shell MAWP formula: (SE × t)/(R + 0.6t)
- [ ] Verify Head MAWP formula: (2SE × t)/(R + 0.2t)
- [ ] Add allowable stress (S) lookup table for SA-240 304 SS at various temperatures
- [ ] Test calculation accuracy against 54-11-067 expected values (Shell: 307.5 psi, East Head: 263.9 psi, West Head: 262.5 psi)
- [ ] Create unit tests for each calculation formula with known values

## P0 - REMAINING AUDIT FIXES (User Requested)
- [x] Update ValidationDashboard.tsx to fetch PDF original values from database
- [x] Remove manual PDF value entry form from validation dashboard
- [x] Display auto-populated PDF values in comparison tables
- [x] Calculate static head pressure: P_static = (ρ × g × h) / 144 for horizontal vessels
- [x] Add static head to design pressure in MAWP calculations
- [x] Review Shell t_min formula: t = PR/(SE - 0.6P) + CA
- [x] Review Head t_min formula: t = PR/(2SE - 0.2P) + CA for 2:1 ellipsoidal
- [x] Review Shell MAWP formula: MAWP = (SE × t)/(R + 0.6t)
- [x] Review Head MAWP formula: MAWP = (2SE × t)/(D + 0.2t)
- [x] Test calculations against 54-11-067 expected: Shell 307.5 psi, East Head 263.9 psi, West Head 262.5 psi
- [x] Add allowable stress lookup for SA-240 304 SS at 200°F
- [x] Verify joint efficiency E = 0.85 is correctly applied

## P0 - CRITICAL BUG: Data Isolation Issue (User Reported)
- [x] Fix PDF generator showing data from different vessel/report in heads section
- [x] Investigate where component calculations are being queried incorrectly
- [x] Ensure all queries filter by correct reportId/inspectionId
- [x] Add validation to prevent cross-contamination between reports
- [ ] Test with multiple vessels to verify data isolation

**Root Cause:** Component calculations were not being automatically generated when creating professional reports. Added generateDefaultCalculationsForInspection() calls to both report creation paths.

## P0 - API 510 COMPLIANCE REVIEW (Based on Diagnostic Guide)
- [x] Fix Next Inspection Date calculation: lesser of 10 years OR 1/2 remaining life
- [ ] Verify component type detection (shell vs head) before applying formulas
- [x] Add missing nameplate fields: Manufacturer, Serial Number, Year Built
- [x] Ensure Material Specification field exists and determines Allowable Stress (S)
- [x] Verify Joint Efficiency (E) field exists with range 0.6-1.0 based on radiography
- [ ] Check database field types: ensure t_min, corrosion_rate use DECIMAL not INT
- [ ] Verify short-term vs long-term corrosion rate logic
- [ ] Ensure t_required calculation uses MAWP not arbitrary limits
- [ ] Add all required API 510 reporting fields to inspection form
- [ ] Verify head type formulas: Ellipsoidal, Torispherical, Hemispherical
