import * as XLSX from "xlsx";
import * as pdf from "pdf-parse";
import { invokeLLM } from "./_core/llm";
import { parseDocument, extractVesselDataFromDocupipe } from "./docupipe";

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
  tmlReadings?: Array<{
    tmlId: string;
    component: string;
    currentThickness?: string;
    previousThickness?: string;
    nominalThickness?: string;
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
          if (key.includes("tag") || key.includes("equipment id") || key.includes("asset")) {
            result.vesselTagNumber = value;
          } else if (key.includes("vessel name") || key.includes("description")) {
            result.vesselName = value;
          } else if (key.includes("manufacturer") || key.includes("fabricator")) {
            result.manufacturer = value;
          } else if (key.includes("year built") || key.includes("year manufactured")) {
            const year = parseInt(value);
            if (!isNaN(year)) result.yearBuilt = year;
          } else if (key.includes("design pressure") || key.includes("mawp")) {
            result.designPressure = value;
          } else if (key.includes("design temp")) {
            result.designTemperature = value;
          } else if (key.includes("operating pressure")) {
            result.operatingPressure = value;
          } else if (key.includes("material") && key.includes("spec")) {
            result.materialSpec = value;
          } else if (key.includes("vessel type")) {
            result.vesselType = value;
          } else if (key.includes("inside diameter") || key.includes("id")) {
            result.insideDiameter = value;
          } else if (key.includes("length") || key.includes("height")) {
            result.overallLength = value;
          }
        }
      }

      // Look for TML readings table
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;

        // Check if this row contains TML headers
        const rowStr = row.join(" ").toLowerCase();
        if (
          (rowStr.includes("tml") || rowStr.includes("location")) &&
          (rowStr.includes("thickness") || rowStr.includes("reading"))
        ) {
          // Found TML table header
          const headers = row.map((h: any) => String(h || "").toLowerCase());

          // Find column indices
          const tmlIdIdx = headers.findIndex((h) => h.includes("tml") || h.includes("location") || h.includes("id"));
          const componentIdx = headers.findIndex((h) => h.includes("component") || h.includes("area"));
          const nominalIdx = headers.findIndex((h) => h.includes("nominal") || h.includes("design"));
          const previousIdx = headers.findIndex((h) => h.includes("previous") || h.includes("last"));
          const currentIdx = headers.findIndex((h) => h.includes("current") || h.includes("actual"));

          // Parse data rows
          for (let j = i + 1; j < data.length; j++) {
            const dataRow = data[j];
            if (!dataRow || dataRow.length === 0) break;

            const tmlId = tmlIdIdx >= 0 ? String(dataRow[tmlIdIdx] || "").trim() : "";
            const component = componentIdx >= 0 ? String(dataRow[componentIdx] || "").trim() : "";

            if (tmlId && component) {
              result.tmlReadings?.push({
                tmlId,
                component,
                nominalThickness: nominalIdx >= 0 ? String(dataRow[nominalIdx] || "") : undefined,
                previousThickness: previousIdx >= 0 ? String(dataRow[previousIdx] || "") : undefined,
                currentThickness: currentIdx >= 0 ? String(dataRow[currentIdx] || "") : undefined,
              });
            }
          }
          break;
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error("Failed to parse Excel file");
  }
}

/**
 * Parse PDF file using Docupipe for enhanced extraction
 */
