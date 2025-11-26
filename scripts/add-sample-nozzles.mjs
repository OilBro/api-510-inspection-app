import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { nozzleEvaluations } from '../drizzle/schema.js';
import { randomUUID } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Get the first inspection ID from the database
const inspections = await db.execute('SELECT id FROM inspections LIMIT 1');
const inspectionId = inspections[0]?.[0]?.id;

if (!inspectionId) {
  console.error('No inspections found in database');
  process.exit(1);
}

console.log(`Adding sample nozzles to inspection: ${inspectionId}`);

const sampleNozzles = [
  {
    id: randomUUID(),
    inspectionId,
    nozzleNumber: '24',
    nozzleDescription: 'Manhole',
    location: 'Shell',
    nominalSize: '24"',
    schedule: 'STD',
    actualThickness: '0.375',
    pipeNominalThickness: '0.375',
    pipeMinusManufacturingTolerance: '0.328',
    shellHeadRequiredThickness: '0.530',
    minimumRequired: '0.328',
    status: 'acceptable',
  },
  {
    id: randomUUID(),
    inspectionId,
    nozzleNumber: 'N1',
    nozzleDescription: 'Relief',
    location: 'Top Head',
    nominalSize: '3"',
    schedule: 'SCH 40',
    actualThickness: '0.216',
    pipeNominalThickness: '0.216',
    pipeMinusManufacturingTolerance: '0.189',
    shellHeadRequiredThickness: '0.526',
    minimumRequired: '0.189',
    status: 'acceptable',
  },
  {
    id: randomUUID(),
    inspectionId,
    nozzleNumber: 'N2',
    nozzleDescription: 'Vapor Out',
    location: 'Top Head',
    nominalSize: '2"',
    schedule: 'SCH 40',
    actualThickness: '0.154',
    pipeNominalThickness: '0.154',
    pipeMinusManufacturingTolerance: '0.135',
    shellHeadRequiredThickness: '0.526',
    minimumRequired: '0.135',
    status: 'acceptable',
  },
  {
    id: randomUUID(),
    inspectionId,
    nozzleNumber: 'N3',
    nozzleDescription: 'Reactor Feed',
    location: 'Shell',
    nominalSize: '2"',
    schedule: 'SCH 40',
    actualThickness: '0.154',
    pipeNominalThickness: '0.154',
    pipeMinusManufacturingTolerance: '0.135',
    shellHeadRequiredThickness: '0.530',
    minimumRequired: '0.135',
    status: 'acceptable',
  },
  {
    id: randomUUID(),
    inspectionId,
    nozzleNumber: 'N4',
    nozzleDescription: 'Drain',
    location: 'Bottom Head',
    nominalSize: '2"',
    schedule: 'SCH 40',
    actualThickness: '0.154',
    pipeNominalThickness: '0.154',
    pipeMinusManufacturingTolerance: '0.135',
    shellHeadRequiredThickness: '0.526',
    minimumRequired: '0.135',
    status: 'acceptable',
  },
];

for (const nozzle of sampleNozzles) {
  await db.insert(nozzleEvaluations).values(nozzle);
  console.log(`✓ Added nozzle ${nozzle.nozzleNumber}: ${nozzle.nozzleDescription}`);
}

console.log('\n✅ Sample nozzles added successfully!');
await connection.end();
