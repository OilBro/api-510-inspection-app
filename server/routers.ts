import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { parseExcelFile, parsePDFFile } from "./fileParser";
import { storagePut } from "./storage";
import { fieldMappingRouter, unmatchedDataRouter } from "./fieldMappingRouters";
import { professionalReportRouter } from "./professionalReportRouters";
import * as fieldMappingDb from "./fieldMappingDb";
import * as professionalReportDb from "./professionalReportDb";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  inspections: router({
    // List all inspections for the current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserInspections(ctx.user.id);
    }),

    // Get a single inspection by ID
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.getInspection(input.id);
      }),

    // Create a new inspection
    create: protectedProcedure
      .input(z.object({
        vesselTagNumber: z.string(),
        vesselName: z.string().optional(),
        manufacturer: z.string().optional(),
        yearBuilt: z.number().optional(),
        designPressure: z.string().optional(),
        designTemperature: z.string().optional(),
        operatingPressure: z.string().optional(),
        materialSpec: z.string().optional(),
        vesselType: z.string().optional(),
        insideDiameter: z.string().optional(),
        overallLength: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const inspection = {
          id: nanoid(),
          userId: ctx.user.id,
          ...input,
          status: "draft" as const,
        };
        await db.createInspection(inspection);
        return inspection;
      }),

    // Update an inspection
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        vesselTagNumber: z.string().optional(),
        vesselName: z.string().optional(),
        manufacturer: z.string().optional(),
        yearBuilt: z.number().optional(),
        designPressure: z.string().optional(),
        designTemperature: z.string().optional(),
        operatingPressure: z.string().optional(),
        materialSpec: z.string().optional(),
        vesselType: z.string().optional(),
        insideDiameter: z.string().optional(),
        overallLength: z.string().optional(),
        status: z.enum(["draft", "in_progress", "completed", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateInspection(id, data);
        return { success: true };
      }),

    // Delete an inspection
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteInspection(input.id);
        return { success: true };
      }),
  }),

  calculations: router({
    // Get calculations for an inspection
    get: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getCalculation(input.inspectionId);
      }),

    // Save calculation results
    save: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        // Minimum thickness fields
        minThicknessDesignPressure: z.string().optional(),
        minThicknessInsideRadius: z.string().optional(),
        minThicknessAllowableStress: z.string().optional(),
        minThicknessJointEfficiency: z.string().optional(),
        minThicknessCorrosionAllowance: z.string().optional(),
        minThicknessResult: z.string().optional(),
        // MAWP fields
        mawpActualThickness: z.string().optional(),
        mawpInsideRadius: z.string().optional(),
        mawpAllowableStress: z.string().optional(),
        mawpJointEfficiency: z.string().optional(),
        mawpCorrosionAllowance: z.string().optional(),
        mawpResult: z.string().optional(),
        // Remaining life fields
        remainingLifeCurrentThickness: z.string().optional(),
        remainingLifeRequiredThickness: z.string().optional(),
        remainingLifeCorrosionRate: z.string().optional(),
        remainingLifeSafetyFactor: z.string().optional(),
        remainingLifeResult: z.string().optional(),
        remainingLifeNextInspection: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Check if calculation exists
        const existing = await db.getCalculation(input.inspectionId);
        
        if (existing) {
          // Update existing
          await db.updateCalculation(existing.id, input);
          return { success: true, id: existing.id };
        } else {
          // Create new
          const calculation = {
            id: nanoid(),
            ...input,
          };
          await db.saveCalculation(calculation);
          return { success: true, id: calculation.id };
        }
      }),
  }),

  tmlReadings: router({
    // Get all TML readings for an inspection
    list: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getTmlReadings(input.inspectionId);
      }),

    // Create a new TML reading
    create: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        tmlId: z.string(),
        component: z.string(),
        currentThickness: z.string().optional(),
        previousThickness: z.string().optional(),
        nominalThickness: z.string().optional(),
        loss: z.string().optional(),
        corrosionRate: z.string().optional(),
        status: z.enum(["good", "monitor", "critical"]).optional(),
      }))
      .mutation(async ({ input }) => {
        // Auto-calculate loss and corrosion rate
        let calculatedLoss: string | undefined = input.loss;
        let calculatedCorrosionRate: string | undefined = input.corrosionRate;
        
        const current = input.currentThickness ? parseFloat(input.currentThickness) : null;
        const previous = input.previousThickness ? parseFloat(input.previousThickness) : null;
        const nominal = input.nominalThickness ? parseFloat(input.nominalThickness) : null;
        
        // Calculate loss percentage: (Nominal - Current) / Nominal * 100
        if (nominal && current && nominal > 0) {
          const lossPercent = ((nominal - current) / nominal) * 100;
          calculatedLoss = lossPercent.toFixed(2);
        }
        
        // Calculate corrosion rate in mpy (mils per year)
        // Use actual time interval from inspection dates
        if (previous && current) {
          let timeSpanYears = 1; // Default fallback
          
          // Calculate actual time span if dates provided
          if (input.previousInspectionDate && input.currentInspectionDate) {
            const prevDate = new Date(input.previousInspectionDate);
            const currDate = new Date(input.currentInspectionDate);
            const monthsDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
            
            if (monthsDiff > 0) {
              timeSpanYears = monthsDiff / 12;
            }
          }
          
          const thicknessLoss = previous - current;
          const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000; // Convert inches to mils
          calculatedCorrosionRate = corrosionRateMpy.toFixed(2);
        }
        
        const reading = {
          id: nanoid(),
          ...input,
          loss: calculatedLoss,
          corrosionRate: calculatedCorrosionRate,
        };
        await db.createTmlReading(reading);
        return reading;
      }),

    // Update a TML reading
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        tmlId: z.string().optional(),
        component: z.string().optional(),
        currentThickness: z.string().optional(),
        previousThickness: z.string().optional(),
        nominalThickness: z.string().optional(),
        loss: z.string().optional(),
        corrosionRate: z.string().optional(),
        status: z.enum(["good", "monitor", "critical"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        
        // Get existing reading to merge values for calculation
        const existingReadings = await db.getTmlReadings('');
        const existing = existingReadings.find(r => r.id === id);
        
        // Merge existing and new values
        const current = data.currentThickness ? parseFloat(data.currentThickness) : 
                       (existing?.currentThickness ? parseFloat(String(existing.currentThickness)) : null);
        const previous = data.previousThickness ? parseFloat(data.previousThickness) : 
                        (existing?.previousThickness ? parseFloat(String(existing.previousThickness)) : null);
        const nominal = data.nominalThickness ? parseFloat(data.nominalThickness) : 
                       (existing?.nominalThickness ? parseFloat(String(existing.nominalThickness)) : null);
        
        // Auto-calculate loss and corrosion rate if not explicitly provided
        let calculatedLoss = data.loss;
        let calculatedCorrosionRate = data.corrosionRate;
        
        // Calculate loss in inches: Nominal - Current
        let calculatedLossPercent;
        if (!calculatedLoss && nominal !== null && current !== null) {
          const lossInches = nominal - current;
          calculatedLoss = lossInches.toFixed(4);
          
          // Also calculate percentage
          if (nominal > 0) {
            const lossPercent = (lossInches / nominal) * 100;
            calculatedLossPercent = lossPercent.toFixed(2);
          }
        }
        
        // Calculate corrosion rate in mpy (mils per year)
        if (!calculatedCorrosionRate && previous && current) {
          let timeSpanYears = 1; // Default to 1 year
          
          // Try to get actual time span from dates
          const prevDate = data.previousInspectionDate || existing?.previousInspectionDate;
          const currDate = data.currentInspectionDate || existing?.currentInspectionDate;
          
          if (prevDate && currDate) {
            const prevTime = prevDate instanceof Date ? prevDate.getTime() : new Date(prevDate).getTime();
            const currTime = currDate instanceof Date ? currDate.getTime() : new Date(currDate).getTime();
            const monthsDiff = (currTime - prevTime) / (1000 * 60 * 60 * 24 * 30.44);
            if (monthsDiff > 0) {
              timeSpanYears = monthsDiff / 12;
            }
          }
          
          const thicknessLoss = previous - current;
          const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000;
          calculatedCorrosionRate = corrosionRateMpy.toFixed(2);
        }
        
        // Auto-calculate status if not provided
        let calculatedStatus = data.status;
        if (!calculatedStatus && current !== null && nominal !== null) {
          // Get inspection data for status calculation
          const inspection = await db.getInspection(existing?.inspectionId || '');
          if (inspection && inspection.designPressure && inspection.insideDiameter) {
            const { calculateTMLStatus } = require('./tmlStatusCalculator');
            try {
              calculatedStatus = calculateTMLStatus({
                currentThickness: current,
                nominalThickness: nominal,
                designPressure: parseFloat(String(inspection.designPressure)),
                insideDiameter: parseFloat(String(inspection.insideDiameter)),
                materialSpec: String(inspection.materialSpec || 'SA-516-70'),
                designTemperature: parseFloat(String(inspection.designTemperature || 500)),
                corrosionAllowance: 0.125
              });
            } catch (error) {
              console.error('[TML Update] Status calculation failed:', error);
            }
          }
        }
        
        const updateData = {
          ...data,
          loss: calculatedLoss,
          lossPercent: calculatedLossPercent,
          corrosionRate: calculatedCorrosionRate,
          status: calculatedStatus,
        };
        
        await db.updateTmlReading(id, updateData);
        return { success: true };
      }),

    // Delete a TML reading
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteTmlReading(input.id);
        return { success: true };
      }),
  }),

  externalInspection: router({
    // Get external inspection data
    get: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getExternalInspection(input.inspectionId);
      }),

    // Save external inspection data
    save: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        visualCondition: z.string().optional(),
        corrosionObserved: z.boolean().optional(),
        damageMechanism: z.string().optional(),
        findings: z.string().optional(),
        recommendations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getExternalInspection(input.inspectionId);
        
        if (existing) {
          // FIX: Now actually updating!
          await db.updateExternalInspection(existing.id, {
            visualCondition: input.visualCondition,
            corrosionObserved: input.corrosionObserved,
            damageMechanism: input.damageMechanism,
            findings: input.findings,
            recommendations: input.recommendations,
          });
          return { success: true, id: existing.id };
        } else {
          const inspection = {
            id: nanoid(),
            ...input,
          };
          await db.saveExternalInspection(inspection);
          return { success: true, id: inspection.id };
        }
      }),
  }),

  internalInspection: router({
    // Get internal inspection data
    get: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getInternalInspection(input.inspectionId);
      }),

    // Save internal inspection data
    save: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        internalCondition: z.string().optional(),
        corrosionPattern: z.string().optional(),
        findings: z.string().optional(),
        recommendations: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await db.getInternalInspection(input.inspectionId);
        
        if (existing) {
          // FIX: Now actually updating!
          await db.updateInternalInspection(existing.id, {
            internalCondition: input.internalCondition,
            corrosionPattern: input.corrosionPattern,
            findings: input.findings,
            recommendations: input.recommendations,
          });
          return { success: true, id: existing.id };
        } else {
          const inspection = {
            id: nanoid(),
            ...input,
          };
          await db.saveInternalInspection(inspection);
          return { success: true, id: inspection.id };
        }
      }),
  }),

  importedFiles: router({
    // Get imported files for an inspection
    list: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        return await db.getInspectionImportedFiles(input.inspectionId);
      }),

    // Create imported file record
    create: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        fileName: z.string(),
        fileType: z.enum(["pdf", "excel"]),
        fileUrl: z.string().optional(),
        fileSize: z.number().optional(),
        extractedData: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const file = {
          id: nanoid(),
          userId: ctx.user.id,
          ...input,
          processingStatus: "pending" as const,
        };
        await db.createImportedFile(file);
        return file;
      }),

    // Update imported file status
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.string(),
        processingStatus: z.enum(["pending", "processing", "completed", "failed"]),
        extractedData: z.string().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateImportedFile(id, {
          ...data,
          processedAt: new Date(),
        });
        return { success: true };
      }),

    // Parse and import file
    parseFile: protectedProcedure
      .input(z.object({
        fileData: z.string(), // Base64 encoded file
        fileName: z.string(),
        fileType: z.enum(["pdf", "excel"]),
        parserType: z.enum(["docupipe", "manus"]).optional(), // Optional parser selection
        inspectionId: z.string().optional(), // Optional: append to existing inspection
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Decode base64 file data
          const buffer = Buffer.from(input.fileData, "base64");

          // Parse based on file type
          let parsedData;
          if (input.fileType === "excel") {
            parsedData = await parseExcelFile(buffer);
          } else {
            parsedData = await parsePDFFile(buffer, input.parserType);
          }

          // Upload file to S3
          const { url: fileUrl } = await storagePut(
            `imports/${ctx.user.id}/${Date.now()}-${input.fileName}`,
            buffer,
            input.fileType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );

          // Helper function to parse numeric values
          const parseNumeric = (value: any): string | null => {
            if (value === null || value === undefined || value === '') return null;
            const str = String(value).trim();
            // Extract first number from string (e.g., "250 psig" -> "250")
            const match = str.match(/([0-9]+\.?[0-9]*)/);
            return match ? match[1] : null;
          };
          
          const parseInt = (value: any): number | null => {
            if (value === null || value === undefined || value === '') return null;
            const num = Number(value);
            return isNaN(num) ? null : Math.floor(num);
          };

          // Create inspection from pars          // Check for existing field mappings to auto-apply
          const existingMappings = await fieldMappingDb.getFieldMappings(ctx.user.id);
          const mappingLookup = new Map<string, any>();
          existingMappings.forEach((m: any) => {
            mappingLookup.set(m.sourceField, { targetSection: m.targetSection, targetField: m.targetField, id: m.id });
          });

          // Get or create inspection record
          let inspection: any;
          let isNewInspection = false;
          
          if (input.inspectionId) {
            // Append to existing inspection
            inspection = await db.getInspection(input.inspectionId);
            if (!inspection) {
              throw new Error(`Inspection ${input.inspectionId} not found`);
            }
            // Verify ownership
            if (inspection.userId !== ctx.user.id) {
              throw new Error("Unauthorized: Cannot modify another user's inspection");
            }
            console.log(`[Multi-Source Import] Appending to existing inspection: ${input.inspectionId}`);
          } else {
            // Create new inspection
            isNewInspection = true;
            inspection = {
              id: nanoid(),
              userId: ctx.user.id,
              vesselTagNumber: parsedData.vesselTagNumber || `IMPORT-${Date.now()}`,
              status: "draft" as const,
            };
            console.log(`[Multi-Source Import] Creating new inspection: ${inspection.id}`);
          }

          // Track successfully mapped fields for learning
          const successfulMappings: Array<{sourceField: string, targetSection: string, targetField: string, sourceValue: string}> = [];
          
          // Helper to track successful mapping
          const trackMapping = (sourceField: string, targetField: string, value: any) => {
            successfulMappings.push({
              sourceField,
              targetSection: 'inspection',
              targetField,
              sourceValue: String(value)
            });
          };
          
          // Merge optional fields (only update if new value exists and old doesn't, or if creating new)
          if (parsedData.vesselName && (isNewInspection || !inspection.vesselName)) {
            inspection.vesselName = String(parsedData.vesselName).substring(0, 500);
            trackMapping('vesselName', 'vesselName', parsedData.vesselName);
          }
          if (parsedData.manufacturer && (isNewInspection || !inspection.manufacturer)) {
            inspection.manufacturer = String(parsedData.manufacturer).substring(0, 500);
            trackMapping('manufacturer', 'manufacturer', parsedData.manufacturer);
          }
          if (parsedData.yearBuilt && (isNewInspection || !inspection.yearBuilt)) {
            const year = parseInt(parsedData.yearBuilt);
            if (year) {
              inspection.yearBuilt = year;
              trackMapping('yearBuilt', 'yearBuilt', parsedData.yearBuilt);
            }
          }
          if (parsedData.designPressure && (isNewInspection || !inspection.designPressure)) {
            const val = parseNumeric(parsedData.designPressure);
            if (val) {
              inspection.designPressure = val;
              trackMapping('designPressure', 'designPressure', parsedData.designPressure);
            }
          }
          if (parsedData.designTemperature && (isNewInspection || !inspection.designTemperature)) {
            const val = parseNumeric(parsedData.designTemperature);
            if (val) {
              inspection.designTemperature = val;
              trackMapping('designTemperature', 'designTemperature', parsedData.designTemperature);
            }
          }
          if (parsedData.operatingPressure && (isNewInspection || !inspection.operatingPressure)) {
            const val = parseNumeric(parsedData.operatingPressure);
            if (val) {
              inspection.operatingPressure = val;
              trackMapping('operatingPressure', 'operatingPressure', parsedData.operatingPressure);
            }
          }
          if (parsedData.materialSpec && (isNewInspection || !inspection.materialSpec)) {
            inspection.materialSpec = String(parsedData.materialSpec).substring(0, 255);
            trackMapping('materialSpec', 'materialSpec', parsedData.materialSpec);
          }
          if (parsedData.vesselType && (isNewInspection || !inspection.vesselType)) {
            inspection.vesselType = String(parsedData.vesselType).substring(0, 255);
            trackMapping('vesselType', 'vesselType', parsedData.vesselType);
          }
          if (parsedData.insideDiameter && (isNewInspection || !inspection.insideDiameter)) {
            const val = parseNumeric(parsedData.insideDiameter);
            if (val) {
              inspection.insideDiameter = val;
              trackMapping('insideDiameter', 'insideDiameter', parsedData.insideDiameter);
            }
          }
          if (parsedData.overallLength && (isNewInspection || !inspection.overallLength)) {
            const val = parseNumeric(parsedData.overallLength);
            if (val) {
              inspection.overallLength = val;
              trackMapping('overallLength', 'overallLength', parsedData.overallLength);
            }
          }

          // Create or update inspection
          if (isNewInspection) {
            await db.createInspection(inspection);
          } else {
            await db.updateInspection(inspection.id, inspection);
          }

          // Save field mappings for successfully imported fields
          for (const mapping of successfulMappings) {
            // Check if mapping already exists
            const existing = await fieldMappingDb.findSimilarMapping(ctx.user.id, mapping.sourceField);
            if (existing) {
              // Update usage count
              await fieldMappingDb.updateFieldMappingUsage(existing.id);
            } else {
              // Create new mapping
              await fieldMappingDb.createFieldMapping({
                id: nanoid(),
                userId: ctx.user.id,
                sourceField: mapping.sourceField,
                sourceValue: mapping.sourceValue,
                targetSection: mapping.targetSection,
                targetField: mapping.targetField,
                confidence: "1.00",
                usageCount: 1,
              });
            }
          }

          // Create TML readings if available
          if (parsedData.tmlReadings && parsedData.tmlReadings.length > 0) {
            for (const reading of parsedData.tmlReadings) {
              const tmlRecord: any = {
                id: nanoid(),
                inspectionId: inspection.id,
                tmlId: reading.tmlId || `TML-${nanoid()}`,
                component: reading.component || "Unknown",
              };
              
              // Only add optional fields if they exist
              if (reading.nominalThickness) {
                const val = typeof reading.nominalThickness === 'number' ? reading.nominalThickness : parseFloat(String(reading.nominalThickness));
                if (!isNaN(val)) tmlRecord.nominalThickness = val;
              }
              if (reading.previousThickness) {
                const val = parseFloat(String(reading.previousThickness));
                if (!isNaN(val)) tmlRecord.previousThickness = val;
              }
              if (reading.currentThickness) {
                const val = typeof reading.currentThickness === 'number' ? reading.currentThickness : parseFloat(String(reading.currentThickness));
                if (!isNaN(val)) tmlRecord.currentThickness = val;
              }
              
              await db.createTmlReading(tmlRecord);
            }
          }

          // Prepare checklist items for review (don't create yet)
          let checklistPreview: any[] = [];
          if (parsedData.checklistItems && parsedData.checklistItems.length > 0) {
            checklistPreview = parsedData.checklistItems.map(item => {
              const preview: any = {
                category: item.category || 'General',
                itemNumber: item.itemNumber,
                itemText: item.itemText || item.description || 'Imported checklist item',
                notes: item.notes,
                checkedBy: item.checkedBy,
                checkedDate: item.checkedDate,
              };
              
              // Auto-map checked status for preview
              if (item.checked !== undefined) {
                preview.checked = Boolean(item.checked);
              } else if (item.status) {
                preview.checked = item.status === 'satisfactory' || item.status === 'completed' || item.status === 'yes';
                preview.originalStatus = item.status;
              } else {
                preview.checked = false;
              }
              
              return preview;
            });
          }

          // Create imported file record
          const importedFileId = nanoid();
          await db.createImportedFile({
            id: importedFileId,
            inspectionId: inspection.id,
            userId: ctx.user.id,
            fileName: input.fileName,
            fileType: input.fileType,
            fileUrl,
            fileSize: buffer.length,
            parserType: input.parserType || "docupipe",
            extractedData: JSON.stringify(parsedData),
            processingStatus: "completed",
          });

          // Identify and store unmatched data
          const mappedFields = new Set([
            'vesselTagNumber', 'vesselName', 'manufacturer', 'yearBuilt', 'designPressure',
            'designTemperature', 'operatingPressure', 'materialSpec', 'vesselType',
            'insideDiameter', 'overallLength', 'product', 'nbNumber', 'constructionCode',
            'vesselConfiguration', 'headType', 'insulationType', 'reportNumber',
            'inspectionDate', 'reportDate', 'inspectionType', 'inspectionCompany',
            'inspectorName', 'inspectorCert', 'clientName', 'clientLocation',
            'executiveSummary', 'thicknessReadings'
          ]);

          const unmatchedFields: any[] = [];
          
          // Flatten parsed data and find unmatched fields
          const flattenObject = (obj: any, prefix = '') => {
            for (const [key, value] of Object.entries(obj)) {
              if (value && typeof value === 'object' && !Array.isArray(value)) {
                flattenObject(value, prefix + key + '.');
              } else if (!mappedFields.has(key) && value !== null && value !== undefined && value !== '') {
                unmatchedFields.push({
                  id: nanoid(),
                  inspectionId: inspection.id,
                  importedFileId,
                  fieldName: prefix + key,
                  fieldValue: String(value),
                  fieldPath: prefix + key,
                  status: "pending" as const,
                });
              }
            }
          };

          flattenObject(parsedData);

          // Store unmatched data
          if (unmatchedFields.length > 0) {
            await fieldMappingDb.bulkCreateUnmatchedData(unmatchedFields);
          }

          return {
            success: true,
            inspectionId: inspection.id,
            isNewInspection,
            parsedData,
            unmatchedCount: unmatchedFields.length,
            checklistPreview, // Send checklist items for review
            requiresChecklistReview: checklistPreview.length > 0,
            message: isNewInspection 
              ? `Created new inspection ${inspection.id}` 
              : `Added data to existing inspection ${inspection.id}`,
          };
        } catch (error) {
          console.error("Error parsing file:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Full error details:", {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            fileName: input.fileName,
            fileType: input.fileType,
          });
          throw new Error(`Failed to parse ${input.fileType} file: ${errorMessage}`);
        }
      }),

    // Finalize checklist import after user review
    finalizeChecklistImport: protectedProcedure
      .input(z.object({
        inspectionId: z.string(),
        checklistItems: z.array(z.object({
          category: z.string(),
          itemNumber: z.string().optional(),
          itemText: z.string(),
          checked: z.boolean(),
          notes: z.string().optional(),
          checkedBy: z.string().optional(),
          checkedDate: z.string().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        try {
          // Create professional report if it doesn't exist
          const reportId = nanoid();
          await professionalReportDb.createProfessionalReport({
            id: reportId,
            inspectionId: input.inspectionId,
            reportNumber: `RPT-${Date.now()}`,
            reportDate: new Date(),
          });

          // Create checklist items
          for (const item of input.checklistItems) {
            const checklistRecord: any = {
              id: nanoid(),
              reportId,
              category: item.category,
              itemText: item.itemText,
              checked: item.checked,
            };
            
            if (item.itemNumber) checklistRecord.itemNumber = item.itemNumber;
            if (item.notes) checklistRecord.notes = item.notes;
            if (item.checkedBy) checklistRecord.checkedBy = item.checkedBy;
            if (item.checkedDate) checklistRecord.checkedDate = new Date(item.checkedDate);
            
            await professionalReportDb.createChecklistItem(checklistRecord);
          }

          return {
            success: true,
            reportId,
            itemsCreated: input.checklistItems.length,
          };
        } catch (error) {
          console.error("Error finalizing checklist import:", error);
          throw new Error("Failed to finalize checklist import");
        }
      }),
  }),

  // Field mappings for machine learning
  fieldMappings: fieldMappingRouter,
  
  // Unmatched data management
  unmatchedData: unmatchedDataRouter,
  
  // Professional report generation
  professionalReport: professionalReportRouter,
});

export type AppRouter = typeof appRouter;

