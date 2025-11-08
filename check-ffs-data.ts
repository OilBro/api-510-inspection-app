import { getDb } from './server/db';
import { inspections, professionalReports, ffsAssessments, inLieuOfAssessments } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function checkData() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('\n📊 Database Check:\n');

  // Check recent inspections
  const insp = await db
    .select()
    .from(inspections)
    .orderBy(desc(inspections.createdAt))
    .limit(3);
  console.log('Recent Inspections:');
  insp.forEach(i => {
    console.log(`  - ID: ${i.id}, Vessel: ${i.vesselTagNumber}, Created: ${i.createdAt}`);
  });

  // Check recent reports
  const reports = await db
    .select()
    .from(professionalReports)
    .orderBy(desc(professionalReports.createdAt))
    .limit(3);
  console.log('\nRecent Professional Reports:');
  reports.forEach(r => {
    console.log(`  - Report ID: ${r.id}`);
    console.log(`    Inspection ID: ${r.inspectionId}`);
    console.log(`    Report Number: ${r.reportNumber}`);
    console.log(`    Inspector: ${r.inspectorName}`);
  });

  // Check FFS assessments
  const ffs = await db
    .select()
    .from(ffsAssessments)
    .orderBy(desc(ffsAssessments.createdAt))
    .limit(3);
  console.log('\nFFS Assessments:');
  if (ffs.length === 0) {
    console.log('  ❌ No FFS assessments found');
  } else {
    ffs.forEach(f => {
      console.log(`  - FFS ID: ${f.id}`);
      console.log(`    Inspection ID: ${f.inspectionId}`);
      console.log(`    Result: ${f.assessmentResult}`);
      console.log(`    Flaw Type: ${f.flawType}`);
    });
  }

  // Check In-Lieu-Of assessments
  const inLieu = await db
    .select()
    .from(inLieuOfAssessments)
    .orderBy(desc(inLieuOfAssessments.createdAt))
    .limit(3);
  console.log('\nIn-Lieu-Of Assessments:');
  if (inLieu.length === 0) {
    console.log('  ❌ No In-Lieu-Of assessments found');
  } else {
    inLieu.forEach(il => {
      console.log(`  - In-Lieu-Of ID: ${il.id}`);
      console.log(`    Inspection ID: ${il.inspectionId}`);
      console.log(`    Result: ${il.qualificationResult}`);
      console.log(`    Basis: ${il.qualificationBasis}`);
    });
  }
}

checkData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

