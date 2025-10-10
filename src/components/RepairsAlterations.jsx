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
import { Settings, Plus, Trash2, CheckCircle, FileText, Wrench } from 'lucide-react'

export default function RepairsAlterations({ data, onDataChange }) {
  const [repairs, setRepairs] = useState(data.repairs || [])
  const [newRepair, setNewRepair] = useState({
    type: '',
    location: '',
    description: '',
    procedure: '',
    materials: '',
    welder: '',
    inspector: '',
    date: new Date().toISOString().split('T')[0],
    ndeRequired: false,
    ndeType: '',
    ndeResults: '',
    approved: false
  })

  const [alterations, setAlterations] = useState(data.alterations || [])
  const [newAlteration, setNewAlteration] = useState({
    type: '',
    description: '',
    engineeringAnalysis: '',
    approvalRequired: false,
    approvedBy: '',
    date: new Date().toISOString().split('T')[0],
    drawings: '',
    calculations: ''
  })

  const repairTypes = [
    'Weld Repair',
    'Patch Repair',
    'Sleeve Repair',
    'Composite Repair',
    'Grinding/Machining',
    'Bolt Hole Repair',
    'Nozzle Repair',
    'Support Repair',
    'Other'
  ]

  const alterationTypes = [
    'Nozzle Addition',
    'Nozzle Modification',
    'Manway Addition',
    'Internal Addition',
    'Support Modification',
    'Rerating',
    'Other'
  ]

  const ndeTypes = [
    'Visual Testing (VT)',
    'Penetrant Testing (PT)',
    'Magnetic Particle Testing (MT)',
    'Ultrasonic Testing (UT)',
    'Radiographic Testing (RT)',
    'Other'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      repairs,
      alterations
    })
  }, [repairs, alterations, data, onDataChange])

  const addRepair = () => {
    if (newRepair.type && newRepair.location && newRepair.description) {
      setRepairs([...repairs, { ...newRepair, id: Date.now() }])
      setNewRepair({
        type: '',
        location: '',
        description: '',
        procedure: '',
        materials: '',
        welder: '',
        inspector: '',
        date: new Date().toISOString().split('T')[0],
        ndeRequired: false,
        ndeType: '',
        ndeResults: '',
        approved: false
      })
    }
  }

  const removeRepair = (id) => {
    setRepairs(repairs.filter(r => r.id !== id))
  }

  const addAlteration = () => {
    if (newAlteration.type && newAlteration.description) {
      setAlterations([...alterations, { ...newAlteration, id: Date.now() }])
      setNewAlteration({
        type: '',
        description: '',
        engineeringAnalysis: '',
        approvalRequired: false,
        approvedBy: '',
        date: new Date().toISOString().split('T')[0],
        drawings: '',
        calculations: ''
      })
    }
  }

  const removeAlteration = (id) => {
    setAlterations(alterations.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-amber-600" />
            <div>
              <CardTitle className="text-amber-900">Repairs & Alterations</CardTitle>
              <CardDescription className="text-amber-700">
                Document repairs and alterations per API 510 Section 7
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Repairs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <span>Repairs</span>
          </CardTitle>
          <CardDescription>
            Document all repairs performed on the pressure vessel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Repair */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-slate-900">Add New Repair</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repair-type">Repair Type *</Label>
                <Select 
                  value={newRepair.type} 
                  onValueChange={(value) => setNewRepair(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select repair type" />
                  </SelectTrigger>
                  <SelectContent>
                    {repairTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repair-location">Location *</Label>
                <Input
                  id="repair-location"
                  value={newRepair.location}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Shell bottom, 6 o'clock"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repair-date">Repair Date</Label>
                <Input
                  id="repair-date"
                  type="date"
                  value={newRepair.date}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welder">Welder</Label>
                <Input
                  id="welder"
                  value={newRepair.welder}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, welder: e.target.value }))}
                  placeholder="Welder name/certification"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repair-inspector">Inspector</Label>
                <Input
                  id="repair-inspector"
                  value={newRepair.inspector}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, inspector: e.target.value }))}
                  placeholder="Inspector name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nde-type">NDE Type</Label>
                <Select 
                  value={newRepair.ndeType} 
                  onValueChange={(value) => setNewRepair(prev => ({ ...prev, ndeType: value }))}
                  disabled={!newRepair.ndeRequired}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select NDE type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ndeTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair-description">Description *</Label>
              <Textarea
                id="repair-description"
                value={newRepair.description}
                onChange={(e) => setNewRepair(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the repair"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="repair-procedure">Repair Procedure</Label>
                <Textarea
                  id="repair-procedure"
                  value={newRepair.procedure}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, procedure: e.target.value }))}
                  placeholder="Repair procedure reference or description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repair-materials">Materials Used</Label>
                <Textarea
                  id="repair-materials"
                  value={newRepair.materials}
                  onChange={(e) => setNewRepair(prev => ({ ...prev, materials: e.target.value }))}
                  placeholder="Materials, electrodes, consumables used"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nde-required"
                  checked={newRepair.ndeRequired}
                  onCheckedChange={(checked) => setNewRepair(prev => ({ ...prev, ndeRequired: checked }))}
                />
                <Label htmlFor="nde-required">NDE Required</Label>
              </div>

              {newRepair.ndeRequired && (
                <div className="space-y-2">
                  <Label htmlFor="nde-results">NDE Results</Label>
                  <Textarea
                    id="nde-results"
                    value={newRepair.ndeResults}
                    onChange={(e) => setNewRepair(prev => ({ ...prev, ndeResults: e.target.value }))}
                    placeholder="NDE results and acceptance criteria"
                    rows={2}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repair-approved"
                  checked={newRepair.approved}
                  onCheckedChange={(checked) => setNewRepair(prev => ({ ...prev, approved: checked }))}
                />
                <Label htmlFor="repair-approved">Repair Approved</Label>
              </div>
            </div>

            <Button onClick={addRepair} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Repair
            </Button>
          </div>

          {/* Repairs List */}
          {repairs.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Documented Repairs</h4>
              {repairs.map((repair) => (
                <Card key={repair.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{repair.type}</Badge>
                          <Badge 
                            className={repair.approved ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}
                          >
                            {repair.approved ? 'Approved' : 'Pending Approval'}
                          </Badge>
                          {repair.ndeRequired && (
                            <Badge variant="outline">NDE Required</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Location:</span>
                            <p className="text-slate-600">{repair.location}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Date:</span>
                            <p className="text-slate-600">{repair.date}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Welder:</span>
                            <p className="text-slate-600">{repair.welder || 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="font-medium text-slate-700">Description:</span>
                          <p className="text-slate-600 text-sm mt-1">{repair.description}</p>
                        </div>

                        {repair.ndeRequired && repair.ndeResults && (
                          <div className="mt-3">
                            <span className="font-medium text-slate-700">NDE Results:</span>
                            <p className="text-slate-600 text-sm mt-1">{repair.ndeResults}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRepair(repair.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alterations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <span>Alterations</span>
          </CardTitle>
          <CardDescription>
            Document all alterations and modifications to the pressure vessel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Alteration */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-slate-900">Add New Alteration</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alteration-type">Alteration Type *</Label>
                <Select 
                  value={newAlteration.type} 
                  onValueChange={(value) => setNewAlteration(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alteration type" />
                  </SelectTrigger>
                  <SelectContent>
                    {alterationTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alteration-date">Alteration Date</Label>
                <Input
                  id="alteration-date"
                  type="date"
                  value={newAlteration.date}
                  onChange={(e) => setNewAlteration(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approved-by">Approved By</Label>
                <Input
                  id="approved-by"
                  value={newAlteration.approvedBy}
                  onChange={(e) => setNewAlteration(prev => ({ ...prev, approvedBy: e.target.value }))}
                  placeholder="Authorized inspector/engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alteration-description">Description *</Label>
              <Textarea
                id="alteration-description"
                value={newAlteration.description}
                onChange={(e) => setNewAlteration(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the alteration"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engineering-analysis">Engineering Analysis</Label>
                <Textarea
                  id="engineering-analysis"
                  value={newAlteration.engineeringAnalysis}
                  onChange={(e) => setNewAlteration(prev => ({ ...prev, engineeringAnalysis: e.target.value }))}
                  placeholder="Engineering analysis and calculations"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drawings">Drawings/Documents</Label>
                <Textarea
                  id="drawings"
                  value={newAlteration.drawings}
                  onChange={(e) => setNewAlteration(prev => ({ ...prev, drawings: e.target.value }))}
                  placeholder="Drawing numbers and document references"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="approval-required"
                checked={newAlteration.approvalRequired}
                onCheckedChange={(checked) => setNewAlteration(prev => ({ ...prev, approvalRequired: checked }))}
              />
              <Label htmlFor="approval-required">Jurisdictional Approval Required</Label>
            </div>

            <Button onClick={addAlteration} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Alteration
            </Button>
          </div>

          {/* Alterations List */}
          {alterations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Documented Alterations</h4>
              {alterations.map((alteration) => (
                <Card key={alteration.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{alteration.type}</Badge>
                          {alteration.approvalRequired && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                              Approval Required
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-700">Date:</span>
                            <p className="text-slate-600">{alteration.date}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-700">Approved By:</span>
                            <p className="text-slate-600">{alteration.approvedBy || 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className="font-medium text-slate-700">Description:</span>
                          <p className="text-slate-600 text-sm mt-1">{alteration.description}</p>
                        </div>

                        {alteration.engineeringAnalysis && (
                          <div className="mt-3">
                            <span className="font-medium text-slate-700">Engineering Analysis:</span>
                            <p className="text-slate-600 text-sm mt-1">{alteration.engineeringAnalysis}</p>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAlteration(alteration.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-amber-600" />
            <span>Repairs & Alterations Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Repairs</h4>
              <div className="text-2xl font-bold text-blue-600">{repairs.length}</div>
              <p className="text-sm text-blue-700">
                {repairs.filter(r => r.approved).length} approved, {repairs.filter(r => !r.approved).length} pending
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Alterations</h4>
              <div className="text-2xl font-bold text-purple-600">{alterations.length}</div>
              <p className="text-sm text-purple-700">
                {alterations.filter(a => a.approvalRequired).length} require jurisdictional approval
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">API 510 Requirements for Repairs & Alterations</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• All repairs must be performed in accordance with approved procedures</p>
              <p>• Welding must be performed by qualified welders using qualified procedures</p>
              <p>• NDE must be performed as required by the applicable code</p>
              <p>• Alterations may require engineering analysis and jurisdictional approval</p>
              <p>• All work must be documented and approved by authorized inspector</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
