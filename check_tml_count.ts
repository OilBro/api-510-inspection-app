import { getDb } from "./server/db";
import { tmlReadings } from "./drizzle/schema";

async function checkTmlCount() {
  const db = await getDb();
  if (!db) {
    console.log("Database not available");
    return;
  }
  
  const allReadings = await db.select().from(tmlReadings);
  console.log("Total TML readings in database:", allReadings.length);
  
  if (allReadings.length > 0) {
    console.log("First reading:", allReadings[0]);
    console.log("Last reading:", allReadings[allReadings.length - 1]);
  }
  
  process.exit(0);
}

checkTmlCount();
