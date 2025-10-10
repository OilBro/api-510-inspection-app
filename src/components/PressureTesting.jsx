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
import { CheckCircle, AlertTriangle, Gauge, Calculator, FileText, Droplets } from 'lucide-react'

export default function PressureTesting({ data, onDataChange }) {
  const [testRequired, setTestRequired] = useState(data.testRequired || false)
  const [testData, setTestData] = useState({
    testType: '',
    testPressure: '',
    holdTime: '',
    testMedium: '',
    temperature: '',
    inspector: '',
    testDate: new Date().toISOString().split('T')[0],
    result: '',
    observations: '',
    ...data.pressureTest
  })

  const [calculations, setCalculations] = useState({
    mawp: '',
    designPressure: '',
    calculatedTestPressure: '',
    temperatureCorrection: '',
    ...data.testCalculations
  })

  const testTypes = [
    'Hydrostatic Test',
    'Pneumatic Test',
    'Combination Test',
    'Alternative Test'
  ]

  const testMediums = [
    'Water',
    'Water with Additives',
    'Air',
    'Nitrogen',
    'Other Gas',
    'Other'
  ]

  const testResults = [
    'Satisfactory',
    'Unsatisfactory - Leakage',
    'Unsatisfactory - Deformation',
    'Unsatisfactory - Other',
    'Test Discontinued'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      testRequired,
      pressureTest: testData,
      testCalculations: calculations
    })
  }, [testRequired, testData, calculations, data, onDataChange])

  const calculateTestPressure = () => {
    const mawp = parseFloat(calculations.mawp)
    const designPressure = parseFloat(calculations.designPressure)
    const testTemp = parseFloat(testData.temperature) || 70
    const designTemp = 650 // Assumed design temperature

    if (mawp && designPressure) {
      // Basic test pressure calculation per ASME Section VIII
      let testPressure = Math.max(mawp, designPressure) * 1.3

      // Temperature correction if test temperature is significantly different
      if (Math.abs(testTemp - designTemp) > 50) {
        const tempCorrection = (testTemp + 460) / (designTemp + 460)
        testPressure = testPressure * tempCorrection
      }

      setCalculations(prev => ({
        ...prev,
        calculatedTestPressure: testPressure.toFixed(1),
        temperatureCorrection: ((testTemp + 460) / (designTemp + 460)).toFixed(3)
      }))

      setTestData(prev => ({
        ...prev,
        testPressure: testPressure.toFixed(1)
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-cyan-600" />
            <div>
              <CardTitle className="text-cyan-900">Pressure Testing</CardTitle>
              <CardDescription className="text-cyan-700">
                Pressure testing requirements and documentation per API 510 Section 8
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Requirement Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Pressure Test Requirement</span>
          </CardTitle>
          <CardDescription>
            Determine if pressure testing is required based on API 510 criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="test-required"
              checked={testRequired}
              onCheckedChange={setTestRequired}
            />
            <Label htmlFor="test-required">Pressure test required</Label>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">API 510 Pressure Test Requirements:</h4>
            <div className="text-sm text-orange-800 space-y-1">
              <p>• When required by the jurisdiction</p>
              <p>• After repairs involving pressure-retaining welds</p>
              <p>• After alterations that affect pressure-containing capability</p>
              <p>• When inspection reveals conditions requiring verification of integrity</p>
              <p>• When the vessel has been rerating to a higher pressure</p>
              <p>• When specified by the owner/user based on risk assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {testRequired && (
        <>
          {/* Test Pressure Calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span>Test Pressure Calculations</span>
              </CardTitle>
              <CardDescription>
                Calculate test pressure per ASME Section VIII requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calc-mawp">MAWP (psig)</Label>
                  <Input
                    id="calc-mawp"
                    type="number"
                    value={calculations.mawp}
                    onChange={(e) => setCalculations(prev => ({ ...prev, mawp: e.target.value }))}
                    placeholder="e.g., 150"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calc-design-pressure">Design Pressure (psig)</Label>
                  <Input
                    id="calc-design-pressure"
                    type="number"
                    value={calculations.designPressure}
                    onChange={(e) => setCalculations(prev => ({ ...prev, designPressure: e.target.value }))}
                    placeholder="e.g., 150"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-temperature">Test Temperature (°F)</Label>
                  <Input
                    id="test-temperature"
                    type="number"
                    value={testData.temperature}
                    onChange={(e) => setTestData(prev => ({ ...prev, temperature: e.target.value }))}
                    placeholder="e.g., 70"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculated-test-pressure">Calculated Test Pressure (psig)</Label>
                  <Input
                    id="calculated-test-pressure"
                    value={calculations.calculatedTestPressure}
                    readOnly
                    className="bg-slate-50 font-medium"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button onClick={calculateTestPressure} className="bg-blue-600 hover:bg-blue-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Test Pressure
                </Button>

                {calculations.calculatedTestPressure && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Test Pressure: {calculations.calculatedTestPressure} psig</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Gauge className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Test Pressure Formula: P_test = 1.3 × max(MAWP, Design Pressure)</p>
                    <p>Temperature correction applied when test temperature differs significantly from design temperature.</p>
                    {calculations.temperatureCorrection && (
                      <p className="mt-1">Temperature correction factor: {calculations.temperatureCorrection}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Execution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
                <span>Test Execution</span>
              </CardTitle>
              <CardDescription>
                Document pressure test execution and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="test-type">Test Type</Label>
                  <Select 
                    value={testData.testType} 
                    onValueChange={(value) => setTestData(prev => ({ ...prev, testType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-pressure-actual">Actual Test Pressure (psig)</Label>
                  <Input
                    id="test-pressure-actual"
                    type="number"
                    value={testData.testPressure}
                    onChange={(e) => setTestData(prev => ({ ...prev, testPressure: e.target.value }))}
                    placeholder="e.g., 195"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hold-time">Hold Time (minutes)</Label>
                  <Input
                    id="hold-time"
                    type="number"
                    value={testData.holdTime}
                    onChange={(e) => setTestData(prev => ({ ...prev, holdTime: e.target.value }))}
                    placeholder="e.g., 30"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-medium">Test Medium</Label>
                  <Select 
                    value={testData.testMedium} 
                    onValueChange={(value) => setTestData(prev => ({ ...prev, testMedium: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test medium" />
                    </SelectTrigger>
                    <SelectContent>
                      {testMediums.map((medium) => (
                        <SelectItem key={medium} value={medium}>{medium}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-inspector">Inspector</Label>
                  <Input
                    id="test-inspector"
                    value={testData.inspector}
                    onChange={(e) => setTestData(prev => ({ ...prev, inspector: e.target.value }))}
                    placeholder="Inspector name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-date">Test Date</Label>
                  <Input
                    id="test-date"
                    type="date"
                    value={testData.testDate}
                    onChange={(e) => setTestData(prev => ({ ...prev, testDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test-result">Test Result</Label>
                  <Select 
                    value={testData.result} 
                    onValueChange={(value) => setTestData(prev => ({ ...prev, result: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test result" />
                    </SelectTrigger>
                    <SelectContent>
                      {testResults.map((result) => (
                        <SelectItem key={result} value={result}>{result}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-observations">Observations and Comments</Label>
                <Textarea
                  id="test-observations"
                  value={testData.observations}
                  onChange={(e) => setTestData(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Document any observations, issues, or special conditions during the test"
                  rows={4}
                />
              </div>

              {testData.result && (
                <div className={`border rounded-lg p-4 ${
                  testData.result === 'Satisfactory' ? 'bg-green-50 border-green-200' :
                  testData.result.includes('Unsatisfactory') ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    {testData.result === 'Satisfactory' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        testData.result === 'Satisfactory' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Test Result: {testData.result}
                      </p>
                      {testData.result !== 'Satisfactory' && (
                        <p className="text-red-700 text-sm mt-1">
                          Unsatisfactory test results require investigation and corrective action before the vessel can be returned to service.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Summary */}
          <Card className="border-cyan-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                <span>Pressure Test Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Test Type</h4>
                  <div className="text-lg font-medium text-blue-600">
                    {testData.testType || 'Not specified'}
                  </div>
                </div>

                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                  <h4 className="font-medium text-cyan-900 mb-2">Test Pressure</h4>
                  <div className="text-lg font-medium text-cyan-600">
                    {testData.testPressure ? `${testData.testPressure} psig` : 'Not specified'}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Hold Time</h4>
                  <div className="text-lg font-medium text-green-600">
                    {testData.holdTime ? `${testData.holdTime} min` : 'Not specified'}
                  </div>
                </div>

                <div className={`border rounded-lg p-4 ${
                  testData.result === 'Satisfactory' ? 'bg-green-50 border-green-200' :
                  testData.result?.includes('Unsatisfactory') ? 'bg-red-50 border-red-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    testData.result === 'Satisfactory' ? 'text-green-900' :
                    testData.result?.includes('Unsatisfactory') ? 'text-red-900' :
                    'text-slate-900'
                  }`}>
                    Result
                  </h4>
                  <div className={`text-lg font-medium ${
                    testData.result === 'Satisfactory' ? 'text-green-600' :
                    testData.result?.includes('Unsatisfactory') ? 'text-red-600' :
                    'text-slate-600'
                  }`}>
                    {testData.result || 'Pending'}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-2">API 510 Pressure Test Requirements</h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>• Test pressure = 1.3 × max(MAWP, Design Pressure) for hydrostatic test</p>
                  <p>• Test pressure = 1.1 × max(MAWP, Design Pressure) for pneumatic test</p>
                  <p>• Hold time minimum 30 minutes for hydrostatic test</p>
                  <p>• Temperature correction may be required for test conditions</p>
                  <p>• Test must be witnessed by authorized inspector</p>
                  <p>• No visible leakage or permanent deformation allowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!testRequired && (
        <Card className="border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-600">
              <CheckCircle className="h-5 w-5" />
              <span>No pressure test required for this inspection</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
