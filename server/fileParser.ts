import * as XLSX from "xlsx";
import * as pdf from "pdf-parse";
import { invokeLLM } from "./_core/llm";
import { parseDocument, parseAndStandardizeDocument } from "./docupipe";
import { parseDocupipeStandard, type DocupipeStandardFormat } from "./docupipeStandardParser";
import { parseAndStandardizeWithManus, parseDocumentWithManus } from "./manusParser";
import { ENV } from "./_core/env";

interface ParsedVesselData {
  vesselTagNumber?: string;
  vesselName?: string;
  manufacturer?: string;
  yearBuilt?: number;
  designPressure?: string;
  designTemperature?: string;
  operatingPressure?: string;
  materialSpec?: string;
  vesselType?: string;
  insideDiameter?: string;
  overallLength?: string;
  
  // Additional fields from Docupipe standardization
  reportNumber?: string;
  reportDate?: string;
  inspectionDate?: string;
  inspectionType?: string;
  inspectionCompany?: string;
  inspectorName?: string;
  inspectorCert?: string;
  clientName?: string;
  clientLocation?: string;
  product?: string;
  nbNumber?: string;
  constructionCode?: string;
  vesselConfiguration?: string;
  headType?: string;
  insulationType?: string;
  executiveSummary?: string;
  
  tmlReadings?: Array<{
    cmlNumber?: string;
    tmlId?: string;
    location?: string;
    component: string;
    currentThickness?: string | number;
    previousThickness?: string;
    nominalThickness?: string | number;
    minimumRequired?: number;
    calculatedMAWP?: number;
  }>;
  
  checklistItems?: Array<{
    category?: string;
    itemNumber?: string;
    itemText?: string;
    description?: string;
    checked?: boolean;
    status?: string;
    notes?: string;
    checkedBy?: string;
    checkedDate?: string;
  }>;
}

/**
 * Parse Excel file and extract vessel inspection data
 */
