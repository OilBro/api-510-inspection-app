import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getInspection, getTmlReadings } from "./db";
import { getComponentCalculations, getProfessionalReportByInspection } from "./professionalReportDb";

// ============================================================================
// Validation Router - Compare app calculations vs PDF original values
// ============================================================================

export const validationRouter = router({
  // Get comparison data for an inspection
  getValidationData: protectedProcedure
    .input(z.object({ inspectionId: z.string() }))
    .query(async ({ input }) => {
      console.log('[Validation] Getting validation data for inspection:', input.inspectionId);
      
      // Get inspection data
      const inspection = await getInspection(input.inspectionId);
      if (!inspection) {
        throw new Error('Inspection not found');
      }

      // Get professional report to get component calculations
      const professionalReport = await getProfessionalReportByInspection(input.inspectionId);
      if (!professionalReport) {
        throw new Error('Professional report not found for this inspection');
      }
      
      // Get component calculations (app-calculated values)
      const componentCalculations = await getComponentCalculations(professionalReport.id) as any[];
      
      // Get TML readings to calculate averages
      const tmlReadings = await getTmlReadings(input.inspectionId) as any[];

      // Note: PDF original values would need to be stored in a separate table
      // For now, we'll compare against component calculations
      // User can manually enter PDF values for comparison
      const pdfOriginalValues: Record<string, any> = {};

      // Build comparison data structure
      const components = ['Shell', 'East Head', 'West Head'];
      const comparisonData = components.map((componentName: string) => {
        const calc = componentCalculations.find((c: any) => 
          c.componentName?.toLowerCase().includes(componentName.toLowerCase())
        );

        const componentTMLs = tmlReadings.filter((tml: any) => 
          tml.componentType?.toLowerCase().includes(componentName.toLowerCase())
        );

        // Calculate actual thickness average from TML readings
        const actualThicknessAvg = componentTMLs.length > 0
          ? componentTMLs.reduce((sum: number, tml: any) => {
              const readings = [tml.tml1, tml.tml2, tml.tml3, tml.tml4].filter(v => v !== null);
              const avg = readings.length > 0 
                ? readings.reduce((a, b) => a! + b!, 0)! / readings.length 
                : tml.actualThickness || 0;
              return sum + avg;
            }, 0) / componentTMLs.length
          : 0;

        // Get PDF original values for this component
        const pdfValues = pdfOriginalValues?.[componentName] || {};

        // App calculated values
        const appValues = {
          componentName,
          actualThickness: calc?.actualThickness || actualThicknessAvg,
          minimumThickness: calc?.minimumThickness || 0,
          mawp: calc?.mawp || 0,
          corrosionRate: calc?.corrosionRate || 0,
          remainingLife: calc?.remainingLife || 0,
          nextInspectionDate: calc?.nextInspectionDate,
        };

        // Calculate discrepancies
        const discrepancies = {
          actualThickness: calculateDiscrepancy(appValues.actualThickness, pdfValues.actualThickness),
          minimumThickness: calculateDiscrepancy(appValues.minimumThickness, pdfValues.minimumThickness),
          mawp: calculateDiscrepancy(appValues.mawp, pdfValues.mawp),
          corrosionRate: calculateDiscrepancy(appValues.corrosionRate, pdfValues.corrosionRate),
          remainingLife: calculateDiscrepancy(appValues.remainingLife, pdfValues.remainingLife),
        };

        return {
          componentName,
          appValues,
          pdfValues,
          discrepancies,
          status: getOverallStatus(discrepancies),
        };
      });

      return {
        inspectionId: input.inspectionId,
        vesselTag: inspection.vesselTagNumber,
        inspectionDate: inspection.inspectionDate,
        comparisonData,
        hasPdfOriginalValues: !!pdfOriginalValues,
      };
    }),
});

// Helper function to calculate discrepancy percentage
function calculateDiscrepancy(appValue: number | null | undefined, pdfValue: number | null | undefined) {
  if (!appValue || !pdfValue) {
    return {
      absolute: 0,
      percentage: 0,
      status: 'unknown' as const,
    };
  }

  const absolute = Math.abs(appValue - pdfValue);
  const percentage = pdfValue !== 0 ? (absolute / Math.abs(pdfValue)) * 100 : 0;

  let status: 'match' | 'minor' | 'major' | 'unknown';
  if (percentage < 1) {
    status = 'match'; // Green: < 1% difference
  } else if (percentage < 5) {
    status = 'minor'; // Yellow: 1-5% difference
  } else {
    status = 'major'; // Red: > 5% difference
  }

  return {
    absolute,
    percentage,
    status,
    appValue,
    pdfValue,
  };
}

// Helper function to get overall component status
function getOverallStatus(discrepancies: Record<string, { status: string }>) {
  const statuses = Object.values(discrepancies).map(d => d.status);
  
  if (statuses.includes('major')) return 'major';
  if (statuses.includes('minor')) return 'minor';
  if (statuses.every(s => s === 'match')) return 'match';
  return 'unknown';
}
