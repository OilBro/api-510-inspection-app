/**
 * Populate pipe schedule database with ASME B36.10M standard pipe dimensions
 * This data is used for nozzle minimum thickness calculations per ASME UG-45
 */

import { getDb } from './server/db.js';
import { pipeSchedules } from './drizzle/schema.js';
import { nanoid } from 'nanoid';

interface PipeData {
  nominalSize: string;
  schedule: string;
  outsideDiameter: number;
  wallThickness: number;
}

// ASME B36.10M Pipe Schedule Data
// Dimensions in inches
const pipeData: PipeData[] = [
  // NPS 1/2"
  { nominalSize: '1/2', schedule: '10', outsideDiameter: 0.840, wallThickness: 0.083 },
  { nominalSize: '1/2', schedule: 'STD', outsideDiameter: 0.840, wallThickness: 0.109 },
  { nominalSize: '1/2', schedule: '40', outsideDiameter: 0.840, wallThickness: 0.109 },
  { nominalSize: '1/2', schedule: 'XS', outsideDiameter: 0.840, wallThickness: 0.147 },
  { nominalSize: '1/2', schedule: '80', outsideDiameter: 0.840, wallThickness: 0.147 },
  { nominalSize: '1/2', schedule: 'XXS', outsideDiameter: 0.840, wallThickness: 0.294 },
  
  // NPS 3/4"
  { nominalSize: '3/4', schedule: '10', outsideDiameter: 1.050, wallThickness: 0.083 },
  { nominalSize: '3/4', schedule: 'STD', outsideDiameter: 1.050, wallThickness: 0.113 },
  { nominalSize: '3/4', schedule: '40', outsideDiameter: 1.050, wallThickness: 0.113 },
  { nominalSize: '3/4', schedule: 'XS', outsideDiameter: 1.050, wallThickness: 0.154 },
  { nominalSize: '3/4', schedule: '80', outsideDiameter: 1.050, wallThickness: 0.154 },
  { nominalSize: '3/4', schedule: 'XXS', outsideDiameter: 1.050, wallThickness: 0.308 },
  
  // NPS 1"
  { nominalSize: '1', schedule: '10', outsideDiameter: 1.315, wallThickness: 0.109 },
  { nominalSize: '1', schedule: 'STD', outsideDiameter: 1.315, wallThickness: 0.133 },
  { nominalSize: '1', schedule: '40', outsideDiameter: 1.315, wallThickness: 0.133 },
  { nominalSize: '1', schedule: 'XS', outsideDiameter: 1.315, wallThickness: 0.179 },
  { nominalSize: '1', schedule: '80', outsideDiameter: 1.315, wallThickness: 0.179 },
  { nominalSize: '1', schedule: 'XXS', outsideDiameter: 1.315, wallThickness: 0.358 },
  
  // NPS 1-1/4"
  { nominalSize: '1-1/4', schedule: '10', outsideDiameter: 1.660, wallThickness: 0.109 },
  { nominalSize: '1-1/4', schedule: 'STD', outsideDiameter: 1.660, wallThickness: 0.140 },
  { nominalSize: '1-1/4', schedule: '40', outsideDiameter: 1.660, wallThickness: 0.140 },
  { nominalSize: '1-1/4', schedule: 'XS', outsideDiameter: 1.660, wallThickness: 0.191 },
  { nominalSize: '1-1/4', schedule: '80', outsideDiameter: 1.660, wallThickness: 0.191 },
  { nominalSize: '1-1/4', schedule: 'XXS', outsideDiameter: 1.660, wallThickness: 0.382 },
  
  // NPS 1-1/2"
  { nominalSize: '1-1/2', schedule: '10', outsideDiameter: 1.900, wallThickness: 0.109 },
  { nominalSize: '1-1/2', schedule: 'STD', outsideDiameter: 1.900, wallThickness: 0.145 },
  { nominalSize: '1-1/2', schedule: '40', outsideDiameter: 1.900, wallThickness: 0.145 },
  { nominalSize: '1-1/2', schedule: 'XS', outsideDiameter: 1.900, wallThickness: 0.200 },
  { nominalSize: '1-1/2', schedule: '80', outsideDiameter: 1.900, wallThickness: 0.200 },
  { nominalSize: '1-1/2', schedule: 'XXS', outsideDiameter: 1.900, wallThickness: 0.400 },
  
  // NPS 2"
  { nominalSize: '2', schedule: '10', outsideDiameter: 2.375, wallThickness: 0.109 },
  { nominalSize: '2', schedule: 'STD', outsideDiameter: 2.375, wallThickness: 0.154 },
  { nominalSize: '2', schedule: '40', outsideDiameter: 2.375, wallThickness: 0.154 },
  { nominalSize: '2', schedule: 'XS', outsideDiameter: 2.375, wallThickness: 0.218 },
  { nominalSize: '2', schedule: '80', outsideDiameter: 2.375, wallThickness: 0.218 },
  { nominalSize: '2', schedule: 'XXS', outsideDiameter: 2.375, wallThickness: 0.436 },
  
  // NPS 2-1/2"
  { nominalSize: '2-1/2', schedule: '10', outsideDiameter: 2.875, wallThickness: 0.120 },
  { nominalSize: '2-1/2', schedule: 'STD', outsideDiameter: 2.875, wallThickness: 0.203 },
  { nominalSize: '2-1/2', schedule: '40', outsideDiameter: 2.875, wallThickness: 0.203 },
  { nominalSize: '2-1/2', schedule: 'XS', outsideDiameter: 2.875, wallThickness: 0.276 },
  { nominalSize: '2-1/2', schedule: '80', outsideDiameter: 2.875, wallThickness: 0.276 },
  { nominalSize: '2-1/2', schedule: 'XXS', outsideDiameter: 2.875, wallThickness: 0.552 },
  
  // NPS 3"
  { nominalSize: '3', schedule: '10', outsideDiameter: 3.500, wallThickness: 0.120 },
  { nominalSize: '3', schedule: 'STD', outsideDiameter: 3.500, wallThickness: 0.216 },
  { nominalSize: '3', schedule: '40', outsideDiameter: 3.500, wallThickness: 0.216 },
  { nominalSize: '3', schedule: 'XS', outsideDiameter: 3.500, wallThickness: 0.300 },
  { nominalSize: '3', schedule: '80', outsideDiameter: 3.500, wallThickness: 0.300 },
  { nominalSize: '3', schedule: 'XXS', outsideDiameter: 3.500, wallThickness: 0.600 },
  
  // NPS 4"
  { nominalSize: '4', schedule: '10', outsideDiameter: 4.500, wallThickness: 0.120 },
  { nominalSize: '4', schedule: 'STD', outsideDiameter: 4.500, wallThickness: 0.237 },
  { nominalSize: '4', schedule: '40', outsideDiameter: 4.500, wallThickness: 0.237 },
  { nominalSize: '4', schedule: 'XS', outsideDiameter: 4.500, wallThickness: 0.337 },
  { nominalSize: '4', schedule: '80', outsideDiameter: 4.500, wallThickness: 0.337 },
  { nominalSize: '4', schedule: 'XXS', outsideDiameter: 4.500, wallThickness: 0.674 },
  
  // NPS 6"
  { nominalSize: '6', schedule: '10', outsideDiameter: 6.625, wallThickness: 0.134 },
  { nominalSize: '6', schedule: 'STD', outsideDiameter: 6.625, wallThickness: 0.280 },
  { nominalSize: '6', schedule: '40', outsideDiameter: 6.625, wallThickness: 0.280 },
  { nominalSize: '6', schedule: 'XS', outsideDiameter: 6.625, wallThickness: 0.432 },
  { nominalSize: '6', schedule: '80', outsideDiameter: 6.625, wallThickness: 0.432 },
  { nominalSize: '6', schedule: 'XXS', outsideDiameter: 6.625, wallThickness: 0.864 },
  
  // NPS 8"
  { nominalSize: '8', schedule: '10', outsideDiameter: 8.625, wallThickness: 0.148 },
  { nominalSize: '8', schedule: '20', outsideDiameter: 8.625, wallThickness: 0.250 },
  { nominalSize: '8', schedule: '30', outsideDiameter: 8.625, wallThickness: 0.277 },
  { nominalSize: '8', schedule: 'STD', outsideDiameter: 8.625, wallThickness: 0.322 },
  { nominalSize: '8', schedule: '40', outsideDiameter: 8.625, wallThickness: 0.322 },
  { nominalSize: '8', schedule: 'XS', outsideDiameter: 8.625, wallThickness: 0.500 },
  { nominalSize: '8', schedule: '80', outsideDiameter: 8.625, wallThickness: 0.500 },
  { nominalSize: '8', schedule: 'XXS', outsideDiameter: 8.625, wallThickness: 0.875 },
  
  // NPS 10"
  { nominalSize: '10', schedule: '10', outsideDiameter: 10.750, wallThickness: 0.165 },
  { nominalSize: '10', schedule: '20', outsideDiameter: 10.750, wallThickness: 0.250 },
  { nominalSize: '10', schedule: '30', outsideDiameter: 10.750, wallThickness: 0.307 },
  { nominalSize: '10', schedule: 'STD', outsideDiameter: 10.750, wallThickness: 0.365 },
  { nominalSize: '10', schedule: '40', outsideDiameter: 10.750, wallThickness: 0.365 },
  { nominalSize: '10', schedule: 'XS', outsideDiameter: 10.750, wallThickness: 0.500 },
  { nominalSize: '10', schedule: '60', outsideDiameter: 10.750, wallThickness: 0.500 },
  { nominalSize: '10', schedule: '80', outsideDiameter: 10.750, wallThickness: 0.593 },
  { nominalSize: '10', schedule: 'XXS', outsideDiameter: 10.750, wallThickness: 1.000 },
  
  // NPS 12"
  { nominalSize: '12', schedule: '10', outsideDiameter: 12.750, wallThickness: 0.180 },
  { nominalSize: '12', schedule: '20', outsideDiameter: 12.750, wallThickness: 0.250 },
  { nominalSize: '12', schedule: 'STD', outsideDiameter: 12.750, wallThickness: 0.375 },
  { nominalSize: '12', schedule: '30', outsideDiameter: 12.750, wallThickness: 0.330 },
  { nominalSize: '12', schedule: '40', outsideDiameter: 12.750, wallThickness: 0.406 },
  { nominalSize: '12', schedule: 'XS', outsideDiameter: 12.750, wallThickness: 0.500 },
  { nominalSize: '12', schedule: '60', outsideDiameter: 12.750, wallThickness: 0.562 },
  { nominalSize: '12', schedule: '80', outsideDiameter: 12.750, wallThickness: 0.687 },
  { nominalSize: '12', schedule: 'XXS', outsideDiameter: 12.750, wallThickness: 1.000 },
  
  // NPS 14" (OD series)
  { nominalSize: '14', schedule: '10', outsideDiameter: 14.000, wallThickness: 0.188 },
  { nominalSize: '14', schedule: '20', outsideDiameter: 14.000, wallThickness: 0.250 },
  { nominalSize: '14', schedule: '30', outsideDiameter: 14.000, wallThickness: 0.312 },
  { nominalSize: '14', schedule: 'STD', outsideDiameter: 14.000, wallThickness: 0.375 },
  { nominalSize: '14', schedule: '40', outsideDiameter: 14.000, wallThickness: 0.437 },
  { nominalSize: '14', schedule: 'XS', outsideDiameter: 14.000, wallThickness: 0.500 },
  { nominalSize: '14', schedule: '60', outsideDiameter: 14.000, wallThickness: 0.593 },
  { nominalSize: '14', schedule: '80', outsideDiameter: 14.000, wallThickness: 0.750 },
  
  // NPS 16"
  { nominalSize: '16', schedule: '10', outsideDiameter: 16.000, wallThickness: 0.188 },
  { nominalSize: '16', schedule: '20', outsideDiameter: 16.000, wallThickness: 0.250 },
  { nominalSize: '16', schedule: '30', outsideDiameter: 16.000, wallThickness: 0.312 },
  { nominalSize: '16', schedule: 'STD', outsideDiameter: 16.000, wallThickness: 0.375 },
  { nominalSize: '16', schedule: '40', outsideDiameter: 16.000, wallThickness: 0.500 },
  { nominalSize: '16', schedule: 'XS', outsideDiameter: 16.000, wallThickness: 0.500 },
  { nominalSize: '16', schedule: '60', outsideDiameter: 16.000, wallThickness: 0.656 },
  { nominalSize: '16', schedule: '80', outsideDiameter: 16.000, wallThickness: 0.843 },
  
  // NPS 18"
  { nominalSize: '18', schedule: '10', outsideDiameter: 18.000, wallThickness: 0.188 },
  { nominalSize: '18', schedule: '20', outsideDiameter: 18.000, wallThickness: 0.250 },
  { nominalSize: '18', schedule: 'STD', outsideDiameter: 18.000, wallThickness: 0.375 },
  { nominalSize: '18', schedule: '30', outsideDiameter: 18.000, wallThickness: 0.437 },
  { nominalSize: '18', schedule: 'XS', outsideDiameter: 18.000, wallThickness: 0.500 },
  { nominalSize: '18', schedule: '40', outsideDiameter: 18.000, wallThickness: 0.562 },
  { nominalSize: '18', schedule: '60', outsideDiameter: 18.000, wallThickness: 0.750 },
  { nominalSize: '18', schedule: '80', outsideDiameter: 18.000, wallThickness: 0.937 },
  
  // NPS 20"
  { nominalSize: '20', schedule: '10', outsideDiameter: 20.000, wallThickness: 0.188 },
  { nominalSize: '20', schedule: '20', outsideDiameter: 20.000, wallThickness: 0.250 },
  { nominalSize: '20', schedule: 'STD', outsideDiameter: 20.000, wallThickness: 0.375 },
  { nominalSize: '20', schedule: '30', outsideDiameter: 20.000, wallThickness: 0.500 },
  { nominalSize: '20', schedule: 'XS', outsideDiameter: 20.000, wallThickness: 0.500 },
  { nominalSize: '20', schedule: '40', outsideDiameter: 20.000, wallThickness: 0.593 },
  { nominalSize: '20', schedule: '60', outsideDiameter: 20.000, wallThickness: 0.812 },
  { nominalSize: '20', schedule: '80', outsideDiameter: 20.000, wallThickness: 1.031 },
  
  // NPS 24"
  { nominalSize: '24', schedule: '10', outsideDiameter: 24.000, wallThickness: 0.218 },
  { nominalSize: '24', schedule: '20', outsideDiameter: 24.000, wallThickness: 0.250 },
  { nominalSize: 'STD', schedule: 'STD', outsideDiameter: 24.000, wallThickness: 0.375 },
  { nominalSize: '24', schedule: '30', outsideDiameter: 24.000, wallThickness: 0.562 },
  { nominalSize: '24', schedule: 'XS', outsideDiameter: 24.000, wallThickness: 0.500 },
  { nominalSize: '24', schedule: '40', outsideDiameter: 24.000, wallThickness: 0.687 },
  { nominalSize: '24', schedule: '60', outsideDiameter: 24.000, wallThickness: 0.968 },
  { nominalSize: '24', schedule: '80', outsideDiameter: 24.000, wallThickness: 1.218 },
];

async function populatePipeSchedules() {
  console.log('🔧 Populating pipe schedule database...');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }
  
  let inserted = 0;
  let skipped = 0;
  
  for (const pipe of pipeData) {
    try {
      const insideDiameter = pipe.outsideDiameter - (2 * pipe.wallThickness);
      
      await db.insert(pipeSchedules).values({
        id: nanoid(),
        nominalSize: pipe.nominalSize,
        schedule: pipe.schedule,
        outsideDiameter: pipe.outsideDiameter.toString(),
        wallThickness: pipe.wallThickness.toString(),
        insideDiameter: insideDiameter.toFixed(4),
      });
      
      inserted++;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        skipped++;
      } else {
        console.error(`Error inserting ${pipe.nominalSize} ${pipe.schedule}:`, error.message);
      }
    }
  }
  
  console.log(`✅ Pipe schedule population complete!`);
  console.log(`   Inserted: ${inserted} records`);
  console.log(`   Skipped (duplicates): ${skipped} records`);
  console.log(`   Total in dataset: ${pipeData.length} records`);
}

populatePipeSchedules().catch(console.error);