export async function parseExcelFile(buffer: Buffer): Promise<ParsedVesselData> {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const result: ParsedVesselData = {
      tmlReadings: [],
    };

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Look for vessel identification data in headers
      for (let i = 0; i < Math.min(20, data.length); i++) {
        const row = data[i];
        if (!row) continue;

        for (let j = 0; j < row.length - 1; j++) {
          const key = String(row[j] || "").toLowerCase();
          const value = String(row[j + 1] || "").trim();

          if (!value) continue;

          // Match vessel identification fields
          if (key.includes("tag") || key.includes("vessel id")) {
            result.vesselTagNumber = value;
          } else if (key.includes("vessel name") || key.includes("equipment")) {
            result.vesselName = value;
          } else if (key.includes("manufacturer") || key.includes("fabricator")) {
            result.manufacturer = value;
          } else if (key.includes("year") && key.includes("built")) {
            result.yearBuilt = parseInt(value);
          } else if (key.includes("design pressure") || key.includes("mawp")) {
            result.designPressure = value;
          } else if (key.includes("design temp")) {
            result.designTemperature = value;
          } else if (key.includes("operating pressure")) {
            result.operatingPressure = value;
          } else if (key.includes("material")) {
            result.materialSpec = value;
          } else if (key.includes("diameter") || key.includes("id")) {
            result.insideDiameter = value;
          } else if (key.includes("length")) {
            result.overallLength = value;
          }
        }
      }

      // Look for TML reading data (usually in tabular format)
      const headers = data[0]?.map((h: any) => String(h || "").toLowerCase()) || [];
      const tmlIdCol = headers.findIndex((h) =>
        h.includes("tml") || h.includes("cml") || h.includes("location")
      );
      const componentCol = headers.findIndex((h) => h.includes("component") || h.includes("area"));
      const currentThicknessCol = headers.findIndex(
        (h) => h.includes("current") || h.includes("actual") || h.includes("measured")
      );
      const nominalCol = headers.findIndex((h) => h.includes("nominal") || h.includes("design"));

      if (tmlIdCol >= 0 && currentThicknessCol >= 0) {
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || !row[tmlIdCol]) continue;

          const reading: any = {
            tmlId: String(row[tmlIdCol]),
            component: componentCol >= 0 ? String(row[componentCol] || "Shell") : "Shell",
            currentThickness: row[currentThicknessCol]
              ? String(row[currentThicknessCol])
              : undefined,
          };

          if (nominalCol >= 0 && row[nominalCol]) {
            reading.nominalThickness = String(row[nominalCol]);
          }

          result.tmlReadings?.push(reading);
        }
      }
    }

    return result;
  } catch (error) {
    console.error("[Excel Parser] Error:", error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse PDF file using Docupipe standardized extraction
 */
export async function parsePDFFile(buffer: Buffer, parserType?: "docupipe" | "manus"): Promise<ParsedVesselData> {
  // Use provided parser type or fall back to ENV configuration
  const selectedParser = parserType || ENV.parserType;
  console.log(`[PDF Parser] Using parser: ${selectedParser}`);
  
  try {
    // Try selected parser's standardized extraction first
    try {
      let standardizedData: any;
      
      if (selectedParser === "manus") {
        console.log("[PDF Parser] Starting Manus API standardized extraction...");
        standardizedData = await parseAndStandardizeWithManus(buffer, "inspection-report.pdf");
        console.log("[PDF Parser] Manus standardization successful");
      } else {
        console.log("[PDF Parser] Starting Docupipe standardized extraction...");
        standardizedData = await parseAndStandardizeDocument(buffer, "inspection-report.pdf");
        console.log("[PDF Parser] Docupipe standardization successful");
      }
      
      // Parse the standardized format
      const parsedData = parseDocupipeStandard(standardizedData as DocupipeStandardFormat);
      
      return {
        vesselTagNumber: parsedData.vesselTagNumber,
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
        
        // Additional standardized fields
        reportNumber: parsedData.reportNumber,
        reportDate: parsedData.reportDate,
        inspectionDate: parsedData.inspectionDate,
        inspectionType: parsedData.inspectionType,
        inspectionCompany: parsedData.inspectionCompany,
        inspectorName: parsedData.inspectorName,
        inspectorCert: parsedData.inspectorCert,
        clientName: parsedData.clientName,
        clientLocation: parsedData.clientLocation,
        product: parsedData.product,
        nbNumber: parsedData.nbNumber,
        constructionCode: parsedData.constructionCode,
        vesselConfiguration: parsedData.vesselConfiguration,
        headType: parsedData.headType,
        insulationType: parsedData.insulationType,
        executiveSummary: parsedData.executiveSummary,
        
        tmlReadings: parsedData.tmlReadings.map(reading => ({
          cmlNumber: reading.cmlNumber,
          location: reading.location,
          component: reading.component,
          currentThickness: reading.currentThickness,
          nominalThickness: reading.nominalThickness,
          minimumRequired: reading.minimumRequired,
          calculatedMAWP: reading.calculatedMAWP,
        })),
      };
    } catch (parserError) {
      console.warn(`[PDF Parser] ${selectedParser} standardization failed, falling back to basic parsing:`, parserError);
      
      // Fallback to basic parsing + LLM extraction
      const docResult = selectedParser === "manus" 
        ? await parseDocumentWithManus(buffer, "inspection-report.pdf")
        : await parseDocument(buffer, "inspection-report.pdf");
      const fullText = docResult.result.text;

      // Use LLM to extract structured data from text
      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are an expert at extracting vessel inspection data from API 510 reports. Extract all available information and return it as JSON.",
          },
          {
            role: "user",
            content: `Extract vessel inspection data from this report:\n\n${fullText.substring(0, 8000)}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "vessel_data",
            strict: true,
            schema: {
              type: "object",
              properties: {
                vesselTagNumber: { type: "string" },
                vesselName: { type: "string" },
                manufacturer: { type: "string" },
                yearBuilt: { type: "number" },
                designPressure: { type: "string" },
                designTemperature: { type: "string" },
                operatingPressure: { type: "string" },
                materialSpec: { type: "string" },
                vesselType: { type: "string" },
                insideDiameter: { type: "string" },
                overallLength: { type: "string" },
                tmlReadings: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      location: { type: "string" },
                      component: { type: "string" },
                      currentThickness: { type: "string" },
                    },
                    required: ["location", "component"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["vesselTagNumber"],
              additionalProperties: false,
            },
          },
        },
      });

      const messageContent = llmResponse.choices[0].message.content;
      const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
      const extracted = JSON.parse(contentStr || "{}");
      console.log("[PDF Parser] LLM extraction completed");
      
      return extracted;
    }
  } catch (error) {
    console.error("[PDF Parser] Error:", error);
    throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

