import axios from "axios";
import { ENV } from "./env";

/**
 * FreeConvert API client for image and PDF conversion
 * Documentation: https://www.freeconvert.com/api/v1/
 */
const freeconvert = axios.create({
  baseURL: "https://api.freeconvert.com/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${process.env.FREECONVERT_API_KEY}`,
  },
});

export interface ConvertToJpegOptions {
  /**
   * URL of the source file (image or PDF) to convert
   */
  sourceUrl: string;

  /**
   * Optional filename for the output
   */
  outputFilename?: string;

  /**
   * Background color for transparent images (default: white)
   */
  backgroundColor?: string;

  /**
   * Custom width for output image (optional)
   */
  width?: number;

  /**
   * Custom height for output image (optional)
   */
  height?: number;

  /**
   * JPEG quality (1-100, default: 85)
   */
  quality?: number;
}

export interface ConvertToJpegResult {
  /**
   * Job ID for tracking the conversion
   */
  jobId: string;

  /**
   * Status of the conversion job
   */
  status: string;

  /**
   * URL to download the converted JPEG file (available when status is 'completed')
   */
  downloadUrl?: string;

  /**
   * Error message if conversion failed
   */
  error?: string;
}

/**
 * Convert an image or PDF to JPEG format using FreeConvert API
 *
 * @param options - Conversion options
 * @returns Conversion result with job ID and download URL
 *
 * @example
 * ```typescript
 * const result = await convertToJpeg({
 *   sourceUrl: "https://example.com/document.pdf",
 *   outputFilename: "converted-document.jpg",
 *   backgroundColor: "#FFFFFF",
 *   quality: 90
 * });
 *
 * console.log("Download URL:", result.downloadUrl);
 * ```
 */
export async function convertToJpeg(
  options: ConvertToJpegOptions
): Promise<ConvertToJpegResult> {
  try {
    const {
      sourceUrl,
      outputFilename = "converted.jpg",
      backgroundColor = "#FFFFFF",
      width,
      height,
      quality = 85,
    } = options;

    // Create a job with import, convert, and export tasks
    const jobResponse = await freeconvert.post("/process/jobs", {
      tasks: {
        import: {
          operation: "import/url",
          url: sourceUrl,
        },
        convert: {
          operation: "convert",
          input: "import",
          output_format: "jpg",
          options: {
            background: backgroundColor,
            ...(width && { image_custom_width: width }),
            ...(height && { image_custom_height: height }),
            ...(quality && { image_quality: quality }),
          },
        },
        export: {
          operation: "export/url",
          input: "convert",
          filename: outputFilename,
        },
      },
    });

    const jobId = jobResponse.data.id;

    // Wait for job to complete (poll status)
    const result = await waitForJobCompletion(jobId);

    return result;
  } catch (error: any) {
    console.error("[FreeConvert] Conversion error:", error.response?.data || error.message);
    return {
      jobId: "",
      status: "failed",
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Poll job status until completion
 */
async function waitForJobCompletion(
  jobId: string,
  maxAttempts = 60,
  pollInterval = 2000
): Promise<ConvertToJpegResult> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusResponse = await freeconvert.get(`/process/jobs/${jobId}`);
      const job = statusResponse.data;

      if (job.status === "completed") {
        // Find the export task to get download URL
        const exportTask = Object.values(job.tasks).find(
          (task: any) => task.operation === "export/url"
        ) as any;

        return {
          jobId,
          status: "completed",
          downloadUrl: exportTask?.result?.url,
        };
      }

      if (job.status === "error" || job.status === "failed") {
        return {
          jobId,
          status: "failed",
          error: job.message || "Conversion failed",
        };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error: any) {
      console.error("[FreeConvert] Status check error:", error.message);
      return {
        jobId,
        status: "failed",
        error: error.message,
      };
    }
  }

  return {
    jobId,
    status: "timeout",
    error: "Conversion timed out",
  };
}

/**
 * Get job status
 */
export async function getJobStatus(jobId: string): Promise<ConvertToJpegResult> {
  try {
    const statusResponse = await freeconvert.get(`/process/jobs/${jobId}`);
    const job = statusResponse.data;

    const exportTask = Object.values(job.tasks).find(
      (task: any) => task.operation === "export/url"
    ) as any;

    return {
      jobId,
      status: job.status,
      downloadUrl: exportTask?.result?.url,
      error: job.message,
    };
  } catch (error: any) {
    return {
      jobId,
      status: "failed",
      error: error.message,
    };
  }
}

