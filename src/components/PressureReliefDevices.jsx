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
import { Shield, Plus, Trash2, CheckCircle, AlertTriangle, Settings, FileText } from 'lucide-react'

export default function PressureReliefDevices({ data, onDataChange }) {
  const [reliefDevices, setReliefDevices] = useState(data.reliefDevices || [])
  const [newDevice, setNewDevice] = useState({
    deviceId: '',
    type: '',
    manufacturer: '',
    model: '',
    setPoint: '',
    capacity: '',
    inlet: '',
    outlet: '',
    lastTestDate: '',
    nextTestDate: '',
    condition: '',
    testResults: '',
    inspector: '',
    notes: ''
  })

  const deviceTypes = [
    'Safety Relief Valve',
    'Relief Valve',
    'Safety Valve',
    'Pilot Operated Relief Valve',
    'Rupture Disc',
    'Rupture Disc/Relief Valve Combination',
    'Other'
  ]

  const conditions = [
    'Satisfactory',
    'Needs Adjustment',
    'Needs Repair',
    'Needs Replacement',
    'Out of Service'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      reliefDevices
    })
  }, [reliefDevices, data, onDataChange])

  const addDevice = () => {
    if (newDevice.deviceId && newDevice.type && newDevice.setPoint) {
      setReliefDevices([...reliefDevices, { ...newDevice, id: Date.now() }])
      setNewDevice({
        deviceId: '',
        type: '',
        manufacturer: '',
        model: '',
        setPoint: '',
        capacity: '',
        inlet: '',
        outlet: '',
        lastTestDate: '',
        nextTestDate: '',
        condition: '',
        testResults: '',
        inspector: '',
        notes: ''
      })
    }
  }

  const removeDevice = (id) => {
    setReliefDevices(reliefDevices.filter(d => d.id !== id))
  }

  const calculateNextTestDate = (lastTestDate) => {
    if (lastTestDate) {
      const lastDate = new Date(lastTestDate)
      const nextDate = new Date(lastDate)
      nextDate.setFullYear(lastDate.getFullYear() + 5) // API 510 standard 5-year interval
      return nextDate.toISOString().split('T')[0]
    }
    return ''
  }

  const isOverdue = (nextTestDate) => {
    if (!nextTestDate) return false
    const today = new Date()
    const testDate = new Date(nextTestDate)
    return testDate < today
  }

  const isDueSoon = (nextTestDate) => {
    if (!nextTestDate) return false
    const today = new Date()
    const testDate = new Date(nextTestDate)
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(today.getMonth() + 6)
    return testDate <= sixMonthsFromNow && testDate >= today
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-emerald-600" />
            <div>
              <CardTitle className="text-emerald-900">Pressure Relief Devices</CardTitle>
              <CardDescription className="text-emerald-700">
                Inspection and testing of pressure relief devices per API 510 Section 9
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add New Device */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <span>Add Pressure Relief Device</span>
          </CardTitle>
          <CardDescription>
            Document pressure relief devices protecting this vessel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-slate-900">Device Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="device-id">Device ID *</Label>
                <Input
                  id="device-id"
                  value={newDevice.deviceId}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, deviceId: e.target.value }))}
                  placeholder="e.g., PSV-101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-type">Device Type *</Label>
                <Select 
                  value={newDevice.type} 
                  onValueChange={(value) => setNewDevice(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={newDevice.manufacturer}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="e.g., Anderson Greenwood"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="e.g., 95-7000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="set-point">Set Point (psig) *</Label>
                <Input
                  id="set-point"
                  type="number"
                  value={newDevice.setPoint}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, setPoint: e.target.value }))}
                  placeholder="e.g., 150"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (SCFM or GPM)</Label>
                <Input
                  id="capacity"
                  value={newDevice.capacity}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="e.g., 1000 SCFM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inlet-size">Inlet Size</Label>
                <Input
                  id="inlet-size"
                  value={newDevice.inlet}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, inlet: e.target.value }))}
                  placeholder="e.g., 2 inch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outlet-size">Outlet Size</Label>
                <Input
                  id="outlet-size"
                  value={newDevice.outlet}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, outlet: e.target.value }))}
                  placeholder="e.g., 3 inch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-test-date">Last Test Date</Label>
                <Input
                  id="last-test-date"
                  type="date"
                  value={newDevice.lastTestDate}
                  onChange={(e) => {
                    const lastDate = e.target.value
                    setNewDevice(prev => ({ 
                      ...prev, 
                      lastTestDate: lastDate,
                      nextTestDate: calculateNextTestDate(lastDate)
                    }))
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-test-date">Next Test Date</Label>
                <Input
                  id="next-test-date"
                  type="date"
                  value={newDevice.nextTestDate}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, nextTestDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select 
                  value={newDevice.condition} 
                  onValueChange={(value) => setNewDevice(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector">Inspector</Label>
                <Input
                  id="inspector"
                  value={newDevice.inspector}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, inspector: e.target.value }))}
                  placeholder="Inspector name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-results">Test Results</Label>
                <Textarea
                  id="test-results"
                  value={newDevice.testResults}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, testResults: e.target.value }))}
                  placeholder="Test results and observations"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-notes">Notes</Label>
                <Textarea
                  id="device-notes"
                  value={newDevice.notes}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or observations"
                  rows={3}
                />
              </div>
            </div>

            <Button onClick={addDevice} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relief Devices List */}
      {reliefDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span>Pressure Relief Devices</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reliefDevices.map((device) => (
              <Card key={device.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline" className="font-mono">{device.deviceId}</Badge>
                        <Badge variant="outline">{device.type}</Badge>
                        <Badge 
                          className={
                            device.condition === 'Satisfactory' ? 'bg-green-100 text-green-800 border-green-300' :
                            device.condition === 'Needs Adjustment' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            device.condition === 'Out of Service' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-orange-100 text-orange-800 border-orange-300'
                          }
                        >
                          {device.condition || 'Not assessed'}
                        </Badge>
                        {isOverdue(device.nextTestDate) && (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {isDueSoon(device.nextTestDate) && !isOverdue(device.nextTestDate) && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Manufacturer:</span>
                          <p className="text-slate-600">{device.manufacturer || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Model:</span>
                          <p className="text-slate-600">{device.model || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Set Point:</span>
                          <p className="text-slate-600 font-mono">{device.setPoint} psig</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Capacity:</span>
                          <p className="text-slate-600">{device.capacity || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Inlet/Outlet:</span>
                          <p className="text-slate-600">{device.inlet || 'N/A'} / {device.outlet || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Last Test:</span>
                          <p className="text-slate-600">{device.lastTestDate || 'Not recorded'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Next Test:</span>
                          <p className={`text-slate-600 ${
                            isOverdue(device.nextTestDate) ? 'text-red-600 font-medium' :
                            isDueSoon(device.nextTestDate) ? 'text-yellow-600 font-medium' : ''
                          }`}>
                            {device.nextTestDate || 'Not scheduled'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Inspector:</span>
                          <p className="text-slate-600">{device.inspector || 'Not specified'}</p>
                        </div>
                      </div>

                      {device.testResults && (
                        <div className="mt-3">
                          <span className="font-medium text-slate-700">Test Results:</span>
                          <p className="text-slate-600 text-sm mt-1">{device.testResults}</p>
                        </div>
                      )}

                      {device.notes && (
                        <div className="mt-3">
                          <span className="font-medium text-slate-700">Notes:</span>
                          <p className="text-slate-600 text-sm mt-1">{device.notes}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeDevice(device.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            <span>Relief Device Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-900 mb-2">Total Devices</h4>
              <div className="text-2xl font-bold text-emerald-600">{reliefDevices.length}</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Satisfactory</h4>
              <div className="text-2xl font-bold text-green-600">
                {reliefDevices.filter(d => d.condition === 'Satisfactory').length}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Due Soon</h4>
              <div className="text-2xl font-bold text-yellow-600">
                {reliefDevices.filter(d => isDueSoon(d.nextTestDate) && !isOverdue(d.nextTestDate)).length}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Overdue</h4>
              <div className="text-2xl font-bold text-red-600">
                {reliefDevices.filter(d => isOverdue(d.nextTestDate)).length}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">API 510 Relief Device Requirements</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Relief devices must be tested at intervals not exceeding 5 years</p>
              <p>• Set point tolerance typically ±3% for safety relief valves</p>
              <p>• Visual inspection required during vessel inspection</p>
              <p>• Capacity must be adequate for maximum credible overpressure scenario</p>
              <p>• Installation must comply with ASME Section VIII and applicable codes</p>
              <p>• Documentation must include test certificates and calibration records</p>
            </div>
          </div>

          {reliefDevices.filter(d => isOverdue(d.nextTestDate) || isDueSoon(d.nextTestDate)).length > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Action Required</p>
                  <p className="text-orange-700 text-sm mt-1">
                    {reliefDevices.filter(d => isOverdue(d.nextTestDate)).length > 0 && 
                      `${reliefDevices.filter(d => isOverdue(d.nextTestDate)).length} device(s) overdue for testing. `}
                    {reliefDevices.filter(d => isDueSoon(d.nextTestDate) && !isOverdue(d.nextTestDate)).length > 0 && 
                      `${reliefDevices.filter(d => isDueSoon(d.nextTestDate) && !isOverdue(d.nextTestDate)).length} device(s) due for testing within 6 months.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
