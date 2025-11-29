import { invokeLLM } from './_core/llm';
import { writeFileSync, unlinkSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

/**
 * Vision-capable PDF parser that handles both text and scanned/image-based PDFs
 * Uses pdfjs-dist for PDF rendering (no system dependencies required)
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
  
  try {
    console.log('[Vision Parser] Starting PDF rendering with pdfjs-dist');
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = Math.min(pdfDocument.numPages, 10); // Process max 10 pages
    
    console.log(`[Vision Parser] PDF loaded with ${pdfDocument.numPages} pages, processing ${numPages}`);
    
    // Render each page to image
    const imageDataUrls: string[] = [];
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality
        
        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        // Render PDF page to canvas
        await page.render({
          canvasContext: context as any,
          viewport: viewport,
          canvas: canvas as any,
        }).promise;
        
        // Convert canvas to base64 data URL
        const dataUrl = canvas.toDataURL('image/png');
        imageDataUrls.push(dataUrl);
        
        console.log(`[Vision Parser] Rendered page ${pageNum}/${numPages}`);
      } catch (error: any) {
        console.error(`[Vision Parser] Failed to render page ${pageNum}:`, error.message);
      }
    }
    
    if (imageDataUrls.length === 0) {
      throw new Error('Failed to render any PDF pages to images');
    }
    
    console.log(`[Vision Parser] Successfully rendered ${imageDataUrls.length} pages`);
    
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
      "previousThickness": 0.689,
      "nominalThickness": 0.750,
      "minimumRequired": 0.500,
      "tActual": 0.652,
      "tml1": 0.652,
      "tml2": 0.648,
      "tml3": 0.655,
      "tml4": 0.650
    }
  ],
  "checklistItems": [
    {
      "category": "External Visual",
      "itemNumber": "1",
      "itemText": "Check item description",
      "description": "detailed description",
      "status": "Satisfactory"
    }
  ]
}

CRITICAL INSTRUCTIONS:
1. Extract PREVIOUS THICKNESS values from any tables, forms, or text
2. Look for thickness measurement tables with columns like "Previous", "Last Reading", "Prior Thickness", etc.
3. Extract ALL TML (Thickness Measurement Location) readings you can find
4. If a field is not present in the document, omit it from the JSON (do not use null or empty string)
5. Pay special attention to scanned tables and handwritten values
6. Return ONLY valid JSON, no additional text`;

    // Build message content with images
    const messageContent: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
      { type: 'text', text: extractionPrompt }
    ];
    
    // Add all page images
    for (const dataUrl of imageDataUrls) {
      messageContent.push({
        type: 'image_url',
        image_url: { url: dataUrl }
      });
    }
    
    console.log('[Vision Parser] Sending images to LLM for analysis...');
    
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
                  corrosionAllowance: { type: 'string' },
                },
                required: [],
                additionalProperties: false,
              },
              thicknessMeasurements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    cmlNumber: { type: 'string' },
                    tmlId: { type: 'string' },
                    location: { type: 'string' },
                    component: { type: 'string' },
                    componentType: { type: 'string' },
                    currentThickness: { type: ['string', 'number'] },
                    previousThickness: { type: ['string', 'number'] },
                    nominalThickness: { type: ['string', 'number'] },
                    minimumRequired: { type: 'number' },
                    tActual: { type: ['string', 'number'] },
                    tml1: { type: ['string', 'number'] },
                    tml2: { type: ['string', 'number'] },
                    tml3: { type: ['string', 'number'] },
                    tml4: { type: ['string', 'number'] },
                  },
                  required: [],
                  additionalProperties: false,
                },
              },
              checklistItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    category: { type: 'string' },
                    itemNumber: { type: 'string' },
                    itemText: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                  },
                  required: [],
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
    if (typeof content !== 'string') {
      throw new Error('Unexpected response format from LLM');
    }
    
    const parsedData: VisionParsedData = JSON.parse(content);
    
    console.log('[Vision Parser] Successfully extracted data from PDF');
    console.log('[Vision Parser] Vessel info:', parsedData.vesselInfo);
    console.log('[Vision Parser] TML readings:', parsedData.thicknessMeasurements?.length || 0);
    console.log('[Vision Parser] Checklist items:', parsedData.checklistItems?.length || 0);
    
    return parsedData;
    
  } catch (error: any) {
    console.error('[Vision Parser] Error:', error);
    throw new Error(`Failed to parse PDF file: ${error.message}`);
  } finally {
    // Cleanup temp directory
    try {
      const fs = await import('fs/promises');
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupError) {
      console.error('[Vision Parser] Cleanup error:', cleanupError);
    }
  }
}
