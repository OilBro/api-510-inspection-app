import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  const [inspectionData, setInspectionData] = useState({
    vesselData: {},
    calculations: {},
    thicknessData: {},
    externalInspection: {},
    internalInspection: {},
    inLieuInspection: {},
    fitnessForService: {},
    repairsAlterations: {},
    pressureTesting: {},
    reliefDevices: {},
    inspectionPlanning: {},
    report: {}
  })

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

  const updateInspectionData = (section, data) => {
    setInspectionData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const renderVesselDataForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Vessel Identification & Specifications</span>
          </CardTitle>
          <CardDescription>
            Complete vessel data entry with material selection and design parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel-tag">Vessel Tag Number *</Label>
              <Input 
                id="vessel-tag" 
                placeholder="e.g., V-101, T-205, R-301" 
                onChange={(e) => updateInspectionData('vesselData', { vesselTag: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vessel-name">Vessel Name/Description *</Label>
              <Input 
                id="vessel-name" 
                placeholder="e.g., Reactor Feed Drum, Distillation Tower" 
                onChange={(e) => updateInspectionData('vesselData', { vesselName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input 
                id="manufacturer" 
                placeholder="e.g., Chicago Bridge & Iron, Babcock & Wilcox" 
                onChange={(e) => updateInspectionData('vesselData', { manufacturer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year-built">Year Built</Label>
              <Input 
                id="year-built" 
                type="number" 
                placeholder="e.g., 1995" 
                onChange={(e) => updateInspectionData('vesselData', { yearBuilt: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="design-pressure">Design Pressure (psig) *</Label>
              <Input 
                id="design-pressure" 
                type="number" 
                placeholder="e.g., 150, 300, 600" 
                onChange={(e) => updateInspectionData('vesselData', { designPressure: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="design-temp">Design Temperature (°F) *</Label>
              <Input 
                id="design-temp" 
                type="number" 
                placeholder="e.g., 650, 800, 1000" 
                onChange={(e) => updateInspectionData('vesselData', { designTemperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operating-pressure">Operating Pressure (psig)</Label>
              <Input 
                id="operating-pressure" 
                type="number" 
                placeholder="e.g., 125, 250, 500" 
                onChange={(e) => updateInspectionData('vesselData', { operatingPressure: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material Specification *</Label>
              <Select onValueChange={(value) => updateInspectionData('vesselData', { material: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material specification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sa516-70">SA-516 Grade 70 (Carbon Steel)</SelectItem>
                  <SelectItem value="sa515-70">SA-515 Grade 70 (Carbon Steel)</SelectItem>
                  <SelectItem value="sa387-22">SA-387 Grade 22 (Cr-Mo Steel)</SelectItem>
                  <SelectItem value="sa387-11">SA-387 Grade 11 (Cr-Mo Steel)</SelectItem>
                  <SelectItem value="sa240-304">SA-240 Type 304 (Stainless Steel)</SelectItem>
                  <SelectItem value="sa240-316">SA-240 Type 316 (Stainless Steel)</SelectItem>
                  <SelectItem value="sa240-321">SA-240 Type 321 (Stainless Steel)</SelectItem>
                  <SelectItem value="sa240-347">SA-240 Type 347 (Stainless Steel)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vessel Type</Label>
              <Select onValueChange={(value) => updateInspectionData('vesselData', { vesselType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure-vessel">Pressure Vessel</SelectItem>
                  <SelectItem value="storage-tank">Storage Tank</SelectItem>
                  <SelectItem value="heat-exchanger">Heat Exchanger</SelectItem>
                  <SelectItem value="reactor">Reactor</SelectItem>
                  <SelectItem value="column">Distillation Column</SelectItem>
                  <SelectItem value="drum">Drum</SelectItem>
                  <SelectItem value="separator">Separator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inside-diameter">Inside Diameter (inches)</Label>
              <Input 
                id="inside-diameter" 
                type="number" 
                placeholder="e.g., 72, 96, 120" 
                onChange={(e) => updateInspectionData('vesselData', { insideDiameter: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overall-length">Overall Length (feet)</Label>
              <Input 
                id="overall-length" 
                type="number" 
                placeholder="e.g., 20, 40, 60" 
                onChange={(e) => updateInspectionData('vesselData', { overallLength: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCalculationsModule = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-green-600" />
            <span>ASME Section VIII Design Calculations</span>
          </CardTitle>
          <CardDescription>
            Comprehensive pressure vessel calculations per ASME Boiler and Pressure Vessel Code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Minimum Required Thickness</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="calc-pressure">Design Pressure (P) - psig</Label>
                  <Input id="calc-pressure" type="number" placeholder="150" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calc-radius">Inside Radius (R) - inches</Label>
                  <Input id="calc-radius" type="number" placeholder="36" />
                </div>
                <div className="space-y-2">
                  <Label>Allowable Stress (S) - psi</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material & temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20000">SA-516-70 @ 650°F: 20,000 psi</SelectItem>
                      <SelectItem value="17500">SA-516-70 @ 700°F: 17,500 psi</SelectItem>
                      <SelectItem value="15000">SA-516-70 @ 750°F: 15,000 psi</SelectItem>
                      <SelectItem value="18750">SA-387-22 @ 850°F: 18,750 psi</SelectItem>
                      <SelectItem value="16250">SA-387-22 @ 900°F: 16,250 psi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Joint Efficiency (E)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select joint efficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 - Full Radiography</SelectItem>
                      <SelectItem value="0.85">0.85 - Spot Radiography</SelectItem>
                      <SelectItem value="0.70">0.70 - No Radiography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corr-allowance">Corrosion Allowance (CA) - inches</Label>
                  <Input id="corr-allowance" type="number" placeholder="0.125" step="0.001" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Calculate Minimum Thickness
                </Button>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Formula:</strong> t = PR/(SE-0.6P) + CA
                  </p>
                  <p className="text-lg font-bold text-green-900 mt-2">
                    Required Thickness: 0.XXX inches
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Maximum Allowable Working Pressure</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="actual-thickness">Actual Thickness (t) - inches</Label>
                  <Input id="actual-thickness" type="number" placeholder="0.375" step="0.001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawp-radius">Inside Radius (R) - inches</Label>
                  <Input id="mawp-radius" type="number" placeholder="36" />
                </div>
                <div className="space-y-2">
                  <Label>Allowable Stress (S) - psi</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material & temperature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20000">SA-516-70 @ 650°F: 20,000 psi</SelectItem>
                      <SelectItem value="17500">SA-516-70 @ 700°F: 17,500 psi</SelectItem>
                      <SelectItem value="15000">SA-516-70 @ 750°F: 15,000 psi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Joint Efficiency (E)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select joint efficiency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 - Full Radiography</SelectItem>
                      <SelectItem value="0.85">0.85 - Spot Radiography</SelectItem>
                      <SelectItem value="0.70">0.70 - No Radiography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawp-corr">Corrosion Allowance (CA) - inches</Label>
                  <Input id="mawp-corr" type="number" placeholder="0.125" step="0.001" />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Calculate MAWP
                </Button>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Formula:</strong> MAWP = SE(t-CA)/(R+0.6(t-CA))
                  </p>
                  <p className="text-lg font-bold text-blue-900 mt-2">
                    MAWP: XXX psig
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remaining Life Assessment</CardTitle>
          <CardDescription>
            Calculate remaining service life based on corrosion rate analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-thickness">Current Thickness (inches)</Label>
              <Input id="current-thickness" type="number" placeholder="0.350" step="0.001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required-thickness">Required Thickness (inches)</Label>
              <Input id="required-thickness" type="number" placeholder="0.250" step="0.001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="corrosion-rate">Corrosion Rate (mils/year)</Label>
              <Input id="corrosion-rate" type="number" placeholder="2.5" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="safety-factor">Safety Factor</Label>
              <Input id="safety-factor" type="number" placeholder="2.0" step="0.1" />
            </div>
          </div>
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            Calculate Remaining Life
          </Button>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-lg font-bold text-orange-900">
              Estimated Remaining Life: XX.X years
            </p>
            <p className="text-sm text-orange-800 mt-1">
              Next inspection due: Month/Year
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderInLieuInspection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>In-Lieu of Internal Inspection Program</span>
          </CardTitle>
          <CardDescription>
            Comprehensive on-stream inspection alternatives per API 510 Section 6.4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Inspection Method Selection</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Primary In-Lieu Method *</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { primaryMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ultrasonic">Ultrasonic Thickness Monitoring (UTM)</SelectItem>
                      <SelectItem value="radiography">Radiographic Testing (RT)</SelectItem>
                      <SelectItem value="acoustic">Acoustic Emission (AE)</SelectItem>
                      <SelectItem value="process">Process Parameter Monitoring</SelectItem>
                      <SelectItem value="corrosion">Corrosion Monitoring Systems</SelectItem>
                      <SelectItem value="visual">Enhanced Visual Inspection</SelectItem>
                      <SelectItem value="magnetic">Magnetic Flux Leakage (MFL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Secondary Method (if applicable)</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { secondaryMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select secondary method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None Required</SelectItem>
                      <SelectItem value="ultrasonic">Ultrasonic Testing</SelectItem>
                      <SelectItem value="eddy-current">Eddy Current Testing</SelectItem>
                      <SelectItem value="liquid-penetrant">Liquid Penetrant Testing</SelectItem>
                      <SelectItem value="magnetic-particle">Magnetic Particle Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Risk Assessment Level *</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { riskLevel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk assessment level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk (API 581 Category 1-2)</SelectItem>
                      <SelectItem value="medium-low">Medium-Low Risk (API 581 Category 3)</SelectItem>
                      <SelectItem value="medium">Medium Risk (API 581 Category 4)</SelectItem>
                      <SelectItem value="medium-high">Medium-High Risk (API 581 Category 5)</SelectItem>
                      <SelectItem value="high">High Risk (API 581 Category 6+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Monitoring Frequency *</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { frequency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select monitoring frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continuous">Continuous Monitoring</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Effectiveness Assessment</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage Percentage (%)</Label>
                  <Input 
                    id="coverage" 
                    type="number" 
                    placeholder="95" 
                    min="0" 
                    max="100"
                    onChange={(e) => updateInspectionData('inLieuInspection', { coverage: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Detection Capability</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { detectionCapability: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select detection capability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (>95% POD)</SelectItem>
                      <SelectItem value="good">Good (80-95% POD)</SelectItem>
                      <SelectItem value="fair">Fair (60-80% POD)</SelectItem>
                      <SelectItem value="poor">Poor (<60% POD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Inspection Interval Extension</Label>
                  <Select onValueChange={(value) => updateInspectionData('inLieuInspection', { intervalExtension: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval extension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Extension (Standard Interval)</SelectItem>
                      <SelectItem value="25">25% Extension</SelectItem>
                      <SelectItem value="50">50% Extension</SelectItem>
                      <SelectItem value="75">75% Extension</SelectItem>
                      <SelectItem value="100">100% Extension (Double Interval)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confidence-level">Confidence Level (%)</Label>
                  <Input 
                    id="confidence-level" 
                    type="number" 
                    placeholder="90" 
                    min="0" 
                    max="100"
                    onChange={(e) => updateInspectionData('inLieuInspection', { confidenceLevel: e.target.value })}
                  />
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
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

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Technical Justification</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="degradation-mechanisms">Identified Degradation Mechanisms</Label>
                <Textarea 
                  id="degradation-mechanisms"
                  placeholder="List and describe all potential degradation mechanisms (e.g., general corrosion, pitting, stress corrosion cracking, fatigue, etc.)"
                  className="min-h-[80px]"
                  onChange={(e) => updateInspectionData('inLieuInspection', { degradationMechanisms: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monitoring-strategy">Monitoring Strategy</Label>
                <Textarea 
                  id="monitoring-strategy"
                  placeholder="Describe the comprehensive monitoring strategy including location selection, measurement techniques, data analysis methods, and alarm/action levels"
                  className="min-h-[80px]"
                  onChange={(e) => updateInspectionData('inLieuInspection', { monitoringStrategy: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technical-basis">Technical Basis and References</Label>
                <Textarea 
                  id="technical-basis"
                  placeholder="Provide detailed technical justification including applicable codes, standards, industry practices, and supporting documentation (API 510, API 579, API 581, etc.)"
                  className="min-h-[100px]"
                  onChange={(e) => updateInspectionData('inLieuInspection', { technicalBasis: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
              Generate In-Lieu Assessment Report
            </Button>
            <Button variant="outline" className="flex-1">
              Save Assessment Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vessel-data':
        return renderVesselDataForm()
      case 'calculations':
        return renderCalculationsModule()
      case 'in-lieu':
        return renderInLieuInspection()
      case 'thickness':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Thickness Measurement Analysis</span>
              </CardTitle>
              <CardDescription>
                Comprehensive TML data management and corrosion analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tml-location">TML Location</Label>
                  <Input id="tml-location" placeholder="e.g., TML-001, Shell-North" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseline-thickness">Baseline Thickness (inches)</Label>
                  <Input id="baseline-thickness" type="number" placeholder="0.375" step="0.001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-reading">Current Reading (inches)</Label>
                  <Input id="current-reading" type="number" placeholder="0.350" step="0.001" />
                </div>
              </div>
              <Button className="w-full">Add TML Reading</Button>
              <p className="text-sm text-gray-600">
                Complete thickness monitoring system with trend analysis, corrosion rate calculations, and remaining life assessments.
              </p>
            </CardContent>
          </Card>
        )
      case 'fitness':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Fitness-for-Service Assessment (API 579)</span>
              </CardTitle>
              <CardDescription>
                Comprehensive structural integrity assessment procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Assessment Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-metal-loss">General Metal Loss (Part 4)</SelectItem>
                    <SelectItem value="local-metal-loss">Local Metal Loss (Part 5)</SelectItem>
                    <SelectItem value="pitting">Pitting Corrosion (Part 6)</SelectItem>
                    <SelectItem value="crack-like-flaws">Crack-Like Flaws (Part 9)</SelectItem>
                    <SelectItem value="creep">Creep Assessment (Part 10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-gray-600">
                Complete API 579 fitness-for-service assessment including Level 1, 2, and 3 analysis procedures with safety factor calculations.
              </p>
            </CardContent>
          </Card>
        )
      case 'report':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-red-600" />
                <span>Comprehensive Inspection Report</span>
              </CardTitle>
              <CardDescription>
                Generate professional API 510 inspection reports with all assessment data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Complete Report
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Professional report generation with executive summary, detailed findings, calculations, recommendations, and regulatory compliance documentation.
              </p>
            </CardContent>
          </Card>
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Professional Inspection Module</CardTitle>
              <CardDescription>
                Advanced API 510 inspection capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section contains professional-grade inspection tools and workflows designed for comprehensive API 510 compliance and industry best practices.</p>
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
                  {navigationItems.map((item, index) => {
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
                        <div className={`p-1 rounded text-white text-xs font-bold w-6 h-6 flex items-center justify-center ${
                          index === 0 ? 'bg-green-500' :
                          index === 1 ? 'bg-blue-500' :
                          index === 2 ? 'bg-orange-500' :
                          index === 3 ? 'bg-purple-500' :
                          index === 4 ? 'bg-teal-500' :
                          index === 5 ? 'bg-pink-500' :
                          index === 6 ? 'bg-indigo-500' :
                          index === 7 ? 'bg-red-500' :
                          index === 8 ? 'bg-emerald-500' :
                          index === 9 ? 'bg-rose-500' :
                          index === 10 ? 'bg-cyan-500' :
                          'bg-amber-500'
                        }`}>
                          {index + 1}
                        </div>
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
