import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  inspections, 
  tmlReadings, 
  inspectionFindings, 
  recommendations,
  componentCalculations 
} from "../../drizzle/schema";
import { eq, inArray, and, desc } from "drizzle-orm";

export const reportComparisonRouter = router({
  /**
   * Get available inspections for comparison
   */
  getAvailableInspections: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select()
        .from(inspections)
        .where(eq(inspections.userId, ctx.user.id))
        .orderBy(desc(inspections.inspectionDate))
        .limit(input.limit);

      return results;
    }),

  /**
   * Compare multiple inspection reports
   */
  compare: protectedProcedure
    .input(
      z.object({
        inspectionIds: z.array(z.string()).min(2).max(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user owns all inspections
      const inspectionRecords = await db
        .select()
        .from(inspections)
        .where(
          and(
            inArray(inspections.id, input.inspectionIds),
            eq(inspections.userId, ctx.user.id)
          )
        );

      if (inspectionRecords.length !== input.inspectionIds.length) {
        throw new Error("Some inspections not found or access denied");
      }

      // Sort inspections by date
      inspectionRecords.sort((a, b) => {
        const dateA = new Date(a.inspectionDate || a.createdAt).getTime();
        const dateB = new Date(b.inspectionDate || b.createdAt).getTime();
        return dateA - dateB;
      });

      // Get TML readings for all inspections
      const tmlData = await db
        .select()
        .from(tmlReadings)
        .where(inArray(tmlReadings.inspectionId, input.inspectionIds));

      // Calculate thickness trends
      const thicknessTrends = calculateThicknessTrends(tmlData, inspectionRecords);

      // Get findings for all inspections
      const findingsData = await db
        .select()
        .from(inspectionFindings)
        .where(
          inArray(
            inspectionFindings.reportId,
            inspectionRecords.map((i) => i.id)
          )
        );

      // Compare findings
      const findingsComparison = compareFindingsAcrossReports(
        findingsData,
        inspectionRecords
      );

      // Get component calculations for degradation analysis
      const componentsData = await db
        .select()
        .from(componentCalculations)
        .where(
          inArray(
            componentCalculations.reportId,
            inspectionRecords.map((i) => i.id)
          )
        );

      // Calculate degradation rates
      const degradationRates = calculateDegradationRates(
        componentsData,
        inspectionRecords
      );

      return {
        inspections: inspectionRecords,
        thicknessTrends,
        findingsComparison,
        degradationRates,
      };
    }),
});

/**
 * Calculate thickness trends across multiple inspections
 */
function calculateThicknessTrends(tmlData: any[], inspectionRecords: any[]) {
  const trends: any[] = [];

  // Group TML readings by component/location
  const groupedByComponent = new Map<string, any[]>();

  tmlData.forEach((reading) => {
    const key = `${reading.component}-${reading.tmlId}`;
    if (!groupedByComponent.has(key)) {
      groupedByComponent.set(key, []);
    }
    groupedByComponent.get(key)!.push(reading);
  });

  // Calculate trends for each component
  groupedByComponent.forEach((readings, key) => {
    if (readings.length < 2) return;

    // Sort by inspection date
    readings.sort((a, b) => {
      const dateA = new Date(a.currentInspectionDate || a.createdAt).getTime();
      const dateB = new Date(b.currentInspectionDate || b.createdAt).getTime();
      return dateA - dateB;
    });

    const firstReading = readings[0];
    const lastReading = readings[readings.length - 1];

    const firstThickness = parseFloat(firstReading.currentThickness || "0");
    const lastThickness = parseFloat(lastReading.currentThickness || "0");
    const thicknessLoss = firstThickness - lastThickness;

    const firstDate = new Date(
      firstReading.currentInspectionDate || firstReading.createdAt
    );
    const lastDate = new Date(
      lastReading.currentInspectionDate || lastReading.createdAt
    );
    const timePeriodYears =
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    const corrosionRate =
      timePeriodYears > 0 ? thicknessLoss / timePeriodYears : 0;

    // Determine status based on corrosion rate
    let status = "stable";
    if (corrosionRate > 0.01) {
      status = "critical";
    } else if (corrosionRate > 0.005) {
      status = "warning";
    } else if (corrosionRate > 0.002) {
      status = "caution";
    }

    trends.push({
      component: firstReading.component,
      location: firstReading.tmlId,
      corrosionRate: corrosionRate.toFixed(4),
      thicknessLoss: thicknessLoss.toFixed(4),
      timePeriodYears: timePeriodYears.toFixed(1),
      status,
      readings: readings.length,
    });
  });

  // Sort by corrosion rate (highest first)
  trends.sort((a, b) => parseFloat(b.corrosionRate) - parseFloat(a.corrosionRate));

  return trends;
}

