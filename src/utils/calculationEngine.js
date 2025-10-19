// API 510 Calculation Engine
// Comprehensive calculation system for pressure vessel inspections

export class API510Calculator {
  constructor() {
    this.vesselData = {};
    this.materialProperties = this.initializeMaterialDatabase();
    this.calculations = {};
  }

  // Initialize material database with temperature-dependent properties
  initializeMaterialDatabase() {
    return {
      'SA-516-70': {
        temperatures: {
          650: { allowableStress: 20000, description: 'SA-516-70 @ 650°F' },
          700: { allowableStress: 17500, description: 'SA-516-70 @ 700°F' },
          750: { allowableStress: 15000, description: 'SA-516-70 @ 750°F' }
        }
      },
      'SA-515-70': {
        temperatures: {
          650: { allowableStress: 20000, description: 'SA-515-70 @ 650°F' },
          700: { allowableStress: 17500, description: 'SA-515-70 @ 700°F' },
          750: { allowableStress: 15000, description: 'SA-515-70 @ 750°F' }
        }
      },
      'SA-387-22': {
        temperatures: {
          850: { allowableStress: 18750, description: 'SA-387-22 @ 850°F' },
          900: { allowableStress: 16250, description: 'SA-387-22 @ 900°F' },
          950: { allowableStress: 14000, description: 'SA-387-22 @ 950°F' }
        }
      },
      'SA-240-304': {
        temperatures: {
          800: { allowableStress: 15700, description: 'SA-240-304 @ 800°F' },
          850: { allowableStress: 14200, description: 'SA-240-304 @ 850°F' },
          900: { allowableStress: 12800, description: 'SA-240-304 @ 900°F' }
        }
      }
    };
  }

  // Set vessel data
  setVesselData(data) {
    this.vesselData = { ...this.vesselData, ...data };
    this.recalculateAll();
  }

  // Get allowable stress for material at temperature
  getAllowableStress(material, temperature) {
    const materialData = this.materialProperties[material];
    if (!materialData) return null;

    // Find closest temperature
    const temps = Object.keys(materialData.temperatures).map(Number).sort((a, b) => a - b);
    let closestTemp = temps[0];
    
    for (const temp of temps) {
      if (Math.abs(temp - temperature) < Math.abs(closestTemp - temperature)) {
        closestTemp = temp;
      }
    }

    return materialData.temperatures[closestTemp];
  }

  // Calculate minimum required thickness per ASME Section VIII
  calculateMinimumThickness(pressure, radius, allowableStress, jointEfficiency, corrosionAllowance = 0) {
    if (!pressure || !radius || !allowableStress || !jointEfficiency) {
      return null;
    }

    // t = PR/(SE-0.6P) + CA
    const numerator = pressure * radius;
    const denominator = (allowableStress * jointEfficiency) - (0.6 * pressure);
    
    if (denominator <= 0) {
      return { error: 'Invalid parameters - denominator is zero or negative' };
    }

    const requiredThickness = (numerator / denominator) + corrosionAllowance;
    
    return {
      thickness: requiredThickness,
      formula: 't = PR/(SE-0.6P) + CA',
      calculation: `t = (${pressure} × ${radius})/((${allowableStress} × ${jointEfficiency}) - (0.6 × ${pressure})) + ${corrosionAllowance}`,
      result: `t = ${requiredThickness.toFixed(4)} inches`
    };
  }

