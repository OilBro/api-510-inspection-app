import { getDb } from "./server/db";
import { professionalReports, componentCalculations } from "./drizzle/schema";

async function checkComponents() {
  const db = await getDb();
  if (!db) {
    console.log("Database not available");
    return;
  }
  
  const reports = await db.select().from(professionalReports);
  console.log("Total professional reports:", reports.length);
  
  if (reports.length > 0) {
    console.log("\nFirst report:", reports[0]);
    
    const components = await db.select().from(componentCalculations);
    console.log("\nTotal component calculations:", components.length);
    
    if (components.length > 0) {
      console.log("First component:", components[0]);
    }
  }
  
  process.exit(0);
}

checkComponents();
