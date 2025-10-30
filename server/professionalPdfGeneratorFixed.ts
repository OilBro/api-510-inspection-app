/**
 * Professional API 510 Report PDF Generator - FIXED VERSION
 * 
 * Generates a complete professional inspection report with proper content rendering
 */

import PDFDocument from "pdfkit";
import {
  getProfessionalReport,
  getComponentCalculations,
  getInspectionFindings,
  getRecommendations,
  getInspectionPhotos,
  getChecklistItems,
} from "./professionalReportDb";
import { getInspection, getTmlReadings } from "./db";

// ============================================================================
// PDF CONFIGURATION
// ============================================================================

const PAGE_WIDTH = 612; // 8.5 inches
const PAGE_HEIGHT = 792; // 11 inches
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

const COLORS = {
  primary: '#2563eb', // Blue
  secondary: '#64748b', // Slate gray
  border: '#e2e8f0',
  headerBg: '#f8fafc',
  text: '#1e293b',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addHeader(doc: PDFKit.PDFDocument, title: string, pageNum?: number) {
  const startY = doc.y;
  
  // Company name
  doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.primary);
  doc.text('OILPRO CONSULTING LLC', MARGIN, MARGIN);
  
  // Page number
  if (pageNum) {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
    doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN - 60, MARGIN, {
      width: 60,
      align: 'right'
    });
  }
  
  // Title
  if (title) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.text);
    doc.text(title, MARGIN, MARGIN + 20, {
      width: CONTENT_WIDTH,
      align: 'center'
    });
  }
  
  // Separator line
  doc.strokeColor(COLORS.border).lineWidth(1);
  doc.moveTo(MARGIN, MARGIN + 45).lineTo(PAGE_WIDTH - MARGIN, MARGIN + 45).stroke();
  
  doc.y = MARGIN + 55;
  doc.fillColor(COLORS.text);
}

function addSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  checkPageBreak(doc, 40);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLORS.primary);
  doc.text(title, MARGIN, doc.y);
  doc.moveDown(0.5);
  
  // Underline
  const y = doc.y;
  doc.strokeColor(COLORS.primary).lineWidth(2);
  doc.moveTo(MARGIN, y).lineTo(MARGIN + 100, y).stroke();
  doc.moveDown(1);
  doc.fillColor(COLORS.text);
}

function addSubsectionTitle(doc: PDFKit.PDFDocument, title: string) {
  checkPageBreak(doc, 30);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.text);
  doc.text(title, MARGIN, doc.y);
  doc.moveDown(0.5);
}

function addText(doc: PDFKit.PDFDocument, text: string, options: any = {}) {
  checkPageBreak(doc, 20);
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
     .fontSize(options.fontSize || 10)
     .fillColor(COLORS.text);
  doc.text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: options.align || 'left',
    ...options
  });
  if (options.moveDown !== false) {
    doc.moveDown(0.3);
  }
}

function checkPageBreak(doc: PDFKit.PDFDocument, requiredSpace: number) {
  if (doc.y + requiredSpace > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    doc.y = MARGIN + 60; // Start below header space
  }
}

function addTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][]) {
  const colWidth = CONTENT_WIDTH / headers.length;
  let startY = doc.y;
  
  checkPageBreak(doc, 40 + (rows.length * 20));
  
  // Header row
  doc.fillColor(COLORS.headerBg).rect(MARGIN, startY, CONTENT_WIDTH, 25).fill();
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(9);
  
  headers.forEach((header, i) => {
    doc.text(header, MARGIN + (i * colWidth) + 5, startY + 8, {
      width: colWidth - 10,
      align: 'left'
    });
  });
  
  startY += 25;
  
  // Data rows
  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, rowIndex) => {
    const rowY = startY + (rowIndex * 20);
    
    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.fillColor('#f9fafb').rect(MARGIN, rowY, CONTENT_WIDTH, 20).fill();
    }
    
    doc.fillColor(COLORS.text);
    row.forEach((cell, colIndex) => {
      doc.text(cell || '-', MARGIN + (colIndex * colWidth) + 5, rowY + 5, {
        width: colWidth - 10,
        align: 'left'
      });
    });
  });
  
  // Border
  doc.strokeColor(COLORS.border).lineWidth(1);
  doc.rect(MARGIN, doc.y, CONTENT_WIDTH, 25 + (rows.length * 20)).stroke();
  
  doc.y = startY + (rows.length * 20) + 10;
}

// ============================================================================
// MAIN PDF GENERATION
// ============================================================================

export interface ProfessionalReportData {
  reportId: string;
  inspectionId: string;
}

