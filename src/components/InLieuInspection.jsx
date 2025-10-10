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
import { Shield, CheckCircle, AlertTriangle, Search, FileText, Zap, Settings } from 'lucide-react'

export default function InLieuInspection({ data, onDataChange }) {
  const [suitabilityData, setSuitabilityData] = useState({
    vesselClass: '',
    service: '',
    corrosionRate: '',
    remainingLife: '',
    ndeCapability: false,
    accessAvailable: false,
    safetyConsiderations: '',
    suitable: null,
    ...data.inLieuSuitability
  })

  const [inspectionTechniques, setInspectionTechniques] = useState(data.inLieuTechniques || [])
  const [newTechnique, setNewTechnique] = useState({
    technique: '',
    scanArea: '',
    coverage: '',
    findings: '',
    acceptanceCriteria: '',
    result: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [assessment, setAssessment] = useState({
    overallResult: '',
    recommendations: '',
    nextInspectionDate: '',
    limitations: '',
    ...data.inLieuAssessment
  })

  const vesselClasses = [
    'Class 1 - High Risk',
    'Class 2 - Medium Risk', 
    'Class 3 - Low Risk'
  ]

  const serviceTypes = [
    'Lethal Service',
    'Toxic Service',
    'Flammable Service',
    'Non-Hazardous Service'
  ]

  const ndeTypes = [
    'Ultrasonic Testing (UT)',
    'Radiographic Testing (RT)',
    'Automated Ultrasonic Testing (AUT)',
    'Phased Array Ultrasonic Testing (PAUT)',
    'Time of Flight Diffraction (TOFD)',
    'Magnetic Particle Testing (MT)',
    'Penetrant Testing (PT)',
    'Visual Testing (VT)',
    'Acoustic Emission (AE)',
    'Guided Wave Testing (GWT)'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      inLieuSuitability: suitabilityData,
      inLieuTechniques: inspectionTechniques,
      inLieuAssessment: assessment
    })
  }, [suitabilityData, inspectionTechniques, assessment, data, onDataChange])

  const evaluateSuitability = () => {
    let suitable = true
    let reasons = []

    // Check vessel class
    if (suitabilityData.vesselClass === 'Class 1 - High Risk') {
      suitable = false
      reasons.push('Class 1 vessels require internal inspection')
    }

    // Check service type
    if (suitabilityData.service === 'Lethal Service') {
      suitable = false
      reasons.push('Lethal service requires internal inspection')
    }

    // Check remaining life
    const remainingLife = parseFloat(suitabilityData.remainingLife)
    if (remainingLife && remainingLife < 5) {
      suitable = false
      reasons.push('Remaining life < 5 years requires internal inspection')
    }

    // Check NDE capability
    if (!suitabilityData.ndeCapability) {
      suitable = false
      reasons.push('Required NDE techniques not available')
    }

    // Check access
    if (!suitabilityData.accessAvailable) {
      suitable = false
      reasons.push('Adequate access not available for inspection')
    }

    setSuitabilityData(prev => ({
      ...prev,
      suitable,
      reasons: reasons.join('; ')
    }))
  }

  const addTechnique = () => {
    if (newTechnique.technique && newTechnique.scanArea) {
      setInspectionTechniques([...inspectionTechniques, { ...newTechnique, id: Date.now() }])
      setNewTechnique({
        technique: '',
        scanArea: '',
        coverage: '',
        findings: '',
        acceptanceCriteria: '',
        result: '',
        inspector: '',
        date: new Date().toISOString().split('T')[0]
      })
    }
  }

  const removeTechnique = (id) => {
    setInspectionTechniques(inspectionTechniques.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-green-900">In-Lieu of Internal Inspection</CardTitle>
              <CardDescription className="text-green-700">
                On-stream inspection alternative per API 510 Section 6.4
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Suitability Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>Suitability Assessment</span>
          </CardTitle>
          <CardDescription>
            Determine if on-stream inspection is permissible per API 510 requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vessel-class">Vessel Class *</Label>
              <Select 
                value={suitabilityData.vesselClass} 
                onValueChange={(value) => setSuitabilityData(prev => ({ ...prev, vesselClass: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vessel class" />
                </SelectTrigger>
                <SelectContent>
                  {vesselClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-type">Service Type *</Label>
              <Select 
                value={suitabilityData.service} 
                onValueChange={(value) => setSuitabilityData(prev => ({ ...prev, service: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corrosion-rate">Corrosion Rate (in/yr)</Label>
              <Input
                id="corrosion-rate"
                type="number"
                value={suitabilityData.corrosionRate}
                onChange={(e) => setSuitabilityData(prev => ({ ...prev, corrosionRate: e.target.value }))}
                placeholder="e.g., 0.005"
                step="0.001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining-life">Remaining Life (years)</Label>
              <Input
                id="remaining-life"
                type="number"
                value={suitabilityData.remainingLife}
                onChange={(e) => setSuitabilityData(prev => ({ ...prev, remainingLife: e.target.value }))}
                placeholder="e.g., 10"
                step="0.1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="nde-capability"
                checked={suitabilityData.ndeCapability}
                onCheckedChange={(checked) => setSuitabilityData(prev => ({ ...prev, ndeCapability: checked }))}
              />
              <Label htmlFor="nde-capability">Required NDE techniques are available and capable</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="access-available"
                checked={suitabilityData.accessAvailable}
                onCheckedChange={(checked) => setSuitabilityData(prev => ({ ...prev, accessAvailable: checked }))}
              />
              <Label htmlFor="access-available">Adequate access is available for inspection</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety-considerations">Safety Considerations</Label>
              <Textarea
                id="safety-considerations"
                value={suitabilityData.safetyConsiderations}
                onChange={(e) => setSuitabilityData(prev => ({ ...prev, safetyConsiderations: e.target.value }))}
                placeholder="Describe any safety considerations for on-stream inspection"
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={evaluateSuitability} className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Evaluate Suitability
            </Button>

            {suitabilityData.suitable !== null && (
              <div className="flex items-center space-x-2">
                {suitabilityData.suitable ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Suitable for In-Lieu Inspection
                    </Badge>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <Badge variant="destructive">
                      Not Suitable - Internal Inspection Required
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {suitabilityData.suitable === false && suitabilityData.reasons && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Reasons for Unsuitability:</p>
                  <p className="text-red-700 text-sm mt-1">{suitabilityData.reasons}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* On-Stream Inspection Techniques */}
      {suitabilityData.suitable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-purple-600" />
              <span>On-Stream Inspection Techniques</span>
            </CardTitle>
            <CardDescription>
              Document NDE techniques and findings for on-stream inspection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Technique */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-slate-900">Add Inspection Technique</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technique">NDE Technique *</Label>
                  <Select 
                    value={newTechnique.technique} 
                    onValueChange={(value) => setNewTechnique(prev => ({ ...prev, technique: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technique" />
                    </SelectTrigger>
                    <SelectContent>
                      {ndeTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scan-area">Scan Area/Location *</Label>
                  <Input
                    id="scan-area"
                    value={newTechnique.scanArea}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, scanArea: e.target.value }))}
                    placeholder="e.g., Shell bottom quadrant"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage (%)</Label>
                  <Input
                    id="coverage"
                    type="number"
                    value={newTechnique.coverage}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, coverage: e.target.value }))}
                    placeholder="e.g., 100"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspector</Label>
                  <Input
                    id="inspector"
                    value={newTechnique.inspector}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, inspector: e.target.value }))}
                    placeholder="Inspector name/certification"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspection-date">Inspection Date</Label>
                  <Input
                    id="inspection-date"
                    type="date"
                    value={newTechnique.date}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Result</Label>
                  <Select 
                    value={newTechnique.result} 
                    onValueChange={(value) => setNewTechnique(prev => ({ ...prev, result: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acceptable">Acceptable</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="repair">Repair Required</SelectItem>
                      <SelectItem value="reject">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    value={newTechnique.findings}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, findings: e.target.value }))}
                    placeholder="Describe inspection findings"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acceptance-criteria">Acceptance Criteria</Label>
                  <Textarea
                    id="acceptance-criteria"
                    value={newTechnique.acceptanceCriteria}
                    onChange={(e) => setNewTechnique(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                    placeholder="Define acceptance criteria used"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={addTechnique} className="bg-purple-600 hover:bg-purple-700">
                <Search className="h-4 w-4 mr-2" />
                Add Technique
              </Button>
            </div>

            {/* Techniques List */}
            {inspectionTechniques.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Inspection Techniques Applied</h4>
                {inspectionTechniques.map((technique) => (
                  <Card key={technique.id} className="border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{technique.technique}</Badge>
                            <Badge 
                              className={
                                technique.result === 'acceptable' ? 'bg-green-100 text-green-800 border-green-300' :
                                technique.result === 'monitor' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                technique.result === 'repair' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                'bg-red-100 text-red-800 border-red-300'
                              }
                            >
                              {technique.result}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Scan Area:</span>
                              <p className="text-slate-600">{technique.scanArea}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Coverage:</span>
                              <p className="text-slate-600">{technique.coverage}%</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Inspector:</span>
                              <p className="text-slate-600">{technique.inspector}</p>
                            </div>
                          </div>

                          {technique.findings && (
                            <div className="mt-3">
                              <span className="font-medium text-slate-700">Findings:</span>
                              <p className="text-slate-600 text-sm mt-1">{technique.findings}</p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTechnique(technique.id)}
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
      )}

      {/* Assessment and Recommendations */}
      {suitabilityData.suitable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Assessment & Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overall-result">Overall Assessment Result</Label>
                <Select 
                  value={assessment.overallResult} 
                  onValueChange={(value) => setAssessment(prev => ({ ...prev, overallResult: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select overall result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acceptable">Acceptable for Continued Service</SelectItem>
                    <SelectItem value="monitor">Acceptable with Monitoring</SelectItem>
                    <SelectItem value="repair">Repair Required</SelectItem>
                    <SelectItem value="internal-required">Internal Inspection Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-inspection">Next Inspection Date</Label>
                <Input
                  id="next-inspection"
                  type="date"
                  value={assessment.nextInspectionDate}
                  onChange={(e) => setAssessment(prev => ({ ...prev, nextInspectionDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={assessment.recommendations}
                onChange={(e) => setAssessment(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="Provide recommendations based on inspection findings"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limitations">Limitations of On-Stream Inspection</Label>
              <Textarea
                id="limitations"
                value={assessment.limitations}
                onChange={(e) => setAssessment(prev => ({ ...prev, limitations: e.target.value }))}
                placeholder="Document any limitations of the on-stream inspection"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* API 510 Requirements Reference */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>API 510 Requirements for In-Lieu Inspection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Per API 510 Section 6.4:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• On-stream inspection may be substituted for internal inspection under specific conditions</li>
                <li>• Vessel must not be in lethal service</li>
                <li>• Adequate NDE techniques must be available and effective</li>
                <li>• Inspection must provide equivalent information to internal inspection</li>
                <li>• Results must demonstrate fitness for continued service</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Limitations:</h4>
              <ul className="space-y-1 text-orange-800">
                <li>• Cannot detect all internal damage mechanisms</li>
                <li>• Limited to accessible areas</li>
                <li>• May not detect localized corrosion or cracking</li>
                <li>• Requires qualified personnel and procedures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
