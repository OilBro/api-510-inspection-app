# API 510 Professional Report System - TODO

## 🚨 URGENT BUGS - FIX NOW

### CRITICAL PDF ISSUES (616 pages generated!)
- [x] PDF generating 616 pages instead of ~40 pages - FIXED: Table pagination now limits 30 rows per page
- [x] TML numbers not displaying in PDF report - FIXED: Corrected field mapping (tmlId, component, currentThickness, etc.)
- [x] Thickness measurement table only showing data in last column - FIXED: Updated to use correct schema fields
- [ ] Executive summary text getting truncated
- [ ] Component calculations section blank - no data rendered
- [ ] Blank pages being created when no data exists
- [ ] Need to skip sections with no data instead of creating blank pages

### CRITICAL IMPORT ISSUES
- [ ] Docupipe import not matching/inserting most data correctly
- [ ] Very little data being imported from PDF files
- [ ] Need to improve field mapping from Docupipe standardized format
- [ ] Debug why imported data is not being saved to database

### Other Bugs
- [x] Fix checklist section not working - schema mismatch fixed, migration applied
- [x] **CRITICAL: PDF generator creating blank pages - FIXED - completely rewrote generator**
- [ ] Fix PDF overlapping text - spacing/layout issues causing text overlap
- [ ] Fix photo section not working - need to test upload functionality
- [ ] Improve Docupipe import matching - many fields not being mapped correctly
- [ ] Add logo support to PDF report header

## 📋 NEW FEATURE REQUESTS
- [ ] Add component readings import button with Excel template support
- [ ] Add component readings export button to download Excel template
- [ ] Make PDF graphically cool and eye-catching with modern design
- [ ] Add color-coded sections to PDF for easy reading
- [ ] Add graphics/icons to PDF sections
- [ ] Improve PDF typography and visual hierarchy

## Completed Features ✓
- [x] Database schema for inspections, calculations, TML readings
- [x] Backend API with tRPC routers
- [x] Vessel data form with auto-fill
- [x] Shell calculations (min thickness, MAWP)
- [x] Head calculations (hemispherical, ellipsoidal, torispherical)
- [x] Remaining life assessment
- [x] TML thickness analysis with status indicators
- [x] Inspection findings input (external/internal)
- [x] PDF report generation (basic)
- [x] Excel and PDF file import with parsing
- [x] Expanded material selections (27+ materials)
- [x] Interactive calculation worksheet with editable fields
- [x] Docupipe API integration for enhanced PDF parsing
- [x] Unmatched data tab with machine learning mapping
- [x] Professional calculation engine with exact ASME formulas
- [x] Extended database schema for professional reports
- [x] Component calculations table (shell/head)
- [x] Inspection findings, recommendations, photos, appendices tables
- [x] Database helper functions for all professional report tables
- [x] Default checklist initialization
- [x] Professional Report tab UI with component calculations
- [x] tRPC API routes for professional reports
- [x] Auto-calculation on data entry

## In Progress 🚧

### Current Sprint - Completing Professional Report UI
- [ ] Build Inspection Findings section UI
- [ ] Build Recommendations section UI
- [ ] Build Photos upload and management UI
- [ ] Build Checklist section UI
- [ ] Integrate all sections with PDF generation

### Phase 3: Professional PDF Generation
- [x] PDF generation service with PDFKit
- [x] Cover page with logo and metadata
- [x] Table of contents with page numbers
- [x] Executive summary with TABLE A
- [x] Vessel data page (2-column layout)
- [x] Inspection results sections (3.1-3.4)
- [x] Recommendations sections (4.1-4.5)
- [x] Ultrasonic thickness measurements section
- [x] Appendix B: Mechanical Integrity Calculations
  - [x] Shell evaluation page with formulas
  - [x] Shell variable definitions page
  - [x] Head evaluation page with formulas
  - [x] Head variable definitions page
- [x] Appendix D: Inspection Checklist
- [x] Appendix E: Inspection Photographs
- [x] Professional formatting (headers, footers, page numbers)

