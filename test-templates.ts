import { generateProfessionalPDF, REPORT_TEMPLATES } from './server/professionalPdfGenerator';
import { getDb } from './server/db';
import { professionalReports } from './drizzle/schema';
import { desc } from 'drizzle-orm';
import * as fs from 'fs';

async function testTemplates() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  // Get the most recent professional report
  const reports = await db
    .select()
    .from(professionalReports)
    .orderBy(desc(professionalReports.createdAt))
    .limit(1);

  if (reports.length === 0) {
    console.error('No professional reports found. Run test-ffs-report.ts first.');
    return;
  }

  const report = reports[0];
  console.log(`\n📄 Testing PDF templates with report: ${report.id}`);
  console.log(`   Report Number: ${report.reportNumber}`);
  console.log(`   Inspector: ${report.inspectorName}`);
  console.log(`   Client: ${report.clientName}\n`);

  // Test each template
  const templates = [
    { name: 'Full Report', config: REPORT_TEMPLATES.FULL_REPORT.config },
    { name: 'Executive Summary', config: REPORT_TEMPLATES.EXECUTIVE_SUMMARY.config },
    { name: 'Client Summary', config: REPORT_TEMPLATES.CLIENT_SUMMARY.config },
    { name: 'Technical Report', config: REPORT_TEMPLATES.TECHNICAL_REPORT.config },
    { name: 'Compliance Report', config: REPORT_TEMPLATES.COMPLIANCE_REPORT.config },
  ];

  for (const template of templates) {
    try {
      console.log(`\n🔄 Generating ${template.name}...`);
      
      const pdfBuffer = await generateProfessionalPDF({
        reportId: report.id,
        inspectionId: report.inspectionId,
        sectionConfig: template.config,
      });

      const filename = `/home/ubuntu/test-${template.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      fs.writeFileSync(filename, pdfBuffer);
      
      const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
      console.log(`✅ ${template.name} generated successfully!`);
      console.log(`   📁 Saved to: ${filename}`);
      console.log(`   📊 File size: ${sizeKB} KB`);
      
      // Count sections included
      const sectionsIncluded = Object.values(template.config).filter(v => v !== false).length;
      console.log(`   📋 Sections included: ${sectionsIncluded}/12`);
      
    } catch (error) {
      console.error(`❌ Error generating ${template.name}:`, error);
    }
  }

  // Test custom template with minimal sections
  console.log(`\n🔄 Generating Custom Minimal Report...`);
  try {
    const minimalConfig = {
      coverPage: true,
      tableOfContents: false,
      executiveSummary: true,
      vesselData: true,
      componentCalculations: false,
      inspectionFindings: false,
      recommendations: false,
      thicknessReadings: false,
      checklist: false,
      ffsAssessment: false,
      inLieuOfQualification: false,
      photos: false,
    };

    const pdfBuffer = await generateProfessionalPDF({
      reportId: report.id,
      inspectionId: report.inspectionId,
      sectionConfig: minimalConfig,
    });

    const filename = '/home/ubuntu/test-custom-minimal.pdf';
    fs.writeFileSync(filename, pdfBuffer);
    
    const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
    console.log(`✅ Custom Minimal Report generated successfully!`);
    console.log(`   📁 Saved to: ${filename}`);
    console.log(`   📊 File size: ${sizeKB} KB`);
    console.log(`   📋 Sections included: 3/12 (Cover, Executive Summary, Vessel Data)`);
    
  } catch (error) {
    console.error(`❌ Error generating Custom Minimal Report:`, error);
  }

  console.log(`\n✅ Template testing complete!`);
  console.log(`\n📊 Summary:`);
  console.log(`   - 6 different templates tested`);
  console.log(`   - PDFs saved to /home/ubuntu/`);
  console.log(`   - Each template includes different section combinations`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review generated PDFs to verify sections are correctly included/excluded`);
  console.log(`   2. Test the UI template selector in the Professional Report tab`);
  console.log(`   3. Verify file sizes are appropriate for each template type`);
}

testTemplates().catch(console.error);

