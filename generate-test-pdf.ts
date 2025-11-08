import { generateProfessionalPDF } from './server/professionalPdfGenerator';
import { getDb } from './server/db';
import { professionalReports } from './drizzle/schema';
import { desc } from 'drizzle-orm';
import * as fs from 'fs';

async function generateTestPdf() {
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
  console.log(`\n📄 Generating PDF for report: ${report.id}`);
  console.log(`   Report Number: ${report.reportNumber}`);
  console.log(`   Inspector: ${report.inspectorName}`);
  console.log(`   Client: ${report.clientName}\n`);

  try {
    // Generate PDF
    const pdfBuffer = await generateProfessionalPDF({
      reportId: report.id,
      inspectionId: report.inspectionId,
    });
    
    // Save to file
    const outputPath = '/home/ubuntu/test-ffs-report.pdf';
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📊 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n🔍 To view the PDF, download it from the file system.`);
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}

generateTestPdf()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

