import { nanoid } from "nanoid";
import { getDb, createTmlReading } from "./server/db";
import { inspections, professionalReports, componentCalculations, tmlReadings } from "./drizzle/schema";

/**
 * Comprehensive audit script to insert report 54-11-004 data
 * This tests all forms, calculations, and data flow
 */

async function auditReport() {
  console.log("🔍 Starting System Audit: Report 54-11-004");
  console.log("=" .repeat(60));
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    return;
  }

  // Step 1: Create Inspection Record
  console.log("\n📝 Step 1: Creating Inspection Record...");
  const inspectionId = nanoid();
  const inspectionData = {
    id: inspectionId,
    userId: "audit-user",
    vesselTagNumber: "54-11-004",
    vesselName: "Tank Storage Area",
    manufacturer: "Unknown",
    yearBuilt: "1981",
    designPressure: "100",
    designTemperature: "500",
    operatingPressure: null,
    operatingTemperature: null,
    materialSpec: "Carbon Steel",
    vesselType: "Horizontal",
    insideDiameter: "96.000",
    overallLength: "249",
    vesselOrientation: "horizontal",
    headType: "torispherical",
    insulationType: "None",
    insulationThickness: "0",
    product: "Tributylamine",
    constructionCode: "ASME S8 D1",
    nationalBoardNumber: "36715",
    mdmt: "-20",
  };
  
  await db.insert(inspections).values(inspectionData);
  console.log("✅ Inspection created:", inspectionId);

  // Step 2: Create Professional Report
  console.log("\n📝 Step 2: Creating Professional Report...");
  const reportId = nanoid();
  const reportData = {
    id: reportId,
    inspectionId: inspectionId,
    reportNumber: "54-11-004",
    reportDate: new Date("2017-06-20"),
    inspectorName: "Christopher welch",
    inspectorCertification: "33958",
    employerName: "OilPro Consulting LLC",
    clientName: "SACHEM",
    clientLocation: "Cleburne, TX",
    clientContact: null,
    clientApprovalName: null,
    clientApprovalTitle: null,
    executiveSummary: "An API Standard 510 In Lieu Of Internal inspection was preformed on pressure vessel 54-11-002 located at CLEBURNE, TX and was conducted on 2/24/2017. This inspection was made to collect data in order to evaluate the mechanical integrity and fitness for service of the vessel. This inspection consisted of an External VT, Phased Array, MT and UT examination on the heads and the Shell of the vessel with no major problems were noted during this inspection with minor discrepancies are listed in Section 3.0 Inspection Results and 4.0 Recommendations.",
    nextExternalInspectionClient: new Date("2018-06-20"),
    nextExternalInspectionAPI: new Date("2022-06-20"),
    nextInternalInspection: new Date("2027-06-20"),
    nextUTInspection: new Date("2027-06-20"),
    governingComponent: "Shell 1",
  };
  
  await db.insert(professionalReports).values(reportData);
  console.log("✅ Professional Report created:", reportId);

  // Step 3: Create Component Calculations
  console.log("\n📝 Step 3: Creating Component Calculations...");
  
  const components = [
    {
      id: nanoid(),
      reportId: reportId,
      componentName: "Shell 1",
      componentType: "shell",
      materialCode: "Carbon Steel",
      designTemp: "500",
      designMAWP: "100",
      nominalThickness: "0.312",
      actualThickness: "0.292",
      minimumThickness: "0.260",
      mawpAtNextInspection: "107.9",
      remainingLife: "56.7",
    },
    {
      id: nanoid(),
      reportId: reportId,
      componentName: "East Head",
      componentType: "head",
      materialCode: "Carbon Steel",
      designTemp: "500",
      designMAWP: "100",
      nominalThickness: "0.450",
      actualThickness: "0.485",
      minimumThickness: "0.401",
      mawpAtNextInspection: "121.4",
      remainingLife: "20",
    },
    {
      id: nanoid(),
      reportId: reportId,
      componentName: "West Head",
      componentType: "head",
      materialCode: "Carbon Steel",
      designTemp: "500",
      designMAWP: "100",
      nominalThickness: "0.450",
      actualThickness: "0.478",
      minimumThickness: "0.401",
      mawpAtNextInspection: "119.6",
      remainingLife: "20",
    },
  ];
  
  for (const comp of components) {
    await db.insert(componentCalculations).values(comp);
    console.log(`✅ Component created: ${comp.componentName}`);
  }

  // Step 4: Create TML Readings (sample from Appendix A)
  console.log("\n📝 Step 4: Creating TML Readings...");
  
  const tmlData = [
    // East Head
    { tmlId: "001", component: "East Head", location: "1-C", nominal: "0.450", previous: "0.450", current: "0.485" },
    { tmlId: "002", component: "East Head", location: "2-B", nominal: "0.450", previous: "0.450", current: "0.490" },
    { tmlId: "003", component: "East Head", location: "3-L", nominal: "0.450", previous: "0.450", current: "0.486" },
    { tmlId: "004", component: "East Head", location: "4-T", nominal: "0.450", previous: "0.450", current: "0.512" },
    { tmlId: "005", component: "East Head", location: "5-R", nominal: "0.450", previous: "0.450", current: "0.494" },
    // Vessel Shell
    { tmlId: "014", component: "Vessel Shell", location: "7-0", nominal: "0.312", previous: "0.312", current: "0.313" },
    { tmlId: "015", component: "Vessel Shell", location: "7-45", nominal: "0.312", previous: "0.312", current: "0.313" },
    { tmlId: "023", component: "Vessel Shell", location: "8-45", nominal: "0.312", previous: "0.312", current: "0.312" },
    { tmlId: "024", component: "Vessel Shell", location: "8-90", nominal: "0.312", previous: "0.312", current: "0.301" },
    { tmlId: "025", component: "Vessel Shell", location: "8-135", nominal: "0.312", previous: "0.312", current: "0.303" },
  ];
  
  let tmlCount = 0;
  for (const tml of tmlData) {
    const tmlRecord = {
      id: nanoid(),
      inspectionId: inspectionId,
      tmlId: tml.tmlId,
      component: tml.component,
      nominalThickness: tml.nominal,
      previousThickness: tml.previous,
      currentThickness: tml.current,
      status: "good" as const,
    };
    
    await createTmlReading(tmlRecord);
    tmlCount++;
  }
  console.log(`✅ Created ${tmlCount} TML readings`);

  // Step 5: Verify Calculations
  console.log("\n📝 Step 5: Verifying TML Auto-Calculations...");
  const readings = await db.select().from(tmlReadings).where(eq(tmlReadings.inspectionId, inspectionId));
  
  let calculationsCorrect = 0;
  let calculationsIncorrect = 0;
  
  for (const reading of readings) {
    const current = parseFloat(String(reading.currentThickness || "0"));
    const previous = parseFloat(String(reading.previousThickness || "0"));
    const nominal = parseFloat(String(reading.nominalThickness || "0"));
    
    // Calculate expected values
    const expectedLoss = nominal > 0 ? (((nominal - current) / nominal) * 100).toFixed(2) : null;
    const expectedCorrRate = previous && current ? (((previous - current) / 1) * 1000).toFixed(2) : null;
    
    const actualLoss = reading.loss;
    const actualCorrRate = reading.corrosionRate;
    
    if (expectedLoss === actualLoss && expectedCorrRate === actualCorrRate) {
      calculationsCorrect++;
    } else {
      calculationsIncorrect++;
      console.log(`⚠️  TML ${reading.tmlId}: Expected loss=${expectedLoss}, got=${actualLoss}; Expected rate=${expectedCorrRate}, got=${actualCorrRate}`);
    }
  }
  
  console.log(`✅ Calculations correct: ${calculationsCorrect}/${readings.length}`);
  if (calculationsIncorrect > 0) {
    console.log(`❌ Calculations incorrect: ${calculationsIncorrect}/${readings.length}`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 AUDIT SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Inspection ID: ${inspectionId}`);
  console.log(`✅ Report ID: ${reportId}`);
  console.log(`✅ Components: ${components.length}`);
  console.log(`✅ TML Readings: ${tmlCount}`);
  console.log(`✅ Calculations Verified: ${calculationsCorrect}/${readings.length}`);
  console.log("\n🎯 Next Steps:");
  console.log("1. Log into https://oilpro510.manus.space");
  console.log("2. Navigate to 'My Inspections'");
  console.log(`3. Find inspection '54-11-004'`);
  console.log("4. Review all tabs and verify data accuracy");
  console.log("5. Generate PDF and compare to original report");
  
  process.exit(0);
}

// Import eq from drizzle
import { eq } from "drizzle-orm";

auditReport().catch(console.error);
