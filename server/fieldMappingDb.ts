import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  fieldMappings, 
  unmatchedData,
  InsertFieldMapping,
  InsertUnmatchedData 
} from "../drizzle/schema";

/**
 * Field Mapping Functions
 */

export async function createFieldMapping(mapping: InsertFieldMapping) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(fieldMappings).values(mapping);
}

export async function getFieldMappings(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(fieldMappings)
    .where(eq(fieldMappings.userId, userId))
    .orderBy(desc(fieldMappings.usageCount), desc(fieldMappings.lastUsed));
  
  return results;
}

export async function findSimilarMapping(userId: string, sourceField: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(fieldMappings)
    .where(
      and(
        eq(fieldMappings.userId, userId),
        eq(fieldMappings.sourceField, sourceField)
      )
    )
    .orderBy(desc(fieldMappings.usageCount))
    .limit(1);
  
  return results.length > 0 ? results[0] : null;
}

export async function updateFieldMappingUsage(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current usage count
  const current = await db
    .select()
    .from(fieldMappings)
    .where(eq(fieldMappings.id, id))
    .limit(1);
  
  if (current.length > 0) {
    await db
      .update(fieldMappings)
      .set({
        usageCount: (current[0].usageCount || 0) + 1,
        lastUsed: new Date(),
      })
      .where(eq(fieldMappings.id, id));
  }
}

/**
 * Unmatched Data Functions
 */

export async function createUnmatchedData(data: InsertUnmatchedData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(unmatchedData).values(data);
}

export async function bulkCreateUnmatchedData(dataArray: InsertUnmatchedData[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (dataArray.length === 0) return;
  
  await db.insert(unmatchedData).values(dataArray);
}

export async function getUnmatchedDataByInspection(inspectionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db
    .select()
    .from(unmatchedData)
    .where(
      and(
        eq(unmatchedData.inspectionId, inspectionId),
        eq(unmatchedData.status, "pending")
      )
    )
    .orderBy(unmatchedData.fieldName);
  
  return results;
}

export async function markUnmatchedDataAsMapped(
  id: string,
  mappedTo: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(unmatchedData)
    .set({
      status: "mapped",
      mappedTo,
      resolvedAt: new Date(),
    })
    .where(eq(unmatchedData.id, id));
}

export async function markUnmatchedDataAsIgnored(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(unmatchedData)
    .set({
      status: "ignored",
      resolvedAt: new Date(),
    })
    .where(eq(unmatchedData.id, id));
}

/**
 * Machine Learning Helper
 * Suggests mapping based on historical patterns
 */
export async function suggestMapping(
  userId: string,
  sourceField: string,
  sourceValue?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  // First try exact field name match
  const exactMatch = await findSimilarMapping(userId, sourceField);
  if (exactMatch) return exactMatch;
  
  // Try fuzzy match on field name (case-insensitive, partial match)
  const fuzzyResults = await db
    .select()
    .from(fieldMappings)
    .where(eq(fieldMappings.userId, userId))
    .orderBy(desc(fieldMappings.usageCount));
  
  const normalizedSource = sourceField.toLowerCase().replace(/[_\s-]/g, "");
  
  for (const mapping of fuzzyResults) {
    const normalizedTarget = mapping.sourceField.toLowerCase().replace(/[_\s-]/g, "");
    if (normalizedTarget.includes(normalizedSource) || normalizedSource.includes(normalizedTarget)) {
      return mapping;
    }
  }
  
  return null;
}

