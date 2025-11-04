import { ENV } from './_core/env';
import { invokeLLM } from './_core/llm';

/**
 * Manus API Parser - Uses Manus built-in Forge API for PDF parsing
 * Alternative to Docupipe API with similar functionality
 */

const MANUS_API_URL = ENV.forgeApiUrl;
const MANUS_API_KEY = ENV.forgeApiKey;

// Log API key status on module load
if (MANUS_API_KEY) {
  console.log("[Manus Parser] API key loaded successfully:", MANUS_API_KEY.substring(0, 10) + "...");
} else {
  console.warn("[Manus Parser] WARNING: API key not found in environment variables");
}

interface ManusParseResponse {
  text: string;
  pages: Array<{
    pageNumber: number;
    text: string;
  }>;
  metadata?: {
    numPages: number;
    title?: string;
    author?: string;
  };
}

/**
 * Parse PDF using Manus built-in API
 * Extracts text content from PDF file
 */
export async function parseWithManusAPI(
  fileBuffer: Buffer,
  filename: string
): Promise<ManusParseResponse> {
  console.log("[Manus Parser] Starting PDF parsing with Manus API...");
  console.log("[Manus Parser] API key check:", MANUS_API_KEY ? "PRESENT" : "MISSING");
  
  if (!MANUS_API_KEY) {
    throw new Error("MANUS_API_KEY is not configured");
  }

  // Convert buffer to base64 for API transmission
  const base64Content = fileBuffer.toString("base64");

  try {
    // Call Manus Forge API for PDF parsing
    const response = await fetch(`${MANUS_API_URL}/data/parse`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MANUS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64Content,
        filename: filename,
        format: "pdf",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Manus Parser] API error:", response.status, errorText);
      throw new Error(`Manus API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("[Manus Parser] Parsing successful, pages:", result.metadata?.numPages || "unknown");

    return result;
  } catch (error) {
    console.error("[Manus Parser] Failed to parse PDF:", error);
    throw error;
  }
}

/**
 * Parse and standardize PDF using Manus API + LLM extraction
 * Similar to Docupipe's parseAndStandardizeDocument
 */
export async function parseAndStandardizeWithManus(
  fileBuffer: Buffer,
  filename: string
): Promise<any> {
  console.log("[Manus Parser] Starting parse and standardization workflow...");

  // Step 1: Parse PDF with Manus API
  const parseResult = await parseWithManusAPI(fileBuffer, filename);
  const fullText = parseResult.text;

  console.log("[Manus Parser] Text extracted, length:", fullText.length);

  // Step 2: Use LLM to extract structured data
  console.log("[Manus Parser] Extracting structured data with LLM...");

  const llmResponse = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting vessel inspection data from API 510 reports. 
Extract all available information and return it as structured JSON matching this schema:

{
  "reportInfo": {
    "reportNumber": "string",
    "reportDate": "string",
    "inspectionDate": "string",
    "inspectionType": "string",
    "inspectionCompany": "string",
    "inspectorName": "string",
    "inspectorCert": "string"
  },
  "clientInfo": {
    "clientName": "string",
    "clientLocation": "string",
    "product": "string"
  },
  "vesselData": {
    "vesselTagNumber": "string",
    "vesselName": "string",
    "manufacturer": "string",
    "yearBuilt": "number",
    "nbNumber": "string",
    "constructionCode": "string",
    "vesselType": "string",
    "vesselConfiguration": "string",
    "designPressure": "string",
    "designTemperature": "string",
    "operatingPressure": "string",
    "materialSpec": "string",
    "insideDiameter": "string",
    "overallLength": "string",
    "headType": "string",
    "insulationType": "string"
  },
  "executiveSummary": "string",
  "tmlReadings": [
    {
      "cmlNumber": "string",
      "location": "string",
      "component": "string",
      "nominalThickness": "number",
      "previousThickness": "number",
      "currentThickness": "number",
      "minimumRequired": "number",
      "calculatedMAWP": "number"
    }
  ],
  "inspectionChecklist": [
    {
      "itemText": "string",
      "status": "string"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Extract vessel inspection data from this API 510 report:\n\n${fullText.substring(0, 15000)}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "api510_inspection_data",
        strict: true,
        schema: {
          type: "object",
          properties: {
            reportInfo: {
              type: "object",
              properties: {
                reportNumber: { type: "string" },
                reportDate: { type: "string" },
                inspectionDate: { type: "string" },
                inspectionType: { type: "string" },
                inspectionCompany: { type: "string" },
                inspectorName: { type: "string" },
                inspectorCert: { type: "string" },
              },
              required: [],
              additionalProperties: false,
            },
            clientInfo: {
              type: "object",
              properties: {
                clientName: { type: "string" },
                clientLocation: { type: "string" },
                product: { type: "string" },
              },
              required: [],
              additionalProperties: false,
            },
            vesselData: {
              type: "object",
              properties: {
                vesselTagNumber: { type: "string" },
                vesselName: { type: "string" },
                manufacturer: { type: "string" },
                yearBuilt: { type: "number" },
                nbNumber: { type: "string" },
                constructionCode: { type: "string" },
                vesselType: { type: "string" },
                vesselConfiguration: { type: "string" },
                designPressure: { type: "string" },
                designTemperature: { type: "string" },
                operatingPressure: { type: "string" },
                materialSpec: { type: "string" },
                insideDiameter: { type: "string" },
                overallLength: { type: "string" },
                headType: { type: "string" },
                insulationType: { type: "string" },
              },
              required: [],
              additionalProperties: false,
            },
            executiveSummary: { type: "string" },
            tmlReadings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  cmlNumber: { type: "string" },
                  location: { type: "string" },
                  component: { type: "string" },
                  nominalThickness: { type: "number" },
                  previousThickness: { type: "number" },
                  currentThickness: { type: "number" },
                  minimumRequired: { type: "number" },
                  calculatedMAWP: { type: "number" },
                },
                required: [],
                additionalProperties: false,
              },
            },
            inspectionChecklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  itemText: { type: "string" },
                  status: { type: "string" },
                },
                required: ["itemText", "status"],
                additionalProperties: false,
              },
            },
          },
          required: ["reportInfo", "clientInfo", "vesselData", "executiveSummary", "tmlReadings", "inspectionChecklist"],
          additionalProperties: false,
        },
      },
    },
  });

  const messageContent = llmResponse.choices[0].message.content;
  const contentText = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
  const extractedData = JSON.parse(contentText || "{}");
  console.log("[Manus Parser] Structured data extracted successfully");

  return extractedData;
}

/**
 * Simple text extraction fallback
 * Just returns the raw text without standardization
 */
export async function parseDocumentWithManus(
  fileBuffer: Buffer,
  filename: string
): Promise<{ result: { text: string; pages: any[] } }> {
  console.log("[Manus Parser] Simple text extraction...");
  
  const parseResult = await parseWithManusAPI(fileBuffer, filename);
  
  return {
    result: {
      text: parseResult.text,
      pages: parseResult.pages || [],
    },
  };
}

