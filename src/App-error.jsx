import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
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
    { id: 'vessel-data', label: 'Vessel Data', icon: Database, description: 'Basic vessel information and specifications', status: 'active' },
    { id: 'calculations', label: 'Calculations', icon: Calculator, description: 'Engineering calculations and assessments', status: 'pending' },
    { id: 'thickness', label: 'Thickness Analysis', icon: BarChart3, description: 'TML data and corrosion analysis', status: 'pending' },
    { id: 'external', label: 'External Inspection', icon: Eye, description: 'Visual inspection findings', status: 'pending' },
    { id: 'internal', label: 'Internal Inspection', icon: Search, description: 'Internal assessment results', status: 'pending' },
    { id: 'in-lieu', label: 'In-Lieu Inspection', icon: Shield, description: 'On-stream inspection alternatives', status: 'pending' },
    { id: 'fitness', label: 'Fitness-for-Service', icon: CheckCircle, description: 'API 579 assessments', status: 'pending' },
    { id: 'repairs', label: 'Repairs & Alterations', icon: Wrench, description: 'Modification documentation', status: 'pending' },
    { id: 'testing', label: 'Pressure Testing', icon: Gauge, description: 'Hydrostatic and pneumatic tests', status: 'pending' },
    { id: 'relief', label: 'Relief Devices', icon: Droplets, description: 'Pressure relief valve inspection', status: 'pending' },
    { id: 'planning', label: 'Inspection Planning', icon: ClipboardCheck, description: 'Interval calculations and scheduling', status: 'pending' },
    { id: 'report', label: 'Inspection Report', icon: FileText, description: 'Generate comprehensive reports', status: 'pending' }
  ]

  const updateInspectionData = (section, data) => {
    setInspectionData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  const calculateProgress = () => {
    const totalSections = navigationItems.length
    const completedSections = Object.values(inspectionData).filter(section => 
      Object.keys(section).length > 0
    ).length
    return Math.round((completedSections / totalSections) * 100)
  }

  const renderVesselDataForm = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Vessel Identification</span>
          </CardTitle>
          <CardDescription>
            Basic vessel information and identification data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel-tag">Vessel Tag Number</Label>
              <Input 
                id="vessel-tag" 
                placeholder="e.g., V-101" 
                onChange={(e) => updateInspectionData('vesselData', { vesselTag: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vessel-name">Vessel Name/Description</Label>
              <Input 
                id="vessel-name" 
                placeholder="e.g., Reactor Feed Drum" 
                onChange={(e) => updateInspectionData('vesselData', { vesselName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input 
                id="manufacturer" 
                placeholder="e.g., Chicago Bridge & Iron" 
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Specifications</CardTitle>
          <CardDescription>
            Design pressure, temperature, and material specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="design-pressure">Design Pressure (psig)</Label>
              <Input 
                id="design-pressure" 
                type="number" 
                placeholder="e.g., 150" 
                onChange={(e) => updateInspectionData('vesselData', { designPressure: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="design-temp">Design Temperature (°F)</Label>
              <Input 
                id="design-temp" 
                type="number" 
                placeholder="e.g., 650" 
                onChange={(e) => updateInspectionData('vesselData', { designTemperature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material">Material Specification</Label>
              <Select onValueChange={(value) => updateInspectionData('vesselData', { material: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sa516-70">SA-516 Grade 70</SelectItem>
                  <SelectItem value="sa515-70">SA-515 Grade 70</SelectItem>
                  <SelectItem value="sa387-22">SA-387 Grade 22</SelectItem>
                  <SelectItem value="sa240-304">SA-240 Type 304</SelectItem>
                  <SelectItem value="sa240-316">SA-240 Type 316</SelectItem>
                </SelectContent>
              </Select>
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
            <span>ASME Section VIII Calculations</span>
          </CardTitle>
          <CardDescription>
            Pressure vessel design and assessment calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Minimum Thickness Calculation</h4>
              <div className="space-y-2">
                <Label htmlFor="radius">Inside Radius (inches)</Label>
                <Input id="radius" type="number" placeholder="e.g., 36" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowable-stress">Allowable Stress (psi)</Label>
                <Input id="allowable-stress" type="number" placeholder="e.g., 20000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joint-efficiency">Joint Efficiency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select efficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.0">1.0 (Full RT)</SelectItem>
                    <SelectItem value="0.85">0.85 (Spot RT)</SelectItem>
                    <SelectItem value="0.70">0.70 (No RT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Calculate Minimum Thickness</Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">MAWP Calculation</h4>
              <div className="space-y-2">
                <Label htmlFor="actual-thickness">Actual Thickness (inches)</Label>
                <Input id="actual-thickness" type="number" placeholder="e.g., 0.375" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corrosion-allowance">Corrosion Allowance (inches)</Label>
                <Input id="corrosion-allowance" type="number" placeholder="e.g., 0.125" />
              </div>
              <Button className="w-full">Calculate MAWP</Button>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Result:</strong> MAWP will be calculated based on current thickness
                </p>
              </div>
            </div>
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
            <span>In-Lieu of Internal Inspection Assessment</span>
          </CardTitle>
          <CardDescription>
            On-stream inspection alternatives and risk-based assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Inspection Method Selection</h4>
              <div className="space-y-2">
                <Label>Primary In-Lieu Method</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultrasonic">Ultrasonic Thickness Monitoring</SelectItem>
                    <SelectItem value="radiography">Radiographic Testing</SelectItem>
                    <SelectItem value="acoustic">Acoustic Emission</SelectItem>
                    <SelectItem value="process">Process Monitoring</SelectItem>
                    <SelectItem value="corrosion">Corrosion Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Risk Assessment Level</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitoring-frequency">Monitoring Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Effectiveness Assessment</h4>
              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Percentage (%)</Label>
                <Input id="coverage" type="number" placeholder="e.g., 95" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="detection-capability">Detection Capability</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select capability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (>95%)</SelectItem>
                    <SelectItem value="good">Good (80-95%)</SelectItem>
                    <SelectItem value="fair">Fair (60-80%)</SelectItem>
                    <SelectItem value="poor">Poor (<60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">Assessment Result</h5>
                <p className="text-sm text-green-700">
                  Based on the selected criteria, this in-lieu inspection program 
                  provides adequate coverage for the identified risk level.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Justification Documentation</h4>
            <Textarea 
              placeholder="Provide detailed justification for in-lieu inspection program including technical basis, risk assessment results, and monitoring program effectiveness..."
              className="min-h-[100px]"
            />
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
                TML data entry and corrosion rate calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Comprehensive thickness analysis module with TML data management, corrosion rate calculations, and remaining life assessments.</p>
            </CardContent>
          </Card>
        )
      case 'fitness':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Fitness-for-Service Assessment</span>
              </CardTitle>
              <CardDescription>
                API 579 assessment procedures and calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Complete API 579 fitness-for-service assessment including general metal loss, local metal loss, and crack assessment procedures.</p>
            </CardContent>
          </Card>
        )
      case 'report':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-red-600" />
                <span>Inspection Report Generation</span>
              </CardTitle>
              <CardDescription>
                Generate comprehensive API 510 inspection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full">Generate Complete Report</Button>
                <Button variant="outline" className="w-full">Export to PDF</Button>
                <Button variant="outline" className="w-full">Export to Excel</Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Professional Module</CardTitle>
              <CardDescription>
                Advanced inspection capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>This section contains professional-grade inspection tools and workflows designed for API 510 compliance.</p>
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
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Progress</p>
                <Progress value={calculateProgress()} className="w-24" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Professional Edition
              </Badge>
            </div>
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
