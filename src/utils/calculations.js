// Engineering Calculations for API 510 Inspection App
// Based on ASME Section VIII Division 1 and API 510 standards

// Minimum thickness calculation for cylindrical shells
export function calculateMinimumThickness(pressure, radius, stress, efficiency, options = {}) {
  const {
    corrosionAllowance = 0,
    designMargin = 0,
    longitudinalJoint = true
  } = options

  let thickness
  
  if (longitudinalJoint) {
    // Circumferential stress (longitudinal joints)
    thickness = (pressure * radius) / (stress * efficiency - 0.6 * pressure)
  } else {
    // Longitudinal stress (circumferential joints)  
    thickness = (pressure * radius) / (2 * stress * efficiency + 0.4 * pressure)
  }
  
  // Add corrosion allowance and design margin
  const totalThickness = thickness + corrosionAllowance + designMargin
  
  return {
    requiredThickness: Math.round(thickness * 1000) / 1000, // Round to 3 decimal places
    minimumThickness: Math.round(totalThickness * 1000) / 1000,
    corrosionAllowance,
    designMargin
  }
}

// Maximum allowable working pressure calculation
export function calculateMAWP(thickness, radius, stress, efficiency, options = {}) {
  const {
    corrosionAllowance = 0,
    longitudinalJoint = true
  } = options

  const effectiveThickness = thickness - corrosionAllowance
  let mawp

  if (longitudinalJoint) {
    // Circumferential stress governs
    mawp = (stress * efficiency * effectiveThickness) / (radius + 0.6 * effectiveThickness)
  } else {
    // Longitudinal stress governs
    mawp = (2 * stress * efficiency * effectiveThickness) / (radius - 0.4 * effectiveThickness)
  }

  return Math.round(mawp * 10) / 10 // Round to 1 decimal place
}

// Remaining life calculation based on corrosion rate
export function calculateRemainingLife(currentThickness, minimumThickness, corrosionRate, options = {}) {
  const {
    retirementThickness = minimumThickness,
    safetyFactor = 1.0
  } = options

  if (corrosionRate <= 0) {
    return {
      remainingLife: 'Infinite',
      retirementDate: 'N/A',
      thicknessAtRetirement: retirementThickness
    }
  }

  const availableThickness = currentThickness - retirementThickness
  const remainingLife = (availableThickness / (corrosionRate / 1000)) / safetyFactor // Convert mils to inches

  const currentDate = new Date()
  const retirementDate = new Date(currentDate.getTime() + remainingLife * 365.25 * 24 * 60 * 60 * 1000)

  return {
    remainingLife: Math.round(remainingLife * 10) / 10,
    retirementDate: retirementDate.toISOString().split('T')[0],
    thicknessAtRetirement: retirementThickness,
    corrosionRate: corrosionRate
  }
}

// Next inspection interval calculation per API 510
export function calculateInspectionInterval(remainingLife, riskCategory = 'Medium', options = {}) {
  const {
    maxInterval = 15, // API 510 maximum
    minInterval = 5,  // API 510 minimum for external
    internalMaxInterval = 20,
    isInternal = false
  } = options

  let baseInterval
  const maxAllowed = isInternal ? internalMaxInterval : maxInterval

  // Risk-based interval calculation
  switch (riskCategory.toLowerCase()) {
    case 'high':
      baseInterval = Math.min(remainingLife / 4, maxAllowed / 2)
      break
    case 'medium':
      baseInterval = Math.min(remainingLife / 2, maxAllowed * 0.75)
      break
    case 'low':
      baseInterval = Math.min(remainingLife / 1.5, maxAllowed)
      break
    default:
      baseInterval = Math.min(remainingLife / 2, maxAllowed)
  }

  // Apply minimum interval
  const interval = Math.max(baseInterval, minInterval)
  
  // Calculate next inspection date
  const currentDate = new Date()
  const nextInspectionDate = new Date(currentDate.getTime() + interval * 365.25 * 24 * 60 * 60 * 1000)

  return {
    interval: Math.round(interval * 10) / 10,
    nextInspectionDate: nextInspectionDate.toISOString().split('T')[0],
    riskCategory,
    remainingLife
  }
}

