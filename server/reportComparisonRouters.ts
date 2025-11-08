import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import { 
  inspections, 
  professionalReports, 
  thicknessReadings,
  inspectionFindings,
  componentCalculations 
} from "../drizzle/schema";

export const reportComparisonRouter = router({
  /**
   * Compare multiple inspection reports
   */
  compare: publicProcedure
    .input(
      z.object({
        inspectionIds: z.array(z.string()).min(2).max(5), // Compare 2-5 reports
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { inspectionIds } = input;

      // Fetch all inspections with their professional reports
      const inspectionData = await db
        .select()
        .from(inspections)
        .where(inArray(inspections.id, inspectionIds))
        .orderBy(inspections.inspectionDate);

      // Fetch professional reports for these inspections
      const reportData = await db
        .select()
        .from(professionalReports)
        .where(inArray(professionalReports.inspectionId, inspectionIds));

      // Create inspection to report ID mapping
      const inspectionToReportMap = new Map(
        reportData.map((r) => [r.inspectionId, r.id])
      );

      const reportIds = reportData.map((r) => r.id);

      // Fetch thickness readings for all reports
      const allThicknessReadings = await db
        .select()
        .from(thicknessReadings)
        .where(inArray(thicknessReadings.inspectionId, inspectionIds));

      // Fetch findings for all reports
      const allFindings = await db
        .select()
        .from(inspectionFindings)
        .where(inArray(inspectionFindings.reportId, reportIds));

      // Fetch component calculations for all reports
      const allCalculations = await db
        .select()
        .from(componentCalculations)
        .where(inArray(componentCalculations.reportId, reportIds));

      // Group data by inspection
      const comparisonData = inspectionData.map((inspection) => {
        const reportId = inspectionToReportMap.get(inspection.id);
        return {
          inspection,
          reportId,
          thicknessReadings: allThicknessReadings.filter(
            (tr) => tr.inspectionId === inspection.id
          ),
          findings: allFindings.filter((f) => f.reportId === reportId),
          calculations: allCalculations.filter((c) => c.reportId === reportId),
        };
      });

      // Calculate thickness trends
      const thicknessTrends = calculateThicknessTrends(comparisonData);

      // Identify new and resolved findings
      const findingsComparison = compareFindingsAcrossReports(comparisonData);

      // Calculate degradation rates
      const degradationRates = calculateDegradationRates(comparisonData);

      return {
        inspections: comparisonData,
        thicknessTrends,
        findingsComparison,
        degradationRates,
      };
    }),

  /**
   * Get available inspections for a vessel for comparison
   */
  getAvailableInspections: publicProcedure
    .input(
      z.object({
        vesselId: z.string().optional(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(inspections);

      if (input.vesselId) {
        query = query.where(eq(inspections.id, input.vesselId)) as any;
      }

      const results = await query
        .orderBy(inspections.inspectionDate)
        .limit(input.limit);

      return results;
    }),
});

/**
 * Calculate thickness trends across multiple inspections
 */
function calculateThicknessTrends(comparisonData: any[]) {
  const locationMap = new Map<string, any[]>();

  // Group thickness readings by location across all inspections
  comparisonData.forEach((data, index) => {
    data.thicknessReadings.forEach((reading: any) => {
      const key = `${reading.component}-${reading.location}`;
      if (!locationMap.has(key)) {
        locationMap.set(key, []);
      }
      locationMap.get(key)!.push({
        inspectionDate: data.inspection.inspectionDate,
        thickness: parseFloat(reading.thickness || "0"),
        inspectionIndex: index,
        component: reading.component,
        location: reading.location,
      });
    });
  });

  // Calculate trends for each location
  const trends: any[] = [];
  locationMap.forEach((readings, key) => {
    if (readings.length < 2) return; // Need at least 2 points for trend

    // Sort by inspection date
    readings.sort(
      (a: any, b: any) =>
        new Date(a.inspectionDate).getTime() -
        new Date(b.inspectionDate).getTime()
    );

    // Calculate corrosion rate (thickness loss per year)
    const firstReading = readings[0];
    const lastReading = readings[readings.length - 1];
    const thicknessLoss = firstReading.thickness - lastReading.thickness;
    const timeDiffYears =
      (new Date(lastReading.inspectionDate).getTime() -
        new Date(firstReading.inspectionDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);

    const corrosionRate = timeDiffYears > 0 ? thicknessLoss / timeDiffYears : 0;

    // Determine trend status
    let status = "stable";
    if (corrosionRate > 0.010) status = "critical"; // >10 mils/year
    else if (corrosionRate > 0.005) status = "warning"; // >5 mils/year
    else if (corrosionRate > 0.002) status = "caution"; // >2 mils/year

    trends.push({
      component: firstReading.component,
      location: firstReading.location,
      readings,
      corrosionRate: corrosionRate.toFixed(4),
      thicknessLoss: thicknessLoss.toFixed(3),
      timePeriodYears: timeDiffYears.toFixed(1),
      status,
    });
  });

  return trends.sort((a, b) => parseFloat(b.corrosionRate) - parseFloat(a.corrosionRate));
}

/**
 * Compare findings across reports to identify new and resolved issues
 */
function compareFindingsAcrossReports(comparisonData: any[]) {
  const allFindings = comparisonData.flatMap((data, index) =>
    data.findings.map((f: any) => ({
      ...f,
      inspectionIndex: index,
      inspectionDate: data.inspection.inspectionDate,
    }))
  );

  // Group findings by description similarity (simple approach)
  const findingGroups = new Map<string, any[]>();
  allFindings.forEach((finding) => {
    const key = finding.description?.substring(0, 50) || finding.findingType;
    if (!findingGroups.has(key)) {
      findingGroups.set(key, []);
    }
    findingGroups.get(key)!.push(finding);
  });

  const newFindings: any[] = [];
  const resolvedFindings: any[] = [];
  const recurringFindings: any[] = [];

  findingGroups.forEach((group) => {
    if (group.length === 1) {
      // Finding appears in only one report
      if (group[0].inspectionIndex === comparisonData.length - 1) {
        newFindings.push(group[0]); // Appears in latest report only
      } else {
        resolvedFindings.push(group[0]); // Appeared in earlier report, not in latest
      }
    } else {
      // Finding appears in multiple reports
      recurringFindings.push({
        finding: group[group.length - 1], // Latest occurrence
        occurrences: group.length,
        firstSeen: group[0].inspectionDate,
        lastSeen: group[group.length - 1].inspectionDate,
      });
    }
  });

  return {
    new: newFindings,
    resolved: resolvedFindings,
    recurring: recurringFindings,
  };
}

/**
 * Calculate component degradation rates
 */
function calculateDegradationRates(comparisonData: any[]) {
  const degradationData: any[] = [];

  comparisonData.forEach((data, index) => {
    if (index === 0) return; // Skip first inspection (no baseline)

    const previousData = comparisonData[index - 1];
    const timeDiffYears =
      (new Date(data.inspection.inspectionDate).getTime() -
        new Date(previousData.inspection.inspectionDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);

    data.calculations.forEach((calc: any) => {
      const previousCalc = previousData.calculations.find(
        (pc: any) =>
          pc.componentType === calc.componentType &&
          pc.componentId === calc.componentId
      );

      if (previousCalc && calc.remainingLife && previousCalc.remainingLife) {
        const remainingLifeChange =
          parseFloat(previousCalc.remainingLife) -
          parseFloat(calc.remainingLife);
        const expectedChange = timeDiffYears;
        const accelerationFactor =
          expectedChange > 0 ? remainingLifeChange / expectedChange : 1;

        degradationData.push({
          component: `${calc.componentType} ${calc.componentId || ""}`,
          previousRemainingLife: parseFloat(previousCalc.remainingLife),
          currentRemainingLife: parseFloat(calc.remainingLife),
          timePeriodYears: timeDiffYears.toFixed(1),
          accelerationFactor: accelerationFactor.toFixed(2),
          status:
            accelerationFactor > 1.5
              ? "accelerating"
              : accelerationFactor > 0.8
              ? "normal"
              : "improving",
        });
      }
    });
  });

  return degradationData;
}

