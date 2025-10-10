import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
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

// Import components
import VesselDataForm from './components/VesselDataForm.jsx'
import InspectionPlanning from './components/InspectionPlanning.jsx'
import ExternalInspection from './components/ExternalInspection.jsx'
import InternalInspection from './components/InternalInspection.jsx'
import InLieuInspection from './components/InLieuInspection.jsx'
import ThicknessAnalysis from './components/ThicknessAnalysis.jsx'
import FitnessForService from './components/FitnessForService.jsx'
import RepairsAlterations from './components/RepairsAlterations.jsx'
import PressureTesting from './components/PressureTesting.jsx'
import PressureReliefDevices from './components/PressureReliefDevices.jsx'
import CalculationModules from './components/CalculationModules.jsx'
import InspectionReport from './components/InspectionReport.jsx'

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
    inspectionReport: {}
  })

  const handleDataChange = (section, data) => {
    setInspectionData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const navigationItems = [
    { id: 'vessel-data', label: 'Vessel Data', icon: Database, description: 'Basic vessel information and design parameters' },
    { id: 'calculations', label: 'Calculations', icon: Calculator, description: 'Engineering calculations and formulas' },
    { id: 'thickness-analysis', label: 'Thickness Analysis', icon: BarChart3, description: 'TML data and corrosion rate calculations' },
    { id: 'external-inspection', label: 'External Inspection', icon: Search, description: 'Visual inspection and external assessment' },
    { id: 'internal-inspection', label: 'Internal Inspection', icon: Settings, description: 'Internal visual and damage mechanism assessment' },
    { id: 'in-lieu-inspection', label: 'In-Lieu Inspection', icon: Eye, description: 'On-stream inspection alternative' },
    { id: 'fitness-for-service', label: 'Fitness-for-Service', icon: AlertTriangle, description: 'FFS assessment per API 579' },
    { id: 'repairs-alterations', label: 'Repairs & Alterations', icon: Wrench, description: 'Repair documentation and procedures' },
    { id: 'pressure-testing', label: 'Pressure Testing', icon: Droplets, description: 'Hydrostatic and pneumatic testing' },
    { id: 'pressure-relief', label: 'Pressure Relief Devices', icon: Shield, description: 'Relief device inspection and testing' },
    { id: 'inspection-planning', label: 'Inspection Planning', icon: ClipboardCheck, description: 'RBI assessment and interval determination' },
    { id: 'reports', label: 'Inspection Report', icon: FileText, description: 'Generate comprehensive inspection reports' }
  ]

  const getCompletionStatus = (tabId) => {
    const sectionKey = tabId === 'vessel-data' ? 'vesselData' : 
                      tabId === 'external-inspection' ? 'externalInspection' :
                      tabId === 'internal-inspection' ? 'internalInspection' :
                      tabId === 'in-lieu-inspection' ? 'inLieuInspection' :
                      tabId === 'fitness-for-service' ? 'fitnessForService' :
                      tabId === 'repairs-alterations' ? 'repairsAlterations' :
                      tabId === 'pressure-testing' ? 'pressureTesting' :
                      tabId === 'pressure-relief' ? 'reliefDevices' :
                      tabId === 'inspection-planning' ? 'inspectionPlanning' :
                      tabId === 'reports' ? 'inspectionReport' :
                      tabId === 'thickness-analysis' ? 'thicknessData' :
                      tabId
    
    const data = inspectionData[sectionKey]
    if (!data || Object.keys(data).length === 0) return 'empty'
    
    const requiredFields = getRequiredFields(tabId)
    const completedFields = requiredFields.filter(field => {
      const value = getNestedValue(data, field)
      return value !== undefined && value !== null && value !== ''
    })
    
    const completionRate = completedFields.length / requiredFields.length
    
    if (completionRate === 1) return 'complete'
    if (completionRate > 0.5) return 'partial'
    if (completionRate > 0) return 'started'
    return 'empty'
  }

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const getRequiredFields = (tabId) => {
    switch (tabId) {
      case 'vessel-data':
        return ['vesselTag', 'description', 'mawp', 'designTemperature']
      case 'calculations':
        return ['minimumThickness', 'remainingLife']
      case 'thickness-analysis':
        return ['tmlData']
      case 'external-inspection':
        return ['inspector', 'inspectionDate']
      case 'internal-inspection':
        return ['inspector', 'inspectionDate']
      case 'in-lieu-inspection':
        return ['applicability']
      case 'fitness-for-service':
        return ['assessmentType']
      case 'repairs-alterations':
        return []
      case 'pressure-testing':
        return []
      case 'pressure-relief':
        return []
      case 'inspection-planning':
        return ['nextInspectionDate']
      case 'reports':
        return ['reportNumber', 'inspector']
      default:
        return []
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'started':
        return <Settings className="h-4 w-4 text-blue-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
    }
  }

  const calculateOverallProgress = () => {
    const statuses = navigationItems.map(item => getCompletionStatus(item.id))
    const weights = { complete: 1, partial: 0.7, started: 0.3, empty: 0 }
    const totalWeight = statuses.reduce((sum, status) => sum + weights[status], 0)
    return Math.round((totalWeight / navigationItems.length) * 100)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'vessel-data':
        return <VesselDataForm data={inspectionData} onDataChange={(data) => handleDataChange('vesselData', data)} />
      case 'calculations':
        return <CalculationModules data={inspectionData} onDataChange={(data) => handleDataChange('calculations', data)} />
      case 'thickness-analysis':
        return <ThicknessAnalysis data={inspectionData} onDataChange={(data) => handleDataChange('thicknessData', data)} />
      case 'external-inspection':
        return <ExternalInspection data={inspectionData} onDataChange={(data) => handleDataChange('externalInspection', data)} />
      case 'internal-inspection':
        return <InternalInspection data={inspectionData} onDataChange={(data) => handleDataChange('internalInspection', data)} />
      case 'in-lieu-inspection':
        return <InLieuInspection data={inspectionData} onDataChange={(data) => handleDataChange('inLieuInspection', data)} />
      case 'fitness-for-service':
        return <FitnessForService data={inspectionData} onDataChange={(data) => handleDataChange('fitnessForService', data)} />
      case 'repairs-alterations':
        return <RepairsAlterations data={inspectionData} onDataChange={(data) => handleDataChange('repairsAlterations', data)} />
      case 'pressure-testing':
        return <PressureTesting data={inspectionData} onDataChange={(data) => handleDataChange('pressureTesting', data)} />
      case 'pressure-relief':
        return <PressureReliefDevices data={inspectionData} onDataChange={(data) => handleDataChange('reliefDevices', data)} />
      case 'inspection-planning':
        return <InspectionPlanning data={inspectionData} onDataChange={(data) => handleDataChange('inspectionPlanning', data)} />
      case 'reports':
        return <InspectionReport data={inspectionData} onDataChange={(data) => handleDataChange('inspectionReport', data)} />
      default:
        return <VesselDataForm data={inspectionData} onDataChange={(data) => handleDataChange('vesselData', data)} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">API 510 Inspection App</h1>
                <p className="text-slate-600">Professional Pressure Vessel Inspection Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-4 w-4 mr-1" />
                API 510 Compliant
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Inspection Workflow</CardTitle>
                <CardDescription>Navigate through the inspection process</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const status = getCompletionStatus(item.id)
                    const isActive = activeTab === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-start space-x-3 hover:bg-slate-50 ${
                          isActive
                            ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700' 
                            : 'text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 leading-tight">
                            {item.description}
                          </div>
                        </div>
                        {getStatusIcon(status)}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Progress Indicator */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Inspection Progress</h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Current Section: {navigationItems.find(item => item.id === activeTab)?.label}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-blue-900 font-medium">
                        {calculateOverallProgress()}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${calculateOverallProgress()}%` 
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Content */}
              <div className="animate-fadeIn">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
