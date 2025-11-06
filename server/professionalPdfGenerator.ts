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

async function addHeader(doc: PDFKit.PDFDocument, title: string, pageNum?: number, logoBuffer?: Buffer) {
  const startY = doc.y;
  
  // Add logo if provided (top left)
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, MARGIN, MARGIN, {
        width: 100, // Scale down to fit header
        height: 42,
      });
    } catch (error) {
      console.error('[PDF] Failed to add logo:', error);
    }
  }
  
  // Company information (right side of logo)
  const companyX = MARGIN + 110;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLORS.primary);
  doc.text('OILPRO CONSULTING LLC', companyX, MARGIN);
  
  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);
  doc.text('Phone: 337-446-7459', companyX, MARGIN + 14);
  doc.text('www.oilproconsulting.com', companyX, MARGIN + 26);
  
  // Page number (far right)
  if (pageNum) {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.secondary);
    doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN - 60, MARGIN, {
      width: 60,
      align: 'right'
    });
  }
  
  // Title (centered below header)
  if (title) {
    doc.font('Helvetica-Bold').fontSize(12).fillColor(COLORS.text);
    doc.text(title, MARGIN, MARGIN + 50, {
      width: CONTENT_WIDTH,
      align: 'center'
    });
  }
  
  // Separator line
  doc.strokeColor(COLORS.border).lineWidth(1);
  doc.moveTo(MARGIN, MARGIN + 70).lineTo(PAGE_WIDTH - MARGIN, MARGIN + 70).stroke();
  
  doc.y = MARGIN + 80;
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

