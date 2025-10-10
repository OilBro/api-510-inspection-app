import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { AlertTriangle, Calculator, CheckCircle, FileText, TrendingUp } from 'lucide-react'

export default function FitnessForService({ data, onDataChange }) {
  const [assessmentType, setAssessmentType] = useState(data.assessmentType || 'general-metal-loss')
  
  const [generalMetalLoss, setGeneralMetalLoss] = useState({
    currentThickness: '',
    minimumThickness: '',
    allowableStress: '',
    designPressure: '',
    operatingPressure: '',
    result: null,
    ...data.generalMetalLoss
  })

  const [localMetalLoss, setLocalMetalLoss] = useState({
    flawLength: '',
    flawWidth: '',
    flawDepth: '',
    remainingThickness: '',
    allowableStress: '',
    yieldStrength: '',
    designPressure: '',
    result: null,
    ...data.localMetalLoss
  })

  const [crackAssessment, setCrackAssessment] = useState({
    crackLength: '',
    crackDepth: '',
    stressIntensity: '',
    fractureToughness: '',
    appliedStress: '',
    result: null,
    ...data.crackAssessment
  })

  const [recommendations, setRecommendations] = useState({
    overallResult: '',
    remainingLife: '',
    monitoringPlan: '',
    repairRecommendations: '',
    nextAssessmentDate: '',
    ...data.ffsRecommendations
  })

  useEffect(() => {
    onDataChange({
      ...data,
      assessmentType,
      generalMetalLoss,
      localMetalLoss,
      crackAssessment,
      ffsRecommendations: recommendations
    })
  }, [assessmentType, generalMetalLoss, localMetalLoss, crackAssessment, recommendations, data, onDataChange])

  // General Metal Loss Assessment (API 579 Level 1)
  const calculateGeneralMetalLoss = () => {
    const t = parseFloat(generalMetalLoss.currentThickness)
    const tmin = parseFloat(generalMetalLoss.minimumThickness)
    const S = parseFloat(generalMetalLoss.allowableStress)
    const Pd = parseFloat(generalMetalLoss.designPressure)
    const Po = parseFloat(generalMetalLoss.operatingPressure)

    if (t && tmin && S && Pd && Po) {
      // Simplified FFS assessment
      const thicknessRatio = t / tmin
      const pressureRatio = Po / Pd
      
      let result = 'Acceptable'
      let safetyFactor = thicknessRatio / pressureRatio

      if (safetyFactor < 1.0) {
        result = 'Not Acceptable - Immediate Action Required'
      } else if (safetyFactor < 1.5) {
        result = 'Monitor - Reduced Safety Margin'
      } else if (safetyFactor < 2.0) {
        result = 'Acceptable with Monitoring'
      } else {
        result = 'Acceptable'
      }

      setGeneralMetalLoss(prev => ({
        ...prev,
        result: {
          assessment: result,
          safetyFactor: safetyFactor.toFixed(2),
          thicknessRatio: thicknessRatio.toFixed(3),
          pressureRatio: pressureRatio.toFixed(3)
        }
      }))
    }
  }

  // Local Metal Loss Assessment (API 579 Level 1)
  const calculateLocalMetalLoss = () => {
    const L = parseFloat(localMetalLoss.flawLength)
    const c = parseFloat(localMetalLoss.flawWidth)
    const d = parseFloat(localMetalLoss.flawDepth)
    const tr = parseFloat(localMetalLoss.remainingThickness)
    const S = parseFloat(localMetalLoss.allowableStress)
    const Sy = parseFloat(localMetalLoss.yieldStrength)
    const P = parseFloat(localMetalLoss.designPressure)

    if (L && c && d && tr && S && Sy && P) {
      // Simplified local metal loss assessment
      const aspectRatio = L / c
      const depthRatio = d / (d + tr)
      
      // Folias factor (simplified)
      const Mt = Math.sqrt(1 + 0.6275 * aspectRatio - 0.003375 * aspectRatio * aspectRatio)
      
      // Allowable stress calculation
      const allowableStress = Math.min(S, 0.9 * Sy)
      
      // Safety factor
      const appliedStress = P * (1 / (1 - depthRatio)) * Mt
      const safetyFactor = allowableStress / appliedStress

      let result = 'Acceptable'
      if (safetyFactor < 1.0) {
        result = 'Not Acceptable - Immediate Repair Required'
      } else if (safetyFactor < 1.5) {
        result = 'Monitor - Reduced Safety Margin'
      } else if (safetyFactor < 2.0) {
        result = 'Acceptable with Monitoring'
      }

      setLocalMetalLoss(prev => ({
        ...prev,
        result: {
          assessment: result,
          safetyFactor: safetyFactor.toFixed(2),
          foliasFactor: Mt.toFixed(3),
          depthRatio: depthRatio.toFixed(3),
          appliedStress: appliedStress.toFixed(1)
        }
      }))
    }
  }

  // Crack Assessment (API 579 Level 1)
  const calculateCrackAssessment = () => {
    const a = parseFloat(crackAssessment.crackLength)
    const c = parseFloat(crackAssessment.crackDepth)
    const K = parseFloat(crackAssessment.stressIntensity)
    const Kmat = parseFloat(crackAssessment.fractureToughness)
    const sigma = parseFloat(crackAssessment.appliedStress)

    if (a && c && K && Kmat && sigma) {
      // Simplified crack assessment
      const aspectRatio = a / c
      const stressIntensityFactor = K * sigma * Math.sqrt(Math.PI * c)
      const safetyFactor = Kmat / stressIntensityFactor

      let result = 'Acceptable'
      if (safetyFactor < 1.0) {
        result = 'Not Acceptable - Immediate Repair Required'
      } else if (safetyFactor < 2.0) {
        result = 'Monitor - Crack Growth Analysis Required'
      } else if (safetyFactor < 3.0) {
        result = 'Acceptable with Monitoring'
      }

      setCrackAssessment(prev => ({
        ...prev,
        result: {
          assessment: result,
          safetyFactor: safetyFactor.toFixed(2),
          stressIntensityFactor: stressIntensityFactor.toFixed(1),
          aspectRatio: aspectRatio.toFixed(3)
        }
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <CardTitle className="text-red-900">Fitness-for-Service Assessment</CardTitle>
              <CardDescription className="text-red-700">
                Engineering assessment per API 579-1/ASME FFS-1 standards
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Type</CardTitle>
          <CardDescription>
            Select the appropriate FFS assessment method based on damage mechanism
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={assessmentType} onValueChange={setAssessmentType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general-metal-loss">General Metal Loss</TabsTrigger>
              <TabsTrigger value="local-metal-loss">Local Metal Loss</TabsTrigger>
              <TabsTrigger value="crack-assessment">Crack Assessment</TabsTrigger>
            </TabsList>

            {/* General Metal Loss Assessment */}
            <TabsContent value="general-metal-loss" className="space-y-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>General Metal Loss Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    API 579 Part 4 - Assessment of general thinning
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-thickness">Current Thickness (inches)</Label>
                      <Input
                        id="current-thickness"
                        type="number"
                        value={generalMetalLoss.currentThickness}
                        onChange={(e) => setGeneralMetalLoss(prev => ({ ...prev, currentThickness: e.target.value }))}
                        placeholder="e.g., 0.450"
                        step="0.001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimum-thickness">Minimum Required Thickness (inches)</Label>
                      <Input
                        id="minimum-thickness"
                        type="number"
                        value={generalMetalLoss.minimumThickness}
                        onChange={(e) => setGeneralMetalLoss(prev => ({ ...prev, minimumThickness: e.target.value }))}
                        placeholder="e.g., 0.125"
                        step="0.001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowable-stress">Allowable Stress (ksi)</Label>
                      <Input
                        id="allowable-stress"
                        type="number"
                        value={generalMetalLoss.allowableStress}
                        onChange={(e) => setGeneralMetalLoss(prev => ({ ...prev, allowableStress: e.target.value }))}
                        placeholder="e.g., 17.5"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="design-pressure">Design Pressure (psig)</Label>
                      <Input
                        id="design-pressure"
                        type="number"
                        value={generalMetalLoss.designPressure}
                        onChange={(e) => setGeneralMetalLoss(prev => ({ ...prev, designPressure: e.target.value }))}
                        placeholder="e.g., 150"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="operating-pressure">Operating Pressure (psig)</Label>
                      <Input
                        id="operating-pressure"
                        type="number"
                        value={generalMetalLoss.operatingPressure}
                        onChange={(e) => setGeneralMetalLoss(prev => ({ ...prev, operatingPressure: e.target.value }))}
                        placeholder="e.g., 125"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button onClick={calculateGeneralMetalLoss} className="bg-blue-600 hover:bg-blue-700">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Assessment
                    </Button>

                    {generalMetalLoss.result && (
                      <Badge 
                        className={
                          generalMetalLoss.result.assessment.includes('Not Acceptable') ? 'bg-red-100 text-red-800 border-red-300' :
                          generalMetalLoss.result.assessment.includes('Monitor') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-green-100 text-green-800 border-green-300'
                        }
                      >
                        {generalMetalLoss.result.assessment}
                      </Badge>
                    )}
                  </div>

                  {generalMetalLoss.result && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Assessment Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Safety Factor:</span>
                          <p className="text-slate-600">{generalMetalLoss.result.safetyFactor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Thickness Ratio:</span>
                          <p className="text-slate-600">{generalMetalLoss.result.thicknessRatio}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Pressure Ratio:</span>
                          <p className="text-slate-600">{generalMetalLoss.result.pressureRatio}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Assessment:</span>
                          <p className="text-slate-600">{generalMetalLoss.result.assessment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Local Metal Loss Assessment */}
            <TabsContent value="local-metal-loss" className="space-y-4">
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Local Metal Loss Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    API 579 Part 5 - Assessment of local thin areas and pitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flaw-length">Flaw Length (inches)</Label>
                      <Input
                        id="flaw-length"
                        type="number"
                        value={localMetalLoss.flawLength}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, flawLength: e.target.value }))}
                        placeholder="e.g., 4.0"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flaw-width">Flaw Width (inches)</Label>
                      <Input
                        id="flaw-width"
                        type="number"
                        value={localMetalLoss.flawWidth}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, flawWidth: e.target.value }))}
                        placeholder="e.g., 2.0"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flaw-depth">Flaw Depth (inches)</Label>
                      <Input
                        id="flaw-depth"
                        type="number"
                        value={localMetalLoss.flawDepth}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, flawDepth: e.target.value }))}
                        placeholder="e.g., 0.100"
                        step="0.001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="remaining-thickness">Remaining Thickness (inches)</Label>
                      <Input
                        id="remaining-thickness"
                        type="number"
                        value={localMetalLoss.remainingThickness}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, remainingThickness: e.target.value }))}
                        placeholder="e.g., 0.350"
                        step="0.001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowable-stress-local">Allowable Stress (ksi)</Label>
                      <Input
                        id="allowable-stress-local"
                        type="number"
                        value={localMetalLoss.allowableStress}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, allowableStress: e.target.value }))}
                        placeholder="e.g., 17.5"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yield-strength">Yield Strength (ksi)</Label>
                      <Input
                        id="yield-strength"
                        type="number"
                        value={localMetalLoss.yieldStrength}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, yieldStrength: e.target.value }))}
                        placeholder="e.g., 35"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="design-pressure-local">Design Pressure (psig)</Label>
                      <Input
                        id="design-pressure-local"
                        type="number"
                        value={localMetalLoss.designPressure}
                        onChange={(e) => setLocalMetalLoss(prev => ({ ...prev, designPressure: e.target.value }))}
                        placeholder="e.g., 150"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button onClick={calculateLocalMetalLoss} className="bg-orange-600 hover:bg-orange-700">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Assessment
                    </Button>

                    {localMetalLoss.result && (
                      <Badge 
                        className={
                          localMetalLoss.result.assessment.includes('Not Acceptable') ? 'bg-red-100 text-red-800 border-red-300' :
                          localMetalLoss.result.assessment.includes('Monitor') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-green-100 text-green-800 border-green-300'
                        }
                      >
                        {localMetalLoss.result.assessment}
                      </Badge>
                    )}
                  </div>

                  {localMetalLoss.result && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Assessment Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Safety Factor:</span>
                          <p className="text-slate-600">{localMetalLoss.result.safetyFactor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Folias Factor:</span>
                          <p className="text-slate-600">{localMetalLoss.result.foliasFactor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Depth Ratio:</span>
                          <p className="text-slate-600">{localMetalLoss.result.depthRatio}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Applied Stress (ksi):</span>
                          <p className="text-slate-600">{localMetalLoss.result.appliedStress}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Assessment:</span>
                          <p className="text-slate-600">{localMetalLoss.result.assessment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Crack Assessment */}
            <TabsContent value="crack-assessment" className="space-y-4">
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Crack Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    API 579 Part 9 - Assessment of crack-like flaws
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="crack-length">Crack Length (inches)</Label>
                      <Input
                        id="crack-length"
                        type="number"
                        value={crackAssessment.crackLength}
                        onChange={(e) => setCrackAssessment(prev => ({ ...prev, crackLength: e.target.value }))}
                        placeholder="e.g., 2.0"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="crack-depth">Crack Depth (inches)</Label>
                      <Input
                        id="crack-depth"
                        type="number"
                        value={crackAssessment.crackDepth}
                        onChange={(e) => setCrackAssessment(prev => ({ ...prev, crackDepth: e.target.value }))}
                        placeholder="e.g., 0.050"
                        step="0.001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stress-intensity">Stress Intensity Factor</Label>
                      <Input
                        id="stress-intensity"
                        type="number"
                        value={crackAssessment.stressIntensity}
                        onChange={(e) => setCrackAssessment(prev => ({ ...prev, stressIntensity: e.target.value }))}
                        placeholder="e.g., 1.12"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fracture-toughness">Fracture Toughness (ksi√in)</Label>
                      <Input
                        id="fracture-toughness"
                        type="number"
                        value={crackAssessment.fractureToughness}
                        onChange={(e) => setCrackAssessment(prev => ({ ...prev, fractureToughness: e.target.value }))}
                        placeholder="e.g., 100"
                        step="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applied-stress">Applied Stress (ksi)</Label>
                      <Input
                        id="applied-stress"
                        type="number"
                        value={crackAssessment.appliedStress}
                        onChange={(e) => setCrackAssessment(prev => ({ ...prev, appliedStress: e.target.value }))}
                        placeholder="e.g., 15"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button onClick={calculateCrackAssessment} className="bg-red-600 hover:bg-red-700">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Assessment
                    </Button>

                    {crackAssessment.result && (
                      <Badge 
                        className={
                          crackAssessment.result.assessment.includes('Not Acceptable') ? 'bg-red-100 text-red-800 border-red-300' :
                          crackAssessment.result.assessment.includes('Monitor') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          'bg-green-100 text-green-800 border-green-300'
                        }
                      >
                        {crackAssessment.result.assessment}
                      </Badge>
                    )}
                  </div>

                  {crackAssessment.result && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-2">Assessment Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Safety Factor:</span>
                          <p className="text-slate-600">{crackAssessment.result.safetyFactor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">K Applied (ksi√in):</span>
                          <p className="text-slate-600">{crackAssessment.result.stressIntensityFactor}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Aspect Ratio:</span>
                          <p className="text-slate-600">{crackAssessment.result.aspectRatio}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Assessment:</span>
                          <p className="text-slate-600">{crackAssessment.result.assessment}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span>FFS Assessment Summary & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overall-result">Overall Assessment Result</Label>
              <Select 
                value={recommendations.overallResult} 
                onValueChange={(value) => setRecommendations(prev => ({ ...prev, overallResult: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select overall result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acceptable">Acceptable for Continued Service</SelectItem>
                  <SelectItem value="monitor">Acceptable with Monitoring</SelectItem>
                  <SelectItem value="repair">Repair Required</SelectItem>
                  <SelectItem value="replace">Replacement Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining-life">Estimated Remaining Life (years)</Label>
              <Input
                id="remaining-life"
                value={recommendations.remainingLife}
                onChange={(e) => setRecommendations(prev => ({ ...prev, remainingLife: e.target.value }))}
                placeholder="e.g., 5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next-assessment">Next Assessment Date</Label>
              <Input
                id="next-assessment"
                type="date"
                value={recommendations.nextAssessmentDate}
                onChange={(e) => setRecommendations(prev => ({ ...prev, nextAssessmentDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitoring-plan">Monitoring Plan</Label>
            <Textarea
              id="monitoring-plan"
              value={recommendations.monitoringPlan}
              onChange={(e) => setRecommendations(prev => ({ ...prev, monitoringPlan: e.target.value }))}
              placeholder="Describe monitoring requirements and frequency"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repair-recommendations">Repair Recommendations</Label>
            <Textarea
              id="repair-recommendations"
              value={recommendations.repairRecommendations}
              onChange={(e) => setRecommendations(prev => ({ ...prev, repairRecommendations: e.target.value }))}
              placeholder="Describe any required repairs or modifications"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* API 579 Reference */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>API 579-1/ASME FFS-1 Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Assessment Levels:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Level 1: Conservative screening</li>
                <li>• Level 2: Detailed analysis</li>
                <li>• Level 3: Advanced methods</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Damage Mechanisms:</h4>
              <ul className="space-y-1 text-green-800">
                <li>• General metal loss</li>
                <li>• Local metal loss</li>
                <li>• Crack-like flaws</li>
                <li>• Blisters and laminations</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">Safety Factors:</h4>
              <ul className="space-y-1 text-orange-800">
                <li>• SF ≥ 2.0: Acceptable</li>
                <li>• 1.5 ≤ SF &lt; 2.0: Monitor</li>
                <li>• SF &lt; 1.5: Not acceptable</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