  // Calculate Maximum Allowable Working Pressure (MAWP)
  calculateMAWP(thickness, radius, allowableStress, jointEfficiency, corrosionAllowance = 0) {
    if (!thickness || !radius || !allowableStress || !jointEfficiency) {
      return null;
    }

    const effectiveThickness = thickness - corrosionAllowance;
    if (effectiveThickness <= 0) {
      return { error: 'Effective thickness is zero or negative' };
    }

    // MAWP = SE(t-CA)/(R+0.6(t-CA))
    const numerator = allowableStress * jointEfficiency * effectiveThickness;
    const denominator = radius + (0.6 * effectiveThickness);
    
    const mawp = numerator / denominator;
    
    return {
      pressure: mawp,
      formula: 'MAWP = SE(t-CA)/(R+0.6(t-CA))',
      calculation: `MAWP = (${allowableStress} × ${jointEfficiency} × ${effectiveThickness})/(${radius} + (0.6 × ${effectiveThickness}))`,
      result: `MAWP = ${mawp.toFixed(1)} psig`
    };
  }

  // Calculate remaining life
  calculateRemainingLife(currentThickness, requiredThickness, corrosionRate, safetyFactor = 1.0) {
    if (!currentThickness || !requiredThickness || !corrosionRate) {
      return null;
    }

    const excessThickness = currentThickness - requiredThickness;
    if (excessThickness <= 0) {
      return { 
        life: 0, 
        status: 'CRITICAL - Below minimum thickness',
        recommendation: 'Immediate action required'
      };
    }

    const remainingLife = (excessThickness / (corrosionRate / 1000)) / safetyFactor;
    
    let status = 'GOOD';
    let recommendation = 'Continue normal operation';
    
    if (remainingLife < 2) {
      status = 'CRITICAL';
      recommendation = 'Plan immediate replacement or repair';
    } else if (remainingLife < 5) {
      status = 'POOR';
      recommendation = 'Plan replacement within 2-3 years';
    } else if (remainingLife < 10) {
      status = 'FAIR';
      recommendation = 'Monitor closely, plan future replacement';
    }

    return {
      life: remainingLife,
      status: status,
      recommendation: recommendation,
      calculation: `Life = (${currentThickness} - ${requiredThickness}) / (${corrosionRate}/1000) / ${safetyFactor}`,
      result: `${remainingLife.toFixed(1)} years`
    };
  }

  // Calculate inspection interval per API 510
  calculateInspectionInterval(remainingLife, riskFactor = 0.5, maxInterval = 10) {
    if (!remainingLife) return null;

    const calculatedInterval = Math.min(remainingLife * riskFactor, maxInterval);
    
    let recommendation = 'Standard interval';
    if (calculatedInterval < 2) {
      recommendation = 'Frequent monitoring required';
    } else if (calculatedInterval > 8) {
      recommendation = 'Extended interval acceptable';
    }

    return {
      interval: calculatedInterval,
      formula: 'Min(Remaining Life × Risk Factor, Max Interval)',
      calculation: `Min(${remainingLife} × ${riskFactor}, ${maxInterval})`,
      result: `${calculatedInterval.toFixed(2)} years`,
      recommendation: recommendation
    };
  }

  // Calculate test pressure
  calculateTestPressure(mawp, testFactor = 1.3) {
    if (!mawp || !testFactor) return null;

    const testPressure = mawp * testFactor;
    
    let testType = 'Hydrostatic';
    if (testFactor === 1.1) testType = 'Pneumatic (ASME VIII)';
    else if (testFactor === 1.25) testType = 'Pneumatic (API 510)';
    else if (testFactor === 1.5) testType = 'Hydrostatic (API 510)';

    return {
      pressure: testPressure,
      testType: testType,
      formula: 'Test Pressure = MAWP × Test Factor',
      calculation: `${mawp} × ${testFactor} = ${testPressure}`,
      result: `${testPressure.toFixed(0)} psig`
    };
  }

