import { getDb } from './server/professionalReportDb.js';
import { professionalReports } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';

const db = await getDb();
const report = await db.select().from(professionalReports).where(eq(professionalReports.reportNumber, 'RPT-1762398384759')).limit(1);

if (report.length > 0) {
  console.log('Found report:');
  console.log('Report ID:', report[0].id);
  console.log('Inspection ID:', report[0].inspectionId);
  console.log('Report Number:', report[0].reportNumber);
} else {
  console.log('Report not found. Listing all reports:');
  const allReports = await db.select().from(professionalReports).limit(10);
  allReports.forEach(r => {
    console.log(`- ${r.reportNumber} (ID: ${r.id}, Inspection: ${r.inspectionId})`);
  });
}

