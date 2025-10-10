// Material Database for API 510 Inspection App
// Based on ASME Section II Part D and common pressure vessel materials

export const materialDatabase = {
  // Carbon Steel Materials
  carbonSteels: {
    'SA-516 Gr 70': {
      name: 'SA-516 Grade 70',
      type: 'Carbon Steel',
      tensileStrength: 70000, // psi
      yieldStrength: 38000, // psi
      allowableStress: {
        100: 17500,  // °F: psi
        200: 17500,
        300: 17500,
        400: 17500,
        500: 15800,
        600: 13300,
        650: 11200
      },
      corrosionAllowance: 0.125, // inches
      weldEfficiency: 1.0,
      applications: ['General pressure vessel service', 'Moderate and lower temperature service']
    },
    'SA-515 Gr 70': {
      name: 'SA-515 Grade 70',
      type: 'Carbon Steel',
      tensileStrength: 70000,
      yieldStrength: 38000,
      allowableStress: {
        100: 17500,
        200: 17500,
        300: 17500,
        400: 17500,
        500: 15800,
        600: 13300,
        650: 11200
      },
      corrosionAllowance: 0.125,
      weldEfficiency: 1.0,
      applications: ['Intermediate and higher temperature service']
    },
    'SA-285 Gr C': {
      name: 'SA-285 Grade C',
      type: 'Carbon Steel',
      tensileStrength: 55000,
      yieldStrength: 30000,
      allowableStress: {
        100: 13800,
        200: 13800,
        300: 13800,
        400: 13800,
        500: 12400,
        600: 10400
      },
      corrosionAllowance: 0.125,
      weldEfficiency: 1.0,
      applications: ['Low pressure service', 'Storage tanks']
    }
  },

  // Stainless Steel Materials
  stainlessSteels: {
    'SA-240 Type 304': {
      name: 'SA-240 Type 304',
      type: 'Stainless Steel',
      tensileStrength: 75000,
      yieldStrength: 30000,
      allowableStress: {
        100: 18800,
        200: 15700,
        300: 14200,
        400: 13100,
        500: 12300,
        600: 11600,
        700: 10900,
        800: 9500
      },
      corrosionAllowance: 0.0, // Typically no CA for SS
      weldEfficiency: 1.0,
      applications: ['Corrosive service', 'Food grade applications', 'High temperature service']
    },
    'SA-240 Type 316': {
      name: 'SA-240 Type 316',
      type: 'Stainless Steel',
      tensileStrength: 75000,
      yieldStrength: 30000,
      allowableStress: {
        100: 18800,
        200: 15700,
        300: 14200,
        400: 13100,
        500: 12300,
        600: 11600,
        700: 10900,
        800: 9500
      },
      corrosionAllowance: 0.0,
      weldEfficiency: 1.0,
      applications: ['Chloride environments', 'Marine applications', 'Chemical processing']
    },
    'SA-240 Type 321': {
      name: 'SA-240 Type 321',
      type: 'Stainless Steel',
      tensileStrength: 75000,
      yieldStrength: 30000,
      allowableStress: {
        100: 18800,
        200: 15700,
        300: 14200,
        400: 13100,
        500: 12300,
        600: 11600,
        700: 10900,
        800: 9500,
        900: 8200,
        1000: 6900
      },
      corrosionAllowance: 0.0,
      weldEfficiency: 1.0,
      applications: ['High temperature service', 'Stabilized against carbide precipitation']
    }
  },

  // Low Alloy Steel Materials
  lowAlloySteels: {
    'SA-387 Gr 11': {
      name: 'SA-387 Grade 11 Class 2',
      type: 'Low Alloy Steel',
      tensileStrength: 75000,
      yieldStrength: 45000,
      allowableStress: {
        100: 18800,
        200: 18800,
        300: 18800,
        400: 18800,
        500: 18800,
        600: 18800,
        700: 18200,
        800: 16900,
        900: 14800,
        1000: 11900
      },
      corrosionAllowance: 0.125,
      weldEfficiency: 1.0,
      applications: ['High temperature hydrogen service', 'Elevated temperature service']
    },
    'SA-387 Gr 22': {
      name: 'SA-387 Grade 22 Class 2',
      type: 'Low Alloy Steel',
      tensileStrength: 85000,
      yieldStrength: 60000,
      allowableStress: {
        100: 21300,
        200: 21300,
        300: 21300,
        400: 21300,
        500: 21300,
        600: 21300,
        700: 20600,
        800: 19400,
        900: 17400,
        1000: 14400,
        1100: 10600
      },
      corrosionAllowance: 0.125,
      weldEfficiency: 1.0,
      applications: ['High temperature service', 'Creep resistance applications']
    }
  },

  // Aluminum Materials
  aluminumAlloys: {
    'SA-5083': {
      name: 'SA-5083',
      type: 'Aluminum Alloy',
      tensileStrength: 42000,
      yieldStrength: 21000,
      allowableStress: {
        100: 10500,
        200: 8400,
        300: 5600,
        400: 2800
      },
      corrosionAllowance: 0.0,
      weldEfficiency: 0.9,
      applications: ['Cryogenic service', 'Marine applications', 'Low temperature service']
    }
  }
}

