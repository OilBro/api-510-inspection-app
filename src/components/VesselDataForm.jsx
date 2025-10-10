import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Database, Info, Calculator, CheckCircle } from 'lucide-react'

// Material database from API_materials.xlsx
const materialDatabase = [
  { spec: 'SA-106', grade: 'B', type: 'smls. pipe', tensile: 60, yield: 35, allowable: 15 },
  { spec: 'SA-106', grade: 'C', type: 'smls. pipe', tensile: 70, yield: 40, allowable: 17.5 },
  { spec: 'SA-234', grade: 'WPB', type: 'smls. fitting', tensile: 60, yield: 35, allowable: 15 },
  { spec: 'SA-234', grade: 'WPC', type: 'smls. fitting', tensile: 70, yield: 40, allowable: 17.5 },
  { spec: 'SA-240', grade: '304', type: 'plate', tensile: 75, yield: 30, allowable: 18.8 },
  { spec: 'SA-240', grade: '304L', type: 'plate', tensile: 70, yield: 25, allowable: 16.7 },
  { spec: 'SA-240', grade: '316', type: 'plate', tensile: 75, yield: 30, allowable: 18.8 },
  { spec: 'SA-240', grade: '316L', type: 'plate', tensile: 70, yield: 25, allowable: 16.7 },
  { spec: 'SA-283', grade: 'C', type: 'plate', tensile: 55, yield: 30, allowable: 13.8 },
  { spec: 'SA-285', grade: 'C', type: 'plate', tensile: 55, yield: 30, allowable: 13.8 },
  { spec: 'SA-312', grade: 'TP304L', type: 'smls. pipe', tensile: 70, yield: 25, allowable: 16.3 },
  { spec: 'SA-312', grade: 'TP316L', type: 'smls. pipe', tensile: 70, yield: 25, allowable: 16.7 },
  { spec: 'SA-333', grade: '6', type: 'smls. pipe', tensile: 60, yield: 35, allowable: 15 },
  { spec: 'SA-335', grade: 'P11', type: 'smls. pipe', tensile: 60, yield: 30, allowable: 15 },
  { spec: 'SA-515', grade: '70', type: 'plate', tensile: 70, yield: 38, allowable: 17.5 },
  { spec: 'SA-516', grade: '55', type: 'plate', tensile: 55, yield: 30, allowable: 13.8 },
  { spec: 'SA-516', grade: '60', type: 'plate', tensile: 60, yield: 32, allowable: 15 },
  { spec: 'SA-516', grade: '65', type: 'plate', tensile: 65, yield: 35, allowable: 16.3 },
  { spec: 'SA-516', grade: '70', type: 'plate', tensile: 70, yield: 38, allowable: 17.5 }
]

const constructionCodes = [
  'ASME Section VIII, Division 1',
  'ASME Section VIII, Division 2',
  'ASME Section I',
  'API 650',
  'API 620',
  'Other'
]

