import { ENV } from "./_core/env";

const DOCUPIPE_API_URL = "https://app.docupipe.ai";
const DOCUPIPE_API_KEY = process.env.DOCUPIPE_API_KEY;

interface DocupipeUploadResponse {
  documentId: string;
  jobId: string;
}

interface DocupipeJobStatus {
  status: "processing" | "completed" | "failed";
  documentId?: string;
}

interface DocupipeDocumentResult {
  documentId: string;
  status: string;
  result: {
    pages: Array<{
      sections: Array<{
        type: string;
        text: string;
        bbox?: number[];
        header?: string;
      }>;
      text: string;
      pageNum: number;
    }>;
    numPages: number;
    text: string;
    language?: string;
  };
}

interface DocupipeStandardizeResponse {
  standardizationId: string;
  jobId: string;
}

interface DocupipeStandardizationResult {
  standardizationId: string;
  status: "processing" | "completed" | "failed";
  result?: Record<string, any>;
}

/**
 * Upload a document to Docupipe for processing
 * @param fileBuffer - The file buffer (PDF, image, etc.)
 * @param filename - The filename
 * @returns Document ID and Job ID
 */
export async function uploadDocument(
  fileBuffer: Buffer,
  filename: string
): Promise<DocupipeUploadResponse> {
  if (!DOCUPIPE_API_KEY) {
    throw new Error("DOCUPIPE_API_KEY is not configured");
  }

  const base64Content = fileBuffer.toString("base64");

  const response = await fetch(`${DOCUPIPE_API_URL}/document`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-API-Key": DOCUPIPE_API_KEY,
    },
    body: JSON.stringify({
      document: {
        file: {
          contents: base64Content,
          filename: filename,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docupipe upload failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Check the status of a Docupipe job
 * @param jobId - The job ID returned from upload
 * @returns Job status
 */
export async function checkJobStatus(jobId: string): Promise<DocupipeJobStatus> {
  if (!DOCUPIPE_API_KEY) {
    throw new Error("DOCUPIPE_API_KEY is not configured");
  }

  const response = await fetch(`${DOCUPIPE_API_URL}/job/${jobId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-Key": DOCUPIPE_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docupipe job status check failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Wait for a job to complete with exponential backoff
 * @param jobId - The job ID to wait for
 * @param maxWaitSeconds - Maximum time to wait (default 120 seconds)
 * @returns Final job status
 */
export async function waitForJobCompletion(
  jobId: string,
  maxWaitSeconds: number = 120
): Promise<DocupipeJobStatus> {
  let waitSeconds = 2;
  let totalWaited = 0;
  let status: DocupipeJobStatus;

  do {
    status = await checkJobStatus(jobId);
    
    if (status.status === "completed" || status.status === "failed") {
      return status;
    }

    // Wait with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
    totalWaited += waitSeconds;
    waitSeconds = Math.min(waitSeconds * 2, 10); // Cap at 10 seconds

    if (totalWaited >= maxWaitSeconds) {
      throw new Error(`Job ${jobId} did not complete within ${maxWaitSeconds} seconds`);
    }
  } while (status.status === "processing");

  return status;
}

/**
 * Get the parsed document results
 * @param documentId - The document ID
 * @returns Parsed document with text and structure
 */
export async function getDocumentResult(
  documentId: string
): Promise<DocupipeDocumentResult> {
  if (!DOCUPIPE_API_KEY) {
    throw new Error("DOCUPIPE_API_KEY is not configured");
  }

  const response = await fetch(`${DOCUPIPE_API_URL}/document/${documentId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-Key": DOCUPIPE_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docupipe get document failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Standardize a document using a schema
 * @param documentId - The document ID
 * @param schemaId - The schema ID to use for standardization
 * @returns Standardization ID and Job ID
 */
export async function standardizeDocument(
  documentId: string,
  schemaId: string
): Promise<DocupipeStandardizeResponse> {
  if (!DOCUPIPE_API_KEY) {
    throw new Error("DOCUPIPE_API_KEY is not configured");
  }

  const response = await fetch(`${DOCUPIPE_API_URL}/v2/standardize/batch`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "X-API-Key": DOCUPIPE_API_KEY,
    },
    body: JSON.stringify({
      documentIds: [documentId],
      schemaId: schemaId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Docupipe standardization failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Get standardization results
 * @param standardizationId - The standardization ID
 * @returns Standardization result with structured JSON
 */
export async function getStandardizationResult(
  standardizationId: string
): Promise<DocupipeStandardizationResult> {
  if (!DOCUPIPE_API_KEY) {
    throw new Error("DOCUPIPE_API_KEY is not configured");
  }

  const response = await fetch(`${DOCUPIPE_API_URL}/standardization/${standardizationId}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "X-API-Key": DOCUPIPE_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Docupipe get standardization failed: ${response.status} - ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Complete workflow: Upload document, wait for processing, and get parsed results
 * @param fileBuffer - The file buffer
 * @param filename - The filename
 * @returns Parsed document result
 */
export async function parseDocument(
  fileBuffer: Buffer,
  filename: string
): Promise<DocupipeDocumentResult> {
  // Upload document
  const { documentId, jobId } = await uploadDocument(fileBuffer, filename);

  // Wait for processing to complete
  await waitForJobCompletion(jobId);

  // Get and return results
  return await getDocumentResult(documentId);
}

/**
 * Extract vessel inspection data from parsed Docupipe result
 * @param docResult - The parsed document result from Docupipe
 * @returns Extracted vessel data
 */
export function extractVesselDataFromDocupipe(docResult: DocupipeDocumentResult): any {
  const fullText = docResult.result.text;
  
  // Extract key information using pattern matching
  const extracted: any = {};

  // Extract vessel information
  const vesselMatch = fullText.match(/Vessel[:\s]+([^\n]+)/i);
  if (vesselMatch) extracted.vesselName = vesselMatch[1].trim();

  const tagMatch = fullText.match(/Tag[:\s]+([^\n]+)/i);
  if (tagMatch) extracted.tagNumber = tagMatch[1].trim();

  // Extract material
  const materialMatch = fullText.match(/Material[:\s]+([^\n]+)/i);
  if (materialMatch) extracted.material = materialMatch[1].trim();

  // Extract dimensions
  const diameterMatch = fullText.match(/(?:Diameter|D)[:\s]+([0-9.]+)/i);
  if (diameterMatch) extracted.diameter = parseFloat(diameterMatch[1]);

  const thicknessMatch = fullText.match(/(?:Thickness|t nom)[:\s]+([0-9.]+)/i);
  if (thicknessMatch) extracted.nominalThickness = parseFloat(thicknessMatch[1]);

  // Extract pressure
  const mawpMatch = fullText.match(/MAWP[:\s]+([0-9.]+)/i);
  if (mawpMatch) extracted.mawp = parseFloat(mawpMatch[1]);

  // Extract temperature
  const tempMatch = fullText.match(/(?:Temp|Temperature)[:\s]+([0-9.]+)/i);
  if (tempMatch) extracted.designTemperature = parseFloat(tempMatch[1]);

  // Extract stress value
  const stressMatch = fullText.match(/S[:\s]+([0-9]+)/i);
  if (stressMatch) extracted.allowableStress = parseInt(stressMatch[1]);

  // Extract efficiency
  const efficiencyMatch = fullText.match(/E[:\s]+([0-9.]+)/i);
  if (efficiencyMatch) extracted.jointEfficiency = parseFloat(efficiencyMatch[1]);

  // Extract corrosion rate
  const corrosionMatch = fullText.match(/(?:Corrosion Rate|Cr)[:\s]+([0-9.]+)/i);
  if (corrosionMatch) extracted.corrosionRate = parseFloat(corrosionMatch[1]);

  return extracted;
}