async function addTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], sectionTitle?: string, pageNumber?: number, logoBuffer?: Buffer) {
  const colWidth = CONTENT_WIDTH / headers.length;
  const ROW_HEIGHT = 20;
  const HEADER_HEIGHT = 25;
  const MAX_ROWS_PER_PAGE = 30; // Limit rows per page to avoid issues
  
  // Helper to draw table header
  function drawTableHeader(y: number) {
    doc.fillColor(COLORS.headerBg).rect(MARGIN, y, CONTENT_WIDTH, HEADER_HEIGHT).fill();
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(9);
    
    headers.forEach((header, i) => {
      doc.text(header, MARGIN + (i * colWidth) + 5, y + 8, {
        width: colWidth - 10,
        align: 'left'
      });
    });
    
    return y + HEADER_HEIGHT;
  }
  
  // Split rows into chunks if needed
  let rowIndex = 0;
  while (rowIndex < rows.length) {
    const remainingRows = rows.length - rowIndex;
    const rowsThisPage = Math.min(remainingRows, MAX_ROWS_PER_PAGE);
    
    // Check if we need a page break
    const neededSpace = HEADER_HEIGHT + (rowsThisPage * ROW_HEIGHT) + 20;
    if (doc.y + neededSpace > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      doc.y = MARGIN + 60; // Start below header space
    }
    
    // Draw header directly at current position (no extra spacing)
    let currentY = drawTableHeader(doc.y);
    const tableStartY = currentY - HEADER_HEIGHT;
    
    // Draw rows for this page
    doc.font('Helvetica').fontSize(9);
    for (let i = 0; i < rowsThisPage; i++) {
      const row = rows[rowIndex + i];
      const rowY = currentY + (i * ROW_HEIGHT);
      
      // Alternate row background
      if (i % 2 === 0) {
        doc.fillColor('#f9fafb').rect(MARGIN, rowY, CONTENT_WIDTH, ROW_HEIGHT).fill();
      }
      
      doc.fillColor(COLORS.text);
      row.forEach((cell, colIndex) => {
        doc.text(cell || '-', MARGIN + (colIndex * colWidth) + 5, rowY + 5, {
          width: colWidth - 10,
          align: 'left'
        });
      });
    }
    
    // Draw border around this table section
    const tableHeight = HEADER_HEIGHT + (rowsThisPage * ROW_HEIGHT);
    doc.strokeColor(COLORS.border).lineWidth(1);
    doc.rect(MARGIN, tableStartY, CONTENT_WIDTH, tableHeight).stroke();
    
    // Update position
    doc.y = currentY + (rowsThisPage * ROW_HEIGHT) + 10;
    rowIndex += rowsThisPage;
    
    // If more rows remain, add a page break with section header
    if (rowIndex < rows.length) {
      doc.addPage();
      if (sectionTitle && pageNumber) {
        await addHeader(doc, sectionTitle + ' (continued)', pageNumber, logoBuffer);
      } else {
        doc.y = MARGIN + 60;
      }
    }
  }
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
  
  // Load company logo
  let logoBuffer: Buffer | undefined;
  try {
    const logoPath = './client/public/oilpro-logo.png';
    const fs = await import('fs');
    logoBuffer = fs.readFileSync(logoPath);
    console.log('[PDF] Logo loaded successfully');
  } catch (error) {
    console.error('[PDF] Failed to load logo:', error);
  }
  
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
  
  // DEBUG LOGGING
  console.log('[PDF DEBUG] Data counts:');
  console.log('  Components:', components?.length || 0);
  console.log('  Findings:', findings?.length || 0);
  console.log('  Recommendations:', recommendations?.length || 0);
  console.log('  Photos:', photos?.length || 0);
  console.log('  Checklist:', checklist?.length || 0);
  console.log('  TML Readings:', tmlReadings?.length || 0);
  
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
  console.log('[PDF DEBUG] Generating cover page...');
  generateCoverPage(doc, report, inspection);
  console.log('[PDF DEBUG] Page count after cover:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating TOC...');
  await generateTableOfContents(doc, logoBuffer);
  console.log('[PDF DEBUG] Page count after TOC:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating executive summary...');
  await generateExecutiveSummary(doc, report, components, logoBuffer);
  console.log('[PDF DEBUG] Page count after exec summary:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating vessel data...');
  await generateVesselData(doc, inspection, logoBuffer);
  console.log('[PDF DEBUG] Page count after vessel data:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating component calculations...');
  await generateComponentCalculations(doc, components, logoBuffer, inspection, tmlReadings);
  console.log('[PDF DEBUG] Page count after components:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating findings...');
  await generateInspectionFindings(doc, findings, logoBuffer);
  console.log('[PDF DEBUG] Page count after findings:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating recommendations...');
  await generateRecommendationsSection(doc, recommendations, logoBuffer);
  console.log('[PDF DEBUG] Page count after recommendations:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating thickness readings...');
  await generateThicknessReadings(doc, tmlReadings, logoBuffer);
  console.log('[PDF DEBUG] Page count after TML:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating checklist...');
  await generateChecklist(doc, checklist, logoBuffer);
  console.log('[PDF DEBUG] Page count after checklist:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating FFS assessment...');
  await generateFfsAssessment(doc, inspectionId, logoBuffer);
  console.log('[PDF DEBUG] Page count after FFS:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating In-Lieu-Of qualification...');
  await generateInLieuOfQualification(doc, inspectionId, logoBuffer);
  console.log('[PDF DEBUG] Page count after In-Lieu-Of:', doc.bufferedPageRange().count);
  
  console.log('[PDF DEBUG] Generating photos...');
  await generatePhotos(doc, photos, logoBuffer);
  console.log('[PDF DEBUG] Final page count:', doc.bufferedPageRange().count);
  
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

async function generateTableOfContents(doc: PDFKit.PDFDocument, logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'TABLE OF CONTENTS', 2, logoBuffer);
  
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

async function generateExecutiveSummary(doc: PDFKit.PDFDocument, report: any, components: any[], logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'EXECUTIVE SUMMARY', 3, logoBuffer);
  
  addSectionTitle(doc, '1.0 EXECUTIVE SUMMARY');
  
  // Use database summary if available, otherwise generate default text
  const summaryText = report.executiveSummary || 
    `An API Standard 510 Inspection based on client criterion for nondestructive examinations was conducted on this pressure vessel. This inspection was conducted in accordance with requirements of the API-510 standard for inspections of Pressure Vessels. The following is a detailed report of the inspection including findings and recommendations.`;
  
  addText(doc, summaryText);
  
  // Summary table
  if (components && components.length > 0) {
    doc.moveDown(1);
    addSubsectionTitle(doc, 'TABLE A: Component Calculation Summary');
    
    const headers = ['Component', 'Min Thickness (in)', 'Actual (in)', 'MAWP (psi)', 'Remaining Life (yrs)'];
    const rows = components.map(c => [
      c.componentName || '',
      c.minimumThickness ? parseFloat(c.minimumThickness).toFixed(3) : '-',
      c.actualThickness ? parseFloat(c.actualThickness).toFixed(3) : '-',
      c.mawpAtNextInspection ? parseFloat(c.mawpAtNextInspection).toFixed(1) : '-',
      c.remainingLife ? parseFloat(c.remainingLife).toFixed(1) : '-',
    ]);
    
    await addTable(doc, headers, rows, 'EXECUTIVE SUMMARY', 3, logoBuffer);
  }
}

async function generateVesselData(doc: PDFKit.PDFDocument, inspection: any, logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'VESSEL DATA', 4, logoBuffer);
  
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
    ['Overall Length', `${inspection.overallLength || '-'} inches`],
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

