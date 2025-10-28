import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { parseExcelFile, parsePDFFile } from "./fileParser";
import { storagePut } from "./storage";

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
        const reading = {
          id: nanoid(),
          ...input,
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
        await db.updateTmlReading(id, data);
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
          // Update not implemented in schema, would need to add
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
            parsedData = await parsePDFFile(buffer);
          }

          // Upload file to S3
          const { url: fileUrl } = await storagePut(
            `imports/${ctx.user.id}/${Date.now()}-${input.fileName}`,
            buffer,
            input.fileType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );

          // Create inspection from parsed data
          const inspection = {
            id: nanoid(),
            userId: ctx.user.id,
            vesselTagNumber: parsedData.vesselTagNumber || `IMPORT-${Date.now()}`,
            vesselName: parsedData.vesselName,
            manufacturer: parsedData.manufacturer,
            yearBuilt: parsedData.yearBuilt,
            designPressure: parsedData.designPressure,
            designTemperature: parsedData.designTemperature,
            operatingPressure: parsedData.operatingPressure,
            materialSpec: parsedData.materialSpec,
            vesselType: parsedData.vesselType,
            insideDiameter: parsedData.insideDiameter,
            overallLength: parsedData.overallLength,
            status: "draft" as const,
          };

          await db.createInspection(inspection);

          // Create TML readings if available
          if (parsedData.tmlReadings && parsedData.tmlReadings.length > 0) {
            for (const reading of parsedData.tmlReadings) {
              await db.createTmlReading({
                id: nanoid(),
                inspectionId: inspection.id,
                ...reading,
              });
            }
          }

          // Create imported file record
          await db.createImportedFile({
            id: nanoid(),
            inspectionId: inspection.id,
            userId: ctx.user.id,
            fileName: input.fileName,
            fileType: input.fileType,
            fileUrl,
            fileSize: buffer.length,
            extractedData: JSON.stringify(parsedData),
            processingStatus: "completed",
          });

          return {
            success: true,
            inspectionId: inspection.id,
            parsedData,
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
  }),
});

export type AppRouter = typeof appRouter;

