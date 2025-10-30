import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  professionalReports,
  componentCalculations,
  inspectionFindings,
  recommendations,
  inspectionPhotos,
  appendixDocuments,
  checklistItems,
  InsertProfessionalReport,
  InsertComponentCalculation,
  InsertInspectionFinding,
  InsertRecommendation,
  InsertInspectionPhoto,
  InsertAppendixDocument,
  InsertChecklistItem,
} from "../drizzle/schema";

// ============================================================================
// Professional Report CRUD
// ============================================================================

export async function createProfessionalReport(data: InsertProfessionalReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(professionalReports).values(data);
  return data.id;
}

export async function getProfessionalReport(reportId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(professionalReports)
    .where(eq(professionalReports.id, reportId))
    .limit(1);
  
  return result[0] || null;
}

export async function getProfessionalReportByInspection(inspectionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(professionalReports)
    .where(eq(professionalReports.inspectionId, inspectionId))
    .limit(1);
  
  return result[0] || null;
}

export async function updateProfessionalReport(
  reportId: string,
  data: Partial<InsertProfessionalReport>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(professionalReports)
    .set(data)
    .where(eq(professionalReports.id, reportId));
}

// ============================================================================
// Component Calculations
// ============================================================================

export async function createComponentCalculation(data: InsertComponentCalculation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(componentCalculations).values(data);
  return data.id;
}

export async function getComponentCalculations(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(componentCalculations)
    .where(eq(componentCalculations.reportId, reportId));
}

export async function updateComponentCalculation(
  calcId: string,
  data: Partial<InsertComponentCalculation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(componentCalculations)
    .set(data)
    .where(eq(componentCalculations.id, calcId));
}

export async function deleteComponentCalculation(calcId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(componentCalculations)
    .where(eq(componentCalculations.id, calcId));
}

// ============================================================================
// Inspection Findings
// ============================================================================

export async function createInspectionFinding(data: InsertInspectionFinding) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(inspectionFindings).values(data);
  return data.id;
}

export async function getInspectionFindings(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(inspectionFindings)
    .where(eq(inspectionFindings.reportId, reportId));
}

export async function updateInspectionFinding(
  findingId: string,
  data: Partial<InsertInspectionFinding>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(inspectionFindings)
    .set(data)
    .where(eq(inspectionFindings.id, findingId));
}

// ============================================================================
// Recommendations
// ============================================================================

export async function createRecommendation(data: InsertRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(recommendations).values(data);
  return data.id;
}

export async function getRecommendations(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.reportId, reportId));
}

export async function updateRecommendation(
  recommendationId: string,
  data: Partial<InsertRecommendation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(recommendations)
    .set(data)
    .where(eq(recommendations.id, recommendationId));
}

// ============================================================================
// Photos
// ============================================================================

export async function createInspectionPhoto(data: InsertInspectionPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(inspectionPhotos).values(data);
  return data.id;
}

export async function getInspectionPhotos(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(inspectionPhotos)
    .where(eq(inspectionPhotos.reportId, reportId));
}

export async function deleteInspectionPhoto(photoId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(inspectionPhotos)
    .where(eq(inspectionPhotos.id, photoId));
}

// ============================================================================
// Appendix Documents
// ============================================================================

export async function createAppendixDocument(data: InsertAppendixDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(appendixDocuments).values(data);
  return data.id;
}

export async function getAppendixDocuments(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(appendixDocuments)
    .where(eq(appendixDocuments.reportId, reportId));
}

export async function deleteAppendixDocument(docId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(appendixDocuments)
    .where(eq(appendixDocuments.id, docId));
}

// ============================================================================
// Checklist Items
// ============================================================================

export async function createChecklistItem(data: InsertChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(checklistItems).values(data);
  return data.id;
}

export async function getChecklistItems(reportId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.reportId, reportId));
}

export async function updateChecklistItem(
  itemId: string,
  data: Partial<InsertChecklistItem>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(checklistItems)
    .set(data)
    .where(eq(checklistItems.id, itemId));
}

// ============================================================================
// Initialize Default Checklist
// ============================================================================

export async function initializeDefaultChecklist(reportId: string) {
  const defaultItems: Omit<InsertChecklistItem, "id" | "reportId">[] = [
    // Foundation
    { category: "foundation", itemNumber: "3.1.1", description: "Vessel foundation supports attached and in satisfactory condition", sequenceNumber: 1, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "foundation", itemNumber: "3.1.2", description: "Supports coating in satisfactory condition", sequenceNumber: 2, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    
    // Shell
    { category: "shell", itemNumber: "3.2.1", description: "Shell material and coating condition", sequenceNumber: 3, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "shell", itemNumber: "3.2.2", description: "External surface profile smooth and clean", sequenceNumber: 4, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "shell", itemNumber: "3.2.3", description: "Exposed surface profile relatively smooth with no significant oxidation", sequenceNumber: 5, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "shell", itemNumber: "3.2.4", description: "Longitudinal and circumferential welds in satisfactory condition", sequenceNumber: 6, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "shell", itemNumber: "3.2.5", description: "Shell nozzle penetration welds in satisfactory condition", sequenceNumber: 7, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    
    // Heads
    { category: "heads", itemNumber: "3.3.1", description: "Head material and condition", sequenceNumber: 8, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "heads", itemNumber: "3.3.2", description: "Head-to-shell welds in satisfactory condition", sequenceNumber: 9, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "heads", itemNumber: "3.3.3", description: "Head nozzle penetrations in satisfactory condition", sequenceNumber: 10, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    
    // Appurtenances
    { category: "appurtenances", itemNumber: "3.4.1", description: "Nozzles and flanges in satisfactory condition", sequenceNumber: 11, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "appurtenances", itemNumber: "3.4.2", description: "Manways and access openings in satisfactory condition", sequenceNumber: 12, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "appurtenances", itemNumber: "3.4.3", description: "Support lugs and attachments in satisfactory condition", sequenceNumber: 13, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
    { category: "appurtenances", itemNumber: "3.4.4", description: "Piping connections and valves in satisfactory condition", sequenceNumber: 14, status: "not_checked", comments: null, createdAt: new Date(), updatedAt: new Date() },
  ];
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const item of defaultItems) {
    const { nanoid } = await import("nanoid");
    await createChecklistItem({
      id: nanoid(),
      reportId,
      ...item,
    });
  }
}

