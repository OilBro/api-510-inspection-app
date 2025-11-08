import { nanoid } from 'nanoid';
import { getDb } from './server/db';
import { inspections, professionalReports, componentCalculations, ffsAssessments, inLieuOfAssessments, tmlReadings } from './drizzle/schema';

async function createSampleInspectionWithFFS() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  console.log('Creating sample inspection with FFS assessment...\n');

  // Create inspection with vessel data
  const inspectionId = nanoid();
  await db.insert(inspections).values({
    id: inspectionId,
    userId: 'test-user',
    vesselTagNumber: 'V-101',
    vesselName: 'Test Pressure Vessel V-101',
    manufacturer: 'ABC Fabricators',
    yearBuilt: 2010,
    designPressure: '250',
    designTemperature: '450',
    operatingPressure: '200',
    materialSpec: 'SA-516 Grade 70',
    vesselType: 'Vertical',
    insideDiameter: '48',
    overallLength: '120',
    status: 'completed',
    createdAt: new Date(),
  });
  console.log(`✅ Created inspection: ${inspectionId}`);

  // Create professional report
  const reportId = nanoid();
  await db.insert(professionalReports).values({
    id: reportId,
    inspectionId: inspectionId,
    reportNumber: 'RPT-2024-001',
    inspectorName: 'John Smith',
    inspectorCertification: 'API 510 #12345',
    clientName: 'OilPro Industries',
    clientAddress: '123 Industrial Blvd, Houston, TX 77001',
    inspectionDate: new Date('2024-01-15'),
    reportDate: new Date('2024-01-20'),
    executiveSummary: 'This report presents the findings of an API 510 pressure vessel inspection conducted on vessel V-101. The inspection included visual examination, thickness measurements, and fitness-for-service assessment. Overall vessel condition is acceptable with recommendations for continued monitoring.',
    createdAt: new Date(),
  });
  console.log(`✅ Created professional report: ${reportId}`);

  // Create component calculation (Shell)
  const componentId = nanoid();
  await db.insert(componentCalculations).values({
    id: componentId,
    reportId: reportId,
    componentName: 'Shell Section 1',
    componentType: 'shell',
    materialCode: 'SA516-70',
    materialName: 'SA-516 Grade 70',
    designTemperature: '450',
    designMAWP: '250',
    staticHead: '5.2',
    corrosionAllowance: '0.125',
    insideDiameter: '48.0',
    nominalThickness: '0.500',
    measuredThickness: '0.420',
    jointEfficiency: '1.0',
    allowableStress: '20000',
    minimumThickness: '0.295',
    corrosionRate: '0.0080',
    remainingLife: '15.63',
    thicknessAtNextInspection: '0.380',
    pressureAtNextInspection: '245.5',
    mawpAtNextInspection: '245.5',
    createdAt: new Date(),
  });
  console.log(`✅ Created component calculation: ${componentId}`);

  // Create FFS assessment
  const ffsId = nanoid();
  await db.insert(ffsAssessments).values({
    id: ffsId,
    inspectionId: inspectionId,
    assessmentLevel: 'level1',
    damageType: 'General Metal Loss',
    remainingThickness: '0.420',
    minimumRequired: '0.295',
    futureCorrosionAllowance: '0.125',
    acceptable: true,
    remainingLife: '15.63',
    nextInspectionDate: new Date('2029-01-15'),
    assessmentNotes: 'Level 1 FFS assessment conducted per API 579-1/ASME FFS-1. Flaw location: Shell Section 1, Lower Quadrant. Flaw dimensions: 12.0" length x 8.0" width x 0.080" depth. Remaining strength factor (RSF) = 1.42, which exceeds acceptance criteria of RSF > 1.0.',
    recommendations: 'Continue monitoring at next scheduled inspection. Re-evaluate if corrosion rate increases.',
    createdAt: new Date(),
  });
  console.log(`✅ Created FFS assessment: ${ffsId}`);

  // Create In-Lieu-Of assessment
  const inLieuId = nanoid();
  await db.insert(inLieuOfAssessments).values({
    id: inLieuId,
    inspectionId: inspectionId,
    cleanService: true,
    noCorrosionHistory: false,
    effectiveExternalInspection: true,
    processMonitoring: true,
    thicknessMonitoring: true,
    qualified: true,
    maxInterval: 10,
    nextInternalDue: new Date('2029-01-15'),
    justification: 'Vessel qualifies for In-Lieu-Of internal inspection per API 510 Section 6.4.3. Criteria met: (1) Corrosion rate < 0.010 mpy (actual: 0.0080 mpy), (2) Remaining life > 10 years (actual: 15.63 years), (3) No evidence of cracking or other damage mechanisms, (4) Effective CML program in place with regular external inspections and thickness monitoring.',
    monitoringPlan: 'Continue external inspection every 2.5 years. Maintain thickness monitoring program with annual TML readings at all CML locations. Review corrosion rate trends annually. Next internal inspection due: January 2029.',
    createdAt: new Date(),
  });
  console.log(`✅ Created In-Lieu-Of assessment: ${inLieuId}`);

  // Create some TML readings
  const tmlData = [
    { tmlId: 'Shell-CML-1', component: 'Shell', nominal: 0.500, previous: 0.480, current: 0.420 },
    { tmlId: 'Shell-CML-2', component: 'Shell', nominal: 0.500, previous: 0.475, current: 0.415 },
    { tmlId: 'Shell-CML-3', component: 'Shell', nominal: 0.500, previous: 0.485, current: 0.425 },
    { tmlId: 'Head-CML-1', component: 'East Head', nominal: 0.375, previous: 0.360, current: 0.340 },
    { tmlId: 'Head-CML-2', component: 'East Head', nominal: 0.375, previous: 0.365, current: 0.345 },
  ];

  for (const tml of tmlData) {
    const loss = tml.nominal - tml.current;
    const lossPercent = (loss / tml.nominal) * 100;
    const corrosionRate = (tml.previous - tml.current) / 5.0; // 5 years between inspections
    
    await db.insert(tmlReadings).values({
      id: nanoid(),
      inspectionId: inspectionId,
      tmlId: tml.tmlId,
      component: tml.component,
      nominalThickness: tml.nominal.toFixed(4),
      previousThickness: tml.previous.toFixed(4),
      currentThickness: tml.current.toFixed(4),
      loss: loss.toFixed(4),
      lossPercent: lossPercent.toFixed(2),
      corrosionRate: corrosionRate.toFixed(4),
      status: lossPercent > 20 ? 'critical' : lossPercent > 10 ? 'monitor' : 'good',
      createdAt: new Date(),
    });
  }
  console.log(`✅ Created ${tmlData.length} TML readings`);

  console.log('\n📊 Sample Data Summary:');
  console.log(`   Inspection ID: ${inspectionId}`);
  console.log(`   Report ID: ${reportId}`);
  console.log(`   Component ID: ${componentId}`);
  console.log(`   FFS Assessment ID: ${ffsId}`);
  console.log(`   In-Lieu-Of Assessment ID: ${inLieuId}`);
  console.log(`   TML Readings: ${tmlData.length}`);

  console.log('\n✅ Sample inspection created successfully!');
  console.log(`\n🔗 View in browser: http://localhost:3000/inspections/${inspectionId}`);
  
  return { inspectionId, reportId };
}

createSampleInspectionWithFFS()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