async function generateComponentCalculations(doc: PDFKit.PDFDocument, components: any[], logoBuffer?: Buffer, inspection?: any, tmlReadings?: any[]) {
  doc.addPage();
  await addHeader(doc, 'COMPONENT CALCULATIONS', 5, logoBuffer);
  
  addSectionTitle(doc, '3.0 MECHANICAL INTEGRITY CALCULATIONS');
  
  // If no pre-calculated components, try to auto-generate from inspection data
  if ((!components || components.length === 0) && inspection && tmlReadings && tmlReadings.length > 0) {
    const { calculateComponent } = require('./componentCalculations');
    
    // Find minimum thickness from TML readings
    const minReading = tmlReadings.reduce((min, r) => {
      const current = r.currentThickness ? parseFloat(r.currentThickness) : Infinity;
      return current < min ? current : min;
    }, Infinity);
    
    if (minReading !== Infinity && inspection.designPressure && inspection.insideDiameter) {
      try {
        const shellCalc = calculateComponent({
          designPressure: parseFloat(inspection.designPressure) || 150,
          designTemperature: parseFloat(inspection.designTemperature) || 500,
          insideDiameter: parseFloat(inspection.insideDiameter) || 95,
          materialSpec: inspection.materialSpec || 'SA-516-70',
          nominalThickness: parseFloat(inspection.nominalThickness) || 0.625,
          actualThickness: minReading,
          corrosionAllowance: 0.125,
          jointEfficiency: 0.85,
          componentType: 'shell',
          corrosionRate: 0
        });
        
        components = [{
          componentName: 'Shell',
          materialCode: shellCalc.material,
          designMAWP: shellCalc.designPressure,
          designTemp: shellCalc.designTemperature,
          allowableStress: shellCalc.allowableStress,
          jointEfficiency: 0.85,
          minimumThickness: shellCalc.minimumRequiredThickness,
          remainingLife: shellCalc.remainingLife,
          mawpAtNextInspection: shellCalc.mawp,
          status: shellCalc.status
        }];
      } catch (error) {
        console.error('[PDF] Auto-calculation failed:', error);
      }
    }
  }
  
  if (!components || components.length === 0) {
    addText(doc, 'No component calculations have been performed yet. Please complete the component calculations in the Professional Report tab.');
    return;
  }
  
  components.forEach((comp, index) => {
    if (index > 0) doc.moveDown(2);
    
    addSubsectionTitle(doc, `${comp.componentName || 'Component'} Evaluation`);
    
    // Component data
    addText(doc, `Material: ${comp.materialCode || comp.materialSpec || '-'}`, { bold: true });
    addText(doc, `Design Pressure: ${comp.designMAWP ? parseFloat(comp.designMAWP).toFixed(1) : '-'} psi`);
    addText(doc, `Design Temperature: ${comp.designTemp ? parseFloat(comp.designTemp).toFixed(1) : '-'} °F`);
    addText(doc, `Allowable Stress: ${comp.allowableStress ? parseFloat(comp.allowableStress).toFixed(0) : '-'} psi`);
    addText(doc, `Joint Efficiency: ${comp.jointEfficiency ? parseFloat(comp.jointEfficiency).toFixed(2) : '-'}`);
    
    doc.moveDown(0.5);
    
    // Calculations
    addText(doc, 'Minimum Required Thickness:', { bold: true });
    addText(doc, `t_min = ${comp.minimumThickness ? parseFloat(comp.minimumThickness).toFixed(3) : '-'} inches`);
    
    addText(doc, 'Remaining Life:', { bold: true });
    addText(doc, `RL = ${comp.remainingLife ? parseFloat(comp.remainingLife).toFixed(1) : '-'} years`);
    
    addText(doc, 'Maximum Allowable Working Pressure:', { bold: true });
    addText(doc, `MAWP = ${comp.mawpAtNextInspection ? parseFloat(comp.mawpAtNextInspection).toFixed(1) : '-'} psi`);
    
    checkPageBreak(doc, 100);
  });
}

async function generateInspectionFindings(doc: PDFKit.PDFDocument, findings: any[], logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'INSPECTION FINDINGS', 6, logoBuffer);
  
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

async function generateRecommendationsSection(doc: PDFKit.PDFDocument, recommendations: any[], logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'RECOMMENDATIONS', 7, logoBuffer);
  
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

