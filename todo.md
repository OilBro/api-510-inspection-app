# Project TODO

## Completed Features
- [x] Database schema for inspections, calculations, TML readings
- [x] Backend API with tRPC routers
- [x] Vessel data form with auto-fill
- [x] Shell calculations (min thickness, MAWP)
- [x] Head calculations (hemispherical, ellipsoidal, torispherical)
- [x] Remaining life assessment
- [x] TML thickness analysis with status indicators
- [x] Inspection findings input (external/internal)
- [x] PDF report generation
- [x] Excel and PDF file import with parsing
- [x] Expanded material selections (27+ materials)

## New Features to Implement
- [x] Interactive calculation worksheet with editable fields and live recalculation
- [x] Professional report format matching OilPro Consulting template
- [x] Variable definitions and formulas display
- [x] MAWP calculations for next inspection interval
- [x] Corrosion allowance tracking and calculations



## New Feature Request
- [x] Integrate Docupipe API for enhanced PDF parsing and data extraction



## Bug Reports
- [x] Fix "failed to parse" error when uploading files - Added better error handling and graceful fallbacks


- [ ] Debug persistent file parsing error - investigate server logs and error details


- [x] Fix database insertion error when creating inspection from parsed file - handle undefined values properly


- [x] Fix database schema - make optional fields nullable or provide default values


- [x] Integrate Docupipe standardized JSON format for parsing
- [x] Update database schema to match Docupipe standardized fields
- [x] Map thickness readings from Docupipe CML format to app TML format


- [x] Fix PDF report generation - overlapping text issue
- [x] Fix PDF to include all imported data fields
- [ ] Fix calculation section saving errors - need more details on specific error

