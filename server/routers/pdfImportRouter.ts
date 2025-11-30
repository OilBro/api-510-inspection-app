import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import { inspections, tmlReadings, inspectionFindings } from "../../drizzle/schema";
import { sql, eq, and } from "drizzle-orm";
import { getDb } from "../db";

/**
 * PDF Import Router
 * Handles uploading and extracting data from inspection report PDFs
 */
export const pdfImportRouter = router({
  /**
   * Upload PDF and extract inspection data using AI
   */
  extractFromPDF: protectedProcedure
    .input(
      z.object({
        pdfUrl: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Use LLM with vision to extract data from PDF
        const extractionPrompt = `You are an expert at extracting data from API 510 pressure vessel inspection reports.

Analyze this inspection report PDF and extract ALL the following information in JSON format:

{
  "vesselData": {
    "vesselTagNumber": "string",
    "vesselName": "string",
    "manufacturer": "string",
    "yearBuilt": "number",
    "designPressure": "number (psig)",
    "designTemperature": "number (°F)",
    "operatingPressure": "number (psig)",
    "materialSpec": "string",
    "vesselType": "string",
    "insideDiameter": "number (inches)",
    "overallLength": "number (inches)"
  },
  "inspectionData": {
    "inspectionDate": "YYYY-MM-DD",
    "inspector": "string",
    "reportNumber": "string",
    "client": "string"
  },
  "thicknessMeasurements": [
    {
      "cml": "string (CML number)",
      "component": "string (e.g., 'Vessel Shell', 'East Head')",
      "location": "string",
      "thickness": "number (inches)"
    }
  ],
  "findings": [
    {
      "section": "string",
      "finding": "string",
      "severity": "acceptable|monitor|critical"
    }
  ]
}

Extract ALL thickness measurements from any tables in the report. Be thorough and accurate.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractionPrompt,
                },
                {
                  type: "file_url",
                  file_url: {
                    url: input.pdfUrl,
                    mime_type: "application/pdf",
                  },
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "inspection_data",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  vesselData: {
                    type: "object",
                    properties: {
                      vesselTagNumber: { type: "string" },
                      vesselName: { type: "string" },
                      manufacturer: { type: "string" },
                      yearBuilt: { type: "number" },
                      designPressure: { type: "number" },
                      designTemperature: { type: "number" },
                      operatingPressure: { type: "number" },
                      materialSpec: { type: "string" },
                      vesselType: { type: "string" },
                      insideDiameter: { type: "number" },
                      overallLength: { type: "number" },
                    },
                    required: ["vesselTagNumber"],
                    additionalProperties: false,
                  },
                  inspectionData: {
                    type: "object",
                    properties: {
                      inspectionDate: { type: "string" },
                      inspector: { type: "string" },
                      reportNumber: { type: "string" },
                      client: { type: "string" },
                    },
                    required: ["inspectionDate"],
                    additionalProperties: false,
                  },
                  thicknessMeasurements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cml: { type: "string" },
                        component: { type: "string" },
                        location: { type: "string" },
                        thickness: { type: "number" },
                      },
                      required: ["cml", "component", "thickness"],
                      additionalProperties: false,
                    },
                  },
                  findings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string" },
                        finding: { type: "string" },
                        severity: { type: "string", enum: ["acceptable", "monitor", "critical"] },
                      },
                      required: ["section", "finding", "severity"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["vesselData", "inspectionData"],
                additionalProperties: false,
              },
            },
          },
        });

        const messageContent = response.choices[0].message.content;
        const extractedData = JSON.parse(typeof messageContent === 'string' ? messageContent : "{}");

        return {
          success: true,
          data: extractedData,
        };
      } catch (error) {
        console.error("PDF extraction failed:", error);
        throw new Error(`Failed to extract data from PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Save extracted data as a new inspection
   */
  saveExtractedData: protectedProcedure
    .input(
      z.object({
        vesselData: z.object({
          vesselTagNumber: z.string(),
          vesselName: z.string().optional(),
          manufacturer: z.string().optional(),
          yearBuilt: z.number().optional(),
          designPressure: z.number().optional(),
          designTemperature: z.number().optional(),
          operatingPressure: z.number().optional(),
          materialSpec: z.string().optional(),
          vesselType: z.string().optional(),
          insideDiameter: z.number().optional(),
          overallLength: z.number().optional(),
        }),
        inspectionData: z.object({
          inspectionDate: z.string(),
          inspector: z.string().optional(),
          reportNumber: z.string().optional(),
          client: z.string().optional(),
        }),
        thicknessMeasurements: z
          .array(
            z.object({
              cml: z.string(),
              component: z.string(),
              location: z.string().optional(),
              thickness: z.number(),
            })
          )
          .optional(),
        findings: z
          .array(
            z.object({
              section: z.string(),
              finding: z.string(),
              severity: z.enum(["acceptable", "monitor", "critical"]),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const inspectionId = nanoid();

      // Create inspection record
      await db.insert(inspections).values({
        id: inspectionId,
        userId: ctx.user.id,
        vesselTagNumber: input.vesselData.vesselTagNumber,
        vesselName: input.vesselData.vesselName || null,
        manufacturer: input.vesselData.manufacturer || null,
        yearBuilt: input.vesselData.yearBuilt || null,
        designPressure: input.vesselData.designPressure?.toString() || null,
        designTemperature: input.vesselData.designTemperature?.toString() || null,
        operatingPressure: input.vesselData.operatingPressure?.toString() || null,
        materialSpec: input.vesselData.materialSpec || null,
        vesselType: input.vesselData.vesselType || null,
        insideDiameter: input.vesselData.insideDiameter?.toString() || null,
        overallLength: input.vesselData.overallLength?.toString() || null,
        status: "completed",
        inspectionDate: new Date(input.inspectionData.inspectionDate),
        completedAt: new Date(input.inspectionData.inspectionDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Import thickness measurements
      if (input.thicknessMeasurements && input.thicknessMeasurements.length > 0) {
        const tmlRecords = input.thicknessMeasurements.map((measurement) => {
          const record = {
            id: nanoid(),
            inspectionId: inspectionId,
            cmlNumber: String(measurement.cml || 'N/A'),
            componentType: String(measurement.component || 'Unknown'),
            location: String(measurement.location || 'N/A'),
            service: null as string | null,
            tml1: measurement.thickness?.toString() || null,
            tml2: null as string | null,
            tml3: null as string | null,
            tml4: null as string | null,
            tActual: measurement.thickness?.toString() || null,
            nominalThickness: measurement.thickness?.toString() || null,
            previousThickness: null as string | null,
            previousInspectionDate: null as Date | null,
            currentInspectionDate: null as Date | null,
            loss: null as string | null,
            lossPercent: null as string | null,
            corrosionRate: null as string | null,
            status: "good" as const,
            tmlId: measurement.cml || null,
            component: measurement.component || null,
            currentThickness: measurement.thickness?.toString() || null,
          };
          console.log('[PDF Import] TML record to insert:', JSON.stringify(record, null, 2));
          return record;
        });

        console.log('[PDF Import] About to insert', tmlRecords.length, 'TML records');
        
        // Use raw SQL to bypass Drizzle ORM issue with defaults
        for (const record of tmlRecords) {
          await db.execute(sql`
            INSERT INTO tmlReadings (
              id, inspectionId, cmlNumber, componentType, location, service,
              tml1, tml2, tml3, tml4, tActual, nominalThickness, previousThickness,
              previousInspectionDate, currentInspectionDate, loss, lossPercent, corrosionRate,
              status, tmlId, component, currentThickness
            ) VALUES (
              ${record.id}, ${record.inspectionId}, ${record.cmlNumber}, ${record.componentType}, ${record.location}, ${record.service},
              ${record.tml1}, ${record.tml2}, ${record.tml3}, ${record.tml4}, ${record.tActual}, ${record.nominalThickness}, ${record.previousThickness},
              ${record.previousInspectionDate}, ${record.currentInspectionDate}, ${record.loss}, ${record.lossPercent}, ${record.corrosionRate},
              ${record.status}, ${record.tmlId}, ${record.component}, ${record.currentThickness}
            )
          `);
        }
      }

      // Import findings
      if (input.findings && input.findings.length > 0) {
        const findingRecords = input.findings.map((finding) => ({
          id: nanoid(),
          reportId: inspectionId,
          section: finding.section,
          severity: finding.severity,
          description: finding.finding,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await db.insert(inspectionFindings).values(findingRecords);
      }

      return {
        success: true,
        inspectionId: inspectionId,
      };
    }),

  /**
   * Upload new UT results to an existing inspection/report
   */
  uploadUTResults: protectedProcedure
    .input(
      z.object({
        targetInspectionId: z.string(),
        pdfUrl: z.string().url(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Verify the target inspection exists and belongs to the user
        const [existingInspection] = await db
          .select()
          .from(inspections)
          .where(
            and(
              eq(inspections.id, input.targetInspectionId),
              eq(inspections.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (!existingInspection) {
          throw new Error("Inspection not found or access denied");
        }

        // Extract UT data from PDF
        const extractionPrompt = `You are an expert at extracting ultrasonic thickness (UT) measurement data from inspection reports.

Analyze this UT report PDF and extract ALL thickness measurements in JSON format:

{
  "inspectionDate": "YYYY-MM-DD",
  "thicknessMeasurements": [
    {
      "cml": "string (CML number)",
      "component": "string (e.g., 'Vessel Shell', 'East Head', 'West Head')",
      "location": "string (specific location description)",
      "thickness": "number (inches)",
      "previousThickness": "number (inches, if available)"
    }
  ]
}

Extract ALL thickness measurements from tables. Be thorough and accurate. If previous thickness values are shown, include them.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractionPrompt,
                },
                {
                  type: "file_url",
                  file_url: {
                    url: input.pdfUrl,
                    mime_type: "application/pdf",
                  },
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "ut_results",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  inspectionDate: { type: "string" },
                  thicknessMeasurements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cml: { type: "string" },
                        component: { type: "string" },
                        location: { type: "string" },
                        thickness: { type: "number" },
                        previousThickness: { type: "number" },
                      },
                      required: ["cml", "component", "thickness"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["inspectionDate", "thicknessMeasurements"],
                additionalProperties: false,
              },
            },
          },
        });

        const messageContent = response.choices[0].message.content;
        const extractedData = JSON.parse(typeof messageContent === 'string' ? messageContent : "{}");

        if (!extractedData.thicknessMeasurements || extractedData.thicknessMeasurements.length === 0) {
          throw new Error("No thickness measurements found in the uploaded file");
        }

        // Update inspection date if provided
        if (extractedData.inspectionDate) {
          await db
            .update(inspections)
            .set({
              inspectionDate: new Date(extractedData.inspectionDate),
              updatedAt: new Date(),
            })
            .where(sql`id = ${input.targetInspectionId}`);
        }

        // Add new TML readings to the inspection
        const newTmlRecords = extractedData.thicknessMeasurements.map((measurement: any) => ({
          id: nanoid(),
          inspectionId: input.targetInspectionId,
          cmlNumber: String(measurement.cml || "N/A"),
          componentType: String(measurement.component || "Unknown"),
          location: String(measurement.location || "N/A"),
          service: null as string | null,
          tml1: measurement.thickness?.toString() || null,
          tml2: null as string | null,
          tml3: null as string | null,
          tml4: null as string | null,
          tActual: measurement.thickness?.toString() || null,
          nominalThickness: null as string | null,
          previousThickness: measurement.previousThickness?.toString() || null,
          previousInspectionDate: existingInspection.inspectionDate || null,
          currentInspectionDate: extractedData.inspectionDate ? new Date(extractedData.inspectionDate) : new Date(),
          loss: null as string | null,
          lossPercent: null as string | null,
          corrosionRate: null as string | null,
          status: "good" as const,
          tmlId: measurement.cml || null,
          component: measurement.component || null,
          currentThickness: measurement.thickness?.toString() || null,
        }));

        // Insert new TML readings
        for (const record of newTmlRecords) {
          await db.execute(sql`
            INSERT INTO tmlReadings (
              id, inspectionId, cmlNumber, componentType, location, service,
              tml1, tml2, tml3, tml4, tActual, nominalThickness, previousThickness,
              previousInspectionDate, currentInspectionDate, loss, lossPercent, corrosionRate,
              status, tmlId, component, currentThickness
            ) VALUES (
              ${record.id}, ${record.inspectionId}, ${record.cmlNumber}, ${record.componentType}, ${record.location}, ${record.service},
              ${record.tml1}, ${record.tml2}, ${record.tml3}, ${record.tml4}, ${record.tActual}, ${record.nominalThickness}, ${record.previousThickness},
              ${record.previousInspectionDate}, ${record.currentInspectionDate}, ${record.loss}, ${record.lossPercent}, ${record.corrosionRate},
              ${record.status}, ${record.tmlId}, ${record.component}, ${record.currentThickness}
            )
          `);
        }

        return {
          success: true,
          inspectionId: input.targetInspectionId,
          addedMeasurements: newTmlRecords.length,
          message: `Successfully added ${newTmlRecords.length} new thickness measurements to the inspection`,
        };
      } catch (error) {
        console.error("UT upload failed:", error);
        throw new Error(`Failed to upload UT results: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});