async function generateThicknessReadings(doc: PDFKit.PDFDocument, readings: any[], logoBuffer?: Buffer) {
    // TML Readings count: ${readings?.length || 0}
  
  if (!readings || readings.length === 0) {
    doc.addPage();
    await addHeader(doc, 'THICKNESS MEASUREMENTS', 8, logoBuffer);
    addSectionTitle(doc, '6.0 ULTRASONIC THICKNESS MEASUREMENTS');
    addText(doc, 'No thickness readings recorded.');
    return;
  }
  
  // Only add page if we have data - table function will handle pagination
  doc.addPage();
  await addHeader(doc, 'THICKNESS MEASUREMENTS', 8, logoBuffer);
  addSectionTitle(doc, '6.0 ULTRASONIC THICKNESS MEASUREMENTS');
  
  // First TML reading structure verified
  
  const headers = ['TML #', 'Component', 'Current (in)', 'Previous (in)', 'Nominal (in)', 'Loss (in)', 'Loss (%)', 'Rate (mpy)', 'Status'];
  const rows = readings.map(r => [
    r.tmlId || '-',
    r.component || '-',
    r.currentThickness ? parseFloat(r.currentThickness).toFixed(3) : '-',
    r.previousThickness ? parseFloat(r.previousThickness).toFixed(3) : '-',
    r.nominalThickness ? parseFloat(r.nominalThickness).toFixed(3) : '-',
    r.loss ? parseFloat(r.loss).toFixed(4) : '-',
    r.lossPercent ? parseFloat(r.lossPercent).toFixed(2) : '-',
    r.corrosionRate ? parseFloat(r.corrosionRate).toFixed(2) : '-',
    r.status || '-',
  ]);
  
  // TML table rows created: ${rows.length}
  
  await addTable(doc, headers, rows, 'ULTRASONIC THICKNESS MEASUREMENTS', 6, logoBuffer);
}

async function generateChecklist(doc: PDFKit.PDFDocument, items: any[], logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'INSPECTION CHECKLIST', 9, logoBuffer);
  
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

async function generatePhotos(doc: PDFKit.PDFDocument, photos: any[], logoBuffer?: Buffer) {
  doc.addPage();
  await addHeader(doc, 'PHOTOGRAPHS', 10, logoBuffer);
  
  addSectionTitle(doc, '8.0 INSPECTION PHOTOGRAPHS');
  
  if (!photos || photos.length === 0) {
    addText(doc, 'No photographs attached.');
    return;
  }
  
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    addSubsectionTitle(doc, `Photo ${i + 1}: ${photo.caption || 'Untitled'}`);
    if (photo.description) {
      addText(doc, photo.description);
      doc.moveDown(0.5);
    }
    
    // Render actual photo from URL
    if (photo.photoUrl) {
      try {
        // Fetch image from URL
        const response = await fetch(photo.photoUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        
        // Calculate image dimensions to fit on page
        const maxWidth = 500;
        const maxHeight = 350;
        
        // Check if we need a new page for the image
        checkPageBreak(doc, maxHeight + 50);
        
        // Add image to PDF
        doc.image(imageBuffer, {
          fit: [maxWidth, maxHeight],
          align: 'center',
        });
        
        console.log(`[PDF] Rendered photo ${i + 1}: ${photo.caption}`);
      } catch (error) {
        console.error(`[PDF] Failed to render photo ${i + 1}:`, error);
        addText(doc, `[Photo could not be loaded: ${photo.photoUrl}]`, { 
          fontSize: 9, 
          align: 'center' 
        });
      }
    } else {
      addText(doc, '[No photo URL provided]', { 
        fontSize: 9, 
        align: 'center' 
      });
    }
    
    doc.moveDown(2);
    checkPageBreak(doc, 200);
  }
}