// Hydrostatic test pressure calculation
export function calculateTestPressure(mawp, designPressure, testType = 'hydrostatic', options = {}) {
  const {
    temperatureCorrection = 1.0,
    stressRatio = 1.0
  } = options

  const basePressure = Math.max(mawp, designPressure)
  let testFactor

  switch (testType.toLowerCase()) {
    case 'hydrostatic':
      testFactor = 1.3
      break
    case 'pneumatic':
      testFactor = 1.1
      break
    case 'combination':
      testFactor = 1.2
      break
    default:
      testFactor = 1.3
  }

  const testPressure = basePressure * testFactor * temperatureCorrection * stressRatio

  return {
    testPressure: Math.round(testPressure * 10) / 10,
    basePressure,
    testFactor,
    temperatureCorrection,
    testType
  }
}

// Corrosion rate calculation from thickness measurements
export function calculateCorrosionRate(initialThickness, currentThickness, timeInService) {
  if (timeInService <= 0) {
    return 0
  }

  const thicknessLoss = initialThickness - currentThickness
  const corrosionRate = (thicknessLoss * 1000) / timeInService // Convert to mils per year

  return Math.round(corrosionRate * 100) / 100
}

// Fitness for service - general metal loss assessment
export function assessGeneralMetalLoss(currentThickness, minimumThickness, allowableStress, designPressure, operatingPressure) {
  const thicknessRatio = currentThickness / minimumThickness
  const pressureRatio = operatingPressure / designPressure
  const safetyFactor = thicknessRatio / pressureRatio

  let assessment
  if (safetyFactor >= 2.0) {
    assessment = 'Acceptable'
  } else if (safetyFactor >= 1.5) {
    assessment = 'Acceptable with Monitoring'
  } else if (safetyFactor >= 1.0) {
    assessment = 'Monitor - Reduced Safety Margin'
  } else {
    assessment = 'Not Acceptable - Immediate Action Required'
  }

  return {
    safetyFactor: Math.round(safetyFactor * 100) / 100,
    thicknessRatio: Math.round(thicknessRatio * 1000) / 1000,
    pressureRatio: Math.round(pressureRatio * 1000) / 1000,
    assessment
  }
}

// Local metal loss assessment (simplified Folias factor)
export function assessLocalMetalLoss(flawLength, flawWidth, flawDepth, remainingThickness, allowableStress, yieldStrength, pressure) {
  const aspectRatio = flawLength / flawWidth
  const depthRatio = flawDepth / (flawDepth + remainingThickness)
  
  // Simplified Folias factor calculation
  const Mt = Math.sqrt(1 + 0.6275 * aspectRatio - 0.003375 * aspectRatio * aspectRatio)
  
  // Allowable stress (lesser of allowable stress or 90% yield)
  const allowableStressLimit = Math.min(allowableStress, 0.9 * yieldStrength)
  
  // Applied stress calculation
  const appliedStress = pressure * (1 / (1 - depthRatio)) * Mt
  const safetyFactor = allowableStressLimit / appliedStress

  let assessment
  if (safetyFactor >= 2.0) {
    assessment = 'Acceptable'
  } else if (safetyFactor >= 1.5) {
    assessment = 'Acceptable with Monitoring'
  } else if (safetyFactor >= 1.0) {
    assessment = 'Monitor - Reduced Safety Margin'
  } else {
    assessment = 'Not Acceptable - Immediate Repair Required'
  }

  return {
    safetyFactor: Math.round(safetyFactor * 100) / 100,
    foliasFactor: Math.round(Mt * 1000) / 1000,
    depthRatio: Math.round(depthRatio * 1000) / 1000,
    appliedStress: Math.round(appliedStress * 10) / 10,
    assessment
  }
}

