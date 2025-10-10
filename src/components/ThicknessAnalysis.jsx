import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Gauge, Plus, Trash2, Calculator, AlertTriangle, TrendingDown, Calendar } from 'lucide-react'

export default function ThicknessAnalysis({ data, onDataChange }) {
  const [tmls, setTmls] = useState(data.tmls || [])
  const [newTml, setNewTml] = useState({
    id: '',
    location: '',
    component: 'shell',
    initialThickness: '',
    initialDate: '',
    previousThickness: '',
    previousDate: '',
    currentThickness: '',
    currentDate: new Date().toISOString().split('T')[0],
    minimumThickness: '',
    notes: ''
  })

  const [corrosionAnalysis, setCorrosionAnalysis] = useState({
    shortTermRate: null,
    longTermRate: null,
    remainingLife: null,
    nextInspectionDate: null
  })

  const componentTypes = [
    'shell',
    'head',
    'nozzle',
    'manway',
    'support',
    'internal'
  ]

  useEffect(() => {
    onDataChange({ ...data, tmls, corrosionAnalysis })
  }, [tmls, corrosionAnalysis, data, onDataChange])

  const addTml = () => {
    if (newTml.id && newTml.location && newTml.currentThickness) {
      const tml = {
        ...newTml,
        id: `TML-${String(tmls.length + 1).padStart(3, '0')}`
      }
      setTmls([...tmls, tml])
      setNewTml({
        id: '',
        location: '',
        component: 'shell',
        initialThickness: '',
        initialDate: '',
        previousThickness: '',
        previousDate: '',
        currentThickness: '',
        currentDate: new Date().toISOString().split('T')[0],
        minimumThickness: '',
        notes: ''
      })
    }
  }

  const removeTml = (index) => {
    setTmls(tmls.filter((_, i) => i !== index))
  }

  const calculateCorrosionRates = (tml) => {
    const current = parseFloat(tml.currentThickness)
    const previous = parseFloat(tml.previousThickness)
    const initial = parseFloat(tml.initialThickness)
    const minimum = parseFloat(tml.minimumThickness)
    
    const currentDate = new Date(tml.currentDate)
    const previousDate = new Date(tml.previousDate)
    const initialDate = new Date(tml.initialDate)

    let shortTermRate = null
    let longTermRate = null
    let remainingLife = null

    // Short-term corrosion rate
    if (previous && current && previousDate && currentDate) {
      const timeDiff = (currentDate - previousDate) / (365.25 * 24 * 60 * 60 * 1000) // years
      if (timeDiff > 0) {
        shortTermRate = (previous - current) / timeDiff
      }
    }

    // Long-term corrosion rate
    if (initial && current && initialDate && currentDate) {
      const timeDiff = (currentDate - initialDate) / (365.25 * 24 * 60 * 60 * 1000) // years
      if (timeDiff > 0) {
        longTermRate = (initial - current) / timeDiff
      }
    }

    // Remaining life calculation
    if (current && minimum && (shortTermRate || longTermRate)) {
      const rate = shortTermRate || longTermRate
      if (rate > 0) {
        remainingLife = (current - minimum) / rate
      }
    }

    return {
      shortTermRate: shortTermRate ? shortTermRate.toFixed(4) : null,
      longTermRate: longTermRate ? longTermRate.toFixed(4) : null,
      remainingLife: remainingLife ? remainingLife.toFixed(1) : null
    }
  }

  const getWorstCaseAnalysis = () => {
    if (tmls.length === 0) return null

    let worstRate = 0
    let shortestLife = Infinity
    let criticalTml = null

    tmls.forEach(tml => {
      const analysis = calculateCorrosionRates(tml)
      const rate = Math.max(
        parseFloat(analysis.shortTermRate) || 0,
        parseFloat(analysis.longTermRate) || 0
      )
      const life = parseFloat(analysis.remainingLife) || Infinity

      if (rate > worstRate) {
        worstRate = rate
      }
      if (life < shortestLife) {
        shortestLife = life
        criticalTml = tml
      }
    })

    return {
      worstCorrosionRate: worstRate.toFixed(4),
      shortestRemainingLife: shortestLife === Infinity ? null : shortestLife.toFixed(1),
      criticalTml: criticalTml
    }
  }

  const worstCase = getWorstCaseAnalysis()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Gauge className="h-6 w-6 text-orange-600" />
            <div>
              <CardTitle className="text-orange-900">Thickness Measurement & Corrosion Rate Analysis</CardTitle>
              <CardDescription className="text-orange-700">
                Record TML data and calculate corrosion rates and remaining life per API 510
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add New TML */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Add Thickness Monitoring Location (TML)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tml-location">Location Description *</Label>
              <Input
                id="tml-location"
                value={newTml.location}
                onChange={(e) => setNewTml(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Shell bottom, 6 o'clock"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-component">Component Type</Label>
              <Select value={newTml.component} onValueChange={(value) => setNewTml(prev => ({ ...prev, component: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-minimum">Minimum Required Thickness (inches)</Label>
              <Input
                id="tml-minimum"
                type="number"
                value={newTml.minimumThickness}
                onChange={(e) => setNewTml(prev => ({ ...prev, minimumThickness: e.target.value }))}
                placeholder="e.g., 0.125"
                step="0.001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-initial">Initial Thickness (inches)</Label>
              <Input
                id="tml-initial"
                type="number"
                value={newTml.initialThickness}
                onChange={(e) => setNewTml(prev => ({ ...prev, initialThickness: e.target.value }))}
                placeholder="e.g., 0.500"
                step="0.001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-initial-date">Initial Date</Label>
              <Input
                id="tml-initial-date"
                type="date"
                value={newTml.initialDate}
                onChange={(e) => setNewTml(prev => ({ ...prev, initialDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-previous">Previous Thickness (inches)</Label>
              <Input
                id="tml-previous"
                type="number"
                value={newTml.previousThickness}
                onChange={(e) => setNewTml(prev => ({ ...prev, previousThickness: e.target.value }))}
                placeholder="e.g., 0.485"
                step="0.001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-previous-date">Previous Date</Label>
              <Input
                id="tml-previous-date"
                type="date"
                value={newTml.previousDate}
                onChange={(e) => setNewTml(prev => ({ ...prev, previousDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-current">Current Thickness (inches) *</Label>
              <Input
                id="tml-current"
                type="number"
                value={newTml.currentThickness}
                onChange={(e) => setNewTml(prev => ({ ...prev, currentThickness: e.target.value }))}
                placeholder="e.g., 0.470"
                step="0.001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tml-current-date">Current Date</Label>
              <Input
                id="tml-current-date"
                type="date"
                value={newTml.currentDate}
                onChange={(e) => setNewTml(prev => ({ ...prev, currentDate: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tml-notes">Notes</Label>
            <Input
              id="tml-notes"
              value={newTml.notes}
              onChange={(e) => setNewTml(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional observations or comments"
            />
          </div>

          <Button onClick={addTml} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add TML
          </Button>
        </CardContent>
      </Card>

      {/* TML Data Table */}
      {tmls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="h-5 w-5 text-slate-600" />
              <span>Thickness Monitoring Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TML ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>t_min (in)</TableHead>
                    <TableHead>t_initial (in)</TableHead>
                    <TableHead>t_previous (in)</TableHead>
                    <TableHead>t_current (in)</TableHead>
                    <TableHead>ST Rate (in/yr)</TableHead>
                    <TableHead>LT Rate (in/yr)</TableHead>
                    <TableHead>Remaining Life (yr)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tmls.map((tml, index) => {
                    const analysis = calculateCorrosionRates(tml)
                    const isAtRisk = parseFloat(analysis.remainingLife) < 5
                    
                    return (
                      <TableRow key={index} className={isAtRisk ? 'bg-red-50' : ''}>
                        <TableCell className="font-mono">{tml.id}</TableCell>
                        <TableCell>{tml.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tml.component}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{tml.minimumThickness}</TableCell>
                        <TableCell className="font-mono">{tml.initialThickness}</TableCell>
                        <TableCell className="font-mono">{tml.previousThickness}</TableCell>
                        <TableCell className="font-mono font-medium">{tml.currentThickness}</TableCell>
                        <TableCell className="font-mono">
                          {analysis.shortTermRate || '-'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {analysis.longTermRate || '-'}
                        </TableCell>
                        <TableCell className="font-mono">
                          {analysis.remainingLife ? (
                            <div className="flex items-center space-x-1">
                              {isAtRisk && <AlertTriangle className="h-4 w-4 text-red-500" />}
                              <span className={isAtRisk ? 'text-red-600 font-medium' : ''}>
                                {analysis.remainingLife}
                              </span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTml(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corrosion Analysis Summary */}
      {worstCase && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <span>Corrosion Analysis Summary</span>
            </CardTitle>
            <CardDescription>
              Worst-case analysis for inspection planning per API 510 Section 5.3
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">Worst Corrosion Rate</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-red-600">
                      {worstCase.worstCorrosionRate}
                    </span>
                    <span className="text-red-700 ml-1">in/yr</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-900">Shortest Remaining Life</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {worstCase.shortestRemainingLife || 'N/A'}
                    </span>
                    {worstCase.shortestRemainingLife && (
                      <span className="text-orange-700 ml-1">years</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Critical Location</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      {worstCase.criticalTml?.location || 'N/A'}
                    </span>
                    {worstCase.criticalTml && (
                      <div className="text-xs text-blue-700 mt-1">
                        {worstCase.criticalTml.id}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">API 510 Corrosion Rate Calculations</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>Short-Term Rate:</strong> (t_previous - t_current) / (date_current - date_previous)</p>
                <p><strong>Long-Term Rate:</strong> (t_initial - t_current) / (date_current - date_initial)</p>
                <p><strong>Remaining Life:</strong> (t_current - t_min) / Corrosion_Rate</p>
                <p className="mt-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Locations with remaining life &lt; 5 years are highlighted in red
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Recommendations */}
      {worstCase && worstCase.shortestRemainingLife && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span>Inspection Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parseFloat(worstCase.shortestRemainingLife) < 2 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">Immediate Action Required</p>
                      <p className="text-red-700 text-sm mt-1">
                        Remaining life is less than 2 years. Consider immediate repair, replacement, or increased inspection frequency.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {parseFloat(worstCase.shortestRemainingLife) >= 2 && parseFloat(worstCase.shortestRemainingLife) < 5 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Increased Monitoring Recommended</p>
                      <p className="text-orange-700 text-sm mt-1">
                        Remaining life is less than 5 years. Consider more frequent thickness monitoring.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-medium text-blue-900 mb-2">Recommended Next Inspection:</p>
                <p className="text-blue-700 text-sm">
                  Based on API 510 guidelines, next inspection should occur within{' '}
                  <strong>{Math.min(Math.floor(parseFloat(worstCase.shortestRemainingLife) / 2), 10)} years</strong>{' '}
                  or by{' '}
                  <strong>
                    {new Date(Date.now() + Math.min(Math.floor(parseFloat(worstCase.shortestRemainingLife) / 2), 10) * 365.25 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
