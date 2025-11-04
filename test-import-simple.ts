import { parsePDFFile } from "./server/fileParser";
import * as fs from "fs";

console.log("=== SIMPLE IMPORT TEST ===\n");

const pdfPath = "/home/ubuntu/test-inspection.pdf";
const testBuffer = fs.readFileSync(pdfPath);

console.log("Testing Docupipe parser...");
parsePDFFile(testBuffer, "docupipe")
  .then(result => {
    console.log("✅ DOCUPIPE SUCCESS!");
    console.log("Vessel Tag:", result.vesselTagNumber);
    console.log("Vessel Name:", result.vesselName);
    console.log("TML Readings:", result.tmlReadings?.length || 0);
    console.log("");
    
    console.log("Testing Manus parser...");
    return parsePDFFile(testBuffer, "manus");
  })
  .then(result => {
    console.log("✅ MANUS SUCCESS!");
    console.log("Vessel Tag:", result.vesselTagNumber);
    console.log("Vessel Name:", result.vesselName);
    console.log("TML Readings:", result.tmlReadings?.length || 0);
    console.log("");
    console.log("=== ALL TESTS PASSED ===");
  })
  .catch(error => {
    console.error("❌ TEST FAILED:", error.message);
    process.exit(1);
  });

