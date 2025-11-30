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
        const extractionPrompt = `You are an expert at extracting ultrasonic thickness (UT) measurement data from API 510 pressure vessel inspection reports.

Analyze this UT report PDF and extract ALL thickness measurements in JSON format.

IMPORTANT INSTRUCTIONS:
1. CML numbers: Extract the exact CML identifier (e.g., "CML-1", "CML-2", "1", "2", etc.)
2. Component: Identify the vessel component (e.g., "Vessel Shell", "Shell", "East Head", "West Head", "Nozzle N1")
3. Location: Extract specific location description if available (e.g., "12 o'clock", "Top", "Bottom")
4. Thickness: Current measured thickness in inches (decimal format)
5. Previous Thickness: If shown in the report, extract the previous inspection thickness

Format:
{
  "inspectionDate": "YYYY-MM-DD",
  "thicknessMeasurements": [
    {
      "cml": "CML identifier (e.g., 'CML-1', '1', 'A-1')",
      "component": "Component name (e.g., 'Vessel Shell', 'East Head')",
      "location": "Specific location (e.g., '12 o'clock', 'Top')",
      "thickness": 0.XXX (current thickness in inches),
      "previousThickness": 0.XXX (previous thickness if available)
    }
  ]
}

Extract ALL thickness measurements from tables. Be thorough and accurate. Match CML numbers exactly as they appear in the document.`;

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

        // Get existing TML readings for this inspection
        const existingTmlReadings = await db
          .select()
          .from(tmlReadings)
          .where(eq(tmlReadings.inspectionId, input.targetInspectionId));

        let updatedCount = 0;
        let addedCount = 0;
        const newInspectionDate = extractedData.inspectionDate ? new Date(extractedData.inspectionDate) : new Date();

        // Process each measurement
        for (const measurement of extractedData.thicknessMeasurements) {
          const cmlNumber = String(measurement.cml || "N/A");
          const componentType = String(measurement.component || "Unknown");
          const location = String(measurement.location || "N/A");
          const newThickness = measurement.thickness?.toString() || null;

          // Try to find matching existing TML record by CML number and component
          const existingRecord = existingTmlReadings.find(
            (tml) =>
              tml.cmlNumber === cmlNumber &&
              (tml.componentType === componentType || tml.component === componentType)
          );

          if (existingRecord && newThickness) {
            // Update existing record: move current to previous, set new as current
            const previousThickness = existingRecord.currentThickness || existingRecord.tActual;
            const previousDate = existingRecord.currentInspectionDate || existingRecord.previousInspectionDate || existingInspection.inspectionDate;

            // Calculate corrosion rate if we have both dates and thicknesses
            let corrosionRate = null;
            if (previousThickness && previousDate) {
              const prevThick = parseFloat(previousThickness);
              const currThick = parseFloat(newThickness);
              const timeSpanMs = newInspectionDate.getTime() - new Date(previousDate).getTime();
              const timeSpanYears = timeSpanMs / (1000 * 60 * 60 * 24 * 365.25);

              if (timeSpanYears > 0) {
                const thicknessLoss = prevThick - currThick;
                const corrosionRateMpy = (thicknessLoss / timeSpanYears) * 1000; // Convert to mils per year
                corrosionRate = corrosionRateMpy.toFixed(4);
              }
            }

            // Update the existing record
            await db.execute(sql`
              UPDATE tmlReadings
              SET
                previousThickness = ${previousThickness},
                previousInspectionDate = ${previousDate},
                currentThickness = ${newThickness},
                tActual = ${newThickness},
                currentInspectionDate = ${newInspectionDate},
                corrosionRate = ${corrosionRate},
                tml1 = ${newThickness}
              WHERE id = ${existingRecord.id}
            `);
            updatedCount++;
          } else {
            // Create new TML record
            const record = {
              id: nanoid(),
              inspectionId: input.targetInspectionId,
              cmlNumber,
              componentType,
              location,
              service: null as string | null,
              tml1: newThickness,
              tml2: null as string | null,
              tml3: null as string | null,
              tml4: null as string | null,
              tActual: newThickness,
              nominalThickness: null as string | null,
              previousThickness: measurement.previousThickness?.toString() || null,
              previousInspectionDate: existingInspection.inspectionDate || null,
              currentInspectionDate: newInspectionDate,
              loss: null as string | null,
              lossPercent: null as string | null,
              corrosionRate: null as string | null,
              status: "good" as const,
              tmlId: measurement.cml || null,
              component: measurement.component || null,
              currentThickness: newThickness,
            };

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
            addedCount++;
          }
        }

        return {
          success: true,
          inspectionId: input.targetInspectionId,
          addedMeasurements: addedCount,
          updatedMeasurements: updatedCount,
          message: `Successfully processed ${addedCount + updatedCount} thickness measurements (${updatedCount} updated, ${addedCount} new)`,
        };
      } catch (error) {
        console.error("UT upload failed:", error);
        throw new Error(`Failed to upload UT results: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});

