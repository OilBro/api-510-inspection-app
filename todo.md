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

## In Progress 🚧

### Phase 3: Professional PDF Generation (CURRENT)
- [ ] PDF generation service with PDFKit
- [ ] Cover page with logo and metadata
- [ ] Table of contents with page numbers
- [ ] Executive summary with TABLE A
- [ ] Vessel data page (2-column layout)
- [ ] Inspection results sections (3.1-3.4)
- [ ] Recommendations sections (4.1-4.5)
- [ ] Ultrasonic thickness measurements section
- [ ] Appendix B: Mechanical Integrity Calculations
  - [ ] Shell evaluation page with formulas
  - [ ] Shell variable definitions page
  - [ ] Head evaluation page with formulas
  - [ ] Head variable definitions page
- [ ] Appendix D: Inspection Checklist
- [ ] Appendix E: Inspection Photographs
- [ ] Professional formatting (headers, footers, page numbers)

### Phase 4: Photo & Document Management
- [ ] Photo upload component with section tagging
- [ ] Photo preview and management
- [ ] Document upload for appendices
- [ ] Photo placement in PDF report
- [ ] Document embedding in PDF appendices

### Phase 5: UI Components
- [ ] Professional Report tab in inspection detail
- [ ] Report metadata form (inspector, client, dates)
- [ ] Component calculation forms (shell/head)
- [ ] Inspection findings editor
- [ ] Recommendations editor
- [ ] Photo upload interface
- [ ] Checklist interface
- [ ] Document upload interface
- [ ] "Generate Final Report" button

### Phase 6: tRPC API Routes
- [ ] Professional report CRUD operations
- [ ] Component calculation operations
- [ ] Inspection findings operations
- [ ] Recommendations operations
- [ ] Photo upload and management
- [ ] Document upload and management
- [ ] Checklist operations
- [ ] PDF generation endpoint

### Phase 7: Verification & Testing
- [ ] Verify shell calculations against sample report (54-11-005)
- [ ] Verify head calculations against sample report
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

