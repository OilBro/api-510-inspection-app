import { readFileSync } from 'fs';
import { storagePut } from './server/storage.js';

// Test PDF import with real vessel report
async function testPDFImport() {
  console.log('=== Testing PDF Import with 54-11-004 2016 Report ===\n');
  
  try {
    // Read the PDF file
    const pdfPath = '/home/ubuntu/upload/54-11-0042016FebruaryExternalInspectionReport.pdf';
    const pdfBuffer = readFileSync(pdfPath);
    console.log(`✓ PDF file loaded: ${pdfBuffer.length} bytes\n`);
    
    // Upload to S3
    console.log('Uploading PDF to S3...');
    const { url: pdfUrl } = await storagePut(
      `test-imports/54-11-004-2016-${Date.now()}.pdf`,
      pdfBuffer,
      'application/pdf'
    );
    console.log(`✓ PDF uploaded to S3: ${pdfUrl}\n`);
    
    console.log('=== PDF Upload Successful ===');
    console.log('Next steps:');
    console.log('1. Use the app UI to import this PDF');
    console.log('2. Check that vessel data is extracted (tag 54-11-004)');
    console.log('3. Verify component calculations use inspection-specific values');
    console.log('4. Confirm no hardcoded values (15000, 1.0, "10") in results');
    console.log('5. Check validation dashboard for discrepancies\n');
    console.log(`PDF URL: ${pdfUrl}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testPDFImport();