// Corrosion rates by service and material
export const corrosionRates = {
  // mils per year
  'Atmospheric': {
    'Carbon Steel': 2.0,
    'Stainless Steel': 0.1,
    'Low Alloy Steel': 1.5,
    'Aluminum Alloy': 0.2
  },
  'Fresh Water': {
    'Carbon Steel': 3.0,
    'Stainless Steel': 0.1,
    'Low Alloy Steel': 2.5,
    'Aluminum Alloy': 0.5
  },
  'Salt Water': {
    'Carbon Steel': 8.0,
    'Stainless Steel': 0.5,
    'Low Alloy Steel': 7.0,
    'Aluminum Alloy': 1.0
  },
  'Crude Oil': {
    'Carbon Steel': 1.5,
    'Stainless Steel': 0.1,
    'Low Alloy Steel': 1.0,
    'Aluminum Alloy': 0.1
  },
  'Natural Gas': {
    'Carbon Steel': 0.5,
    'Stainless Steel': 0.05,
    'Low Alloy Steel': 0.3,
    'Aluminum Alloy': 0.05
  },
  'Sour Service': {
    'Carbon Steel': 5.0,
    'Stainless Steel': 0.2,
    'Low Alloy Steel': 4.0,
    'Aluminum Alloy': 0.1
  },
  'High Temperature': {
    'Carbon Steel': 3.0,
    'Stainless Steel': 0.3,
    'Low Alloy Steel': 2.0,
    'Aluminum Alloy': 1.0
  }
}

// Weld joint efficiency factors
export const weldEfficiencies = {
  'Type 1 - Full RT': 1.0,
  'Type 2 - Spot RT': 0.85,
  'Type 3 - No RT': 0.70,
  'Seamless': 1.0
}

// Temperature interpolation function
export function getStressAtTemperature(material, temperature) {
  const stressTable = material.allowableStress
  const temps = Object.keys(stressTable).map(Number).sort((a, b) => a - b)
  
  // If temperature is in the table, return exact value
  if (stressTable[temperature]) {
    return stressTable[temperature]
  }
  
  // Find bounding temperatures
  let lowerTemp = temps[0]
  let upperTemp = temps[temps.length - 1]
  
  for (let i = 0; i < temps.length - 1; i++) {
    if (temperature >= temps[i] && temperature <= temps[i + 1]) {
      lowerTemp = temps[i]
      upperTemp = temps[i + 1]
      break
    }
  }
  
  // Linear interpolation
  const lowerStress = stressTable[lowerTemp]
  const upperStress = stressTable[upperTemp]
  
  if (lowerTemp === upperTemp) {
    return lowerStress
  }
  
  const interpolatedStress = lowerStress + 
    (upperStress - lowerStress) * (temperature - lowerTemp) / (upperTemp - lowerTemp)
  
  return Math.round(interpolatedStress)
}

// Get all materials as a flat array for dropdowns
export function getAllMaterials() {
  const allMaterials = []
  
  Object.values(materialDatabase).forEach(category => {
    Object.entries(category).forEach(([key, material]) => {
      allMaterials.push({
        id: key,
        name: material.name,
        type: material.type,
        ...material
      })
    })
  })
  
  return allMaterials
}

// Get materials by type
export function getMaterialsByType(type) {
  return getAllMaterials().filter(material => material.type === type)
}

// Get material by ID
export function getMaterialById(id) {
  const allMaterials = getAllMaterials()
  return allMaterials.find(material => material.id === id)
}

// Calculate corrosion rate based on service and material
export function getCorrosionRate(service, materialType) {
  if (corrosionRates[service] && corrosionRates[service][materialType]) {
    return corrosionRates[service][materialType]
  }
  
  // Default conservative corrosion rate
  return 2.0
}

// Damage mechanism factors
export const damageMechanisms = {
  'General Corrosion': {
    description: 'Uniform metal loss over the surface',
    factors: ['pH', 'Temperature', 'Velocity', 'Oxygen content'],
    mitigation: ['Corrosion inhibitors', 'Material upgrade', 'Coating systems']
  },
  'Pitting Corrosion': {
    description: 'Localized corrosion resulting in small holes',
    factors: ['Chlorides', 'Stagnant conditions', 'Crevices'],
    mitigation: ['Material selection', 'Cathodic protection', 'Water treatment']
  },
  'Stress Corrosion Cracking': {
    description: 'Cracking due to combined stress and corrosive environment',
    factors: ['Tensile stress', 'Susceptible material', 'Corrosive environment'],
    mitigation: ['Stress relief', 'Material change', 'Environment modification']
  },
  'Hydrogen Induced Cracking': {
    description: 'Cracking caused by hydrogen diffusion into steel',
    factors: ['H2S content', 'pH', 'Temperature', 'Steel hardness'],
    mitigation: ['HIC resistant materials', 'pH control', 'Inhibitors']
  },
  'Erosion': {
    description: 'Material loss due to mechanical wear',
    factors: ['Velocity', 'Particle size', 'Hardness differential'],
    mitigation: ['Velocity reduction', 'Hard facing', 'Flow modification']
  },
  'Fatigue': {
    description: 'Cracking due to cyclic loading',
    factors: ['Stress amplitude', 'Number of cycles', 'Stress concentrations'],
    mitigation: ['Design modification', 'Stress reduction', 'Improved details']
  }
}

export default {
  materialDatabase,
  corrosionRates,
  weldEfficiencies,
  damageMechanisms,
  getStressAtTemperature,
  getAllMaterials,
  getMaterialsByType,
  getMaterialById,
  getCorrosionRate
}