async function generateFfsAssessment(doc: PDFKit.PDFDocument, inspectionId: string, logoBuffer?: Buffer) {
  // Fetch FFS assessment data from database
  const { getDb } = require('./db');
  const db = await getDb();
  if (!db) {
    console.log('[PDF] Database not available for FFS assessment');
    return;
  }
  
  const { ffsAssessments } = require('../drizzle/schema');
  const { eq } = require('drizzle-orm');
  
  const assessments = await db.select().from(ffsAssessments).where(eq(ffsAssessments.inspectionId, inspectionId));
  
  if (!assessments || assessments.length === 0) {
    console.log('[PDF] No FFS assessments found');
    return;
  }
  
  doc.addPage();
  await addHeader(doc, 'FITNESS-FOR-SERVICE ASSESSMENT', 11, logoBuffer);
  
  addSectionTitle(doc, '9.0 FITNESS-FOR-SERVICE ASSESSMENT (API 579)');
  
  addText(doc, 'Fitness-For-Service (FFS) assessment performed per API 579-1/ASME FFS-1 to evaluate the structural integrity of components with identified flaws or damage.');
  doc.moveDown();
  
  for (const assessment of assessments) {
    addSubsectionTitle(doc, `Component: ${assessment.componentName || 'Unknown'}`);
    
    const data = [
      ['Assessment Level', `Level ${assessment.assessmentLevel}`],
      ['Assessment Type', assessment.assessmentType || '-'],
      ['Flaw Type', assessment.flawType || '-'],
      ['Flaw Depth (in)', assessment.flawDepth?.toFixed(3) || '-'],
      ['Flaw Length (in)', assessment.flawLength?.toFixed(2) || '-'],
      ['Remaining Thickness (in)', assessment.remainingThickness?.toFixed(3) || '-'],
      ['Required Thickness (in)', assessment.requiredThickness?.toFixed(3) || '-'],
      ['Remaining Strength Factor', assessment.rsf?.toFixed(3) || '-'],
      ['Acceptance Criteria', assessment.acceptanceCriteria || '-'],
      ['Result', assessment.result || '-'],
      ['Remaining Life (years)', assessment.remainingLife?.toFixed(1) || '-'],
      ['Next Inspection (years)', assessment.nextInspectionInterval?.toFixed(1) || '-'],
    ];
    
    addTable(doc, ['Parameter', 'Value'], data);
    doc.moveDown();
    
    if (assessment.recommendations) {
      addSubsectionTitle(doc, 'Recommendations');
      addText(doc, assessment.recommendations);
      doc.moveDown();
    }
    
    if (assessment.warnings) {
      addSubsectionTitle(doc, 'Warnings');
      addText(doc, assessment.warnings, { fontSize: 10 });
      doc.moveDown();
    }
  }
}

async function generateInLieuOfQualification(doc: PDFKit.PDFDocument, inspectionId: string, logoBuffer?: Buffer) {
  // Fetch In-Lieu-Of assessment data from database
  const { getDb } = require('./db');
  const db = await getDb();
  if (!db) {
    console.log('[PDF] Database not available for In-Lieu-Of assessment');
    return;
  }
  
  const { inLieuOfAssessments } = require('../drizzle/schema');
  const { eq } = require('drizzle-orm');
  
  const assessments = await db.select().from(inLieuOfAssessments).where(eq(inLieuOfAssessments.inspectionId, inspectionId));
  
  if (!assessments || assessments.length === 0) {
    console.log('[PDF] No In-Lieu-Of assessments found');
    return;
  }
  
  doc.addPage();
  await addHeader(doc, 'IN-LIEU-OF INTERNAL INSPECTION', 12, logoBuffer);
  
  addSectionTitle(doc, '10.0 IN-LIEU-OF INTERNAL INSPECTION QUALIFICATION (API 510 Section 6.4)');
  
  addText(doc, 'Assessment performed to determine if external inspection combined with thickness measurements can be used in lieu of internal inspection per API 510 Section 6.4.');
  doc.moveDown();
  
  for (const assessment of assessments) {
    const data = [
      ['Qualification Method', assessment.qualificationMethod || '-'],
      ['External Inspection Effective', assessment.externalInspectionEffective ? 'Yes' : 'No'],
      ['Corrosion Mechanism Known', assessment.corrosionMechanismKnown ? 'Yes' : 'No'],
      ['Process Monitoring Active', assessment.processMonitoringActive ? 'Yes' : 'No'],
      ['Thickness Monitoring Adequate', assessment.thicknessMonitoringAdequate ? 'Yes' : 'No'],
      ['Minimum Thickness Maintained', assessment.minimumThicknessMaintained ? 'Yes' : 'No'],
      ['Corrosion Rate (mpy)', assessment.corrosionRate?.toFixed(3) || '-'],
      ['Remaining Life (years)', assessment.remainingLife?.toFixed(1) || '-'],
      ['Next Inspection Interval (years)', assessment.nextInspectionInterval?.toFixed(1) || '-'],
      ['Qualification Result', assessment.qualificationResult || '-'],
    ];
    
    addTable(doc, ['Criteria', 'Status'], data);
    doc.moveDown();
    
    if (assessment.justification) {
      addSubsectionTitle(doc, 'Justification');
      addText(doc, assessment.justification);
      doc.moveDown();
    }
    
    if (assessment.limitations) {
      addSubsectionTitle(doc, 'Limitations');
      addText(doc, assessment.limitations);
      doc.moveDown();
    }
    
    if (assessment.recommendations) {
      addSubsectionTitle(doc, 'Recommendations');
      addText(doc, assessment.recommendations);
      doc.moveDown();
    }
  }
}

