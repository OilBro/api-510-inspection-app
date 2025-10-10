import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Search, Eye, AlertTriangle, CheckCircle, Camera, FileText } from 'lucide-react'

export default function ExternalInspection({ data, onDataChange }) {
  const [inspectionData, setInspectionData] = useState({
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    weather: '',
    temperature: '',
    ...data.externalInspection
  })

  const [visualFindings, setVisualFindings] = useState(data.visualFindings || [])
  const [newFinding, setNewFinding] = useState({
    location: '',
    finding: '',
    severity: '',
    description: '',
    recommendation: ''
  })

  const [checklist, setChecklist] = useState({
    nameplate: false,
    supports: false,
    insulation: false,
    painting: false,
    corrosion: false,
    deformation: false,
    leakage: false,
    vibration: false,
    nozzles: false,
    manways: false,
    reliefDevices: false,
    instrumentation: false,
    ...data.externalChecklist
  })

  const severityLevels = [
    'Minor',
    'Moderate', 
    'Major',
    'Critical'
  ]

  const findingTypes = [
    'Corrosion',
    'Cracking',
    'Deformation',
    'Leakage',
    'Insulation Damage',
    'Support Issues',
    'Coating Failure',
    'Vibration',
    'Other'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      externalInspection: inspectionData,
      visualFindings,
      externalChecklist: checklist
    })
  }, [inspectionData, visualFindings, checklist, data, onDataChange])

  const addFinding = () => {
    if (newFinding.location && newFinding.finding) {
      setVisualFindings([...visualFindings, { ...newFinding, id: Date.now() }])
      setNewFinding({
        location: '',
        finding: '',
        severity: '',
        description: '',
        recommendation: ''
      })
    }
  }

  const removeFinding = (id) => {
    setVisualFindings(visualFindings.filter(f => f.id !== id))
  }

  const updateChecklist = (item, checked) => {
    setChecklist(prev => ({ ...prev, [item]: checked }))
  }

  const getCompletionPercentage = () => {
    const totalItems = Object.keys(checklist).length
    const completedItems = Object.values(checklist).filter(Boolean).length
    return Math.round((completedItems / totalItems) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-green-900">External Visual Inspection</CardTitle>
              <CardDescription className="text-green-700">
                Comprehensive external inspection per API 510 Section 6.2
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inspection Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Inspection Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspector">Inspector</Label>
              <Input
                id="inspector"
                value={inspectionData.inspector}
                onChange={(e) => setInspectionData(prev => ({ ...prev, inspector: e.target.value }))}
                placeholder="Inspector name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inspection-date">Inspection Date</Label>
              <Input
                id="inspection-date"
                type="date"
                value={inspectionData.inspectionDate}
                onChange={(e) => setInspectionData(prev => ({ ...prev, inspectionDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather">Weather Conditions</Label>
              <Select 
                value={inspectionData.weather} 
                onValueChange={(value) => setInspectionData(prev => ({ ...prev, weather: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rain">Rain</SelectItem>
                  <SelectItem value="fog">Fog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                value={inspectionData.temperature}
                onChange={(e) => setInspectionData(prev => ({ ...prev, temperature: e.target.value }))}
                placeholder="e.g., 75"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>External Inspection Checklist</span>
            <Badge variant="outline" className="ml-auto">
              {getCompletionPercentage()}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Systematic external inspection per API 510 requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              nameplate: 'Nameplate & Markings',
              supports: 'Supports & Foundations',
              insulation: 'Insulation & Fireproofing',
              painting: 'Protective Coating',
              corrosion: 'External Corrosion',
              deformation: 'Deformation & Distortion',
              leakage: 'Leakage',
              vibration: 'Vibration & Movement',
              nozzles: 'Nozzles & Connections',
              manways: 'Manways & Access',
              reliefDevices: 'Relief Devices',
              instrumentation: 'Instrumentation'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={checklist[key]}
                  onCheckedChange={(checked) => updateChecklist(key, checked)}
                />
                <Label htmlFor={key} className="text-sm">{label}</Label>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Inspection Progress</span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Visual Findings</span>
          </CardTitle>
          <CardDescription>
            Document any defects, damage, or areas of concern
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Finding */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-slate-900">Add New Finding</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finding-location">Location</Label>
                <Input
                  id="finding-location"
                  value={newFinding.location}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Shell bottom, 6 o'clock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding-type">Finding Type</Label>
                <Select 
                  value={newFinding.finding} 
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, finding: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select finding type" />
                  </SelectTrigger>
                  <SelectContent>
                    {findingTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding-severity">Severity</Label>
                <Select 
                  value={newFinding.severity} 
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityLevels.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="finding-description">Description</Label>
                <Textarea
                  id="finding-description"
                  value={newFinding.description}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the finding"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finding-recommendation">Recommendation</Label>
                <Textarea
                  id="finding-recommendation"
                  value={newFinding.recommendation}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, recommendation: e.target.value }))}
                  placeholder="Recommended action or follow-up"
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={addFinding} className="bg-orange-600 hover:bg-orange-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Add Finding
            </Button>
          </div>

          {/* Findings List */}
          {visualFindings.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Documented Findings</h4>
              {visualFindings.map((finding) => (
                <Card key={finding.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{finding.finding}</Badge>
                          <Badge 
                            className={
                              finding.severity === 'Critical' ? 'bg-red-100 text-red-800 border-red-300' :
                              finding.severity === 'Major' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                              finding.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Location:</span>
                            <p className="text-slate-600">{finding.location}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Description:</span>
                            <p className="text-slate-600">{finding.description}</p>
                          </div>
                        </div>

                        {finding.recommendation && (
                          <div className="mt-3">
                            <span className="font-medium text-slate-700">Recommendation:</span>
                            <p className="text-slate-600 text-sm mt-1">{finding.recommendation}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFinding(finding.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Summary */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>External Inspection Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Checklist Completion</h4>
              <div className="text-2xl font-bold text-green-600">{getCompletionPercentage()}%</div>
              <p className="text-sm text-green-700">
                {Object.values(checklist).filter(Boolean).length} of {Object.keys(checklist).length} items completed
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Total Findings</h4>
              <div className="text-2xl font-bold text-orange-600">{visualFindings.length}</div>
              <p className="text-sm text-orange-700">
                {visualFindings.filter(f => f.severity === 'Critical' || f.severity === 'Major').length} require immediate attention
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Overall Status</h4>
              <div className="text-lg font-medium text-blue-600">
                {visualFindings.filter(f => f.severity === 'Critical').length > 0 ? 'Critical Issues Found' :
                 visualFindings.filter(f => f.severity === 'Major').length > 0 ? 'Major Issues Found' :
                 visualFindings.length > 0 ? 'Minor Issues Found' : 'No Issues Found'}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">API 510 External Inspection Requirements</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Visual inspection of all accessible external surfaces</p>
              <p>• Verification of nameplate and marking legibility</p>
              <p>• Assessment of supports, foundations, and structural attachments</p>
              <p>• Evaluation of protective coatings and insulation</p>
              <p>• Detection of external corrosion, cracking, or deformation</p>
              <p>• Inspection of all external connections and attachments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
