import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Calculator, AlertCircle, CheckCircle, Info, FileText } from 'lucide-react'

export default function CalculationModules() {
  const [shellCalc, setShellCalc] = useState({
    pressure: '',
    radius: '',
    stress: '',
    efficiency: '1.0',
    result: null
  })

  const [headCalc, setHeadCalc] = useState({
    pressure: '',
    radius: '',
    stress: '',
    efficiency: '1.0',
    result: null
  })

  const [mawpCalc, setMawpCalc] = useState({
    stress: '',
    efficiency: '1.0',
    thickness: '',
    radius: '',
    result: null
  })

  const [pipingCalc, setPipingCalc] = useState({
    pressure: '',
    diameter: '',
    stress: '',
    y: '0.4',
    result: null
  })

  const [pipingPressureCalc, setPipingPressureCalc] = useState({
    stress: '',
    thickness: '',
    diameter: '',
    y: '0.4',
    result: null
  })

  const [pipelineCalc, setPipelineCalc] = useState({
    yieldStrength: '',
    thickness: '',
    diameter: '',
    designFactor: '0.72',
    jointFactor: '1.0',
    tempFactor: '1.0',
    result: null
  })

  // Shell thickness calculation: t = PR / (SE - 0.6P)
  const calculateShellThickness = () => {
    const P = parseFloat(shellCalc.pressure)
    const R = parseFloat(shellCalc.radius)
    const S = parseFloat(shellCalc.stress) * 1000 // Convert ksi to psi
    const E = parseFloat(shellCalc.efficiency)

    if (P && R && S && E) {
      const denominator = S * E - 0.6 * P
      if (denominator > 0) {
        const thickness = (P * R) / denominator
        setShellCalc(prev => ({ ...prev, result: thickness.toFixed(4) }))
      } else {
        setShellCalc(prev => ({ ...prev, result: 'Invalid - Check inputs' }))
      }
    }
  }

  // Head thickness calculation: t = PR / (2SE - 0.2P)
  const calculateHeadThickness = () => {
    const P = parseFloat(headCalc.pressure)
    const R = parseFloat(headCalc.radius)
    const S = parseFloat(headCalc.stress) * 1000 // Convert ksi to psi
    const E = parseFloat(headCalc.efficiency)

    if (P && R && S && E) {
      const denominator = 2 * S * E - 0.2 * P
      if (denominator > 0) {
        const thickness = (P * R) / denominator
        setHeadCalc(prev => ({ ...prev, result: thickness.toFixed(4) }))
      } else {
        setHeadCalc(prev => ({ ...prev, result: 'Invalid - Check inputs' }))
      }
    }
  }

  // MAWP calculation: P = (SEt) / (R + 0.6t)
  const calculateMAWP = () => {
    const S = parseFloat(mawpCalc.stress) * 1000 // Convert ksi to psi
    const E = parseFloat(mawpCalc.efficiency)
    const t = parseFloat(mawpCalc.thickness)
    const R = parseFloat(mawpCalc.radius)

    if (S && E && t && R) {
      const pressure = (S * E * t) / (R + 0.6 * t)
      setMawpCalc(prev => ({ ...prev, result: pressure.toFixed(2) }))
    }
  }

  // Piping thickness calculation: t = PD / (2(SE + PY))
  const calculatePipingThickness = () => {
    const P = parseFloat(pipingCalc.pressure)
    const D = parseFloat(pipingCalc.diameter)
    const S = parseFloat(pipingCalc.stress) * 1000 // Convert ksi to psi
    const Y = parseFloat(pipingCalc.y)

    if (P && D && S && Y) {
      const denominator = 2 * (S + P * Y)
      const thickness = (P * D) / denominator
      setPipingCalc(prev => ({ ...prev, result: thickness.toFixed(4) }))
    }
  }

  // Piping pressure calculation: P = 2SEt / (D - 2tY)
  const calculatePipingPressure = () => {
    const S = parseFloat(pipingPressureCalc.stress) * 1000 // Convert ksi to psi
    const t = parseFloat(pipingPressureCalc.thickness)
    const D = parseFloat(pipingPressureCalc.diameter)
    const Y = parseFloat(pipingPressureCalc.y)

    if (S && t && D && Y) {
      const denominator = D - 2 * t * Y
      if (denominator > 0) {
        const pressure = (2 * S * t) / denominator
        setPipingPressureCalc(prev => ({ ...prev, result: pressure.toFixed(2) }))
      } else {
        setPipingPressureCalc(prev => ({ ...prev, result: 'Invalid - Check inputs' }))
      }
    }
  }

  // Pipeline pressure calculation: P = (2St/D) * F * E * T
  const calculatePipelinePressure = () => {
    const S = parseFloat(pipelineCalc.yieldStrength)
    const t = parseFloat(pipelineCalc.thickness)
    const D = parseFloat(pipelineCalc.diameter)
    const F = parseFloat(pipelineCalc.designFactor)
    const E = parseFloat(pipelineCalc.jointFactor)
    const T = parseFloat(pipelineCalc.tempFactor)

    if (S && t && D && F && E && T) {
      const pressure = (2 * S * t / D) * F * E * T
      setPipelineCalc(prev => ({ ...prev, result: pressure.toFixed(2) }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle className="text-purple-900">Engineering Calculations</CardTitle>
              <CardDescription className="text-purple-700">
                ASME and API standard calculations for pressure vessel design and assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="shell" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="shell">Shell t_min</TabsTrigger>
          <TabsTrigger value="head">Head t_min</TabsTrigger>
          <TabsTrigger value="mawp">MAWP</TabsTrigger>
          <TabsTrigger value="piping">Piping t_min</TabsTrigger>
          <TabsTrigger value="piping-pressure">Piping P_max</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline P</TabsTrigger>
        </TabsList>

        {/* Shell Thickness Calculation */}
        <TabsContent value="shell">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span>Shell Minimum Required Thickness</span>
              </CardTitle>
              <CardDescription>
                ASME Section VIII, Division 1, UG-27: t = PR / (SE - 0.6P)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shell-pressure">Internal Design Pressure (P) - psig</Label>
                  <Input
                    id="shell-pressure"
                    type="number"
                    value={shellCalc.pressure}
                    onChange={(e) => setShellCalc(prev => ({ ...prev, pressure: e.target.value }))}
                    placeholder="e.g., 150"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shell-radius">Inside Radius (R) - inches</Label>
                  <Input
                    id="shell-radius"
                    type="number"
                    value={shellCalc.radius}
                    onChange={(e) => setShellCalc(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="e.g., 36"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shell-stress">Allowable Stress (S) - ksi</Label>
                  <Input
                    id="shell-stress"
                    type="number"
                    value={shellCalc.stress}
                    onChange={(e) => setShellCalc(prev => ({ ...prev, stress: e.target.value }))}
                    placeholder="e.g., 17.5"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shell-efficiency">Joint Efficiency (E)</Label>
                  <Input
                    id="shell-efficiency"
                    type="number"
                    value={shellCalc.efficiency}
                    onChange={(e) => setShellCalc(prev => ({ ...prev, efficiency: e.target.value }))}
                    placeholder="1.0"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculateShellThickness} className="bg-blue-600 hover:bg-blue-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {shellCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Required Thickness: {shellCalc.result} inches</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Formula: t = PR / (SE - 0.6P)</p>
                    <p>Where: P = Internal pressure, R = Inside radius, S = Allowable stress, E = Joint efficiency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Head Thickness Calculation */}
        <TabsContent value="head">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-green-600" />
                <span>2:1 Ellipsoidal Head Minimum Required Thickness</span>
              </CardTitle>
              <CardDescription>
                ASME Section VIII, Division 1, UG-32: t = PR / (2SE - 0.2P)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="head-pressure">Internal Design Pressure (P) - psig</Label>
                  <Input
                    id="head-pressure"
                    type="number"
                    value={headCalc.pressure}
                    onChange={(e) => setHeadCalc(prev => ({ ...prev, pressure: e.target.value }))}
                    placeholder="e.g., 150"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head-radius">Inside Radius (R) - inches</Label>
                  <Input
                    id="head-radius"
                    type="number"
                    value={headCalc.radius}
                    onChange={(e) => setHeadCalc(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="e.g., 36"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head-stress">Allowable Stress (S) - ksi</Label>
                  <Input
                    id="head-stress"
                    type="number"
                    value={headCalc.stress}
                    onChange={(e) => setHeadCalc(prev => ({ ...prev, stress: e.target.value }))}
                    placeholder="e.g., 17.5"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head-efficiency">Joint Efficiency (E)</Label>
                  <Input
                    id="head-efficiency"
                    type="number"
                    value={headCalc.efficiency}
                    onChange={(e) => setHeadCalc(prev => ({ ...prev, efficiency: e.target.value }))}
                    placeholder="1.0"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculateHeadThickness} className="bg-green-600 hover:bg-green-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {headCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Required Thickness: {headCalc.result} inches</span>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Formula: t = PR / (2SE - 0.2P)</p>
                    <p>For 2:1 ellipsoidal heads. For other head types, different formulas apply.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAWP Calculation */}
        <TabsContent value="mawp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                <span>Maximum Allowable Working Pressure (MAWP)</span>
              </CardTitle>
              <CardDescription>
                ASME Section VIII, Division 1, UG-27: P = (SEt) / (R + 0.6t)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mawp-stress">Allowable Stress (S) - ksi</Label>
                  <Input
                    id="mawp-stress"
                    type="number"
                    value={mawpCalc.stress}
                    onChange={(e) => setMawpCalc(prev => ({ ...prev, stress: e.target.value }))}
                    placeholder="e.g., 17.5"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawp-efficiency">Joint Efficiency (E)</Label>
                  <Input
                    id="mawp-efficiency"
                    type="number"
                    value={mawpCalc.efficiency}
                    onChange={(e) => setMawpCalc(prev => ({ ...prev, efficiency: e.target.value }))}
                    placeholder="1.0"
                    step="0.01"
                    min="0.1"
                    max="1.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawp-thickness">Thickness (t) - inches</Label>
                  <Input
                    id="mawp-thickness"
                    type="number"
                    value={mawpCalc.thickness}
                    onChange={(e) => setMawpCalc(prev => ({ ...prev, thickness: e.target.value }))}
                    placeholder="e.g., 0.5"
                    step="0.001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mawp-radius">Inside Radius (R) - inches</Label>
                  <Input
                    id="mawp-radius"
                    type="number"
                    value={mawpCalc.radius}
                    onChange={(e) => setMawpCalc(prev => ({ ...prev, radius: e.target.value }))}
                    placeholder="e.g., 36"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculateMAWP} className="bg-purple-600 hover:bg-purple-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {mawpCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">MAWP: {mawpCalc.result} psig</span>
                  </div>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Formula: P = (SEt) / (R + 0.6t)</p>
                    <p>Used to determine the maximum allowable working pressure for shells.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Piping Thickness */}
        <TabsContent value="piping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                <span>Piping Minimum Required Thickness</span>
              </CardTitle>
              <CardDescription>
                ANSI B31.3, Para. 304.1.2: t = PD / (2(SE + PY))
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="piping-pressure">Internal Design Pressure (P) - psig</Label>
                  <Input
                    id="piping-pressure"
                    type="number"
                    value={pipingCalc.pressure}
                    onChange={(e) => setPipingCalc(prev => ({ ...prev, pressure: e.target.value }))}
                    placeholder="e.g., 150"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-diameter">Outside Diameter (D) - inches</Label>
                  <Input
                    id="piping-diameter"
                    type="number"
                    value={pipingCalc.diameter}
                    onChange={(e) => setPipingCalc(prev => ({ ...prev, diameter: e.target.value }))}
                    placeholder="e.g., 12.75"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-stress">Allowable Stress (S) - ksi</Label>
                  <Input
                    id="piping-stress"
                    type="number"
                    value={pipingCalc.stress}
                    onChange={(e) => setPipingCalc(prev => ({ ...prev, stress: e.target.value }))}
                    placeholder="e.g., 16.3"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-y">Y Coefficient</Label>
                  <Input
                    id="piping-y"
                    type="number"
                    value={pipingCalc.y}
                    onChange={(e) => setPipingCalc(prev => ({ ...prev, y: e.target.value }))}
                    placeholder="0.4"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculatePipingThickness} className="bg-orange-600 hover:bg-orange-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {pipingCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Required Thickness: {pipingCalc.result} inches</span>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium mb-1">Formula: t = PD / (2(SE + PY))</p>
                    <p>Y = 0.4 for ferritic steels up to 900°F. E = 1.0 for seamless pipe.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Piping Pressure */}
        <TabsContent value="piping-pressure">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-red-600" />
                <span>Piping Maximum Pressure</span>
              </CardTitle>
              <CardDescription>
                ANSI B31.3, Para. 304.1.2: P = 2SEt / (D - 2tY)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="piping-pressure-stress">Allowable Stress (S) - ksi</Label>
                  <Input
                    id="piping-pressure-stress"
                    type="number"
                    value={pipingPressureCalc.stress}
                    onChange={(e) => setPipingPressureCalc(prev => ({ ...prev, stress: e.target.value }))}
                    placeholder="e.g., 16.3"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-pressure-thickness">Thickness (t) - inches</Label>
                  <Input
                    id="piping-pressure-thickness"
                    type="number"
                    value={pipingPressureCalc.thickness}
                    onChange={(e) => setPipingPressureCalc(prev => ({ ...prev, thickness: e.target.value }))}
                    placeholder="e.g., 0.5"
                    step="0.001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-pressure-diameter">Outside Diameter (D) - inches</Label>
                  <Input
                    id="piping-pressure-diameter"
                    type="number"
                    value={pipingPressureCalc.diameter}
                    onChange={(e) => setPipingPressureCalc(prev => ({ ...prev, diameter: e.target.value }))}
                    placeholder="e.g., 12.75"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="piping-pressure-y">Y Coefficient</Label>
                  <Input
                    id="piping-pressure-y"
                    type="number"
                    value={pipingPressureCalc.y}
                    onChange={(e) => setPipingPressureCalc(prev => ({ ...prev, y: e.target.value }))}
                    placeholder="0.4"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculatePipingPressure} className="bg-red-600 hover:bg-red-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {pipingPressureCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Maximum Pressure: {pipingPressureCalc.result} psig</span>
                  </div>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Formula: P = 2SEt / (D - 2tY)</p>
                    <p>Used to determine maximum allowable pressure for existing piping.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Pressure */}
        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-teal-600" />
                <span>Pipeline Internal Design Pressure</span>
              </CardTitle>
              <CardDescription>
                ANSI B31.8, para 841.1: P = (2St/D) × F × E × T
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pipeline-yield">Yield Strength (S) - psi</Label>
                  <Input
                    id="pipeline-yield"
                    type="number"
                    value={pipelineCalc.yieldStrength}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, yieldStrength: e.target.value }))}
                    placeholder="e.g., 35000"
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipeline-thickness">Wall Thickness (t) - inches</Label>
                  <Input
                    id="pipeline-thickness"
                    type="number"
                    value={pipelineCalc.thickness}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, thickness: e.target.value }))}
                    placeholder="e.g., 0.18"
                    step="0.001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipeline-diameter">Outside Diameter (D) - inches</Label>
                  <Input
                    id="pipeline-diameter"
                    type="number"
                    value={pipelineCalc.diameter}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, diameter: e.target.value }))}
                    placeholder="e.g., 16"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipeline-design-factor">Design Factor (F)</Label>
                  <Input
                    id="pipeline-design-factor"
                    type="number"
                    value={pipelineCalc.designFactor}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, designFactor: e.target.value }))}
                    placeholder="0.72"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipeline-joint-factor">Joint Factor (E)</Label>
                  <Input
                    id="pipeline-joint-factor"
                    type="number"
                    value={pipelineCalc.jointFactor}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, jointFactor: e.target.value }))}
                    placeholder="1.0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pipeline-temp-factor">Temperature Factor (T)</Label>
                  <Input
                    id="pipeline-temp-factor"
                    type="number"
                    value={pipelineCalc.tempFactor}
                    onChange={(e) => setPipelineCalc(prev => ({ ...prev, tempFactor: e.target.value }))}
                    placeholder="1.0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={calculatePipelinePressure} className="bg-teal-600 hover:bg-teal-700">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
                {pipelineCalc.result && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Design Pressure: {pipelineCalc.result} psig</span>
                  </div>
                )}
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div className="text-sm text-teal-800">
                    <p className="font-medium mb-1">Formula: P = (2St/D) × F × E × T</p>
                    <p>F = 0.72 for most applications, E = 1.0 for seamless, T = 1.0 for ≤250°F</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reference Information */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <span>Calculation References</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">ASME References:</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• Section VIII, Div. 1, UG-27: Shell thickness</li>
                <li>• Section VIII, Div. 1, UG-32: Head thickness</li>
                <li>• Section II, Part D: Material properties</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">ANSI/API References:</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• B31.3, Para. 304.1.2: Process piping</li>
                <li>• B31.8, Para. 841.1: Gas transmission</li>
                <li>• API 510: Pressure vessel inspection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
