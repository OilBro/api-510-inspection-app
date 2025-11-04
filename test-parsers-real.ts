import { parseAndStandardizeDocument, parseDocument } from "./server/docupipe";
import { parseAndStandardizeWithManus, parseDocumentWithManus } from "./server/manusParser";
import { ENV } from "./server/_core/env";
import * as fs from "fs";

console.log("=== PARSER TEST SCRIPT (Real PDF) ===\n");

// Check environment variables
console.log("1. ENVIRONMENT CHECK:");
console.log("   Docupipe API Key:", ENV.docupipeApiKey ? `${ENV.docupipeApiKey.substring(0, 10)}... (${ENV.docupipeApiKey.length} chars)` : "MISSING");
console.log("   Docupipe Schema ID:", ENV.docupipeSchemaId || "MISSING");
console.log("   Manus API URL:", ENV.forgeApiUrl || "MISSING");
console.log("   Manus API Key:", ENV.forgeApiKey ? `${ENV.forgeApiKey.substring(0, 10)}... (${ENV.forgeApiKey.length} chars)` : "MISSING");
console.log("   Default Parser:", ENV.parserType);
console.log("");

// Load real PDF file
const pdfPath = "/home/ubuntu/test-inspection.pdf";
if (!fs.existsSync(pdfPath)) {
  console.error("ERROR: Test PDF not found at", pdfPath);
  process.exit(1);
}

const testBuffer = fs.readFileSync(pdfPath);
console.log("2. TEST FILE:");
console.log("   Path:", pdfPath);
console.log("   Size:", testBuffer.length, "bytes");
console.log("");

async function testDocupipe() {
  console.log("3. TESTING DOCUPIPE PARSER:");
  try {
    console.log("   Calling parseDocument()...");
    const result = await parseDocument(testBuffer, "test-inspection.pdf");
    console.log("   ✅ parseDocument() SUCCESS");
    console.log("   Text length:", result.result.text.length);
    console.log("   Text preview:", result.result.text.substring(0, 200));
    console.log("");
    
    console.log("   Calling parseAndStandardizeDocument()...");
    const standardized = await parseAndStandardizeDocument(testBuffer, "test-inspection.pdf");
    console.log("   ✅ parseAndStandardizeDocument() SUCCESS");
    console.log("   Result keys:", Object.keys(standardized));
    if (standardized.vesselData) {
      console.log("   Vessel Tag:", standardized.vesselData.vesselTagNumber);
      console.log("   Vessel Name:", standardized.vesselData.vesselName);
    }
    console.log("");
  } catch (error) {
    console.error("   ❌ DOCUPIPE ERROR:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.message.includes("400")) {
      console.error("   Note: Docupipe may require specific PDF format or structure");
    }
    console.log("");
  }
}

async function testManus() {
  console.log("4. TESTING MANUS PARSER:");
  try {
    console.log("   Calling parseDocumentWithManus()...");
    const result = await parseDocumentWithManus(testBuffer, "test-inspection.pdf");
    console.log("   ✅ parseDocumentWithManus() SUCCESS");
    console.log("   Text length:", result.result.text.length);
    console.log("   Text preview:", result.result.text.substring(0, 200));
    console.log("");
    
    console.log("   Calling parseAndStandardizeWithManus()...");
    const standardized = await parseAndStandardizeWithManus(testBuffer, "test-inspection.pdf");
    console.log("   ✅ parseAndStandardizeWithManus() SUCCESS");
    console.log("   Result keys:", Object.keys(standardized));
    if (standardized.vesselData) {
      console.log("   Vessel Tag:", standardized.vesselData.vesselTagNumber);
      console.log("   Vessel Name:", standardized.vesselData.vesselName);
    }
    console.log("");
  } catch (error) {
    console.error("   ❌ MANUS ERROR:", error instanceof Error ? error.message : error);
    console.log("");
  }
}

async function main() {
  await testDocupipe();
  await testManus();
  
  console.log("=== TEST COMPLETE ===");
}

main().catch(console.error);

