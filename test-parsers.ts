import { parseAndStandardizeDocument, parseDocument } from "./server/docupipe";
import { parseAndStandardizeWithManus, parseDocumentWithManus } from "./server/manusParser";
import { ENV } from "./server/_core/env";
import * as fs from "fs";

console.log("=== PARSER TEST SCRIPT ===\n");

// Check environment variables
console.log("1. ENVIRONMENT CHECK:");
console.log("   Docupipe API Key:", ENV.docupipeApiKey ? `${ENV.docupipeApiKey.substring(0, 10)}... (${ENV.docupipeApiKey.length} chars)` : "MISSING");
console.log("   Docupipe Schema ID:", ENV.docupipeSchemaId || "MISSING");
console.log("   Manus API URL:", ENV.forgeApiUrl || "MISSING");
console.log("   Manus API Key:", ENV.forgeApiKey ? `${ENV.forgeApiKey.substring(0, 10)}... (${ENV.forgeApiKey.length} chars)` : "MISSING");
console.log("   Default Parser:", ENV.parserType);
console.log("");

// Create a simple test PDF buffer (just text for now)
const testText = `API 510 INSPECTION REPORT

Report Number: TEST-001
Inspection Date: November 4, 2025
Inspector: John Smith, API 510 #12345

VESSEL IDENTIFICATION
Vessel Tag Number: V-101
Vessel Name: Test Reactor
Manufacturer: ABC Manufacturing
Year Built: 2020
Design Pressure: 150 psig
Design Temperature: 650°F
Operating Pressure: 125 psig
Material: SA-516 Grade 70

THICKNESS MEASUREMENTS
CML-1: Shell Top, Nominal: 0.500", Current: 0.485"
CML-2: Shell Bottom, Nominal: 0.500", Current: 0.490"`;

const testBuffer = Buffer.from(testText);

async function testDocupipe() {
  console.log("2. TESTING DOCUPIPE PARSER:");
  try {
    console.log("   Calling parseDocument()...");
    const result = await parseDocument(testBuffer, "test.pdf");
    console.log("   ✅ parseDocument() SUCCESS");
    console.log("   Text length:", result.result.text.length);
    console.log("");
    
    console.log("   Calling parseAndStandardizeDocument()...");
    const standardized = await parseAndStandardizeDocument(testBuffer, "test.pdf");
    console.log("   ✅ parseAndStandardizeDocument() SUCCESS");
    console.log("   Result keys:", Object.keys(standardized));
    console.log("");
  } catch (error) {
    console.error("   ❌ DOCUPIPE ERROR:", error instanceof Error ? error.message : error);
    console.error("   Stack:", error instanceof Error ? error.stack : "");
    console.log("");
  }
}

async function testManus() {
  console.log("3. TESTING MANUS PARSER:");
  try {
    console.log("   Calling parseDocumentWithManus()...");
    const result = await parseDocumentWithManus(testBuffer, "test.pdf");
    console.log("   ✅ parseDocumentWithManus() SUCCESS");
    console.log("   Text length:", result.result.text.length);
    console.log("");
    
    console.log("   Calling parseAndStandardizeWithManus()...");
    const standardized = await parseAndStandardizeWithManus(testBuffer, "test.pdf");
    console.log("   ✅ parseAndStandardizeWithManus() SUCCESS");
    console.log("   Result keys:", Object.keys(standardized));
    console.log("");
  } catch (error) {
    console.error("   ❌ MANUS ERROR:", error instanceof Error ? error.message : error);
    console.error("   Stack:", error instanceof Error ? error.stack : "");
    console.log("");
  }
}

async function main() {
  await testDocupipe();
  await testManus();
  
  console.log("=== TEST COMPLETE ===");
}

main().catch(console.error);

