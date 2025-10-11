import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Settings, 
  Calculator, 
  ClipboardCheck, 
  FileText, 
  Shield, 
  Gauge,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Search,
  Download,
  Eye,
  Wrench,
  BarChart3,
  Droplets
} from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('vessel-data')
  
  // State for vessel data and calculations
  const [vesselData, setVesselData] = useState({
    tagNumber: '',
    vesselName: '',
    manufacturer: '',
    yearBuilt: '',
    designPressure: '',
    designTemperature: '',
    operatingPressure: '',
    materialSpec: '',
    vesselType: '',
    insideDiameter: '',
    overallLength: ''
  })
  
  const [calculationResults, setCalculationResults] = useState({
    minThickness: null,
    mawp: null,
    remainingLife: null,
    testPressure: null,
    inspectionInterval: null
  })
  
  const [calculationInputs, setCalculationInputs] = useState({
    // Minimum thickness inputs
    designPressure: '',
    insideRadius: '',
    allowableStress: '',
    jointEfficiency: '',
    corrosionAllowance: '0.125',
    // MAWP inputs
    actualThickness: '',
    // Remaining life inputs
    currentThickness: '',
    requiredThickness: '',
    corrosionRate: '',
    safetyFactor: '2.0'
  })

  // Material database with temperature-dependent properties
  const materialDatabase = {
    'SA-516-70': {
      650: { stress: 20000, description: 'SA-516-70 @ 650°F: 20,000 psi' },
      700: { stress: 17500, description: 'SA-516-70 @ 700°F: 17,500 psi' },
      750: { stress: 15000, description: 'SA-516-70 @ 750°F: 15,000 psi' }
    },
    'SA-515-70': {
      650: { stress: 20000, description: 'SA-515-70 @ 650°F: 20,000 psi' },
      700: { stress: 17500, description: 'SA-515-70 @ 700°F: 17,500 psi' },
      750: { stress: 15000, description: 'SA-515-70 @ 750°F: 15,000 psi' }
    },
    'SA-387-22': {
      850: { stress: 18750, description: 'SA-387-22 @ 850°F: 18,750 psi' },
      900: { stress: 16250, description: 'SA-387-22 @ 900°F: 16,250 psi' },
      950: { stress: 14000, description: 'SA-387-22 @ 950°F: 14,000 psi' }
    }
  }

  // Update vessel data
  const updateVesselData = (field, value) => {
    setVesselData(prev => ({ ...prev, [field]: value }))
    
    // Enhanced cross-section data integration
    if (field === 'designPressure') {
      setCalculationInputs(prev => ({ ...prev, designPressure: value }))
    }
    if (field === 'insideDiameter') {
      const radius = parseFloat(value) / 2
      setCalculationInputs(prev => ({ ...prev, insideRadius: radius.toString() }))
    }
    if (field === 'materialSpec') {
      // Auto-lookup allowable stress based on material and temperature
      const designTemp = parseFloat(vesselData.designTemperature) || 650
      const material = materialDatabase[value]
      if (material) {
        // Find closest temperature match
        const temps = Object.keys(material).map(t => parseInt(t))
        const closestTemp = temps.reduce((prev, curr) => 
          Math.abs(curr - designTemp) < Math.abs(prev - designTemp) ? curr : prev
        )
        const allowableStress = material[closestTemp].stress
        setCalculationInputs(prev => ({ ...prev, allowableStress: allowableStress.toString() }))
      }
    }
    if (field === 'designTemperature') {
      // Update allowable stress if material is already selected
      const material = materialDatabase[vesselData.materialSpec]
      if (material) {
        const designTemp = parseFloat(value) || 650
        const temps = Object.keys(material).map(t => parseInt(t))
        const closestTemp = temps.reduce((prev, curr) => 
          Math.abs(curr - designTemp) < Math.abs(prev - designTemp) ? curr : prev
        )
        const allowableStress = material[closestTemp].stress
        setCalculationInputs(prev => ({ ...prev, allowableStress: allowableStress.toString() }))
      }
    }
  }

  // Update calculation inputs
  const updateCalculationInputs = (field, value) => {
    console.log('Updating calculation input:', field, '=', value)
    setCalculationInputs(prev => {
      const newState = { ...prev, [field]: value }
      console.log('New calculation state:', newState)
      return newState
    })
  }

  // Core calculation functions
  const calculateMinimumThickness = () => {
    try {
      console.log('Calculation inputs:', calculationInputs)
      const P = parseFloat(calculationInputs.designPressure)
      const R = parseFloat(calculationInputs.insideRadius)
      const S = parseFloat(calculationInputs.allowableStress)
      const E = parseFloat(calculationInputs.jointEfficiency)
      const CA = parseFloat(calculationInputs.corrosionAllowance)
      console.log('Parsed values:', { P, R, S, E, CA })

      if (!P || !R || !S || !E) {
        alert('Please fill in all required fields for minimum thickness calculation')
        return
      }

      // ASME Section VIII formula: t = PR/(SE-0.6P) + CA
      const denominator = (S * E) - (0.6 * P)
      
      if (denominator <= 0) {
        alert('Invalid parameters - denominator is zero or negative. Check allowable stress and pressure values.')
        return
      }

      const thickness = (P * R) / denominator + CA
      
      setCalculationResults(prev => ({
        ...prev,
        minThickness: {
          value: thickness,
          formula: 't = PR/(SE-0.6P) + CA',
          calculation: `t = (${P} × ${R})/((${S} × ${E}) - (0.6 × ${P})) + ${CA}`,
          result: `${thickness.toFixed(4)} inches`
        }
      }))

      // Auto-populate required thickness for remaining life calculation
      setCalculationInputs(prev => ({ ...prev, requiredThickness: thickness.toFixed(4) }))

    } catch (error) {
      alert('Error in minimum thickness calculation. Please check your inputs.')
    }
  }

  const calculateMAWP = () => {
    try {
      const t = parseFloat(calculationInputs.actualThickness)
      const R = parseFloat(calculationInputs.insideRadius)
      const S = parseFloat(calculationInputs.allowableStress)
      const E = parseFloat(calculationInputs.jointEfficiency)
      const CA = parseFloat(calculationInputs.corrosionAllowance)

      if (!t || !R || !S || !E) {
        alert('Please fill in all required fields for MAWP calculation')
        return
      }

      const effectiveThickness = t - CA
      
      if (effectiveThickness <= 0) {
        alert('Effective thickness is zero or negative. Check actual thickness and corrosion allowance.')
        return
      }

      // ASME Section VIII formula: MAWP = SE(t-CA)/(R+0.6(t-CA))
      const numerator = S * E * effectiveThickness
      const denominator = R + (0.6 * effectiveThickness)
      const mawp = numerator / denominator

      setCalculationResults(prev => ({
        ...prev,
        mawp: {
          value: mawp,
          formula: 'MAWP = SE(t-CA)/(R+0.6(t-CA))',
          calculation: `MAWP = (${S} × ${E} × ${effectiveThickness})/(${R} + (0.6 × ${effectiveThickness}))`,
          result: `${mawp.toFixed(1)} psig`
        }
      }))

      // Auto-calculate test pressure
      const testPressure = mawp * 1.3 // Default hydrostatic test factor
      setCalculationResults(prev => ({
        ...prev,
        testPressure: {
          value: testPressure,
          formula: 'Test Pressure = MAWP × 1.3',
          calculation: `${mawp.toFixed(1)} × 1.3 = ${testPressure.toFixed(0)}`,
          result: `${testPressure.toFixed(0)} psig`
        }
      }))

    } catch (error) {
      alert('Error in MAWP calculation. Please check your inputs.')
    }
  }

  const calculateRemainingLife = () => {
    try {
      const currentThickness = parseFloat(calculationInputs.currentThickness)
      const requiredThickness = parseFloat(calculationInputs.requiredThickness)
      const corrosionRate = parseFloat(calculationInputs.corrosionRate) // mils/year
      const safetyFactor = parseFloat(calculationInputs.safetyFactor)

      if (!currentThickness || !requiredThickness || !corrosionRate || !safetyFactor) {
        alert('Please fill in all required fields for remaining life calculation')
        return
      }

      const excessThickness = currentThickness - requiredThickness
      
      if (excessThickness <= 0) {
        setCalculationResults(prev => ({
          ...prev,
          remainingLife: {
            value: 0,
            status: 'CRITICAL',
            statusColor: 'red',
            recommendation: 'Immediate action required - Below minimum thickness',
            result: '0.0 years'
          }
        }))
        return
      }

      // Convert mils/year to inches/year and apply safety factor
      const remainingLife = (excessThickness / (corrosionRate / 1000)) / safetyFactor

      let status = 'GOOD'
      let statusColor = 'green'
      let recommendation = 'Continue normal operation'
      
      if (remainingLife < 2) {
        status = 'CRITICAL'
        statusColor = 'red'
        recommendation = 'Plan immediate replacement or repair'
      } else if (remainingLife < 5) {
        status = 'POOR'
        statusColor = 'orange'
        recommendation = 'Plan replacement within 2-3 years'
      } else if (remainingLife < 10) {
        status = 'FAIR'
        statusColor = 'yellow'
        recommendation = 'Monitor closely, plan future replacement'
      }

      setCalculationResults(prev => ({
        ...prev,
        remainingLife: {
          value: remainingLife,
          status: status,
          statusColor: statusColor,
          recommendation: recommendation,
          calculation: `Life = (${currentThickness} - ${requiredThickness}) / (${corrosionRate}/1000) / ${safetyFactor}`,
          result: `${remainingLife.toFixed(1)} years`
        }
      }))

      // Auto-calculate inspection interval
      const riskFactor = 0.5 // Default medium risk
      const maxInterval = 10 // API 510 maximum
      const inspectionInterval = Math.min(remainingLife * riskFactor, maxInterval)

      setCalculationResults(prev => ({
        ...prev,
        inspectionInterval: {
          value: inspectionInterval,
          formula: 'Min(Remaining Life × Risk Factor, Max Interval)',
          calculation: `Min(${remainingLife.toFixed(1)} × ${riskFactor}, ${maxInterval})`,
          result: `${inspectionInterval.toFixed(2)} years`
        }
      }))

    } catch (error) {
      alert('Error in remaining life calculation. Please check your inputs.')
    }
  }

  const navigationItems = [
    { id: 'vessel-data', label: 'Vessel Data', icon: Database, description: 'Basic vessel information and specifications' },
    { id: 'calculations', label: 'Calculations', icon: Calculator, description: 'Engineering calculations and assessments' },
    { id: 'thickness', label: 'Thickness Analysis', icon: BarChart3, description: 'TML data and corrosion analysis' },
    { id: 'external', label: 'External Inspection', icon: Eye, description: 'Visual inspection findings' },
    { id: 'internal', label: 'Internal Inspection', icon: Search, description: 'Internal assessment results' },
    { id: 'in-lieu', label: 'In-Lieu Inspection', icon: Shield, description: 'On-stream inspection alternatives' },
    { id: 'fitness', label: 'Fitness-for-Service', icon: CheckCircle, description: 'API 579 assessments' },
    { id: 'repairs', label: 'Repairs & Alterations', icon: Wrench, description: 'Modification documentation' },
    { id: 'testing', label: 'Pressure Testing', icon: Gauge, description: 'Hydrostatic and pneumatic tests' },
    { id: 'relief', label: 'Relief Devices', icon: Droplets, description: 'Pressure relief valve inspection' },
    { id: 'planning', label: 'Inspection Planning', icon: ClipboardCheck, description: 'Interval calculations and scheduling' },
    { id: 'report', label: 'Inspection Report', icon: FileText, description: 'Generate comprehensive reports' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vessel-data':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="mr-2 h-5 w-5 text-blue-600" />
                Vessel Data & Specifications
              </h2>
              <p className="text-gray-600 mb-6">Complete vessel identification and design parameters</p>
              
              {/* Vessel Identification */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Vessel Identification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Tag Number *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., V-101, T-205, R-301"
                      value={vesselData.tagNumber}
                      onChange={(e) => updateVesselData('tagNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name/Description *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Reactor Feed Drum, Distillation Tower"
                      value={vesselData.vesselName}
                      onChange={(e) => updateVesselData('vesselName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Chicago Bridge & Iron, Babcock & Wilcox"
                      value={vesselData.manufacturer}
                      onChange={(e) => updateVesselData('manufacturer', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1995"
                      value={vesselData.yearBuilt}
                      onChange={(e) => updateVesselData('yearBuilt', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Design Specifications */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Design Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Design Pressure (psig) *</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 150, 300, 600"
                      value={vesselData.designPressure}
                      onChange={(e) => updateVesselData('designPressure', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Design Temperature (°F) *</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 650, 800, 1000"
                      value={vesselData.designTemperature}
                      onChange={(e) => updateVesselData('designTemperature', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Pressure (psig)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 125, 250, 500"
                      value={vesselData.operatingPressure}
                      onChange={(e) => updateVesselData('operatingPressure', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Specification *</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={vesselData.materialSpec}
                      onChange={(e) => updateVesselData('materialSpec', e.target.value)}
                    >
                      <option value="">Select material specification</option>
                      <option value="sa516-70">SA-516 Grade 70 (Carbon Steel)</option>
                      <option value="sa515-70">SA-515 Grade 70 (Carbon Steel)</option>
                      <option value="sa387-22">SA-387 Grade 22 (Cr-Mo Steel)</option>
                      <option value="sa387-11">SA-387 Grade 11 (Cr-Mo Steel)</option>
                      <option value="sa240-304">SA-240 Type 304 (Stainless Steel)</option>
                      <option value="sa240-316">SA-240 Type 316 (Stainless Steel)</option>
                      <option value="sa240-321">SA-240 Type 321 (Stainless Steel)</option>
                      <option value="sa240-347">SA-240 Type 347 (Stainless Steel)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={vesselData.vesselType}
                      onChange={(e) => updateVesselData('vesselType', e.target.value)}
                    >
                      <option value="">Select vessel type</option>
                      <option value="pressure-vessel">Pressure Vessel</option>
                      <option value="storage-tank">Storage Tank</option>
                      <option value="heat-exchanger">Heat Exchanger</option>
                      <option value="reactor">Reactor</option>
                      <option value="column">Distillation Column</option>
                      <option value="drum">Drum</option>
                      <option value="separator">Separator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vessel Geometry */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Vessel Geometry</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inside Diameter (inches)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 72, 96, 120"
                      value={vesselData.insideDiameter}
                      onChange={(e) => updateVesselData('insideDiameter', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Length (feet)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 20, 40, 60"
                      value={vesselData.overallLength}
                      onChange={(e) => updateVesselData('overallLength', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'calculations':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-green-600" />
                ASME Section VIII Design Calculations
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive pressure vessel calculations per ASME Boiler and Pressure Vessel Code</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Minimum Required Thickness */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Minimum Required Thickness</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Design Pressure (P) - psig</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="150"
                        value={calculationInputs.designPressure}
                        onChange={(e) => updateCalculationInputs('designPressure', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inside Radius (R) - inches</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="36"
                        value={calculationInputs.insideRadius}
                        onChange={(e) => updateCalculationInputs('insideRadius', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowable Stress (S) - psi</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={calculationInputs.allowableStress}
                        onChange={(e) => updateCalculationInputs('allowableStress', e.target.value)}
                      >
                        <option value="">Select material & temperature</option>
                        <option value="20000">SA-516-70 @ 650°F: 20,000 psi</option>
                        <option value="17500">SA-516-70 @ 700°F: 17,500 psi</option>
                        <option value="15000">SA-516-70 @ 750°F: 15,000 psi</option>
                        <option value="18750">SA-387-22 @ 850°F: 18,750 psi</option>
                        <option value="16250">SA-387-22 @ 900°F: 16,250 psi</option>
                        <option value="14000">SA-387-22 @ 950°F: 14,000 psi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joint Efficiency (E)</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={calculationInputs.jointEfficiency}
                        onChange={(e) => updateCalculationInputs('jointEfficiency', e.target.value)}
                      >
                        <option value="">Select joint efficiency</option>
                        <option value="1.0">1.0 - Full Radiography</option>
                        <option value="0.85">0.85 - Spot Radiography</option>
                        <option value="0.70">0.70 - No Radiography</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Allowance (CA) - inches</label>
                      <input 
                        type="number" 
                        step="0.001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.125"
                        value={calculationInputs.corrosionAllowance}
                        onChange={(e) => updateCalculationInputs('corrosionAllowance', e.target.value)}
                      />
                    </div>
                    <button 
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      onClick={calculateMinimumThickness}
                    >
                      Calculate Minimum Thickness
                    </button>
                    <button 
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors mt-2"
                      onClick={() => {
                        setCalculationInputs(prev => ({
                          ...prev,
                          designPressure: '150',
                          insideRadius: '36',
                          allowableStress: '20000',
                          jointEfficiency: '1.0',
                          corrosionAllowance: '0.125'
                        }));
                        setTimeout(calculateMinimumThickness, 100);
                      }}
                    >
                      Test Calculation (Auto-Fill)
                    </button>
                    <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                      <p className="text-sm text-green-800 mb-2">
                        <strong>Formula:</strong> {calculationResults.minThickness?.formula || 't = PR/(SE-0.6P) + CA'}
                      </p>
                      {calculationResults.minThickness?.calculation && (
                        <p className="text-xs text-green-700 mb-2">
                          <strong>Calculation:</strong> {calculationResults.minThickness.calculation}
                        </p>
                      )}
                      <p className="text-lg font-bold text-green-900">
                        Required Thickness: {calculationResults.minThickness?.result || '0.XXX inches'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* MAWP Calculation */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Maximum Allowable Working Pressure</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Thickness (t) - inches</label>
                      <input 
                        type="number" 
                        step="0.001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.375"
                        value={calculationInputs.actualThickness}
                        onChange={(e) => updateCalculationInputs('actualThickness', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inside Radius (R) - inches</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="36"
                        value={calculationInputs.insideRadius}
                        onChange={(e) => updateCalculationInputs('insideRadius', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowable Stress (S) - psi</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={calculationInputs.allowableStress}
                        onChange={(e) => updateCalculationInputs('allowableStress', e.target.value)}
                      >
                        <option value="">Select material & temperature</option>
                        <option value="20000">SA-516-70 @ 650°F: 20,000 psi</option>
                        <option value="17500">SA-516-70 @ 700°F: 17,500 psi</option>
                        <option value="15000">SA-516-70 @ 750°F: 15,000 psi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joint Efficiency (E)</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={calculationInputs.jointEfficiency}
                        onChange={(e) => updateCalculationInputs('jointEfficiency', e.target.value)}
                      >
                        <option value="">Select joint efficiency</option>
                        <option value="1.0">1.0 - Full Radiography</option>
                        <option value="0.85">0.85 - Spot Radiography</option>
                        <option value="0.70">0.70 - No Radiography</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Allowance (CA) - inches</label>
                      <input 
                        type="number" 
                        step="0.001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.125"
                        value={calculationInputs.corrosionAllowance}
                        onChange={(e) => updateCalculationInputs('corrosionAllowance', e.target.value)}
                      />
                    </div>
                    <button 
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      onClick={calculateMAWP}
                    >
                      Calculate MAWP
                    </button>
                    <button 
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors mt-2"
                      onClick={() => {
                        setCalculationInputs(prev => ({
                          ...prev,
                          actualThickness: '0.375',
                          insideRadius: '36',
                          allowableStress: '20000',
                          jointEfficiency: '1.0',
                          corrosionAllowance: '0.125'
                        }));
                        setTimeout(calculateMAWP, 100);
                      }}
                    >
                      Test MAWP Calculation (Auto-Fill)
                    </button>
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Formula:</strong> {calculationResults.mawp?.formula || 'MAWP = SE(t-CA)/(R+0.6(t-CA))'}
                      </p>
                      {calculationResults.mawp?.calculation && (
                        <p className="text-xs text-blue-700 mb-2">
                          <strong>Calculation:</strong> {calculationResults.mawp.calculation}
                        </p>
                      )}
                      <p className="text-lg font-bold text-blue-900">
                        MAWP: {calculationResults.mawp?.result || 'XXX psig'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Life Assessment */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">Remaining Life Assessment</h3>
                <p className="text-gray-600 mb-4">Calculate remaining service life based on corrosion rate analysis</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Thickness (inches)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.350"
                      value={calculationInputs.currentThickness}
                      onChange={(e) => updateCalculationInputs('currentThickness', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Thickness (inches)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.250"
                      value={calculationInputs.requiredThickness}
                      onChange={(e) => updateCalculationInputs('requiredThickness', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Rate (mils/year)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="2.5"
                      value={calculationInputs.corrosionRate}
                      onChange={(e) => updateCalculationInputs('corrosionRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Safety Factor</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="2.0"
                      value={calculationInputs.safetyFactor}
                      onChange={(e) => updateCalculationInputs('safetyFactor', e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors mt-4"
                  onClick={calculateRemainingLife}
                >
                  Calculate Remaining Life
                </button>
                <button 
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors mt-2"
                  onClick={() => {
                    setCalculationInputs(prev => ({
                      ...prev,
                      currentThickness: '0.350',
                      requiredThickness: '0.250',
                      corrosionRate: '2.5',
                      safetyFactor: '2.0'
                    }));
                    setTimeout(calculateRemainingLife, 100);
                  }}
                >
                  Test Remaining Life (Auto-Fill)
                </button>
                
                {/* Comprehensive Test Button */}
                <button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors mt-4 font-semibold"
                  onClick={() => {
                    // Run comprehensive test with realistic pressure vessel data
                    setVesselData(prev => ({
                      ...prev,
                      tagNumber: 'V-101',
                      vesselName: 'Reactor Feed Drum',
                      designPressure: '150',
                      designTemperature: '650',
                      materialSpec: 'SA-516-70',
                      insideDiameter: '72'
                    }));
                    
                    setCalculationInputs(prev => ({
                      ...prev,
                      designPressure: '150',
                      insideRadius: '36',
                      allowableStress: '20000',
                      jointEfficiency: '1.0',
                      corrosionAllowance: '0.125',
                      actualThickness: '0.375',
                      currentThickness: '0.350',
                      corrosionRate: '2.5',
                      safetyFactor: '2.0'
                    }));
                    
                    // Run all calculations in sequence
                    setTimeout(() => {
                      calculateMinimumThickness();
                      setTimeout(() => {
                        calculateMAWP();
                        setTimeout(() => {
                          calculateRemainingLife();
                        }, 200);
                      }, 200);
                    }, 200);
                  }}
                >
                  🚀 Run Complete API 510 Calculation Suite
                </button>
                <div className="p-4 bg-orange-100 rounded-lg border border-orange-300 mt-4">
                  <p className="text-lg font-bold text-orange-900">
                    Estimated Remaining Life: {calculationResults.remainingLife?.result || 'XX.X years'}
                  </p>
                  {calculationResults.remainingLife?.status && (
                    <div className="mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        calculationResults.remainingLife.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                        calculationResults.remainingLife.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        calculationResults.remainingLife.statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {calculationResults.remainingLife.status}
                      </span>
                    </div>
                  )}
                  {calculationResults.remainingLife?.recommendation && (
                    <p className="text-sm text-orange-800 mt-2">
                      <strong>Recommendation:</strong> {calculationResults.remainingLife.recommendation}
                    </p>
                  )}
                  {calculationResults.inspectionInterval?.result && (
                    <p className="text-sm text-orange-800 mt-1">
                      <strong>Next inspection due:</strong> {calculationResults.inspectionInterval.result}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      case 'in-lieu':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-purple-600" />
                In-Lieu of Internal Inspection Program
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive on-stream inspection alternatives per API 510 Section 6.4</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inspection Method Selection */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 text-purple-800">Inspection Method Selection</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary In-Lieu Method *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select primary method</option>
                        <option value="ultrasonic">Ultrasonic Thickness Monitoring (UTM)</option>
                        <option value="radiography">Radiographic Testing (RT)</option>
                        <option value="acoustic">Acoustic Emission (AE)</option>
                        <option value="process">Process Parameter Monitoring</option>
                        <option value="corrosion">Corrosion Monitoring Systems</option>
                        <option value="visual">Enhanced Visual Inspection</option>
                        <option value="magnetic">Magnetic Flux Leakage (MFL)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Method (if applicable)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select secondary method</option>
                        <option value="none">None Required</option>
                        <option value="ultrasonic">Ultrasonic Testing</option>
                        <option value="eddy-current">Eddy Current Testing</option>
                        <option value="liquid-penetrant">Liquid Penetrant Testing</option>
                        <option value="magnetic-particle">Magnetic Particle Testing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment Level *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select risk assessment level</option>
                        <option value="low">Low Risk (API 581 Category 1-2)</option>
                        <option value="medium-low">Medium-Low Risk (API 581 Category 3)</option>
                        <option value="medium">Medium Risk (API 581 Category 4)</option>
                        <option value="medium-high">Medium-High Risk (API 581 Category 5)</option>
                        <option value="high">High Risk (API 581 Category 6+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Frequency *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select monitoring frequency</option>
                        <option value="continuous">Continuous Monitoring</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semi-annual">Semi-Annual</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Effectiveness Assessment */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Effectiveness Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Percentage (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="95"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detection Capability</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select detection capability</option>
                        <option value="excellent">Excellent (&gt;95% POD)</option>
                        <option value="good">Good (80-95% POD)</option>
                        <option value="fair">Fair (60-80% POD)</option>
                        <option value="poor">Poor (&lt;60% POD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Interval Extension</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select interval extension</option>
                        <option value="none">No Extension (Standard Interval)</option>
                        <option value="25">25% Extension</option>
                        <option value="50">50% Extension</option>
                        <option value="75">75% Extension</option>
                        <option value="100">100% Extension (Double Interval)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Level (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="90"
                      />
                    </div>

                    <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                      <h5 className="font-semibold text-green-800 mb-2">Assessment Result</h5>
                      <p className="text-sm text-green-700">
                        Based on the selected criteria, this in-lieu inspection program 
                        provides adequate coverage for the identified risk level and supports 
                        the requested inspection interval extension.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Justification */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Technical Justification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Identified Degradation Mechanisms</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[80px]"
                      placeholder="List and describe all potential degradation mechanisms (e.g., general corrosion, pitting, stress corrosion cracking, fatigue, etc.)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Strategy</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[80px]"
                      placeholder="Describe the comprehensive monitoring strategy including location selection, measurement techniques, data analysis methods, and alarm/action levels"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technical Basis and References</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 min-h-[100px]"
                      placeholder="Provide detailed technical justification including applicable codes, standards, industry practices, and supporting documentation (API 510, API 579, API 581, etc.)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  Generate In-Lieu Assessment Report
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Save Assessment Data
                </button>
              </div>
            </div>
          </div>
        )
      case 'thickness':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-orange-600" />
                Thickness Measurement Location (TML) Analysis
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive thickness data analysis and corrosion assessment</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TML Data Entry */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800">TML Data Entry & Import</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TML Location ID *</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., TML-001, Shell-N1, Head-E2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Thickness (inches)</label>
                        <input 
                          type="number" 
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0.350"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Previous Thickness (inches)</label>
                        <input 
                          type="number" 
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="0.375"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Measurement Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Previous Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Component Location</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select component</option>
                        <option value="shell">Cylindrical Shell</option>
                        <option value="head-top">Top Head</option>
                        <option value="head-bottom">Bottom Head</option>
                        <option value="nozzle">Nozzle</option>
                        <option value="manway">Manway</option>
                        <option value="support">Support Attachment</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                        Add TML Reading
                      </button>
                      <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                        Import Excel Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Corrosion Analysis */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-4 text-red-800">Corrosion Rate Analysis</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">Statistical Summary</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Mean Thickness:</span>
                          <span className="font-bold ml-2">0.352 inches</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Min Thickness:</span>
                          <span className="font-bold ml-2">0.340 inches</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Max Thickness:</span>
                          <span className="font-bold ml-2">0.365 inches</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Std Deviation:</span>
                          <span className="font-bold ml-2">0.008 inches</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Years</label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="5.2"
                      />
                    </div>
                    
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
                      Calculate Corrosion Rate
                    </button>
                    
                    <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                      <h5 className="font-semibold text-red-800 mb-2">Corrosion Analysis Results</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>General Corrosion Rate:</span>
                          <span className="font-bold">2.4 mils/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maximum Local Rate:</span>
                          <span className="font-bold">3.8 mils/year</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Corrosion Type:</span>
                          <span className="font-bold">General + Localized</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trend:</span>
                          <span className="font-bold text-red-600">Increasing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TML Data Table */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">TML Measurement History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">TML ID</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Component</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Current (in)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Previous (in)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Loss (mils)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Rate (mils/yr)</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">TML-001</td>
                        <td className="border border-gray-300 px-4 py-2">Shell</td>
                        <td className="border border-gray-300 px-4 py-2">0.352</td>
                        <td className="border border-gray-300 px-4 py-2">0.375</td>
                        <td className="border border-gray-300 px-4 py-2">23</td>
                        <td className="border border-gray-300 px-4 py-2">2.4</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Monitor</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">TML-002</td>
                        <td className="border border-gray-300 px-4 py-2">Shell</td>
                        <td className="border border-gray-300 px-4 py-2">0.340</td>
                        <td className="border border-gray-300 px-4 py-2">0.375</td>
                        <td className="border border-gray-300 px-4 py-2">35</td>
                        <td className="border border-gray-300 px-4 py-2">3.8</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Critical</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">TML-003</td>
                        <td className="border border-gray-300 px-4 py-2">Head</td>
                        <td className="border border-gray-300 px-4 py-2">0.365</td>
                        <td className="border border-gray-300 px-4 py-2">0.375</td>
                        <td className="border border-gray-300 px-4 py-2">10</td>
                        <td className="border border-gray-300 px-4 py-2">1.1</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Good</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remaining Life Assessment */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Remaining Life Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Current Status</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Min Current Thickness:</span>
                        <span className="font-bold">0.340 inches</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Thickness:</span>
                        <span className="font-bold">0.271 inches</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available for Corrosion:</span>
                        <span className="font-bold">0.069 inches</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Life Calculation</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Corrosion Rate:</span>
                        <span className="font-bold">3.8 mils/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Factor:</span>
                        <span className="font-bold">2.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Life:</span>
                        <span className="font-bold text-blue-600">9.1 years</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Next Actions</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Next Inspection:</span>
                        <span className="font-bold">4.5 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retirement Date:</span>
                        <span className="font-bold">2033</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <span className="font-bold text-orange-600">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                  Generate TML Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Export to Excel
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Save Analysis
                </button>
              </div>
            </div>
          </div>
        )
      case 'external':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="mr-2 h-5 w-5 text-purple-600" />
                External Visual Inspection
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive external assessment and visual inspection findings</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Condition Assessment */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 text-purple-800">General Condition Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overall Condition *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select overall condition</option>
                        <option value="excellent">Excellent - No visible defects</option>
                        <option value="good">Good - Minor cosmetic issues</option>
                        <option value="fair">Fair - Some deterioration present</option>
                        <option value="poor">Poor - Significant deterioration</option>
                        <option value="critical">Critical - Immediate attention required</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date *</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name *</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Inspector certification and name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select weather conditions</option>
                        <option value="clear">Clear and Dry</option>
                        <option value="overcast">Overcast</option>
                        <option value="light-rain">Light Rain</option>
                        <option value="heavy-rain">Heavy Rain</option>
                        <option value="snow">Snow</option>
                        <option value="fog">Fog/Limited Visibility</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Corrosion Assessment */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-4 text-red-800">Corrosion Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">General Corrosion Level</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select corrosion level</option>
                        <option value="none">None Visible</option>
                        <option value="light">Light Surface Corrosion</option>
                        <option value="moderate">Moderate Corrosion</option>
                        <option value="heavy">Heavy Corrosion</option>
                        <option value="severe">Severe Corrosion</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pitting Observed</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select pitting level</option>
                        <option value="none">No Pitting</option>
                        <option value="minor">Minor Pitting (&lt;1mm deep)</option>
                        <option value="moderate">Moderate Pitting (1-3mm deep)</option>
                        <option value="severe">Severe Pitting (&gt;3mm deep)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Under Insulation (CUI)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select CUI assessment</option>
                        <option value="not-applicable">Not Applicable - No Insulation</option>
                        <option value="no-evidence">No Evidence of CUI</option>
                        <option value="suspected">CUI Suspected</option>
                        <option value="confirmed">CUI Confirmed</option>
                        <option value="extensive">Extensive CUI</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Location Details</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                        placeholder="Describe specific locations and extent of corrosion..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structural Assessment */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Structural Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Supports & Foundations</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Foundation Settlement</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select settlement level</option>
                          <option value="none">No Settlement</option>
                          <option value="minor">Minor Settlement</option>
                          <option value="moderate">Moderate Settlement</option>
                          <option value="severe">Severe Settlement</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Attachments & Nozzles</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nozzle Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Piping Stress</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select stress level</option>
                          <option value="acceptable">Acceptable</option>
                          <option value="moderate">Moderate Stress</option>
                          <option value="high">High Stress</option>
                          <option value="excessive">Excessive Stress</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Insulation & Coatings</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insulation Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="missing">Missing/Damaged</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coating Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Defects and Findings */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-yellow-800">Defects and Findings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Defect Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="">Select defect type</option>
                        <option value="corrosion">Corrosion</option>
                        <option value="crack">Crack</option>
                        <option value="dent">Dent/Deformation</option>
                        <option value="leak">Leak</option>
                        <option value="weld-defect">Weld Defect</option>
                        <option value="support-issue">Support Issue</option>
                        <option value="coating-failure">Coating Failure</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="">Select severity</option>
                        <option value="low">Low - Monitor</option>
                        <option value="medium">Medium - Plan Repair</option>
                        <option value="high">High - Repair Soon</option>
                        <option value="critical">Critical - Immediate Action</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Description</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="e.g., Shell at 3 o'clock, 5 feet from bottom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      rows="3"
                      placeholder="Provide detailed description of the defect, dimensions, and any immediate concerns..."
                    ></textarea>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors">
                      Add Finding
                    </button>
                    <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                      Attach Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Recommendations & Next Actions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Immediate Actions Required</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="2"
                      placeholder="List any immediate actions required based on inspection findings..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Future Monitoring Requirements</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="2"
                      placeholder="Specify areas requiring increased monitoring or special attention..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next External Inspection Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
                  Generate External Inspection Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Save Inspection Data
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Export Findings
                </button>
              </div>
            </div>
          </div>
        )
      case 'internal':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="mr-2 h-5 w-5 text-teal-600" />
                Internal Inspection Assessment
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive internal inspection findings and assessment</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Entry and Preparation */}
                <div className="bg-teal-50 p-6 rounded-lg border border-teal-200">
                  <h3 className="text-lg font-semibold mb-4 text-teal-800">Entry Preparation & Safety</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Entry Permit Status *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select permit status</option>
                        <option value="approved">Approved and Valid</option>
                        <option value="pending">Pending Approval</option>
                        <option value="expired">Expired</option>
                        <option value="not-required">Not Required</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atmosphere Testing</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select test status</option>
                        <option value="safe">Safe for Entry</option>
                        <option value="monitoring">Continuous Monitoring Required</option>
                        <option value="unsafe">Unsafe - Entry Prohibited</option>
                        <option value="not-tested">Not Tested</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Method</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select cleaning method</option>
                        <option value="water-wash">Water Washing</option>
                        <option value="chemical-clean">Chemical Cleaning</option>
                        <option value="steam-clean">Steam Cleaning</option>
                        <option value="mechanical">Mechanical Cleaning</option>
                        <option value="solvent">Solvent Cleaning</option>
                        <option value="none">No Cleaning Required</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Method</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Select inspection method</option>
                        <option value="visual">Visual Inspection</option>
                        <option value="visual-ndt">Visual + NDT</option>
                        <option value="remote">Remote Visual (RVI)</option>
                        <option value="robotic">Robotic Inspection</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Internal Condition Assessment */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800">Internal Condition Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Overall Internal Condition</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select overall condition</option>
                        <option value="excellent">Excellent - Like New</option>
                        <option value="good">Good - Minor Wear</option>
                        <option value="fair">Fair - Moderate Deterioration</option>
                        <option value="poor">Poor - Significant Issues</option>
                        <option value="critical">Critical - Immediate Action Required</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Internal Corrosion</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select corrosion level</option>
                        <option value="none">No Corrosion</option>
                        <option value="light">Light General Corrosion</option>
                        <option value="moderate">Moderate Corrosion</option>
                        <option value="heavy">Heavy Corrosion</option>
                        <option value="severe">Severe Localized Corrosion</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deposit/Scale Buildup</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select buildup level</option>
                        <option value="none">No Deposits</option>
                        <option value="light">Light Deposits</option>
                        <option value="moderate">Moderate Buildup</option>
                        <option value="heavy">Heavy Buildup</option>
                        <option value="severe">Severe Fouling</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weld Joint Condition</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select weld condition</option>
                        <option value="good">Good - No Issues</option>
                        <option value="fair">Fair - Minor Indications</option>
                        <option value="poor">Poor - Significant Issues</option>
                        <option value="critical">Critical - Repair Required</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Findings */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-800">Detailed Internal Findings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-red-800 mb-3">Shell Assessment</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shell Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thickness Loss Areas</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows="2"
                          placeholder="Describe areas of thickness loss..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-red-800 mb-3">Head Assessment</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Head Condition</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Knuckle Region</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                          <option value="">Select condition</option>
                          <option value="good">Good</option>
                          <option value="fair">Fair</option>
                          <option value="poor">Poor</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Recommendations */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Internal Inspection Recommendations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Follow-up Actions</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="List required follow-up actions based on internal inspection findings..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Internal Inspection Interval</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select interval</option>
                      <option value="5">5 Years</option>
                      <option value="10">10 Years</option>
                      <option value="15">15 Years</option>
                      <option value="20">20 Years</option>
                      <option value="custom">Custom Interval</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Monitoring Requirements</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Specify any special monitoring or in-lieu inspection requirements..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">
                  Generate Internal Inspection Report
                </button>
                <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                  Save Assessment Data
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Export Findings
                </button>
              </div>
            </div>
          </div>
        )
      case 'fitness':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-indigo-600" />
                Fitness-for-Service Assessment (API 579)
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive API 579 fitness-for-service evaluation and remaining life assessment</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assessment Level Selection */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-800">Assessment Level Selection</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API 579 Assessment Level *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select assessment level</option>
                        <option value="level1">Level 1 - Screening Assessment</option>
                        <option value="level2">Level 2 - Engineering Assessment</option>
                        <option value="level3">Level 3 - Advanced Assessment</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degradation Mechanism *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select degradation mechanism</option>
                        <option value="general-corrosion">General Corrosion</option>
                        <option value="localized-corrosion">Localized Corrosion</option>
                        <option value="pitting">Pitting Corrosion</option>
                        <option value="cracking">Cracking</option>
                        <option value="erosion">Erosion/Erosion-Corrosion</option>
                        <option value="creep">Creep Damage</option>
                        <option value="fatigue">Fatigue</option>
                        <option value="brittle-fracture">Brittle Fracture</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Purpose</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select purpose</option>
                        <option value="remaining-life">Remaining Life Assessment</option>
                        <option value="fitness-for-service">Current Fitness-for-Service</option>
                        <option value="inspection-planning">Inspection Planning</option>
                        <option value="repair-assessment">Repair Assessment</option>
                        <option value="rerating">Rerating Assessment</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Defect Characterization */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-4 text-red-800">Defect Characterization</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Defect Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select defect type</option>
                        <option value="wall-thinning">Wall Thinning</option>
                        <option value="local-thin-area">Local Thin Area (LTA)</option>
                        <option value="groove-like-flaw">Groove-Like Flaw</option>
                        <option value="crack-like-flaw">Crack-Like Flaw</option>
                        <option value="blunt-flaw">Blunt Flaw</option>
                        <option value="dent">Dent/Deformation</option>
                        <option value="lamination">Lamination</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Defect Length (inches)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 6.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Defect Width (inches)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 3.0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Defect Depth (inches)</label>
                        <input 
                          type="number" 
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 0.125"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Thickness (inches)</label>
                        <input 
                          type="number" 
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="e.g., 0.375"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Defect Location</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select location</option>
                        <option value="cylindrical-shell">Cylindrical Shell</option>
                        <option value="spherical-shell">Spherical Shell</option>
                        <option value="formed-head">Formed Head</option>
                        <option value="flat-head">Flat Head</option>
                        <option value="nozzle">Nozzle</option>
                        <option value="weld-joint">Weld Joint</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Calculations */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">Assessment Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Level 1 Assessment</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Thickness (treq)</label>
                        <input 
                          type="number" 
                          step="0.001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calculated value"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Strength Factor (RSF)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calculated value"
                          readOnly
                        />
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Calculate Level 1
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Level 2 Assessment</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stress Intensity Factor (K)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calculated value"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Folias Factor (Mt)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Calculated value"
                          readOnly
                        />
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Calculate Level 2
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-blue-800 mb-3">Level 3 Assessment</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">FEA Required</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select FEA requirement</option>
                          <option value="yes">Yes - Complex Geometry</option>
                          <option value="no">No - Standard Methods Apply</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Software</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="">Select software</option>
                          <option value="ansys">ANSYS</option>
                          <option value="abaqus">ABAQUS</option>
                          <option value="nastran">NASTRAN</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                        Setup Level 3
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Results */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Assessment Results & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3">Fitness-for-Service Evaluation</h5>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Current Fitness Status:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Acceptable
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Remaining Life:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            8.5 Years
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Safety Factor:</span>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                            2.1
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3">Recommendations</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Interval</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Select interval</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="custom">Custom Interval</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Requirements</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="3"
                          placeholder="Specify monitoring requirements and inspection focus areas..."
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operating Restrictions</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows="2"
                          placeholder="List any operating pressure/temperature restrictions..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Generate FFS Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Save Assessment
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Export Calculations
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Print Summary
                </button>
              </div>
            </div>
          </div>
        )
      case 'repairs':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Wrench className="mr-2 h-5 w-5 text-orange-600" />
                Repairs & Alterations Documentation
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive documentation and assessment of vessel modifications per API 510</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Repair/Alteration Information */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold mb-4 text-orange-800">Repair/Alteration Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Type *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select work type</option>
                        <option value="repair">Repair</option>
                        <option value="alteration">Alteration</option>
                        <option value="rerating">Rerating</option>
                        <option value="replacement">Component Replacement</option>
                        <option value="modification">Design Modification</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Classification</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select classification</option>
                        <option value="major">Major Repair/Alteration</option>
                        <option value="minor">Minor Repair/Alteration</option>
                        <option value="emergency">Emergency Repair</option>
                        <option value="temporary">Temporary Repair</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contractor/Organization</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Contractor name and certification"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows="3"
                        placeholder="Detailed description of repair/alteration work performed..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Technical Requirements */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Technical Requirements</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Design Code Compliance</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select code</option>
                        <option value="asme-viii-1">ASME Section VIII Div 1</option>
                        <option value="asme-viii-2">ASME Section VIII Div 2</option>
                        <option value="asme-i">ASME Section I</option>
                        <option value="api-650">API 650</option>
                        <option value="other">Other Code</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Material Specification</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select material</option>
                        <option value="sa516-70">SA-516 Grade 70</option>
                        <option value="sa515-70">SA-515 Grade 70</option>
                        <option value="sa387-22">SA-387 Grade 22</option>
                        <option value="sa240-304">SA-240 Type 304</option>
                        <option value="sa240-316">SA-240 Type 316</option>
                        <option value="other">Other Material</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Design Pressure (psig)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Design Temperature (°F)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 650"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welding Procedure (WPS)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="WPS number and qualification"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Welder Qualification</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Welder certification numbers"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Control & Testing */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-green-800">Quality Control & Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3">Non-Destructive Testing</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NDT Methods Required</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Visual Testing (VT)</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Liquid Penetrant (PT)</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Magnetic Particle (MT)</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Radiographic (RT)</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Ultrasonic (UT)</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NDT Results</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Select result</option>
                          <option value="acceptable">Acceptable</option>
                          <option value="rejectable">Rejectable - Rework Required</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3">Pressure Testing</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Select test type</option>
                          <option value="hydrostatic">Hydrostatic Test</option>
                          <option value="pneumatic">Pneumatic Test</option>
                          <option value="combination">Combination Test</option>
                          <option value="not-required">Not Required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Pressure (psig)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Calculated test pressure"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Result</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Select result</option>
                          <option value="passed">Passed</option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3">Documentation</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Repair/Alteration Form</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Design Calculations</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Material Certificates</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">WPS & WQR</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">NDT Reports</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Pressure Test Report</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Inspector</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="AI name and commission number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Impact Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-purple-800 mb-3">Vessel Rating Impact</h5>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">MAWP Change:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            No Change
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Temperature Rating:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Maintained
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Code Compliance:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Compliant
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-purple-800 mb-3">Inspection Requirements</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Inspection Interval</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Select interval</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                          <option value="custom">Custom Interval</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Monitoring</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="3"
                          placeholder="Specify any special monitoring requirements for the repair/alteration area..."
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Actions</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="2"
                          placeholder="List any required follow-up actions or inspections..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                  Generate Repair Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Save Documentation
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Submit for Approval
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Print Forms
                </button>
              </div>
            </div>
          </div>
        )
      case 'testing':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Gauge className="mr-2 h-5 w-5 text-green-600" />
                Pressure Testing Documentation
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive hydrostatic and pneumatic pressure testing per ASME and API standards</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Planning & Setup */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Test Planning & Setup</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select test type</option>
                        <option value="hydrostatic">Hydrostatic Test</option>
                        <option value="pneumatic">Pneumatic Test</option>
                        <option value="combination">Combination Test</option>
                        <option value="alternative">Alternative Test Method</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Purpose</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select purpose</option>
                        <option value="initial">Initial Construction Test</option>
                        <option value="repair">Post-Repair Test</option>
                        <option value="alteration">Post-Alteration Test</option>
                        <option value="rerating">Rerating Test</option>
                        <option value="periodic">Periodic Test</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Medium</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select medium</option>
                        <option value="water">Water</option>
                        <option value="air">Air</option>
                        <option value="nitrogen">Nitrogen</option>
                        <option value="other-liquid">Other Liquid</option>
                        <option value="other-gas">Other Gas</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Temperature (°F)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 70, 100"
                      />
                    </div>
                  </div>
                </div>

                {/* Pressure Calculations */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Pressure Calculations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Design Pressure (psig)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="From vessel data"
                        value="150"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">MAWP (psig)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="From calculations"
                        value="165"
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Pressure Factor</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select factor</option>
                        <option value="1.3">1.3 (ASME VIII Hydrostatic)</option>
                        <option value="1.1">1.1 (ASME VIII Pneumatic)</option>
                        <option value="1.5">1.5 (API 510 Hydrostatic)</option>
                        <option value="1.25">1.25 (API 510 Pneumatic)</option>
                        <option value="custom">Custom Factor</option>
                      </select>
                    </div>
                    
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Calculated Test Pressure:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          195 psig
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">MAWP × 1.3 = 165 × 1.3 = 195 psig</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Test Pressure (psig)</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Actual pressure applied"
                      />
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Calculate Test Pressure
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Execution & Results */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-orange-800">Test Execution & Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="font-semibold text-orange-800 mb-3">Test Procedure</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pressurization Rate</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select rate</option>
                          <option value="gradual">Gradual (≤10 psi/min)</option>
                          <option value="moderate">Moderate (10-25 psi/min)</option>
                          <option value="controlled">Controlled Rate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hold Time (minutes)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="e.g., 10, 30, 60"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Method</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select method</option>
                          <option value="visual">Visual Inspection</option>
                          <option value="soap-solution">Soap Solution</option>
                          <option value="acoustic">Acoustic Monitoring</option>
                          <option value="strain-gauge">Strain Gauge</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Safety Precautions</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Personnel Cleared</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Barriers Installed</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span className="text-sm">Emergency Procedures</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-orange-800 mb-3">Test Results</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Result</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select result</option>
                          <option value="passed">Passed - No Leakage</option>
                          <option value="failed-leak">Failed - Leakage Detected</option>
                          <option value="failed-deformation">Failed - Permanent Deformation</option>
                          <option value="failed-rupture">Failed - Rupture</option>
                          <option value="aborted">Test Aborted</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Pressure Achieved (psig)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Highest pressure reached"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pressure Drop (psi)</label>
                        <input 
                          type="number" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Pressure loss during hold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows="3"
                          placeholder="Visual observations, sounds, deformations..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-orange-800 mb-3">Documentation</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Personnel</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Test supervisor and crew"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Inspector</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="AI name and commission"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Equipment</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows="2"
                          placeholder="Pumps, gauges, recording devices..."
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Status</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select status</option>
                          <option value="current">Current Calibration</option>
                          <option value="expired">Expired Calibration</option>
                          <option value="unknown">Unknown Status</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gauge Accuracy</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                          <option value="">Select accuracy</option>
                          <option value="0.5">±0.5% Full Scale</option>
                          <option value="1.0">±1.0% Full Scale</option>
                          <option value="2.0">±2.0% Full Scale</option>
                          <option value="other">Other Accuracy</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-Test Actions */}
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-purple-800">Post-Test Actions & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-purple-800 mb-3">Required Actions</h5>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Test Status:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Passed
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corrective Actions</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="3"
                          placeholder="List any required repairs or modifications..."
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Retest Required</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Select requirement</option>
                          <option value="no">No Retest Required</option>
                          <option value="partial">Partial Retest</option>
                          <option value="full">Full Retest Required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Test Due Date</label>
                        <input 
                          type="date" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-purple-800 mb-3">Code Compliance</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Applicable Code</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Select code</option>
                          <option value="asme-viii-1">ASME Section VIII Div 1</option>
                          <option value="asme-viii-2">ASME Section VIII Div 2</option>
                          <option value="api-510">API 510</option>
                          <option value="asme-i">ASME Section I</option>
                          <option value="other">Other Code</option>
                        </select>
                      </div>
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Code Compliance:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Compliant
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exemptions/Deviations</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          rows="2"
                          placeholder="List any approved exemptions or deviations..."
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Required</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option value="">Select requirement</option>
                          <option value="yes">Certificate Required</option>
                          <option value="no">No Certificate Required</option>
                          <option value="pending">Certificate Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                  Generate Test Report
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Save Test Data
                </button>
                <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
                  Print Certificate
                </button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
                  Export Results
                </button>
              </div>
            </div>
          </div>
        )
      case 'relief':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Droplets className="mr-2 h-5 w-5 text-red-600" />
                Pressure Relief Device Inspection
              </h2>
              <p className="text-gray-600 mb-6">Comprehensive inspection and testing of pressure relief valves per API 510 and ASME requirements</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Information */}
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <h3 className="text-lg font-semibold mb-4 text-red-800">Relief Device Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">Select device type</option>
                        <option value="safety-valve">Safety Valve</option>
                        <option value="relief-valve">Relief Valve</option>
                        <option value="safety-relief">Safety Relief Valve</option>
                        <option value="rupture-disc">Rupture Disc</option>
                        <option value="pilot-operated">Pilot Operated Relief Valve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g., Crosby, Anderson Greenwood" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model/Size</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g., JOS-3M6, 4x6" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Device serial number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Set Pressure (psig)</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="e.g., 150, 300" />
                    </div>
                  </div>
                </div>

                {/* Inspection Results */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Inspection Results</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Visual Condition</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="unacceptable">Unacceptable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pop Test Result</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select result</option>
                        <option value="passed">Passed - Within ±3%</option>
                        <option value="high">Failed - Set Pressure High</option>
                        <option value="low">Failed - Set Pressure Low</option>
                        <option value="no-pop">Failed - No Pop</option>
                        <option value="not-tested">Not Tested</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Pop Pressure (psig)</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Measured pop pressure" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seat Leakage</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select leakage</option>
                        <option value="none">No Leakage</option>
                        <option value="slight">Slight Leakage</option>
                        <option value="moderate">Moderate Leakage</option>
                        <option value="excessive">Excessive Leakage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Action</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select action</option>
                        <option value="continue">Continue Service</option>
                        <option value="adjust">Adjust Set Pressure</option>
                        <option value="repair">Repair Required</option>
                        <option value="replace">Replace Device</option>
                        <option value="remove">Remove from Service</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">Generate Relief Device Report</button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Save Inspection Data</button>
              </div>
            </div>
          </div>
        )
      case 'planning':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ClipboardCheck className="mr-2 h-5 w-5 text-blue-600" />
                Inspection Planning & Scheduling
              </h2>
              <p className="text-gray-600 mb-6">Calculate inspection intervals and plan future inspections per API 510 requirements</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interval Calculations */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800">Inspection Interval Calculations</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remaining Life (years)</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="From calculations" value="8.5" readOnly />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Interval (years)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select maximum</option>
                        <option value="10">10 Years (API 510 Maximum)</option>
                        <option value="15">15 Years (Special Cases)</option>
                        <option value="20">20 Years (Exceptional)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risk Factor</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select risk factor</option>
                        <option value="0.25">0.25 (High Risk)</option>
                        <option value="0.5">0.5 (Medium Risk)</option>
                        <option value="0.75">0.75 (Low Risk)</option>
                      </select>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Calculated Interval:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">4.25 Years</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Min(Remaining Life × Risk Factor, Max Interval)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Interval (years)</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Final recommended interval" />
                    </div>
                  </div>
                </div>

                {/* Inspection Schedule */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Inspection Schedule</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Internal Inspection</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last External Inspection</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Internal Due</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next External Due</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Status:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Current</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Generate Schedule Report</button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">Save Planning Data</button>
              </div>
            </div>
          </div>
        )
      case 'report':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-purple-600" />
                Comprehensive Inspection Report
              </h2>
              <p className="text-gray-600 mb-6">Generate complete API 510 inspection reports with all assessment data and recommendations</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Configuration */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold mb-4 text-purple-800">Report Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select report type</option>
                        <option value="internal">Internal Inspection Report</option>
                        <option value="external">External Inspection Report</option>
                        <option value="comprehensive">Comprehensive Report</option>
                        <option value="summary">Executive Summary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Include Sections</label>
                      <div className="space-y-2">
                        <label className="flex items-center"><input type="checkbox" className="mr-2" checked readOnly />Vessel Data</label>
                        <label className="flex items-center"><input type="checkbox" className="mr-2" checked readOnly />Calculations</label>
                        <label className="flex items-center"><input type="checkbox" className="mr-2" checked readOnly />Thickness Analysis</label>
                        <label className="flex items-center"><input type="checkbox" className="mr-2" checked readOnly />Inspection Findings</label>
                        <label className="flex items-center"><input type="checkbox" className="mr-2" checked readOnly />Fitness-for-Service</label>
                        <label className="flex items-center"><input type="checkbox" className="mr-2" />Appendices</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Report Format</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Select format</option>
                        <option value="pdf">PDF Document</option>
                        <option value="word">Word Document</option>
                        <option value="excel">Excel Workbook</option>
                        <option value="html">HTML Report</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Report Summary */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Report Summary</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Overall Condition:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Good</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Remaining Life:</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">8.5 Years</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Next Inspection:</span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">4.25 Years</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Recommendations:</span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">3 Items</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Comments</label>
                      <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500" rows="3" placeholder="Additional inspector comments and observations..."></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">Generate Complete Report</button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Preview Report</button>
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">Export Data</button>
                <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">Print Report</button>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                This section is under development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Additional features will be added here.</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">API 510 Inspection App</h1>
                <p className="text-sm text-slate-600">Pressure Vessel Inspection System</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              Professional Edition
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Inspection Workflow</CardTitle>
                <CardDescription>
                  Complete API 510 inspection process
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 transition-colors ${
                          activeTab === item.id 
                            ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-700' 
                            : 'text-slate-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