  // Process TML data and calculate corrosion rates
  processTMLData(tmlReadings) {
    if (!tmlReadings || tmlReadings.length === 0) return null;

    const results = {
      summary: {
        count: tmlReadings.length,
        mean: 0,
        min: Infinity,
        max: -Infinity,
        stdDev: 0
      },
      corrosionAnalysis: {
        generalRate: 0,
        maxLocalRate: 0,
        trend: 'Stable'
      },
      readings: []
    };

    // Calculate statistical summary
    let sum = 0;
    tmlReadings.forEach(reading => {
      const thickness = parseFloat(reading.currentThickness);
      sum += thickness;
      results.summary.min = Math.min(results.summary.min, thickness);
      results.summary.max = Math.max(results.summary.max, thickness);
    });

    results.summary.mean = sum / tmlReadings.length;

    // Calculate standard deviation
    const variance = tmlReadings.reduce((acc, reading) => {
      const thickness = parseFloat(reading.currentThickness);
      return acc + Math.pow(thickness - results.summary.mean, 2);
    }, 0) / tmlReadings.length;
    
    results.summary.stdDev = Math.sqrt(variance);

    // Calculate corrosion rates
    const corrosionRates = [];
    tmlReadings.forEach(reading => {
      if (reading.previousThickness && reading.serviceYears) {
        const thicknessLoss = reading.previousThickness - reading.currentThickness;
        const rate = (thicknessLoss * 1000) / reading.serviceYears; // mils/year
        corrosionRates.push(rate);
        
        results.readings.push({
          ...reading,
          thicknessLoss: thicknessLoss,
          corrosionRate: rate,
          status: rate > 5 ? 'High' : rate > 2 ? 'Moderate' : 'Low'
        });
      }
    });

    if (corrosionRates.length > 0) {
      results.corrosionAnalysis.generalRate = corrosionRates.reduce((a, b) => a + b, 0) / corrosionRates.length;
      results.corrosionAnalysis.maxLocalRate = Math.max(...corrosionRates);
      
      // Determine trend
      if (results.corrosionAnalysis.generalRate > 3) {
        results.corrosionAnalysis.trend = 'Increasing';
      } else if (results.corrosionAnalysis.generalRate < 1) {
        results.corrosionAnalysis.trend = 'Minimal';
      }
    }

    return results;
  }

  // API 579 Fitness-for-Service calculations
  calculateFitnessForService(defectData, assessmentLevel = 1) {
    if (!defectData) return null;

    const results = {
      level: assessmentLevel,
      currentFitness: 'Acceptable',
      remainingLife: 0,
      safetyFactor: 0,
      recommendations: []
    };

    switch (assessmentLevel) {
      case 1:
        // Level 1 - Screening Assessment
        results.screeningResults = this.performLevel1Assessment(defectData);
        break;
      case 2:
        // Level 2 - Engineering Assessment
        results.engineeringResults = this.performLevel2Assessment(defectData);
        break;
      case 3:
        // Level 3 - Advanced Assessment (FEA required)
        results.advancedResults = this.performLevel3Assessment(defectData);
        break;
    }

    return results;
  }

  // Level 1 FFS Assessment
  performLevel1Assessment(defectData) {
    const { length, width, depth, remainingThickness } = defectData;
    
    // Simplified Level 1 screening criteria
    const lengthRatio = length / (2 * Math.sqrt(remainingThickness * 0.5)); // Simplified
    const depthRatio = depth / remainingThickness;
    
    return {
      lengthRatio: lengthRatio,
      depthRatio: depthRatio,
      acceptable: lengthRatio < 2.0 && depthRatio < 0.8,
      recommendation: lengthRatio < 2.0 && depthRatio < 0.8 ? 'Acceptable for continued service' : 'Requires Level 2 assessment'
    };
  }

  // Level 2 FFS Assessment
  performLevel2Assessment(defectData) {
    // More detailed engineering assessment
    const { length, width, depth, remainingThickness, designPressure, allowableStress } = defectData;
    
    // Calculate stress intensity factor (simplified)
    const stressIntensityFactor = this.calculateStressIntensityFactor(defectData);
    const remainingStrengthFactor = remainingThickness / (remainingThickness + depth);
    
    return {
      stressIntensityFactor: stressIntensityFactor,
      remainingStrengthFactor: remainingStrengthFactor,
      acceptable: remainingStrengthFactor > 0.9,
      recommendation: remainingStrengthFactor > 0.9 ? 'Acceptable with monitoring' : 'Repair recommended'
    };
  }