export async function generateProfessionalPDF(data: ProfessionalReportData): Promise<Buffer> {
  const { reportId, inspectionId } = data;
  
  // Fetch all data
  const report = await getProfessionalReport(reportId);
  if (!report) throw new Error('Report not found');
  
  const inspection = await getInspection(inspectionId);
  if (!inspection) throw new Error('Inspection not found');
  
  const components = await getComponentCalculations(reportId);
  const findings = await getInspectionFindings(reportId);
  const recommendations = await getRecommendations(reportId);
  const photos = await getInspectionPhotos(reportId);
  const checklist = await getChecklistItems(reportId);
  const tmlReadings = await getTmlReadings(inspectionId);
  
  // Create PDF
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    bufferPages: true,
  });
  
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  
  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  
  // Generate pages
  generateCoverPage(doc, report, inspection);
  generateTableOfContents(doc);
  generateExecutiveSummary(doc, report, components);
  generateVesselData(doc, inspection);
  generateComponentCalculations(doc, components);
  generateInspectionFindings(doc, findings);
  generateRecommendationsSection(doc, recommendations);
  generateThicknessReadings(doc, tmlReadings);
  generateChecklist(doc, checklist);
  generatePhotos(doc, photos);
  
  // Finalize
  doc.end();
  
  return pdfPromise;
}

// ============================================================================
// PAGE GENERATION FUNCTIONS
// ============================================================================

function generateCoverPage(doc: PDFKit.PDFDocument, report: any, inspection: any) {
  // Company header
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.secondary);
  doc.text('OILPRO CONSULTING LLC', MARGIN, MARGIN);
  doc.text(`${inspection.vesselTagNumber || ''} API 510 IN LIEU OF`, 
    PAGE_WIDTH - MARGIN - 200, MARGIN, { width: 200, align: 'right' });
  
  // Logo (text-based for now - will add image support)
  doc.font('Helvetica-Bold').fontSize(32).fillColor(COLORS.primary);
  doc.text('OilPro', MARGIN, MARGIN + 60);
  doc.font('Helvetica').fontSize(12).fillColor(COLORS.secondary);
  doc.text('CONSULTING', MARGIN + 10, MARGIN + 95);
  
  // Client info
  doc.moveDown(4);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(COLORS.text);
  doc.text(report.clientName || 'CLIENT NAME', { align: 'center' });
  doc.font('Helvetica').fontSize(14).fillColor(COLORS.secondary);
  doc.text(report.clientLocation || 'Location', { align: 'center' });
  
  // Report metadata box
  doc.moveDown(3);
  const boxY = doc.y;
  const boxHeight = 120;
  
  // Box background
  doc.fillColor(COLORS.headerBg).rect(MARGIN + 50, boxY, CONTENT_WIDTH - 100, boxHeight).fill();
  doc.strokeColor(COLORS.border).rect(MARGIN + 50, boxY, CONTENT_WIDTH - 100, boxHeight).stroke();
  
  // Metadata fields
  const leftX = MARGIN + 70;
  const valueX = leftX + 140;
  let fieldY = boxY + 20;
  
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(11);
  
  const fields = [
    ['Report No.:', report.reportNumber || ''],
    ['Inspector:', report.inspectorName || ''],
    ['Employer:', report.employerName || 'OilPro Consulting LLC'],
    ['Inspection Date:', report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-US') : ''],
  ];
  
  fields.forEach(([label, value]) => {
    doc.text(label, leftX, fieldY);
    doc.font('Helvetica').text(value, valueX, fieldY);
    doc.font('Helvetica-Bold');
    fieldY += 25;
  });
  
  // Title
  doc.moveDown(4);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(COLORS.primary);
  doc.text('IN-SERVICE', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16);
  doc.text('Inspection Report For', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(20);
  doc.text('Pressure Vessel', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(24).fillColor(COLORS.text);
  doc.text(inspection.vesselTagNumber || '', { align: 'center' });
  
  // Executive summary paragraph
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.text);
  const summaryText = `An API Standard 510 Inspection based on client criterion for nondestructive examinations was conducted on vessel ${inspection.vesselTagNumber || ''} in the ${report.clientLocation || ''} facility located at ${report.clientLocation || ''} on ${report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-US') : ''}. This vessel was originally built to ASME S8 D1. This inspection was conducted in accordance with requirements of the API-510 standard for inspections of Pressure Vessels. The following is a detailed report of the inspection including findings and recommendations.`;
  
  doc.text(summaryText, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
    align: 'justify'
  });
}