// Crack assessment (simplified)
export function assessCrack(crackLength, crackDepth, stressIntensityFactor, fractureToughness, appliedStress) {
  const aspectRatio = crackLength / crackDepth
  const stressIntensity = stressIntensityFactor * appliedStress * Math.sqrt(Math.PI * crackDepth)
  const safetyFactor = fractureToughness / stressIntensity

  let assessment
  if (safetyFactor >= 3.0) {
    assessment = 'Acceptable'
  } else if (safetyFactor >= 2.0) {
    assessment = 'Acceptable with Monitoring'
  } else if (safetyFactor >= 1.0) {
    assessment = 'Monitor - Crack Growth Analysis Required'
  } else {
    assessment = 'Not Acceptable - Immediate Repair Required'
  }

  return {
    safetyFactor: Math.round(safetyFactor * 100) / 100,
    stressIntensityFactor: Math.round(stressIntensity * 10) / 10,
    aspectRatio: Math.round(aspectRatio * 1000) / 1000,
    assessment
  }
}

// Vessel volume calculation
export function calculateVesselVolume(diameter, length, headType = 'ellipsoidal') {
  const radius = diameter / 2
  const cylindricalVolume = Math.PI * radius * radius * length

  let headVolume = 0
  switch (headType.toLowerCase()) {
    case 'ellipsoidal':
    case '2:1 ellipsoidal':
      headVolume = (2 * Math.PI * radius * radius * radius) / 3
      break
    case 'hemispherical':
      headVolume = (2 * Math.PI * radius * radius * radius) / 3
      break
    case 'torispherical':
      // Simplified calculation
      headVolume = (Math.PI * radius * radius * radius) / 2
      break
    case 'flat':
      headVolume = 0
      break
    default:
      headVolume = (2 * Math.PI * radius * radius * radius) / 3
  }

  const totalVolume = cylindricalVolume + (2 * headVolume) // Two heads

  return {
    cylindricalVolume: Math.round(cylindricalVolume * 100) / 100,
    headVolume: Math.round(headVolume * 100) / 100,
    totalVolume: Math.round(totalVolume * 100) / 100,
    units: 'cubic inches'
  }
}

// Weight calculation (approximate)
export function calculateVesselWeight(diameter, length, thickness, materialDensity = 0.284) { // lb/in³ for steel
  const radius = diameter / 2
  const outerRadius = radius + thickness
  const innerRadius = radius
  
  // Shell weight
  const shellVolume = Math.PI * length * (outerRadius * outerRadius - innerRadius * innerRadius)
  
  // Head weight (simplified for ellipsoidal heads)
  const headThickness = thickness
  const headVolume = 2 * (2 * Math.PI * radius * radius * headThickness) // Approximate
  
  const totalMetalVolume = shellVolume + headVolume
  const weight = totalMetalVolume * materialDensity

  return {
    shellWeight: Math.round(shellVolume * materialDensity),
    headWeight: Math.round(headVolume * materialDensity),
    totalWeight: Math.round(weight),
    units: 'pounds'
  }
}

// Temperature conversion utilities
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9
}

export function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32
}

// Pressure conversion utilities
export function psiToBar(psi) {
  return psi * 0.0689476
}

export function barToPsi(bar) {
  return bar * 14.5038
}

// Length conversion utilities
export function inchesToMm(inches) {
  return inches * 25.4
}

export function mmToInches(mm) {
  return mm / 25.4
}

// API 510 specific calculations
export const api510Calculations = {
  calculateMinimumThickness,
  calculateMAWP,
  calculateRemainingLife,
  calculateInspectionInterval,
  calculateTestPressure,
  calculateCorrosionRate,
  assessGeneralMetalLoss,
  assessLocalMetalLoss,
  assessCrack,
  calculateVesselVolume,
  calculateVesselWeight
}

export default {
  calculateMinimumThickness,
  calculateMAWP,
  calculateRemainingLife,
  calculateInspectionInterval,
  calculateTestPressure,
  calculateCorrosionRate,
  assessGeneralMetalLoss,
  assessLocalMetalLoss,
  assessCrack,
  calculateVesselVolume,
  calculateVesselWeight,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  psiToBar,
  barToPsi,
  inchesToMm,
  mmToInches,
  api510Calculations
}
