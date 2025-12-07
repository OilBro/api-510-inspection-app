/**
 * Bulk insert comprehensive material stress data
 * Run with: node scripts/insertMaterials.mjs
 */

import { config } from 'dotenv';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

// Material data
const comprehensiveMaterialData = [
  // Carbon Steel Plate Materials
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 500, allowableStressPsi: 17100 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 600, allowableStressPsi: 15700 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 650, allowableStressPsi: 14300 },
  { materialCode: 'SA-515 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 700, allowableStressPsi: 12100 },
  
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 500, allowableStressPsi: 19500 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 600, allowableStressPsi: 17900 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 650, allowableStressPsi: 16300 },
  { materialCode: 'SA-515 Gr 70', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/high-temp service', temperatureF: 700, allowableStressPsi: 13800 },
  
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: -20, allowableStressPsi: 15000 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 100, allowableStressPsi: 15000 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 200, allowableStressPsi: 15000 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 300, allowableStressPsi: 15000 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 400, allowableStressPsi: 15000 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 500, allowableStressPsi: 14700 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 600, allowableStressPsi: 13500 },
  { materialCode: 'SA-516 Gr 55', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 650, allowableStressPsi: 12300 },
  
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 500, allowableStressPsi: 17100 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 600, allowableStressPsi: 15700 },
  { materialCode: 'SA-516 Gr 60', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 650, allowableStressPsi: 14300 },
  
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: -20, allowableStressPsi: 18800 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 100, allowableStressPsi: 18800 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 200, allowableStressPsi: 18800 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 300, allowableStressPsi: 18800 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 400, allowableStressPsi: 18800 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 500, allowableStressPsi: 18400 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 600, allowableStressPsi: 16900 },
  { materialCode: 'SA-516 Gr 65', category: 'Carbon Steel', description: 'Carbon steel plate for moderate/low-temp service', temperatureF: 650, allowableStressPsi: 15400 },
  
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: -20, allowableStressPsi: 11300 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 100, allowableStressPsi: 11300 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 200, allowableStressPsi: 11300 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 300, allowableStressPsi: 11300 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 400, allowableStressPsi: 11300 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 500, allowableStressPsi: 11000 },
  { materialCode: 'SA-285 Gr A', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 600, allowableStressPsi: 10100 },
  
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: -20, allowableStressPsi: 13800 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 100, allowableStressPsi: 13800 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 200, allowableStressPsi: 13800 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 300, allowableStressPsi: 13800 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 400, allowableStressPsi: 13800 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 500, allowableStressPsi: 13500 },
  { materialCode: 'SA-285 Gr B', category: 'Carbon Steel', description: 'Low/intermediate tensile strength carbon steel plate', temperatureF: 600, allowableStressPsi: 12400 },
  
  // Stainless Steel Materials
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: -325, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 100, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 200, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 300, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 400, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 500, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 600, allowableStressPsi: 16200 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 700, allowableStressPsi: 15100 },
  { materialCode: 'SA-240 Type 304L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (low-carbon)', temperatureF: 800, allowableStressPsi: 14000 },
  
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: -325, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 100, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 200, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 300, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 400, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 500, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 600, allowableStressPsi: 16700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 700, allowableStressPsi: 15700 },
  { materialCode: 'SA-240 Type 316L', category: 'Stainless Steel', description: 'Austenitic stainless steel plate with Mo (low-carbon)', temperatureF: 800, allowableStressPsi: 14600 },
  
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 600, allowableStressPsi: 19400 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 700, allowableStressPsi: 18100 },
  { materialCode: 'SA-240 Type 321', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Ti-stabilized)', temperatureF: 800, allowableStressPsi: 16800 },
  
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 600, allowableStressPsi: 19400 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 700, allowableStressPsi: 18100 },
  { materialCode: 'SA-240 Type 347', category: 'Stainless Steel', description: 'Austenitic stainless steel plate (Cb-stabilized)', temperatureF: 800, allowableStressPsi: 16800 },
  
  // Chrome-Moly Alloy Steel Materials
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 500, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 600, allowableStressPsi: 17500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 700, allowableStressPsi: 17100 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 800, allowableStressPsi: 15900 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 900, allowableStressPsi: 13500 },
  { materialCode: 'SA-387 Gr 11 Cl 2', category: 'Alloy Steel', description: '1.25Cr-0.5Mo alloy steel plate (normalized & tempered)', temperatureF: 1000, allowableStressPsi: 9800 },
  
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 600, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 700, allowableStressPsi: 20000 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 800, allowableStressPsi: 19500 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 900, allowableStressPsi: 17900 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 1000, allowableStressPsi: 14800 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 1050, allowableStressPsi: 12400 },
  { materialCode: 'SA-387 Gr 22 Cl 2', category: 'Alloy Steel', description: '2.25Cr-1Mo alloy steel plate (normalized & tempered)', temperatureF: 1100, allowableStressPsi: 9500 },
  
  // Low-Temperature Materials
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: -50, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 500, allowableStressPsi: 17100 },
  { materialCode: 'SA-333 Gr 6', category: 'Low-Temp Steel', description: 'Seamless carbon steel pipe for low-temp service', temperatureF: 600, allowableStressPsi: 15700 },
  
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: -150, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: -100, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: -50, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-203 Gr D', category: 'Low-Temp Steel', description: '3.5% Ni alloy steel plate for low-temp service', temperatureF: 300, allowableStressPsi: 20000 },
  
  // Pipe Materials
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 500, allowableStressPsi: 17100 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 600, allowableStressPsi: 15700 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 650, allowableStressPsi: 14300 },
  { materialCode: 'SA-106 Gr B', category: 'Pipe', description: 'Seamless carbon steel pipe for high-temp service', temperatureF: 700, allowableStressPsi: 12100 },
  
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 500, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 600, allowableStressPsi: 17500 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 700, allowableStressPsi: 17100 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 800, allowableStressPsi: 15900 },
  { materialCode: 'SA-335 P11', category: 'Alloy Pipe', description: '1.25Cr-0.5Mo seamless ferritic alloy steel pipe', temperatureF: 900, allowableStressPsi: 13500 },
  
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: -20, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 600, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 700, allowableStressPsi: 20000 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 800, allowableStressPsi: 19500 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 900, allowableStressPsi: 17900 },
  { materialCode: 'SA-335 P22', category: 'Alloy Pipe', description: '2.25Cr-1Mo seamless ferritic alloy steel pipe', temperatureF: 1000, allowableStressPsi: 14800 },
  
  // Forged Materials
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: -20, allowableStressPsi: 17500 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 100, allowableStressPsi: 17500 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 200, allowableStressPsi: 17500 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 300, allowableStressPsi: 17500 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 400, allowableStressPsi: 17500 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 500, allowableStressPsi: 17100 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 600, allowableStressPsi: 15700 },
  { materialCode: 'SA-105', category: 'Forgings', description: 'Carbon steel forgings for piping components', temperatureF: 650, allowableStressPsi: 14300 },
  
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: -325, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 600, allowableStressPsi: 19400 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 700, allowableStressPsi: 18100 },
  { materialCode: 'SA-182 F304', category: 'Forgings', description: 'Austenitic stainless steel forgings', temperatureF: 800, allowableStressPsi: 16800 },
  
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: -325, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 100, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 200, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 300, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 400, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 500, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 600, allowableStressPsi: 20000 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 700, allowableStressPsi: 18800 },
  { materialCode: 'SA-182 F316', category: 'Forgings', description: 'Austenitic stainless steel forgings with Mo', temperatureF: 800, allowableStressPsi: 17500 },
];

