import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  inspections,
  InsertInspection,
  calculations,
  InsertCalculation,
  tmlReadings,
  InsertTmlReading,
  externalInspections,
  InsertExternalInspection,
  internalInspections,
  InsertInternalInspection,
  importedFiles,
  InsertImportedFile
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= User Functions =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Inspection Functions =============

export async function createInspection(inspection: InsertInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(inspections).values(inspection);
  return inspection;
}

export async function getInspection(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(inspections).where(eq(inspections.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserInspections(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(inspections).where(eq(inspections.userId, userId)).orderBy(desc(inspections.updatedAt));
}

export async function updateInspection(id: string, data: Partial<InsertInspection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(inspections).set(data).where(eq(inspections.id, id));
}

export async function deleteInspection(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(inspections).where(eq(inspections.id, id));
}

// ============= Calculation Functions =============

export async function saveCalculation(calculation: InsertCalculation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(calculations).values(calculation);
  return calculation;
}

export async function getCalculation(inspectionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(calculations).where(eq(calculations.inspectionId, inspectionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCalculation(id: string, data: Partial<InsertCalculation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(calculations).set(data).where(eq(calculations.id, id));
}

// ============= TML Reading Functions =============

export async function createTmlReading(reading: InsertTmlReading) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Auto-calculate loss and corrosion rate if not provided
  const current = reading.currentThickness ? parseFloat(String(reading.currentThickness)) : null;
  const previous = reading.previousThickness ? parseFloat(String(reading.previousThickness)) : null;
  const nominal = reading.nominalThickness ? parseFloat(String(reading.nominalThickness)) : null;
  
  let loss = reading.loss;
  let corrosionRate = reading.corrosionRate;
  
  // Calculate loss percentage: (Nominal - Current) / Nominal * 100
  if (!loss && nominal && current && nominal > 0) {
    const lossPercent = ((nominal - current) / nominal) * 100;
    loss = lossPercent.toFixed(2);
  }
  
  // Calculate corrosion rate in mpy (mils per year)
  if (!corrosionRate && previous && current) {
    const timeSpanYears = 1; // Default to 1 year
    const thicknessLoss = previous - current;
    const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000;
    corrosionRate = corrosionRateMpy.toFixed(2);
  }
  
  const readingWithCalcs = {
    ...reading,
    loss,
    corrosionRate,
  };
  
  await db.insert(tmlReadings).values(readingWithCalcs);
  return readingWithCalcs;
}

export async function getTmlReadings(inspectionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tmlReadings).where(eq(tmlReadings.inspectionId, inspectionId));
}

export async function updateTmlReading(id: string, data: Partial<InsertTmlReading>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(tmlReadings).set(data).where(eq(tmlReadings.id, id));
}

export async function deleteTmlReading(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(tmlReadings).where(eq(tmlReadings.id, id));
}

// ============= External Inspection Functions =============

export async function saveExternalInspection(inspection: InsertExternalInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(externalInspections).values(inspection);
  return inspection;
}

export async function getExternalInspection(inspectionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(externalInspections).where(eq(externalInspections.inspectionId, inspectionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Internal Inspection Functions =============

export async function saveInternalInspection(inspection: InsertInternalInspection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(internalInspections).values(inspection);
  return inspection;
}

export async function getInternalInspection(inspectionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(internalInspections).where(eq(internalInspections.inspectionId, inspectionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= Imported File Functions =============

export async function createImportedFile(file: InsertImportedFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(importedFiles).values(file);
  return file;
}

export async function getImportedFile(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(importedFiles).where(eq(importedFiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateImportedFile(id: string, data: Partial<InsertImportedFile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(importedFiles).set(data).where(eq(importedFiles.id, id));
}

export async function getInspectionImportedFiles(inspectionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(importedFiles).where(eq(importedFiles.inspectionId, inspectionId)).orderBy(desc(importedFiles.createdAt));
}

