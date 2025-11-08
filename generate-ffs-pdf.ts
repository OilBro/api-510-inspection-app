import { generateProfessionalPDF } from './server/professionalPdfGenerator';
import * as fs from 'fs';

async function generateFFS() {
  console.log('\n📄 Generating PDF with FFS and In-Lieu-Of data...\n');
  
  // Use report EaiT5cdi3f99mBRrgZc-3 which has FFS data
  const reportId = 'EaiT5cdi3f99mBRrgZc-3';
  const inspectionId = 'muVLln0ZRe_DC7xN0hi0B';
  
  console.log(`Report ID: ${reportId}`);
  console.log(`Inspection ID: ${inspectionId}`);
  console.log('This report has FFS and In-Lieu-Of assessments\n');
  
  try {
    const pdfBuffer = await generateProfessionalPDF({
      reportId,
      inspectionId,
    });

    const filename = '/home/ubuntu/test-with-ffs-sections.pdf';
    fs.writeFileSync(filename, pdfBuffer);
    
    const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Saved to: ${filename}`);
    console.log(`📊 File size: ${sizeKB} KB`);
    console.log(`\n🔍 This PDF should include:`);
    console.log(`   - Section 9.0: FITNESS-FOR-SERVICE ASSESSMENT`);
    console.log(`   - Section 10.0: IN-LIEU-OF INTERNAL INSPECTION QUALIFICATION`);
    
  } catch (error) {
    console.error(`❌ Error generating PDF:`, error);
  }
}

generateFFS().catch(console.error);

