import { getDb } from './server/db';
import { ffsAssessments, inLieuOfAssessments, professionalReports } from './drizzle/schema';
import { desc } from 'drizzle-orm';

async function checkFFS() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('\n🔍 Checking FFS and In-Lieu-Of data...\n');

  // Get all FFS assessments
  const ffsData = await db.select().from(ffsAssessments).orderBy(desc(ffsAssessments.createdAt));
  
  console.log(`📊 Found ${ffsData.length} FFS assessments:`);
  ffsData.forEach((ffs, index) => {
    console.log(`\n${index + 1}. FFS Assessment:`);
    console.log(`   ID: ${ffs.id}`);
    console.log(`   Inspection ID: ${ffs.inspectionId}`);
    console.log(`   Damage Type: ${ffs.damageType}`);
    console.log(`   Assessment Level: ${ffs.assessmentLevel}`);
    console.log(`   Remaining Thickness: ${ffs.remainingThickness}`);
    console.log(`   Min Required: ${ffs.minimumRequired}`);
    console.log(`   Acceptable: ${ffs.acceptable}`);
    console.log(`   Remaining Life: ${ffs.remainingLife}`);
  });

  // Get all In-Lieu-Of assessments
  const inLieuData = await db.select().from(inLieuOfAssessments).orderBy(desc(inLieuOfAssessments.createdAt));
  
  console.log(`\n\n📊 Found ${inLieuData.length} In-Lieu-Of assessments:`);
  inLieuData.forEach((ilo, index) => {
    console.log(`\n${index + 1}. In-Lieu-Of Assessment:`);
    console.log(`   ID: ${ilo.id}`);
    console.log(`   Inspection ID: ${ilo.inspectionId}`);
    console.log(`   Clean Service: ${ilo.cleanService}`);
    console.log(`   No Corrosion History: ${ilo.noCorrosionHistory}`);
    console.log(`   Qualified: ${ilo.qualified}`);
    console.log(`   Max Interval: ${ilo.maxInterval}`);
  });

  // Get professional reports and their inspection IDs
  console.log('\n\n📄 Professional Reports:');
  const reports = await db.select().from(professionalReports).orderBy(desc(professionalReports.createdAt)).limit(5);
  
  reports.forEach((report, index) => {
    console.log(`\n${index + 1}. Report ${report.reportNumber}:`);
    console.log(`   Report ID: ${report.id}`);
    console.log(`   Inspection ID: ${report.inspectionId}`);
    
    // Check if this inspection has FFS data
    const hasFFS = ffsData.some(f => f.inspectionId === report.inspectionId);
    const hasILO = inLieuData.some(i => i.inspectionId === report.inspectionId);
    console.log(`   Has FFS: ${hasFFS}`);
    console.log(`   Has In-Lieu-Of: ${hasILO}`);
  });

  console.log('\n✅ Check complete!');
}

checkFFS().catch(console.error);

