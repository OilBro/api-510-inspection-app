// Seed script for materialStressValues table
// Populates database with ASME allowable stress data

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// Material stress data from ASME Section VIII Division 1
const MATERIAL_STRESS_DATA = [
  // SA-240 Type 304 (Stainless Steel)
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: -20, allowableStress: 20000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 100, allowableStress: 20000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 200, allowableStress: 20000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 300, allowableStress: 19000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 400, allowableStress: 18000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 500, allowableStress: 17000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 600, allowableStress: 16000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 700, allowableStress: 15500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 304", materialGrade: "Type 304", materialCategory: "Stainless Steel", temperatureF: 800, allowableStress: 15000, asmeTable: "1A", asmeEdition: "2023" },

  // SA-516 Grade 70 (Carbon Steel)
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: -20, allowableStress: 17500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 100, allowableStress: 17500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 200, allowableStress: 17500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 300, allowableStress: 17000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 400, allowableStress: 16500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 500, allowableStress: 16000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 600, allowableStress: 15000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-516 Grade 70", materialGrade: "Grade 70", materialCategory: "Carbon Steel", temperatureF: 650, allowableStress: 13500, asmeTable: "1A", asmeEdition: "2023" },

  // SA-240 Type 316 (Stainless Steel)
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: -20, allowableStress: 20000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 100, allowableStress: 20000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 200, allowableStress: 19000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 300, allowableStress: 18000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 400, allowableStress: 17000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 500, allowableStress: 16000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 600, allowableStress: 15000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 700, allowableStress: 14500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-240 Type 316", materialGrade: "Type 316", materialCategory: "Stainless Steel", temperatureF: 800, allowableStress: 14000, asmeTable: "1A", asmeEdition: "2023" },

  // SA-455 (Stainless Steel)
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: -20, allowableStress: 18000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: 100, allowableStress: 18000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: 200, allowableStress: 18000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: 300, allowableStress: 17500, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: 400, allowableStress: 17000, asmeTable: "1A", asmeEdition: "2023" },
  { materialSpec: "SA-455", materialGrade: "SA-455", materialCategory: "Stainless Steel", temperatureF: 500, allowableStress: 16500, asmeTable: "1A", asmeEdition: "2023" },
];

async function seedMaterialStress() {
  console.log('🌱 Starting material stress database seeding...\n');

  // Connect to database
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    // Check if table already has data
    const [existingData] = await connection.query(
      'SELECT COUNT(*) as count FROM materialStressValues'
    );
    const count = existingData[0].count;

    if (count > 0) {
      console.log(`⚠️  Table already contains ${count} records.`);
      console.log('   Clear the table first if you want to re-seed.\n');
      
      const shouldContinue = process.argv.includes('--force');
      if (!shouldContinue) {
        console.log('   Use --force flag to clear and re-seed.');
        await connection.end();
        return;
      }

      console.log('   --force flag detected. Clearing existing data...');
      await connection.query('DELETE FROM materialStressValues');
      console.log('   ✓ Existing data cleared\n');
    }

    // Insert material stress data
    console.log(`📊 Inserting ${MATERIAL_STRESS_DATA.length} material stress records...\n`);

    for (const record of MATERIAL_STRESS_DATA) {
      await connection.query(
        `INSERT INTO materialStressValues 
         (materialSpec, materialGrade, materialCategory, temperatureF, allowableStress, asmeTable, asmeEdition) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          record.materialSpec,
          record.materialGrade,
          record.materialCategory,
          record.temperatureF,
          record.allowableStress,
          record.asmeTable,
          record.asmeEdition,
        ]
      );
    }

    console.log('✅ Material stress data seeded successfully!\n');

    // Display summary
    const [summary] = await connection.query(`
      SELECT 
        materialSpec,
        COUNT(*) as temperaturePoints,
        MIN(temperatureF) as minTemp,
        MAX(temperatureF) as maxTemp,
        MIN(allowableStress) as minStress,
        MAX(allowableStress) as maxStress
      FROM materialStressValues
      GROUP BY materialSpec
      ORDER BY materialSpec
    `);

    console.log('📋 Summary by Material:\n');
    console.table(summary);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('\n✓ Database connection closed');
  }
}

// Run seed script
seedMaterialStress()
  .then(() => {
    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
