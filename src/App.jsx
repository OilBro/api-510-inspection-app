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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Name/Description *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Reactor Feed Drum, Distillation Tower"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Chicago Bridge & Iron, Babcock & Wilcox"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1995"
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Design Temperature (°F) *</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 650, 800, 1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operating Pressure (psig)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 125, 250, 500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Specification *</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
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
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overall Length (feet)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 20, 40, 60"
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inside Radius (R) - inches</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="36"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowable Stress (S) - psi</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
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
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
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
                      />
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                      Calculate Minimum Thickness
                    </button>
                    <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                      <p className="text-sm text-green-800 mb-2">
                        <strong>Formula:</strong> t = PR/(SE-0.6P) + CA
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        Required Thickness: 0.XXX inches
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Inside Radius (R) - inches</label>
                      <input 
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="36"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowable Stress (S) - psi</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select material & temperature</option>
                        <option value="20000">SA-516-70 @ 650°F: 20,000 psi</option>
                        <option value="17500">SA-516-70 @ 700°F: 17,500 psi</option>
                        <option value="15000">SA-516-70 @ 750°F: 15,000 psi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Joint Efficiency (E)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Calculate MAWP
                    </button>
                    <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Formula:</strong> MAWP = SE(t-CA)/(R+0.6(t-CA))
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        MAWP: XXX psig
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Required Thickness (inches)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Corrosion Rate (mils/year)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Safety Factor</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="2.0"
                    />
                  </div>
                </div>
                <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors mt-4">
                  Calculate Remaining Life
                </button>
                <div className="p-4 bg-orange-100 rounded-lg border border-orange-300 mt-4">
                  <p className="text-lg font-bold text-orange-900">
                    Estimated Remaining Life: XX.X years
                  </p>
                  <p className="text-sm text-orange-800 mt-1">
                    Next inspection due: Month/Year
                  </p>
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
