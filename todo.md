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
