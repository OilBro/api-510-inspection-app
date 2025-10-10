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
import { Settings, Eye, AlertTriangle, CheckCircle, Microscope, FileText } from 'lucide-react'

export default function InternalInspection({ data, onDataChange }) {
  const [inspectionData, setInspectionData] = useState({
    inspector: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    entryMethod: '',
    cleaningMethod: '',
    lightingAdequate: false,
    ventilationAdequate: false,
    ...data.internalInspection
  })

  const [internalFindings, setInternalFindings] = useState(data.internalFindings || [])
  const [newFinding, setNewFinding] = useState({
    location: '',
    damageMechanism: '',
    severity: '',
    description: '',
    dimensions: '',
    recommendation: ''
  })

  const [checklist, setChecklist] = useState({
    generalCorrosion: false,
    localizedCorrosion: false,
    cracking: false,
    erosion: false,
    deformation: false,
    weldIntegrity: false,
    internalAttachments: false,
    nozzleIntegrity: false,
    manwayIntegrity: false,
    internalCoating: false,
    deposits: false,
    foreignObjects: false,
    ...data.internalChecklist
  })

  const entryMethods = [
    'Manway',
    'Handhole',
    'Nozzle',
    'Cut Opening',
    'Other'
  ]

  const cleaningMethods = [
    'Water Washing',
    'Steam Cleaning',
    'Chemical Cleaning',
    'Mechanical Cleaning',
    'Hydroblasting',
    'Sandblasting',
    'Other'
  ]

  const damageMechanisms = [
    'General Corrosion',
    'Pitting Corrosion',
    'Crevice Corrosion',
    'Galvanic Corrosion',
    'Stress Corrosion Cracking',
    'Hydrogen Induced Cracking',
    'Fatigue Cracking',
    'Erosion',
    'Erosion-Corrosion',
    'High Temperature Damage',
    'Thermal Fatigue',
    'Mechanical Damage'
  ]

  const severityLevels = [
    'Minor',
    'Moderate',
    'Major', 
    'Critical'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      internalInspection: inspectionData,
      internalFindings,
      internalChecklist: checklist
    })
  }, [inspectionData, internalFindings, checklist, data, onDataChange])

  const addFinding = () => {
    if (newFinding.location && newFinding.damageMechanism) {
      setInternalFindings([...internalFindings, { ...newFinding, id: Date.now() }])
      setNewFinding({
        location: '',
        damageMechanism: '',
        severity: '',
        description: '',
        dimensions: '',
        recommendation: ''
      })
    }
  }

  const removeFinding = (id) => {
    setInternalFindings(internalFindings.filter(f => f.id !== id))
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
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle className="text-purple-900">Internal Inspection</CardTitle>
              <CardDescription className="text-purple-700">
                Comprehensive internal inspection per API 510 Section 6.3
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Inspection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Inspection Setup & Preparation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <Label htmlFor="entry-method">Entry Method</Label>
              <Select 
                value={inspectionData.entryMethod} 
                onValueChange={(value) => setInspectionData(prev => ({ ...prev, entryMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entry method" />
                </SelectTrigger>
                <SelectContent>
                  {entryMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaning-method">Cleaning Method</Label>
              <Select 
                value={inspectionData.cleaningMethod} 
                onValueChange={(value) => setInspectionData(prev => ({ ...prev, cleaningMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cleaning method" />
                </SelectTrigger>
                <SelectContent>
                  {cleaningMethods.map((method) => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lighting-adequate"
                checked={inspectionData.lightingAdequate}
                onCheckedChange={(checked) => setInspectionData(prev => ({ ...prev, lightingAdequate: checked }))}
              />
              <Label htmlFor="lighting-adequate">Adequate lighting provided for inspection</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ventilation-adequate"
                checked={inspectionData.ventilationAdequate}
                onCheckedChange={(checked) => setInspectionData(prev => ({ ...prev, ventilationAdequate: checked }))}
              />
              <Label htmlFor="ventilation-adequate">Adequate ventilation and safety measures in place</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Inspection Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Internal Inspection Checklist</span>
            <Badge variant="outline" className="ml-auto">
              {getCompletionPercentage()}% Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Systematic internal inspection per API 510 requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries({
              generalCorrosion: 'General Corrosion',
              localizedCorrosion: 'Localized Corrosion',
              cracking: 'Cracking',
              erosion: 'Erosion',
              deformation: 'Deformation',
              weldIntegrity: 'Weld Integrity',
              internalAttachments: 'Internal Attachments',
              nozzleIntegrity: 'Nozzle Integrity',
              manwayIntegrity: 'Manway Integrity',
              internalCoating: 'Internal Coating',
              deposits: 'Deposits/Scale',
              foreignObjects: 'Foreign Objects'
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

          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Inspection Progress</span>
            </div>
            <div className="mt-2 bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Internal Findings</span>
          </CardTitle>
          <CardDescription>
            Document damage mechanisms and internal conditions
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
                <Label htmlFor="damage-mechanism">Damage Mechanism</Label>
                <Select 
                  value={newFinding.damageMechanism} 
                  onValueChange={(value) => setNewFinding(prev => ({ ...prev, damageMechanism: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select damage mechanism" />
                  </SelectTrigger>
                  <SelectContent>
                    {damageMechanisms.map((mechanism) => (
                      <SelectItem key={mechanism} value={mechanism}>{mechanism}</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="finding-dimensions">Dimensions</Label>
                <Input
                  id="finding-dimensions"
                  value={newFinding.dimensions}
                  onChange={(e) => setNewFinding(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g., 2 in x 1 in x 0.1 in deep"
                />
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
          {internalFindings.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Documented Findings</h4>
              {internalFindings.map((finding) => (
                <Card key={finding.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{finding.damageMechanism}</Badge>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Location:</span>
                            <p className="text-slate-600">{finding.location}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Dimensions:</span>
                            <p className="text-slate-600">{finding.dimensions || 'Not specified'}</p>
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
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-600" />
            <span>Internal Inspection Summary</span>
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
              <div className="text-2xl font-bold text-orange-600">{internalFindings.length}</div>
              <p className="text-sm text-orange-700">
                {internalFindings.filter(f => f.severity === 'Critical' || f.severity === 'Major').length} require immediate attention
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Overall Condition</h4>
              <div className="text-lg font-medium text-purple-600">
                {internalFindings.filter(f => f.severity === 'Critical').length > 0 ? 'Critical Issues Found' :
                 internalFindings.filter(f => f.severity === 'Major').length > 0 ? 'Major Issues Found' :
                 internalFindings.length > 0 ? 'Minor Issues Found' : 'Good Condition'}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">API 510 Internal Inspection Requirements</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Visual inspection of all accessible internal surfaces</p>
              <p>• Assessment of general and localized corrosion</p>
              <p>• Detection of cracking, erosion, and mechanical damage</p>
              <p>• Evaluation of weld integrity and internal attachments</p>
              <p>• Inspection of nozzles, manways, and internal connections</p>
              <p>• Assessment of internal coatings and deposits</p>
              <p>• Documentation of all damage mechanisms and conditions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