function generateTableOfContents(doc: PDFKit.PDFDocument) {
  doc.addPage();
  addHeader(doc, 'TABLE OF CONTENTS', 2);
  
  const sections = [
    '1.0 EXECUTIVE SUMMARY',
    '2.0 VESSEL DATA',
    '3.0 COMPONENT CALCULATIONS',
    '4.0 INSPECTION FINDINGS',
    '5.0 RECOMMENDATIONS',
    '6.0 ULTRASONIC THICKNESS MEASUREMENTS',
    '7.0 INSPECTION CHECKLIST',
    '8.0 PHOTOGRAPHS',
  ];
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.text);
  sections.forEach((section, i) => {
    doc.text(section, MARGIN + 20, doc.y);
    doc.moveDown(0.8);
  });
}

function generateExecutiveSummary(doc: PDFKit.PDFDocument, report: any, components: any[]) {
  doc.addPage();
  addHeader(doc, 'EXECUTIVE SUMMARY', 3);
  
  addSectionTitle(doc, '1.0 EXECUTIVE SUMMARY');
  
  addText(doc, report.executiveSummary || 'No executive summary provided.');
  
  // Summary table
  if (components && components.length > 0) {
    doc.moveDown(1);
    addSubsectionTitle(doc, 'TABLE A: Component Calculation Summary');
    
    const headers = ['Component', 'Min Thickness (in)', 'Actual (in)', 'MAWP (psi)', 'Remaining Life (yrs)'];
    const rows = components.map(c => [
      c.componentName || '',
      c.minimumThickness?.toFixed(3) || '-',
      c.actualThickness?.toFixed(3) || '-',
      c.mawp?.toFixed(1) || '-',
      c.remainingLife?.toFixed(1) || '-',
    ]);
    
    addTable(doc, headers, rows);
  }
}

function generateVesselData(doc: PDFKit.PDFDocument, inspection: any) {
  doc.addPage();
  addHeader(doc, 'VESSEL DATA', 4);
  
  addSectionTitle(doc, '2.0 VESSEL DATA');
  
  const data = [
    ['Vessel Tag Number', inspection.vesselTagNumber || '-'],
    ['Vessel Name', inspection.vesselName || '-'],
    ['Manufacturer', inspection.manufacturer || '-'],
    ['Year Built', inspection.yearBuilt || '-'],
    ['Design Pressure', `${inspection.designPressure || '-'} psi`],
    ['Design Temperature', `${inspection.designTemperature || '-'} °F`],
    ['Operating Pressure', `${inspection.operatingPressure || '-'} psi`],
    ['Material Specification', inspection.materialSpec || '-'],
    ['Vessel Type', inspection.vesselType || '-'],
    ['Inside Diameter', `${inspection.insideDiameter || '-'} inches`],
    ['Overall Length', `${inspection.overallLength || '-'} feet`],
  ];
  
  // Two-column layout
  const colWidth = CONTENT_WIDTH / 2 - 10;
  let leftY = doc.y;
  
  data.forEach((row, i) => {
    const isLeft = i % 2 === 0;
    const x = isLeft ? MARGIN : MARGIN + colWidth + 20;
    const y = isLeft ? leftY : leftY;
    
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.text);
    doc.text(row[0] + ':', x, y, { width: colWidth });
    doc.font('Helvetica');
    doc.text(row[1], x, y + 15, { width: colWidth });
    
    if (!isLeft) {
      leftY += 40;
    }
  });
  
  doc.y = leftY + 20;
}

function generateComponentCalculations(doc: PDFKit.PDFDocument, components: any[]) {
  doc.addPage();
  addHeader(doc, 'COMPONENT CALCULATIONS', 5);
  
  addSectionTitle(doc, '3.0 MECHANICAL INTEGRITY CALCULATIONS');
  
  components.forEach((comp, index) => {
    if (index > 0) doc.moveDown(2);
    
    addSubsectionTitle(doc, `${comp.componentName || 'Component'} Evaluation`);
    
    // Component data
    addText(doc, `Material: ${comp.materialSpec || '-'}`, { bold: true });
    addText(doc, `Design Pressure: ${comp.designPressure || '-'} psi`);
    addText(doc, `Design Temperature: ${comp.designTemperature || '-'} °F`);
    addText(doc, `Allowable Stress: ${comp.allowableStress || '-'} psi`);
    addText(doc, `Joint Efficiency: ${comp.jointEfficiency || '-'}`);
    
    doc.moveDown(0.5);
    
    // Calculations
    addText(doc, 'Minimum Required Thickness:', { bold: true });
    addText(doc, `t_min = ${comp.minimumThickness?.toFixed(3) || '-'} inches`);
    
    addText(doc, 'Remaining Life:', { bold: true });
    addText(doc, `RL = ${comp.remainingLife?.toFixed(1) || '-'} years`);
    
    addText(doc, 'Maximum Allowable Working Pressure:', { bold: true });
    addText(doc, `MAWP = ${comp.mawp?.toFixed(1) || '-'} psi`);
    
    checkPageBreak(doc, 100);
  });
}

