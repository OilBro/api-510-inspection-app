/**
 * In-Lieu-Of Internal Inspection Assessment
 * Per API 510 Section 6.4
 */

export interface InLieuOfCriteria {
  // Service conditions
  cleanService: boolean; // Non-corrosive, non-fouling service
  noCorrosionHistory: boolean; // No history of internal corrosion
  
  // Inspection effectiveness
  effectiveExternalInspection: boolean; // Thorough external inspection performed
  thicknessMonitoring: boolean; // Ongoing thickness monitoring program
  
  // Process monitoring
  processMonitoring: boolean; // Process parameters monitored and controlled
  
  // Additional factors
  designMargin: number; // Percentage over minimum required thickness
  serviceYears: number; // Years in service
  lastInternalInspection?: Date; // Date of last internal inspection
}

export interface InLieuOfResult {
  qualified: boolean;
  maxInterval: number; // years
  nextInternalDue: Date | null;
  justification: string[];
  requirements: string[];
  warnings: string[];
}

/**
 * Assess qualification for In-Lieu-Of internal inspection
 * Per API 510 Section 6.4
 */
export function assessInLieuOfQualification(criteria: InLieuOfCriteria): InLieuOfResult {
  const justification: string[] = [];
  const requirements: string[] = [];
  const warnings: string[] = [];
  
  // Check mandatory criteria per API 510
  const mandatoryCriteria = [
    { met: criteria.cleanService, name: "Clean, non-corrosive service" },
    { met: criteria.noCorrosionHistory, name: "No history of internal corrosion" },
    { met: criteria.effectiveExternalInspection, name: "Effective external inspection program" },
    { met: criteria.thicknessMonitoring, name: "Ongoing thickness monitoring" },
    { met: criteria.processMonitoring, name: "Process parameter monitoring" },
  ];

  const unmetCriteria = mandatoryCriteria.filter(c => !c.met);
  
  if (unmetCriteria.length > 0) {
    return {
      qualified: false,
      maxInterval: 0,
      nextInternalDue: null,
      justification: [],
      requirements: unmetCriteria.map(c => `REQUIRED: ${c.name}`),
      warnings: ["Vessel does not qualify for In-Lieu-Of internal inspection"],
    };
  }

  // All mandatory criteria met
  justification.push("Vessel operates in clean, non-corrosive service");
  justification.push("No history of internal corrosion documented");
  justification.push("Effective external inspection program in place");
  justification.push("Ongoing thickness monitoring program active");
  justification.push("Process parameters monitored and controlled");

  // Determine maximum interval based on API 510 Table 6.1
  let maxInterval = 10; // Default maximum per API 510

  // Adjust based on design margin
  if (criteria.designMargin >= 50) {
    maxInterval = 15; // Can extend to 15 years with significant margin
    justification.push("Design margin >50% allows extended interval");
  } else if (criteria.designMargin >= 25) {
    maxInterval = 12;
    justification.push("Design margin >25% supports 12-year interval");
  } else if (criteria.designMargin < 10) {
    maxInterval = 8;
    warnings.push("Low design margin (<10%) limits interval to 8 years");
  }

  // Service history consideration
  if (criteria.serviceYears > 20) {
    justification.push(`Vessel has ${criteria.serviceYears} years of successful service history`);
  } else if (criteria.serviceYears < 5) {
    warnings.push("Limited service history - recommend conservative interval");
    maxInterval = Math.min(maxInterval, 10);
  }

  // Calculate next internal inspection due date
  const lastInternal = criteria.lastInternalInspection || new Date();
  const nextInternalDue = new Date(lastInternal);
  nextInternalDue.setFullYear(nextInternalDue.getFullYear() + maxInterval);

  // Add ongoing requirements
  requirements.push("Maintain effective external inspection program");
  requirements.push("Continue thickness monitoring at critical locations");
  requirements.push("Monitor process parameters continuously");
  requirements.push("Document any process upsets or excursions");
  requirements.push("Review qualification annually");

  return {
    qualified: true,
    maxInterval,
    nextInternalDue,
    justification,
    requirements,
    warnings,
  };
}

/**
 * Generate monitoring plan for In-Lieu-Of program
 */
export function generateMonitoringPlan(criteria: InLieuOfCriteria): string {
  const plan: string[] = [];

  plan.push("IN-LIEU-OF INTERNAL INSPECTION MONITORING PLAN");
  plan.push("Per API 510 Section 6.4\n");

  plan.push("1. EXTERNAL INSPECTION REQUIREMENTS:");
  plan.push("   - Conduct thorough external visual inspection annually");
  plan.push("   - Document condition of insulation, coatings, and supports");
  plan.push("   - Inspect for signs of leakage, corrosion, or damage");
  plan.push("   - Photograph areas of concern\n");

  plan.push("2. THICKNESS MONITORING:");
  plan.push("   - Establish baseline thickness measurements at critical locations");
  plan.push("   - Re-measure thickness at established grid points every 2-3 years");
  plan.push("   - Monitor corrosion rates and trending");
  plan.push("   - Alert if thickness approaches minimum required\n");

  plan.push("3. PROCESS MONITORING:");
  plan.push("   - Monitor and record process temperature, pressure, and composition");
  plan.push("   - Document any process upsets or excursions");
  plan.push("   - Maintain process within design limits");
  plan.push("   - Review process data quarterly\n");

  plan.push("4. DOCUMENTATION:");
  plan.push("   - Maintain inspection records and thickness data");
  plan.push("   - Document qualification review annually");
  plan.push("   - Update risk assessment if conditions change");
  plan.push("   - Notify inspector of any concerns\n");

  plan.push("5. DISQUALIFICATION TRIGGERS:");
  plan.push("   - Change in service (introduction of corrosive materials)");
  plan.push("   - Evidence of internal corrosion from thickness monitoring");
  plan.push("   - Process upset causing temperature/pressure excursion");
  plan.push("   - Thickness approaching minimum required");

  return plan.join("\n");
}

