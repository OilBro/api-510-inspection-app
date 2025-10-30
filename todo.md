# API 510 Professional Report System - TODO

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

### Current Sprint
- [x] Enhance Unmatched Data tab to support mapping to Professional Report fields
- [x] Add Professional Report sections to field mapping dropdown options
- [x] Allow mapping to component calculation fields (material, pressure, diameter, etc.)
- [x] Allow mapping to report metadata fields (inspector, client, dates)

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