function generateInspectionFindings(doc: PDFKit.PDFDocument, findings: any[]) {
  doc.addPage();
  addHeader(doc, 'INSPECTION FINDINGS', 6);
  
  addSectionTitle(doc, '4.0 INSPECTION FINDINGS');
  
  if (!findings || findings.length === 0) {
    addText(doc, 'No findings reported.');
    return;
  }
  
  findings.forEach((finding, index) => {
    if (index > 0) doc.moveDown(1);
    
    addSubsectionTitle(doc, `Finding ${index + 1}: ${finding.findingType || 'General'}`);
    addText(doc, `Section: ${finding.section || '-'}`);
    addText(doc, `Severity: ${finding.severity || '-'}`, { bold: true });
    addText(doc, `Location: ${finding.location || '-'}`);
    addText(doc, `Description: ${finding.description || '-'}`);
    
    if (finding.measurements) {
      addText(doc, `Measurements: ${finding.measurements}`);
    }
    
    checkPageBreak(doc, 80);
  });
}

function generateRecommendationsSection(doc: PDFKit.PDFDocument, recommendations: any[]) {
  doc.addPage();
  addHeader(doc, 'RECOMMENDATIONS', 7);
  
  addSectionTitle(doc, '5.0 RECOMMENDATIONS');
  
  if (!recommendations || recommendations.length === 0) {
    addText(doc, 'No recommendations at this time.');
    return;
  }
  
  recommendations.forEach((rec, index) => {
    if (index > 0) doc.moveDown(1);
    
    addText(doc, `${index + 1}. ${rec.recommendation || ''}`, { bold: true });
    addText(doc, `Priority: ${rec.priority || '-'}`);
    if (rec.dueDate) {
      addText(doc, `Due Date: ${new Date(rec.dueDate).toLocaleDateString('en-US')}`);
    }
    if (rec.notes) {
      addText(doc, `Notes: ${rec.notes}`);
    }
    
    checkPageBreak(doc, 60);
  });
}

function generateThicknessReadings(doc: PDFKit.PDFDocument, readings: any[]) {
  doc.addPage();
  addHeader(doc, 'THICKNESS MEASUREMENTS', 8);
  
  addSectionTitle(doc, '6.0 ULTRASONIC THICKNESS MEASUREMENTS');
  
  if (!readings || readings.length === 0) {
    addText(doc, 'No thickness readings recorded.');
    return;
  }
  
  const headers = ['TML #', 'Location', 'Reading (in)', 'Min Req (in)', 'Status'];
  const rows = readings.map(r => [
    r.tmlNumber || '-',
    r.location || '-',
    r.reading?.toFixed(3) || '-',
    r.minRequired?.toFixed(3) || '-',
    r.status || '-',
  ]);
  
  addTable(doc, headers, rows);
}

function generateChecklist(doc: PDFKit.PDFDocument, items: any[]) {
  doc.addPage();
  addHeader(doc, 'INSPECTION CHECKLIST', 9);
  
  addSectionTitle(doc, '7.0 API 510 INSPECTION CHECKLIST');
  
  if (!items || items.length === 0) {
    addText(doc, 'Checklist not completed.');
    return;
  }
  
  items.forEach((item, index) => {
    const checkbox = item.checked ? '☑' : '☐';
    addText(doc, `${checkbox} ${item.itemText || ''}`, { moveDown: true });
    
    if (item.notes) {
      addText(doc, `   Notes: ${item.notes}`, { fontSize: 9 });
    }
    
    checkPageBreak(doc, 30);
  });
}

function generatePhotos(doc: PDFKit.PDFDocument, photos: any[]) {
  doc.addPage();
  addHeader(doc, 'PHOTOGRAPHS', 10);
  
  addSectionTitle(doc, '8.0 INSPECTION PHOTOGRAPHS');
  
  if (!photos || photos.length === 0) {
    addText(doc, 'No photographs attached.');
    return;
  }
  
  photos.forEach((photo, index) => {
    addSubsectionTitle(doc, `Photo ${index + 1}: ${photo.caption || 'Untitled'}`);
    addText(doc, photo.description || '');
    
    // TODO: Add actual photo rendering from base64/URL
    addText(doc, '[Photo placeholder - image rendering to be implemented]', { 
      fontSize: 9, 
      align: 'center' 
    });
    
    doc.moveDown(2);
    checkPageBreak(doc, 200);
  });
}

