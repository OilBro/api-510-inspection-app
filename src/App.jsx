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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span>Vessel Data & Specifications</span>
              </CardTitle>
              <CardDescription>
                Enter basic vessel information and operating parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Vessel data form will be implemented here.</p>
            </CardContent>
          </Card>
        )
      case 'calculations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-600" />
                <span>Engineering Calculations</span>
              </CardTitle>
              <CardDescription>
                Perform ASME and API standard calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Calculation modules will be implemented here.</p>
            </CardContent>
          </Card>
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
