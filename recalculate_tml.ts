import { getDb } from "./server/db";
import { tmlReadings } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function recalculateTmlReadings() {
  const db = await getDb();
  if (!db) {
    console.log("Database not available");
    return;
  }
  
  const allReadings = await db.select().from(tmlReadings);
  console.log(`Found ${allReadings.length} TML readings to recalculate...`);
  
  let updated = 0;
  
  for (const reading of allReadings) {
    const current = reading.currentThickness ? parseFloat(String(reading.currentThickness)) : null;
    const previous = reading.previousThickness ? parseFloat(String(reading.previousThickness)) : null;
    const nominal = reading.nominalThickness ? parseFloat(String(reading.nominalThickness)) : null;
    
    let loss: string | null = null;
    let corrosionRate: string | null = null;
    
    // Calculate loss percentage: (Nominal - Current) / Nominal * 100
    if (nominal && current && nominal > 0) {
      const lossPercent = ((nominal - current) / nominal) * 100;
      loss = lossPercent.toFixed(2);
    }
    
    // Calculate corrosion rate in mpy (mils per year)
    if (previous && current) {
      const timeSpanYears = 1; // Default to 1 year
      const thicknessLoss = previous - current;
      const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000;
      corrosionRate = corrosionRateMpy.toFixed(2);
    }
    
    // Update if we calculated new values
    if (loss !== null || corrosionRate !== null) {
      await db.update(tmlReadings)
        .set({ 
          loss: loss, 
          corrosionRate: corrosionRate 
        })
        .where(eq(tmlReadings.id, reading.id));
      updated++;
    }
  }
  
  console.log(`✅ Successfully recalculated ${updated} TML readings`);
  console.log("\nSample updated reading:");
  const sample = await db.select().from(tmlReadings).limit(1);
  console.log(sample[0]);
  
  process.exit(0);
}

recalculateTmlReadings();