async function main() {
  console.log('🚀 Starting bulk material insert...');
  console.log(`Total materials to insert: ${comprehensiveMaterialData.length}`);
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Clear existing data
    console.log('Clearing existing material data...');
    await connection.execute('DELETE FROM materialStressValues');
    
    // Bulk insert
    console.log('Inserting new material data...');
    let inserted = 0;
    
    for (const material of comprehensiveMaterialData) {
      await connection.execute(
        'INSERT INTO materialStressValues (materialSpec, materialCategory, notes, temperatureF, allowableStress) VALUES (?, ?, ?, ?, ?)',
        [material.materialCode, material.category, material.description, material.temperatureF, material.allowableStressPsi]
      );
      inserted++;
      
      if (inserted % 50 === 0) {
        console.log(`  Inserted ${inserted}/${comprehensiveMaterialData.length}...`);
      }
    }
    
    console.log(`✅ Successfully inserted ${inserted} material stress values`);
    
    // Verify
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM materialStressValues');
    console.log(`✅ Verified: ${rows[0].count} records in database`);
    
    // Show summary
    const [categories] = await connection.execute('SELECT category, COUNT(*) as count FROM materialStressValues GROUP BY category ORDER BY category');
    console.log('\n📊 Materials by category:');
    categories.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} data points`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
