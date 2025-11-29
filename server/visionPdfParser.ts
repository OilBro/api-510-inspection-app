import { fromPath } from 'pdf2pic';
import { invokeLLM } from './_core/llm';
import { writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Vision-capable PDF parser that handles both text and scanned/image-based PDFs
 * Converts PDF pages to images and uses GPT-4 Vision to extract data
 */

interface VisionParsedData {
  vesselInfo?: {
    vesselTag?: string;
    vesselDescription?: string;
    manufacturer?: string;
    serialNumber?: string;
    yearBuilt?: string;
    designPressure?: string;
    designTemperature?: string;
    corrosionAllowance?: string;
  };
  thicknessMeasurements?: Array<{
    cmlNumber?: string;
    tmlId?: string;
    location?: string;
    component?: string;
    componentType?: string;
    currentThickness?: string | number;
    previousThickness?: string | number;
    nominalThickness?: string | number;
    minimumRequired?: number;
    tActual?: string | number;
    tml1?: string | number;
    tml2?: string | number;
    tml3?: string | number;
    tml4?: string | number;
  }>;
  checklistItems?: Array<{
    category?: string;
    itemNumber?: string;
    itemText?: string;
    description?: string;
    status?: string;
  }>;
  photos?: Array<{
    description?: string;
    location?: string;
    url?: string;
  }>;
}

/**
 * Parse a PDF using vision LLM to extract inspection data
 * Handles scanned PDFs and images within PDFs
 */
export async function parseWithVision(pdfBuffer: Buffer): Promise<VisionParsedData> {
  const tempDir = join(tmpdir(), `pdf-vision-${Date.now()}`);
  mkdirSync(tempDir, { recursive: true });
  
  const pdfPath = join(tempDir, 'input.pdf');
  writeFileSync(pdfPath, pdfBuffer);
  
  try {
    // Convert PDF pages to images
    const converter = fromPath(pdfPath, {
      density: 200, // DPI for image quality
      saveFilename: 'page',
      savePath: tempDir,
      format: 'png',
      width: 2000,
      height: 2000,
    });
    
    // Convert first 10 pages (adjust as needed)
    const maxPages = 10;
    const imagePromises: Promise<{ page: number; path: string }>[] = [];
    
    for (let i = 1; i <= maxPages; i++) {
      imagePromises.push(
        converter(i, { responseType: 'image' })
          .then((result: any) => ({
            page: result.page,
            path: result.path,
          }))
          .catch(() => null as any)
      );
    }
    
    const images = (await Promise.all(imagePromises)).filter(Boolean);
    
    if (images.length === 0) {
      throw new Error('Failed to convert PDF pages to images');
    }
    
    console.log(`[Vision Parser] Converted ${images.length} pages to images`);
    
    // Prepare vision LLM prompt
    const extractionPrompt = `You are an expert at extracting data from API 510 pressure vessel inspection reports.

Analyze these inspection report pages and extract ALL available data in the following JSON structure:

{
  "vesselInfo": {
    "vesselTag": "vessel tag number or ID",
    "vesselDescription": "vessel description",
    "manufacturer": "manufacturer name",
    "serialNumber": "serial number",
    "yearBuilt": "year built",
    "designPressure": "design pressure in psi",
    "designTemperature": "design temperature in °F",
    "corrosionAllowance": "corrosion allowance in inches"
  },
  "thicknessMeasurements": [
    {
      "cmlNumber": "CML number or location ID",
      "location": "measurement location description",
      "component": "component name (e.g., Shell, Head, Nozzle)",
      "componentType": "component type",
      "currentThickness": 0.652,
      "previousThickness": 0.750,
      "nominalThickness": 0.875,
      "tml1": 0.652,
      "tml2": 0.655,
      "tml3": 0.648,
      "tml4": 0.650
    }
  ],
  "checklistItems": [
    {
      "category": "Visual Inspection",
      "itemNumber": "1",
      "itemText": "Check for corrosion",
      "status": "Pass"
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Extract ALL thickness measurements from tables, even if they're in scanned images
2. Pay special attention to "Previous Thickness" or "Prior Thickness" columns
3. Include all TML readings (tml1, tml2, tml3, tml4) if available
4. Convert all thickness values to numbers (inches)
5. If a table has multiple rows, create a separate entry for each row
6. Return ONLY valid JSON, no markdown formatting

Extract as much data as possible from the images.`;
    
    // Build message content with all page images
    const messageContent: any[] = [
      { type: 'text', text: extractionPrompt }
    ];
    
    // Add up to 5 pages to avoid token limits
    const pagesToAnalyze = images.slice(0, 5);
    for (const img of pagesToAnalyze) {
      // Read image as base64
      const fs = await import('fs/promises');
      const imageBuffer = await fs.readFile(img.path);
      const base64Image = imageBuffer.toString('base64');
      
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64Image}`,
          detail: 'high'
        }
      });
    }
    
    console.log(`[Vision Parser] Sending ${pagesToAnalyze.length} pages to vision LLM`);
    
    // Call vision LLM
    const response = await invokeLLM({
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'inspection_data',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              vesselInfo: {
                type: 'object',
                properties: {
                  vesselTag: { type: 'string' },
                  vesselDescription: { type: 'string' },
                  manufacturer: { type: 'string' },
                  serialNumber: { type: 'string' },
                  yearBuilt: { type: 'string' },
                  designPressure: { type: 'string' },
                  designTemperature: { type: 'string' },
                  corrosionAllowance: { type: 'string' }
                },
                required: [],
                additionalProperties: false
              },
              thicknessMeasurements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    cmlNumber: { type: 'string' },
                    location: { type: 'string' },
                    component: { type: 'string' },
                    componentType: { type: 'string' },
                    currentThickness: { type: 'number' },
                    previousThickness: { type: 'number' },
                    nominalThickness: { type: 'number' },
                    tml1: { type: 'number' },
                    tml2: { type: 'number' },
                    tml3: { type: 'number' },
                    tml4: { type: 'number' }
                  },
                  required: [],
                  additionalProperties: false
                }
              },
              checklistItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    itemNumber: { type: 'string' },
                    itemText: { type: 'string' },
                    status: { type: 'string' }
                  },
                  required: [],
                  additionalProperties: false
                }
              }
            },
            required: [],
            additionalProperties: false
          }
        }
      }
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from vision LLM');
    }
    
    const parsedData: VisionParsedData = JSON.parse(content);
    console.log(`[Vision Parser] Extracted ${parsedData.thicknessMeasurements?.length || 0} thickness measurements`);
    
    return parsedData;
    
  } finally {
    // Cleanup temp files
    try {
      const fs = await import('fs/promises');
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (err) {
      console.error('[Vision Parser] Failed to cleanup temp files:', err);
    }
  }
}