export default function VesselDataForm({ data, onDataChange }) {
  const [formData, setFormData] = useState({
    vesselId: '',
    vesselName: '',
    location: '',
    plantUnit: '',
    constructionCode: '',
    yearBuilt: '',
    manufacturer: '',
    mawp: '',
    designTemperature: '',
    mdmt: '',
    diameter: '',
    length: '',
    materialSpec: '',
    materialGrade: '',
    materialType: '',
    tensileStrength: '',
    yieldStrength: '',
    allowableStress: '',
    ...data
  })

  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [availableGrades, setAvailableGrades] = useState([])

  useEffect(() => {
    onDataChange(formData)
  }, [formData, onDataChange])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMaterialSpecChange = (spec) => {
    const grades = materialDatabase.filter(material => material.spec === spec)
    setAvailableGrades(grades)
    setSelectedMaterial(null)
    
    setFormData(prev => ({
      ...prev,
      materialSpec: spec,
      materialGrade: '',
      materialType: '',
      tensileStrength: '',
      yieldStrength: '',
      allowableStress: ''
    }))
  }

  const handleMaterialGradeChange = (grade) => {
    const material = materialDatabase.find(m => m.spec === formData.materialSpec && m.grade === grade)
    if (material) {
      setSelectedMaterial(material)
      setFormData(prev => ({
        ...prev,
        materialGrade: grade,
        materialType: material.type,
        tensileStrength: material.tensile.toString(),
        yieldStrength: material.yield.toString(),
        allowableStress: material.allowable.toString()
      }))
    }
  }

  const uniqueSpecs = [...new Set(materialDatabase.map(m => m.spec))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Vessel Data & Design Parameters</CardTitle>
              <CardDescription className="text-blue-700">
                Enter fundamental design and operational data for the pressure vessel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vessel Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-slate-600" />
            <span>Vessel Identification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselId">Vessel ID *</Label>
              <Input
                id="vesselId"
                value={formData.vesselId}
                onChange={(e) => handleInputChange('vesselId', e.target.value)}
                placeholder="e.g., V-101"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name *</Label>
              <Input
                id="vesselName"
                value={formData.vesselName}
                onChange={(e) => handleInputChange('vesselName', e.target.value)}
                placeholder="e.g., Distillation Column"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Unit 100, Area A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plantUnit">Plant/Unit</Label>
              <Input
                id="plantUnit"
                value={formData.plantUnit}
                onChange={(e) => handleInputChange('plantUnit', e.target.value)}
                placeholder="e.g., Crude Unit"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design and Construction Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-slate-600" />
            <span>Design & Construction Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constructionCode">Construction Code *</Label>
              <Select value={formData.constructionCode} onValueChange={(value) => handleInputChange('constructionCode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select construction code" />
                </SelectTrigger>
                <SelectContent>
                  {constructionCodes.map((code) => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                placeholder="e.g., 1995"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="e.g., ABC Fabricators"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mawp">MAWP (psig) *</Label>
              <Input
                id="mawp"
                type="number"
                value={formData.mawp}
                onChange={(e) => handleInputChange('mawp', e.target.value)}
                placeholder="e.g., 150"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designTemperature">Design Temperature (°F) *</Label>
              <Input
                id="designTemperature"
                type="number"
                value={formData.designTemperature}
                onChange={(e) => handleInputChange('designTemperature', e.target.value)}
                placeholder="e.g., 650"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdmt">MDMT (°F)</Label>
              <Input
                id="mdmt"
                type="number"
                value={formData.mdmt}
                onChange={(e) => handleInputChange('mdmt', e.target.value)}
                placeholder="e.g., -20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diameter">Diameter (inches)</Label>
              <Input
                id="diameter"
                type="number"
                value={formData.diameter}
                onChange={(e) => handleInputChange('diameter', e.target.value)}
                placeholder="e.g., 72"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (inches)</Label>
              <Input
                id="length"
                type="number"
                value={formData.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                placeholder="e.g., 240"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-slate-600" />
            <span>Material Selection</span>
          </CardTitle>
          <CardDescription>
            Select material specification and grade. Properties will be auto-populated from ASME Section II Part D.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materialSpec">Material Specification *</Label>
              <Select value={formData.materialSpec} onValueChange={handleMaterialSpecChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material spec" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSpecs.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialGrade">Material Grade *</Label>
              <Select 
                value={formData.materialGrade} 
                onValueChange={handleMaterialGradeChange}
                disabled={!formData.materialSpec}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {availableGrades.map((material) => (
                    <SelectItem key={`${material.spec}-${material.grade}`} value={material.grade}>
                      {material.grade} ({material.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Input
                id="materialType"
                value={formData.materialType}
                readOnly
                className="bg-slate-50"
                placeholder="Auto-populated"
              />
            </div>
          </div>

          {selectedMaterial && (
            <>
              <Separator />
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Material Properties (Auto-populated)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tensileStrength">Tensile Strength (ksi)</Label>
                    <Input
                      id="tensileStrength"
                      value={formData.tensileStrength}
                      readOnly
                      className="bg-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yieldStrength">Yield Strength (ksi)</Label>
                    <Input
                      id="yieldStrength"
                      value={formData.yieldStrength}
                      readOnly
                      className="bg-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowableStress">Allowable Stress (ksi)</Label>
                    <Input
                      id="allowableStress"
                      value={formData.allowableStress}
                      readOnly
                      className="bg-white font-medium"
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm text-green-700">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Source: ASME Section II Part D
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-slate-900">Data Validation</span>
            </div>
            <Badge variant={formData.vesselId && formData.mawp && formData.materialSpec ? "default" : "secondary"}>
              {formData.vesselId && formData.mawp && formData.materialSpec ? "Complete" : "Incomplete"}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Required fields: Vessel ID, MAWP, Design Temperature, Construction Code, Material Specification
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
