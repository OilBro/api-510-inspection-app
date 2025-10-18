import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Inspections table - main inspection records
 */
export const inspections = mysqlTable("inspections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  // Vessel identification
  vesselTagNumber: varchar("vesselTagNumber", { length: 255 }).notNull(),
  vesselName: text("vesselName"),
  manufacturer: text("manufacturer"),
  yearBuilt: int("yearBuilt"),
  
  // Design specifications
  designPressure: decimal("designPressure", { precision: 10, scale: 2 }),
  designTemperature: decimal("designTemperature", { precision: 10, scale: 2 }),
  operatingPressure: decimal("operatingPressure", { precision: 10, scale: 2 }),
  materialSpec: varchar("materialSpec", { length: 255 }),
  vesselType: varchar("vesselType", { length: 255 }),
  
  // Geometry
  insideDiameter: decimal("insideDiameter", { precision: 10, scale: 2 }),
  overallLength: decimal("overallLength", { precision: 10, scale: 2 }),
  
  // Status
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "archived"]).default("draft").notNull(),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
  completedAt: timestamp("completedAt"),
});

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = typeof inspections.$inferInsert;

/**
 * Calculations table - stores calculation results
 */
export const calculations = mysqlTable("calculations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  
  // Minimum thickness calculation
  minThicknessDesignPressure: decimal("minThicknessDesignPressure", { precision: 10, scale: 2 }),
  minThicknessInsideRadius: decimal("minThicknessInsideRadius", { precision: 10, scale: 2 }),
  minThicknessAllowableStress: decimal("minThicknessAllowableStress", { precision: 10, scale: 2 }),
  minThicknessJointEfficiency: decimal("minThicknessJointEfficiency", { precision: 4, scale: 2 }),
  minThicknessCorrosionAllowance: decimal("minThicknessCorrosionAllowance", { precision: 10, scale: 4 }),
  minThicknessResult: decimal("minThicknessResult", { precision: 10, scale: 4 }),
  
  // MAWP calculation
  mawpActualThickness: decimal("mawpActualThickness", { precision: 10, scale: 4 }),
  mawpInsideRadius: decimal("mawpInsideRadius", { precision: 10, scale: 2 }),
  mawpAllowableStress: decimal("mawpAllowableStress", { precision: 10, scale: 2 }),
  mawpJointEfficiency: decimal("mawpJointEfficiency", { precision: 4, scale: 2 }),
  mawpCorrosionAllowance: decimal("mawpCorrosionAllowance", { precision: 10, scale: 4 }),
  mawpResult: decimal("mawpResult", { precision: 10, scale: 2 }),
  
  // Remaining life calculation
  remainingLifeCurrentThickness: decimal("remainingLifeCurrentThickness", { precision: 10, scale: 4 }),
  remainingLifeRequiredThickness: decimal("remainingLifeRequiredThickness", { precision: 10, scale: 4 }),
  remainingLifeCorrosionRate: decimal("remainingLifeCorrosionRate", { precision: 10, scale: 2 }),
  remainingLifeSafetyFactor: decimal("remainingLifeSafetyFactor", { precision: 4, scale: 2 }),
  remainingLifeResult: decimal("remainingLifeResult", { precision: 10, scale: 2 }),
  remainingLifeNextInspection: decimal("remainingLifeNextInspection", { precision: 10, scale: 2 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Calculation = typeof calculations.$inferSelect;
export type InsertCalculation = typeof calculations.$inferInsert;

/**
 * TML (Thickness Measurement Location) readings
 */
export const tmlReadings = mysqlTable("tmlReadings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  
  tmlId: varchar("tmlId", { length: 255 }).notNull(),
  component: varchar("component", { length: 255 }).notNull(),
  currentThickness: decimal("currentThickness", { precision: 10, scale: 4 }),
  previousThickness: decimal("previousThickness", { precision: 10, scale: 4 }),
  nominalThickness: decimal("nominalThickness", { precision: 10, scale: 4 }),
  loss: decimal("loss", { precision: 10, scale: 2 }),
  corrosionRate: decimal("corrosionRate", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["good", "monitor", "critical"]).default("good").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type TmlReading = typeof tmlReadings.$inferSelect;
export type InsertTmlReading = typeof tmlReadings.$inferInsert;

/**
 * External inspection findings
 */
export const externalInspections = mysqlTable("externalInspections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  
  visualCondition: text("visualCondition"),
  corrosionObserved: boolean("corrosionObserved").default(false),
  damageMechanism: text("damageMechanism"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type ExternalInspection = typeof externalInspections.$inferSelect;
export type InsertExternalInspection = typeof externalInspections.$inferInsert;

/**
 * Internal inspection findings
 */
export const internalInspections = mysqlTable("internalInspections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  
  internalCondition: text("internalCondition"),
  corrosionPattern: text("corrosionPattern"),
  findings: text("findings"),
  recommendations: text("recommendations"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type InternalInspection = typeof internalInspections.$inferSelect;
export type InsertInternalInspection = typeof internalInspections.$inferInsert;

/**
 * Imported files tracking
 */
export const importedFiles = mysqlTable("importedFiles", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  userId: varchar("userId", { length: 64 }).notNull(),
  
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["pdf", "excel"]).notNull(),
  fileUrl: text("fileUrl"),
  fileSize: int("fileSize"),
  
  extractedData: text("extractedData"), // JSON string
  processingStatus: mysqlEnum("processingStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow(),
  processedAt: timestamp("processedAt"),
});

export type ImportedFile = typeof importedFiles.$inferSelect;
export type InsertImportedFile = typeof importedFiles.$inferInsert;