/**
 * Compare findings across multiple reports
 */
function compareFindingsAcrossReports(findingsData: any[], inspectionRecords: any[]) {
  const latestInspection = inspectionRecords[inspectionRecords.length - 1];
  const previousInspections = inspectionRecords.slice(0, -1);

  const latestFindings = findingsData.filter(
    (f) => f.reportId === latestInspection.id
  );
  const previousFindings = findingsData.filter((f) =>
    previousInspections.some((i) => i.id === f.reportId)
  );

  // Identify new findings (in latest but not in previous)
  const newFindings = latestFindings.filter(
    (lf) =>
      !previousFindings.some(
        (pf) =>
          pf.section === lf.section &&
          pf.findingType === lf.findingType &&
          similarDescription(pf.description, lf.description)
      )
  );

  // Identify resolved findings (in previous but not in latest)
  const resolvedFindings = previousFindings.filter(
    (pf) =>
      !latestFindings.some(
        (lf) =>
          lf.section === pf.section &&
          lf.findingType === pf.findingType &&
          similarDescription(lf.description, pf.description)
      )
  );

  // Identify recurring findings (appear in multiple inspections)
  const recurringFindings: any[] = [];
  const findingOccurrences = new Map<string, { finding: any; occurrences: number }>();

  findingsData.forEach((finding) => {
    const key = `${finding.section}-${finding.findingType}-${finding.description.substring(0, 50)}`;
    if (!findingOccurrences.has(key)) {
      findingOccurrences.set(key, { finding, occurrences: 0 });
    }
    findingOccurrences.get(key)!.occurrences++;
  });

  findingOccurrences.forEach((value) => {
    if (value.occurrences >= 2) {
      recurringFindings.push(value);
    }
  });

  return {
    new: newFindings,
    resolved: resolvedFindings,
    recurring: recurringFindings,
  };
}

/**
 * Calculate degradation rates for components
 */
function calculateDegradationRates(componentsData: any[], inspectionRecords: any[]) {
  const rates: any[] = [];

  // Group components by name
  const groupedByComponent = new Map<string, any[]>();

  componentsData.forEach((comp) => {
    const key = comp.componentName;
    if (!groupedByComponent.has(key)) {
      groupedByComponent.set(key, []);
    }
    groupedByComponent.get(key)!.push(comp);
  });

  // Calculate degradation for each component
  groupedByComponent.forEach((components, componentName) => {
    if (components.length < 2) return;

    // Sort by report date
    components.sort((a, b) => {
      const inspA = inspectionRecords.find((i) => i.id === a.reportId);
      const inspB = inspectionRecords.find((i) => i.id === b.reportId);
      const dateA = new Date(inspA?.inspectionDate || inspA?.createdAt || 0).getTime();
      const dateB = new Date(inspB?.inspectionDate || inspB?.createdAt || 0).getTime();
      return dateA - dateB;
    });

    const firstComp = components[0];
    const lastComp = components[components.length - 1];

    const firstInsp = inspectionRecords.find((i) => i.id === firstComp.reportId);
    const lastInsp = inspectionRecords.find((i) => i.id === lastComp.reportId);

    if (!firstInsp || !lastInsp) return;

    const firstDate = new Date(firstInsp.inspectionDate || firstInsp.createdAt);
    const lastDate = new Date(lastInsp.inspectionDate || lastInsp.createdAt);
    const timePeriodYears =
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (timePeriodYears <= 0) return;

    const previousRemainingLife = parseFloat(firstComp.remainingLife || "0");
    const currentRemainingLife = parseFloat(lastComp.remainingLife || "0");

    const expectedRemainingLife = previousRemainingLife - timePeriodYears;
    const accelerationFactor =
      expectedRemainingLife > 0
        ? (previousRemainingLife - currentRemainingLife) / timePeriodYears
        : 1;

    let status = "normal";
    if (accelerationFactor > 1.5) {
      status = "accelerating";
    } else if (accelerationFactor < 0.8) {
      status = "improving";
    }

    rates.push({
      component: componentName,
      previousRemainingLife,
      currentRemainingLife,
      timePeriodYears: timePeriodYears.toFixed(1),
      accelerationFactor: accelerationFactor.toFixed(2),
      status,
    });
  });

  return rates;
}

/**
 * Check if two descriptions are similar (simple string matching)
 */
function similarDescription(desc1: string, desc2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const n1 = normalize(desc1);
  const n2 = normalize(desc2);

  // Check if one contains the other or they share significant overlap
  return n1.includes(n2.substring(0, 30)) || n2.includes(n1.substring(0, 30));
}

