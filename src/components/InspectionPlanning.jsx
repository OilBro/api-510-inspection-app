import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { ClipboardCheck, Calendar, AlertTriangle, TrendingUp, Calculator } from 'lucide-react'

export default function InspectionPlanning({ data, onDataChange }) {
  const [planningMethod, setPlanningMethod] = useState(data.planningMethod || 'fixed')
  const [fixedInterval, setFixedInterval] = useState({
    externalInterval: '5',
    internalInterval: '10',
    ...data.fixedInterval
  })

  const [rbiData, setRbiData] = useState({
    fluid: '',
    operatingPressure: '',
    operatingTemperature: '',
    releaseRate: '',
    consequenceArea: '',
    damageMechanism: '',
    corrosionRate: '',
    inspectionEffectiveness: '0.9',
    riskLevel: '',
    recommendedInterval: '',
    ...data.rbiData
  })

  const fluids = [
    'Hydrocarbon - Light',
    'Hydrocarbon - Heavy',
    'Hydrogen',
    'Hydrogen Sulfide',
    'Ammonia',
    'Chlorine',
    'Caustic',
    'Acid',
    'Steam',
    'Water',
    'Other'
  ]

  const damageMechanisms = [
    'General Corrosion',
    'Localized Corrosion',
    'Stress Corrosion Cracking',
    'Hydrogen Damage',
    'High Temperature Damage',
    'Mechanical Fatigue',
    'Brittle Fracture',
    'External Corrosion'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      planningMethod,
      fixedInterval,
      rbiData
    })
  }, [planningMethod, fixedInterval, rbiData, data, onDataChange])

  const calculateRBI = () => {
    // Simplified RBI calculation for demonstration
    const pressure = parseFloat(rbiData.operatingPressure) || 0
    const temperature = parseFloat(rbiData.operatingTemperature) || 0
    const corrosionRate = parseFloat(rbiData.corrosionRate) || 0
    
    // Consequence of Failure (simplified)
    let cof = 1
    if (pressure > 600) cof += 2
    else if (pressure > 150) cof += 1
    
    if (temperature > 800) cof += 2
    else if (temperature > 400) cof += 1

    if (rbiData.fluid.includes('Hydrogen') || rbiData.fluid.includes('Toxic')) cof += 2
    else if (rbiData.fluid.includes('Hydrocarbon')) cof += 1

    // Probability of Failure (simplified)
    let pof = 1
    if (corrosionRate > 0.010) pof += 3
    else if (corrosionRate > 0.005) pof += 2
    else if (corrosionRate > 0.002) pof += 1

    if (rbiData.damageMechanism.includes('Cracking')) pof += 2
    else if (rbiData.damageMechanism.includes('Hydrogen')) pof += 1

    const effectiveness = parseFloat(rbiData.inspectionEffectiveness) || 0.9
    pof = pof * (1 - effectiveness)

    // Risk calculation
    const risk = cof * pof
    let riskLevel = 'Low'
    let interval = 10

    if (risk > 6) {
      riskLevel = 'High'
      interval = 2
    } else if (risk > 3) {
      riskLevel = 'Medium'
      interval = 5
    } else {
      riskLevel = 'Low'
      interval = 10
    }

    setRbiData(prev => ({
      ...prev,
      riskLevel,
      recommendedInterval: interval.toString()
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Inspection Planning</CardTitle>
              <CardDescription className="text-blue-700">
                Determine inspection intervals using RBI assessment or fixed intervals per API 510
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Planning Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Planning Method</CardTitle>
          <CardDescription>
            Choose between Risk-Based Inspection (RBI) or traditional fixed intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={planningMethod} onValueChange={setPlanningMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixed">Fixed Intervals</TabsTrigger>
              <TabsTrigger value="rbi">Risk-Based Inspection</TabsTrigger>
            </TabsList>

            <TabsContent value="fixed" className="space-y-4">
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    <span>Fixed Inspection Intervals</span>
                  </CardTitle>
                  <CardDescription>
                    Traditional inspection intervals per API 510 Section 6
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="external-interval">External Inspection Interval (years)</Label>
                      <Select 
                        value={fixedInterval.externalInterval} 
                        onValueChange={(value) => setFixedInterval(prev => ({ ...prev, externalInterval: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3 years</SelectItem>
                          <SelectItem value="5">5 years (Standard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="internal-interval">Internal/On-stream Inspection Interval (years)</Label>
                      <Select 
                        value={fixedInterval.internalInterval} 
                        onValueChange={(value) => setFixedInterval(prev => ({ ...prev, internalInterval: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 years</SelectItem>
                          <SelectItem value="10">10 years (Standard)</SelectItem>
                          <SelectItem value="15">15 years</SelectItem>
                          <SelectItem value="20">20 years (Maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">API 510 Standard Intervals:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• External inspection: Every 5 years (may be extended based on condition)</li>
                      <li>• Internal inspection: Every 10 years (may be extended to 20 years maximum)</li>
                      <li>• Pressure test: When required by jurisdiction or condition assessment</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rbi" className="space-y-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <span>Risk-Based Inspection Assessment</span>
                  </CardTitle>
                  <CardDescription>
                    Determine inspection intervals based on risk assessment per API 581
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Consequence of Failure Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Consequence of Failure (CoF) Analysis</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fluid">Process Fluid</Label>
                        <Select 
                          value={rbiData.fluid} 
                          onValueChange={(value) => setRbiData(prev => ({ ...prev, fluid: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fluid" />
                          </SelectTrigger>
                          <SelectContent>
                            {fluids.map((fluid) => (
                              <SelectItem key={fluid} value={fluid}>{fluid}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operating-pressure">Operating Pressure (psig)</Label>
                        <Input
                          id="operating-pressure"
                          type="number"
                          value={rbiData.operatingPressure}
                          onChange={(e) => setRbiData(prev => ({ ...prev, operatingPressure: e.target.value }))}
                          placeholder="e.g., 150"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="operating-temperature">Operating Temperature (°F)</Label>
                        <Input
                          id="operating-temperature"
                          type="number"
                          value={rbiData.operatingTemperature}
                          onChange={(e) => setRbiData(prev => ({ ...prev, operatingTemperature: e.target.value }))}
                          placeholder="e.g., 650"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Probability of Failure Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Probability of Failure (PoF) Analysis</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="damage-mechanism">Primary Damage Mechanism</Label>
                        <Select 
                          value={rbiData.damageMechanism} 
                          onValueChange={(value) => setRbiData(prev => ({ ...prev, damageMechanism: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mechanism" />
                          </SelectTrigger>
                          <SelectContent>
                            {damageMechanisms.map((mechanism) => (
                              <SelectItem key={mechanism} value={mechanism}>{mechanism}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="corrosion-rate">Corrosion Rate (in/yr)</Label>
                        <Input
                          id="corrosion-rate"
                          type="number"
                          value={rbiData.corrosionRate}
                          onChange={(e) => setRbiData(prev => ({ ...prev, corrosionRate: e.target.value }))}
                          placeholder="e.g., 0.005"
                          step="0.001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inspection-effectiveness">Inspection Effectiveness</Label>
                        <Select 
                          value={rbiData.inspectionEffectiveness} 
                          onValueChange={(value) => setRbiData(prev => ({ ...prev, inspectionEffectiveness: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.95">Highly Effective (95%)</SelectItem>
                            <SelectItem value="0.9">Usually Effective (90%)</SelectItem>
                            <SelectItem value="0.8">Fairly Effective (80%)</SelectItem>
                            <SelectItem value="0.6">Poorly Effective (60%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button onClick={calculateRBI} className="bg-purple-600 hover:bg-purple-700">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Risk & Interval
                    </Button>

                    {rbiData.riskLevel && (
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={
                            rbiData.riskLevel === 'High' ? 'bg-red-100 text-red-800 border-red-300' :
                            rbiData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }
                        >
                          {rbiData.riskLevel} Risk
                        </Badge>
                        <span className="text-sm text-slate-600">
                          Recommended Interval: {rbiData.recommendedInterval} years
                        </span>
                      </div>
                    )}
                  </div>

                  {rbiData.riskLevel && (
                    <div className={`border rounded-lg p-4 ${
                      rbiData.riskLevel === 'High' ? 'bg-red-50 border-red-200' :
                      rbiData.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {rbiData.riskLevel === 'High' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                        <div>
                          <p className={`font-medium ${
                            rbiData.riskLevel === 'High' ? 'text-red-900' :
                            rbiData.riskLevel === 'Medium' ? 'text-yellow-900' :
                            'text-green-900'
                          }`}>
                            Risk Assessment Result: {rbiData.riskLevel} Risk
                          </p>
                          <p className={`text-sm mt-1 ${
                            rbiData.riskLevel === 'High' ? 'text-red-700' :
                            rbiData.riskLevel === 'Medium' ? 'text-yellow-700' :
                            'text-green-700'
                          }`}>
                            {rbiData.riskLevel === 'High' && 'Immediate attention required. Consider more frequent inspections and monitoring.'}
                            {rbiData.riskLevel === 'Medium' && 'Moderate risk level. Standard inspection practices with some additional monitoring.'}
                            {rbiData.riskLevel === 'Low' && 'Low risk level. Standard inspection intervals may be appropriate.'}
                          </p>
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

      {/* Inspection Schedule Summary */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>Inspection Schedule Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">External Inspection</h4>
              <p className="text-blue-700">
                Interval: {planningMethod === 'rbi' ? (rbiData.recommendedInterval || 'TBD') : fixedInterval.externalInterval} years
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {planningMethod === 'rbi' ? 'Based on RBI assessment' : 'Fixed interval per API 510'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Internal/On-stream Inspection</h4>
              <p className="text-green-700">
                Interval: {planningMethod === 'rbi' ? (rbiData.recommendedInterval || 'TBD') : fixedInterval.internalInterval} years
              </p>
              <p className="text-sm text-green-600 mt-1">
                {planningMethod === 'rbi' ? 'Based on RBI assessment' : 'Fixed interval per API 510'}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Planning Method: {planningMethod === 'rbi' ? 'Risk-Based Inspection' : 'Fixed Intervals'}</h4>
            <p className="text-sm text-slate-600">
              {planningMethod === 'rbi' 
                ? 'Inspection intervals determined through quantitative risk assessment considering consequence and probability of failure.'
                : 'Traditional fixed inspection intervals as specified in API 510 Section 6.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
