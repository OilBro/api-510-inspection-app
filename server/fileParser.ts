import * as XLSX from "xlsx";
import * as pdf from "pdf-parse";
import { invokeLLM } from "./_core/llm";

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

          // Vessel tag number variations
          if (
            key.includes("vessel") && (key.includes("tag") || key.includes("number") || key.includes("id")) ||
            key.includes("equipment") && key.includes("number") ||
            key === "tag number" ||
            key === "vessel id"
          ) {
            result.vesselTagNumber = value;
          }

          // Vessel name
          if (
            key.includes("vessel") && key.includes("name") ||
            key.includes("description") ||
            key === "vessel name"
          ) {
            result.vesselName = value;
          }

          // Manufacturer
          if (key.includes("manufacturer") || key.includes("fabricator")) {
            result.manufacturer = value;
          }

          // Year built
          if (key.includes("year") && key.includes("built") || key.includes("construction year")) {
            const year = parseInt(value);
            if (!isNaN(year) && year > 1900 && year < 2100) {
              result.yearBuilt = year;
            }
          }

          // Design pressure
          if (key.includes("design") && key.includes("pressure")) {
            result.designPressure = value.replace(/[^0-9.]/g, "");
          }

          // Design temperature
          if (key.includes("design") && key.includes("temp")) {
            result.designTemperature = value.replace(/[^0-9.]/g, "");
          }

          // Operating pressure
          if (key.includes("operating") && key.includes("pressure")) {
            result.operatingPressure = value.replace(/[^0-9.]/g, "");
          }

          // Material specification
          if (
            key.includes("material") && (key.includes("spec") || key.includes("specification")) ||
            key === "material"
          ) {
            result.materialSpec = value;
          }

          // Vessel type
          if (key.includes("vessel") && key.includes("type") || key === "type") {
            result.vesselType = value;
          }

          // Inside diameter
          if (
            key.includes("inside") && key.includes("diameter") ||
            key.includes("id") && key.includes("diameter") ||
            key === "diameter"
          ) {
            result.insideDiameter = value.replace(/[^0-9.]/g, "");
          }

          // Overall length
          if (key.includes("length") || key.includes("height")) {
            result.overallLength = value.replace(/[^0-9.]/g, "");
          }
        }
      }

      // Look for TML readings table
      const tmlHeaders = ["tml", "location", "component", "thickness", "reading", "nominal", "previous", "current"];
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row) continue;

        // Check if this row contains TML headers
        const rowStr = row.join(" ").toLowerCase();
        const hasTmlHeader = tmlHeaders.some((h) => rowStr.includes(h));

        if (hasTmlHeader) {
          // Found header row, parse data rows below
          const headers = row.map((h) => String(h || "").toLowerCase());
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
 * Parse PDF file and extract vessel inspection data using LLM
 */
export async function parsePDFFile(buffer: Buffer): Promise<ParsedVesselData> {
  try {
    // Extract text from PDF
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

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const parsedData = JSON.parse(contentStr) as ParsedVesselData;
    return parsedData;
  } catch (error) {
    console.error("Error parsing PDF file:", error);
    throw new Error("Failed to parse PDF file");
  }
}