export async function parsePDFFile(buffer: Buffer): Promise<ParsedVesselData> {
  try {
    // First, try Docupipe for enhanced parsing
    console.log("Parsing PDF with Docupipe...");
    
    try {
      const docResult = await parseDocument(buffer, "inspection.pdf");
      const fullText = docResult.result.text;
      
      console.log("Docupipe parsing successful, extracting vessel data...");
      
      // Extract vessel data using pattern matching
      const result: ParsedVesselData = {
        tmlReadings: [],
      };

      // Extract vessel tag/ID
      const tagPatterns = [
        /(?:Vessel|Tag|Equipment\s+ID|Asset)[:\s]+([A-Z0-9-]+)/i,
        /Report\s+No[.:]?\s*([A-Z0-9-]+)/i,
      ];
      for (const pattern of tagPatterns) {
        const match = fullText.match(pattern);
        if (match) {
          result.vesselTagNumber = match[1].trim();
          break;
        }
      }

      // Extract vessel name
      const nameMatch = fullText.match(/(?:Vessel\s+Name|Description)[:\s]+([^\n]+)/i);
      if (nameMatch) result.vesselName = nameMatch[1].trim();

      // Extract client/manufacturer
      const clientMatch = fullText.match(/(?:Client|Manufacturer)[:\s]+([^\n]+)/i);
      if (clientMatch) result.manufacturer = clientMatch[1].trim();

      // Extract material
      const materialMatch = fullText.match(/Material[:\s]+(SA-[0-9A-Z-]+|SS\s*A\s*-\s*[0-9]+)/i);
      if (materialMatch) result.materialSpec = materialMatch[1].trim().replace(/\s+/g, "-");

      // Extract design pressure (MAWP)
      const mawpMatch = fullText.match(/(?:MAWP|Design\s+Pressure)[:\s]+([0-9.]+)\s*(?:psi|psig)?/i);
      if (mawpMatch) result.designPressure = `${mawpMatch[1]} psig`;

      // Extract design temperature
      const tempMatch = fullText.match(/(?:Design\s+)?Temp(?:erature)?[:\s]+([0-9.]+)\s*(?:°F|F)?/i);
      if (tempMatch) result.designTemperature = `${tempMatch[1]} °F`;

      // Extract diameter
      const diameterMatch = fullText.match(/(?:Inside\s+)?Diameter[:\s]+([0-9.]+)\s*(?:inch|in)?/i);
      if (diameterMatch) result.insideDiameter = `${diameterMatch[1]} inches`;

      // Extract TML readings from tables
      // Look for patterns like "TML-1  Shell  0.625  0.652"
      const tmlPattern = /([A-Z0-9-]+)\s+(Shell|Head|Nozzle|Bottom|Top|Side)\s+([0-9.]+)\s+([0-9.]+)/gi;
      let tmlMatch;
      while ((tmlMatch = tmlPattern.exec(fullText)) !== null) {
        result.tmlReadings?.push({
          tmlId: tmlMatch[1],
          component: tmlMatch[2],
          previousThickness: tmlMatch[3],
          currentThickness: tmlMatch[4],
        });
      }

      // If we got meaningful data, return it
      if (result.vesselTagNumber || result.vesselName || (result.tmlReadings && result.tmlReadings.length > 0)) {
        console.log("Successfully extracted data with Docupipe");
        return result;
      }
      
      console.log("Docupipe extraction incomplete, falling back to LLM...");
    } catch (docupipeError) {
      console.warn("Docupipe parsing failed, falling back to LLM:", docupipeError);
    }

    // Fallback to pdf-parse + LLM if Docupipe fails or returns insufficient data
    console.log("Using pdf-parse + LLM for extraction...");
    const pdfData = await (pdf as any)(buffer);
    const text = pdfData.text;

    // Use LLM to extract structured data
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert at extracting vessel inspection data from API 510 inspection reports. 
Extract the following information from the provided text and return it as valid JSON:
{
  "vesselTagNumber": "vessel tag number, equipment ID, or asset ID",
  "vesselName": "vessel name or description",
  "manufacturer": "manufacturer or fabricator name",
  "yearBuilt": year as number,
  "designPressure": "design pressure value in psig",
  "designTemperature": "design temperature value in °F",
  "operatingPressure": "operating pressure value in psig",
  "materialSpec": "material specification (e.g., SA-516-70)",
  "vesselType": "vessel type (e.g., Pressure Vessel, Storage Tank)",
  "insideDiameter": "inside diameter in inches",
  "overallLength": "overall length in feet",
  "tmlReadings": [
    {
      "tmlId": "TML location ID",
      "component": "component name (Shell, Head, Nozzle, etc.)",
      "nominalThickness": "nominal thickness in inches",
      "previousThickness": "previous thickness reading in inches",
      "currentThickness": "current thickness reading in inches"
    }
  ]
}

Only include fields that are found in the text. If a field is not found, omit it from the JSON.
Return ONLY valid JSON, no other text.`,
        },
        {
          role: "user",
          content: text,
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
              yearBuilt: { type: "integer" },
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
                    tmlId: { type: "string" },
                    component: { type: "string" },
                    nominalThickness: { type: "string" },
                    previousThickness: { type: "string" },
                    currentThickness: { type: "string" },
                  },
                  required: ["tmlId", "component"],
                  additionalProperties: false,
                },
              },
            },
            required: [],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in LLM response");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsedData = JSON.parse(contentStr);
    console.log("Successfully extracted data with LLM");
    return parsedData;
  } catch (error) {
    console.error("Error parsing PDF file:", error);
    throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