  // Level 3 FFS Assessment
  performLevel3Assessment(defectData) {
    return {
      feaRequired: true,
      recommendation: 'Advanced finite element analysis required',
      suggestedSoftware: ['ANSYS', 'ABAQUS', 'NASTRAN']
    };
  }

  // Calculate stress intensity factor (simplified)
  calculateStressIntensityFactor(defectData) {
    const { length, depth, remainingThickness } = defectData;
    // Simplified calculation - actual would be more complex
    return Math.sqrt(Math.PI * depth) * (1 + 0.12 * (length / remainingThickness));
  }

  // Recalculate all dependent values when vessel data changes
  recalculateAll() {
    if (!this.vesselData.designPressure || !this.vesselData.insideDiameter) return;

    const radius = this.vesselData.insideDiameter / 2;
    const material = this.vesselData.materialSpec;
    const temperature = this.vesselData.designTemperature || 650;
    
    const materialProps = this.getAllowableStress(material, temperature);
    if (!materialProps) return;

    // Calculate minimum thickness
    const minThickness = this.calculateMinimumThickness(
      this.vesselData.designPressure,
      radius,
      materialProps.allowableStress,
      0.85, // Default joint efficiency
      0.125 // Default corrosion allowance
    );

    // Calculate MAWP
    const mawp = this.calculateMAWP(
      0.5, // Assumed current thickness
      radius,
      materialProps.allowableStress,
      0.85,
      0.125
    );

    // Store calculations
    this.calculations = {
      minThickness: minThickness,
      mawp: mawp,
      materialProps: materialProps
    };
  }

  // Get all calculations
  getCalculations() {
    return this.calculations;
  }

  // Export calculation report
  generateCalculationReport() {
    return {
      vesselData: this.vesselData,
      calculations: this.calculations,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
  }
}

// Data management utilities
export class DataManager {
  constructor() {
    this.data = {
      vesselData: {},
      inspectionFindings: {},
      calculations: {},
      reports: []
    };
  }

  // Update section data
  updateSection(section, data) {
    this.data[section] = { ...this.data[section], ...data };
    this.notifyDataChange(section, data);
  }

  // Get section data
  getSection(section) {
    return this.data[section] || {};
  }

  // Get all data
  getAllData() {
    return this.data;
  }

  // Data change notification system
  notifyDataChange(section, data) {
    // Trigger recalculations or UI updates as needed
    if (section === 'vesselData') {
      // Trigger calculation updates
      this.triggerCalculationUpdate();
    }
  }

  // Trigger calculation updates
  triggerCalculationUpdate() {
    // This would trigger the calculator to recalculate
    console.log('Triggering calculation update...');
  }

  // Validate data completeness
  validateData() {
    const validation = {
      vesselData: this.validateVesselData(),
      inspectionFindings: this.validateInspectionFindings(),
      calculations: this.validateCalculations()
    };

    return validation;
  }

  validateVesselData() {
    const required = ['tagNumber', 'designPressure', 'designTemperature', 'materialSpec'];
    const missing = required.filter(field => !this.data.vesselData[field]);
    
    return {
      complete: missing.length === 0,
      missing: missing,
      completeness: ((required.length - missing.length) / required.length) * 100
    };
  }

  validateInspectionFindings() {
    // Validate inspection findings completeness
    return {
      complete: true,
      completeness: 100
    };
  }

  validateCalculations() {
    // Validate calculations completeness
    return {
      complete: Object.keys(this.data.calculations).length > 0,
      completeness: Object.keys(this.data.calculations).length > 0 ? 100 : 0
    };
  }
}

// Export instances
export const calculator = new API510Calculator();
export const dataManager = new DataManager();