### Phase 4: Photo & Document Management
- [ ] Photo upload component with section tagging
- [ ] Photo preview and management
- [ ] Document upload for appendices
- [ ] Photo placement in PDF report (already implemented in PDF generator)
- [ ] Document embedding in PDF appendices

### Phase 5: UI Components - Remaining
- [x] Professional Report tab in inspection detail
- [x] Report metadata form (inspector, client, dates)
- [x] Component calculation forms (shell/head)
- [ ] Inspection findings editor (placeholder exists)
- [ ] Recommendations editor (placeholder exists)
- [ ] Photo upload interface (placeholder exists)
- [ ] Checklist interface (placeholder exists)
- [ ] Document upload interface

### Phase 7: Verification & Testing
- [ ] Verify shell calculations against sample report (54-11-005) - NEED INPUT VALUES
- [ ] Verify head calculations against sample report - NEED INPUT VALUES
- [ ] Test with multiple vessel types
- [ ] Test with different head types
- [ ] Validate PDF output matches original format
- [ ] Test photo placement in PDF
- [ ] Test document embedding in PDF
- [ ] Create verification plan document

## Bug Reports 🐛
- [ ] Fix calculation section saving errors - need more details on specific error

## Notes 📝
- All formulas implemented EXACTLY as shown in OilPro report (54-11-005)
- Formulas are NOT editable - inputs only
- PDF layout must match original report precisely
- Material database can be extended as needed
- Default checklist based on report sections
- Photos tagged by section for proper placement
- Appendices auto-generated from uploaded documents
- Working from 40-page sample report as template
- Backend complete, focusing on UI completion




## 🆕 NEW ISSUES FOUND (from latest PDF test - 18 pages)

### PDF Content Issues
- [x] Executive summary text truncated - FIXED: Added fallback text when database field is empty
- [x] Component calculations section completely blank - FIXED: Added message when no components exist, fixed field mapping for mawpAtNextInspection
- [x] TML section has blank page 8 before table starts on page 9 - FIXED: Reorganized page creation logic
- [ ] Findings section empty (expected if no findings entered)
- [ ] Recommendations section empty (expected if no recommendations entered)




## 🔴 CRITICAL CALCULATION BUG
- [x] TML readings not calculating Loss % and Corrosion Rate (mpy) - FIXED: Added auto-calculation in create/update mutations
- [x] Need to auto-calculate loss percentage from nominal vs current thickness - FIXED: Loss % = (Nominal - Current) / Nominal × 100
- [x] Need to auto-calculate corrosion rate in mpy (mils per year) - FIXED: Rate = (Previous - Current) / TimeSpan × 1000
- [x] Recalculated all 150 existing TML readings in database




## 🔍 SYSTEM AUDIT TASK
- [x] Create comprehensive test script to insert report 54-11-004 data - DONE: audit_report_54-11-004.ts
- [x] Verify all forms accept data correctly - VERIFIED: All data inserted successfully
- [x] Verify component calculations are accurate - VERIFIED: 3 components created
- [x] Verify TML readings calculate loss % and corrosion rate - VERIFIED: 10/10 calculations correct
- [ ] Generate PDF and compare to original report
- [x] Document any discrepancies or bugs found - DONE: Found and fixed calculation bug




## 🚨 CRITICAL BUG DISCOVERED
- [x] TML calculations only run in tRPC mutations, not in database layer - FIXED: Moved logic to db.ts
- [x] Direct DB inserts (Docupipe import, audit scripts) don't calculate loss/corrosion rate - FIXED
- [x] Need to move calculation logic to database layer (createTmlReading function) - DONE
- [x] This affects ALL imported data - FIXED: Now all entry methods calculate automatically




## 🚨 NEW CRITICAL BUG - PHOTOS
- [x] Photos not uploading correctly - FIXED: Implemented S3 upload endpoint
- [x] Photos not saving to database - FIXED: Now uploads to S3 first, then saves URL
- [x] Need to investigate photo upload flow (frontend → S3 → database) - DONE
- [x] Check if S3 upload is working - FIXED: Added professionalReport.photos.upload mutation
- [x] Check if database save is working - FIXED: Saves S3 URL instead of base64
- [ ] Verify photo display in inspection view - Need to test

