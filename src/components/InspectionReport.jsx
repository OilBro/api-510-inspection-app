import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { FileText, Download, Printer, Mail, CheckCircle, AlertTriangle, Eye, Settings } from 'lucide-react'

export default function InspectionReport({ data, onDataChange }) {
  const [reportHeader, setReportHeader] = useState({
    reportNumber: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: '',
    inspectorCertification: '',
    company: '',
    customer: '',
    location: '',
    reportDate: new Date().toISOString().split('T')[0],
    ...data.reportHeader
  })

  const [executiveSummary, setExecutiveSummary] = useState({
    overallCondition: '',
    keyFindings: '',
    recommendations: '',
    nextInspectionDate: '',
    ...data.executiveSummary
  })

  const [reportSections, setReportSections] = useState({
    includeVesselData: true,
    includeCalculations: true,
    includeThicknessAnalysis: true,
    includeExternalInspection: true,
    includeInternalInspection: true,
    includeInLieuInspection: false,
    includeFitnessForService: false,
    includeRepairsAlterations: false,
    includePressureTesting: false,
    includeReliefDevices: true,
    includeInspectionPlanning: true,
    includePhotos: true,
    includeDrawings: true,
    includeAppendices: true,
    ...data.reportSections
  })

  const [reportFormat, setReportFormat] = useState({
    format: 'comprehensive',
    template: 'standard',
    includeSignatures: true,
    includeCoverPage: true,
    includeTableOfContents: true,
    ...data.reportFormat
  })

  const [certifications, setCertifications] = useState({
    inspectorStatement: '',
    certificationDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    jurisdictionalRequirements: '',
    ...data.certifications
  })

  const reportFormats = [
    'comprehensive',
    'summary',
    'executive',
    'technical'
  ]

  const reportTemplates = [
    'standard',
    'detailed',
    'regulatory',
    'custom'
  ]

  const overallConditions = [
    'Excellent',
    'Good',
    'Fair',
    'Poor',
    'Unacceptable'
  ]

  useEffect(() => {
    onDataChange({
      ...data,
      reportHeader,
      executiveSummary,
      reportSections,
      reportFormat,
      certifications
    })
  }, [reportHeader, executiveSummary, reportSections, reportFormat, certifications, data, onDataChange])

  const generateReportPreview = () => {
    // This would generate a preview of the report
    console.log('Generating report preview...')
  }

  const exportReport = (format) => {
    // This would export the report in the specified format
    console.log(`Exporting report as ${format}...`)
  }

  const getCompletionStatus = () => {
    const requiredFields = [
      reportHeader.reportNumber,
      reportHeader.inspector,
      reportHeader.customer,
      executiveSummary.overallCondition,
      executiveSummary.keyFindings
    ]
    
    const completedFields = requiredFields.filter(field => field && field.trim() !== '')
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const getDataSummary = () => {
    const sections = []
    
    if (data.vesselData && Object.keys(data.vesselData).length > 0) {
      sections.push('Vessel Data')
    }
    if (data.calculations && Object.keys(data.calculations).length > 0) {
      sections.push('Calculations')
    }
    if (data.thicknessData && Object.keys(data.thicknessData).length > 0) {
      sections.push('Thickness Analysis')
    }
    if (data.externalInspection && Object.keys(data.externalInspection).length > 0) {
      sections.push('External Inspection')
    }
    if (data.internalInspection && Object.keys(data.internalInspection).length > 0) {
      sections.push('Internal Inspection')
    }
    if (data.inLieuInspection && Object.keys(data.inLieuInspection).length > 0) {
      sections.push('In-Lieu Inspection')
    }
    if (data.fitnessForService && Object.keys(data.fitnessForService).length > 0) {
      sections.push('Fitness-for-Service')
    }
    
    return sections
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-slate-600" />
              <div>
                <CardTitle className="text-slate-900">Inspection Report Generation</CardTitle>
                <CardDescription className="text-slate-700">
                  Generate comprehensive API 510 inspection reports
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                {getCompletionStatus()}% Complete
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="header" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="header">Report Header</TabsTrigger>
          <TabsTrigger value="summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="sections">Report Sections</TabsTrigger>
          <TabsTrigger value="format">Format & Export</TabsTrigger>
          <TabsTrigger value="preview">Preview & Generate</TabsTrigger>
        </TabsList>

        {/* Report Header */}
        <TabsContent value="header" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Report Header Information</span>
              </CardTitle>
              <CardDescription>
                Basic report identification and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-number">Report Number *</Label>
                  <Input
                    id="report-number"
                    value={reportHeader.reportNumber}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, reportNumber: e.target.value }))}
                    placeholder="e.g., API510-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspection-date">Inspection Date *</Label>
                  <Input
                    id="inspection-date"
                    type="date"
                    value={reportHeader.inspectionDate}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, inspectionDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-date">Report Date</Label>
                  <Input
                    id="report-date"
                    type="date"
                    value={reportHeader.reportDate}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, reportDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspector Name *</Label>
                  <Input
                    id="inspector"
                    value={reportHeader.inspector}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, inspector: e.target.value }))}
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector-certification">Inspector Certification</Label>
                  <Input
                    id="inspector-certification"
                    value={reportHeader.inspectorCertification}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, inspectorCertification: e.target.value }))}
                    placeholder="e.g., API 510 #12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Inspection Company</Label>
                  <Input
                    id="company"
                    value={reportHeader.company}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., ABC Inspection Services"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Input
                    id="customer"
                    value={reportHeader.customer}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="e.g., XYZ Refinery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Facility Location</Label>
                  <Input
                    id="location"
                    value={reportHeader.location}
                    onChange={(e) => setReportHeader(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Houston, TX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Executive Summary */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Executive Summary</span>
              </CardTitle>
              <CardDescription>
                High-level summary of inspection findings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overall-condition">Overall Condition *</Label>
                  <Select 
                    value={executiveSummary.overallCondition} 
                    onValueChange={(value) => setExecutiveSummary(prev => ({ ...prev, overallCondition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select overall condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {overallConditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next-inspection-date">Next Inspection Date</Label>
                  <Input
                    id="next-inspection-date"
                    type="date"
                    value={executiveSummary.nextInspectionDate}
                    onChange={(e) => setExecutiveSummary(prev => ({ ...prev, nextInspectionDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-findings">Key Findings *</Label>
                <Textarea
                  id="key-findings"
                  value={executiveSummary.keyFindings}
                  onChange={(e) => setExecutiveSummary(prev => ({ ...prev, keyFindings: e.target.value }))}
                  placeholder="Summarize the most important inspection findings"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  value={executiveSummary.recommendations}
                  onChange={(e) => setExecutiveSummary(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Provide specific recommendations based on inspection findings"
                  rows={4}
                />
              </div>

              {executiveSummary.overallCondition && (
                <div className={`border rounded-lg p-4 ${
                  executiveSummary.overallCondition === 'Excellent' || executiveSummary.overallCondition === 'Good' ? 'bg-green-50 border-green-200' :
                  executiveSummary.overallCondition === 'Fair' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    {executiveSummary.overallCondition === 'Excellent' || executiveSummary.overallCondition === 'Good' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${
                        executiveSummary.overallCondition === 'Excellent' || executiveSummary.overallCondition === 'Good' ? 'text-green-900' :
                        executiveSummary.overallCondition === 'Fair' ? 'text-yellow-900' :
                        'text-red-900'
                      }`}>
                        Overall Condition: {executiveSummary.overallCondition}
                      </p>
                      <p className={`text-sm mt-1 ${
                        executiveSummary.overallCondition === 'Excellent' || executiveSummary.overallCondition === 'Good' ? 'text-green-700' :
                        executiveSummary.overallCondition === 'Fair' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {executiveSummary.overallCondition === 'Excellent' ? 'Equipment is in excellent condition with no significant issues identified.' :
                         executiveSummary.overallCondition === 'Good' ? 'Equipment is in good condition with minor issues that should be monitored.' :
                         executiveSummary.overallCondition === 'Fair' ? 'Equipment has moderate issues that require attention and monitoring.' :
                         executiveSummary.overallCondition === 'Poor' ? 'Equipment has significant issues that require prompt attention.' :
                         'Equipment condition is unacceptable and requires immediate action.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Sections */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span>Report Sections</span>
              </CardTitle>
              <CardDescription>
                Select which sections to include in the final report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries({
                  includeVesselData: 'Vessel Data & Specifications',
                  includeCalculations: 'Engineering Calculations',
                  includeThicknessAnalysis: 'Thickness Analysis & TML Data',
                  includeExternalInspection: 'External Inspection Findings',
                  includeInternalInspection: 'Internal Inspection Findings',
                  includeInLieuInspection: 'In-Lieu Inspection Assessment',
                  includeFitnessForService: 'Fitness-for-Service Assessment',
                  includeRepairsAlterations: 'Repairs & Alterations',
                  includePressureTesting: 'Pressure Testing Results',
                  includeReliefDevices: 'Pressure Relief Devices',
                  includeInspectionPlanning: 'Inspection Planning & Intervals',
                  includePhotos: 'Photographs & Visual Documentation',
                  includeDrawings: 'Drawings & Sketches',
                  includeAppendices: 'Appendices & Supporting Data'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={key}
                      checked={reportSections[key]}
                      onChange={(e) => setReportSections(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor={key} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">Available Data Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {getDataSummary().map((section) => (
                    <Badge key={section} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      {section}
                    </Badge>
                  ))}
                </div>
                {getDataSummary().length === 0 && (
                  <p className="text-sm text-slate-600">No inspection data available. Complete other sections first.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Format & Export */}
        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-indigo-600" />
                <span>Report Format & Export Options</span>
              </CardTitle>
              <CardDescription>
                Configure report format and export settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-format">Report Format</Label>
                  <Select 
                    value={reportFormat.format} 
                    onValueChange={(value) => setReportFormat(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportFormats.map((format) => (
                        <SelectItem key={format} value={format}>{format.charAt(0).toUpperCase() + format.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-template">Report Template</Label>
                  <Select 
                    value={reportFormat.template} 
                    onValueChange={(value) => setReportFormat(prev => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTemplates.map((template) => (
                        <SelectItem key={template} value={template}>{template.charAt(0).toUpperCase() + template.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Report Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries({
                    includeCoverPage: 'Include Cover Page',
                    includeTableOfContents: 'Include Table of Contents',
                    includeSignatures: 'Include Signature Pages'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={reportFormat[key]}
                        onChange={(e) => setReportFormat(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor={key} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="inspector-statement">Inspector Certification Statement</Label>
                <Textarea
                  id="inspector-statement"
                  value={certifications.inspectorStatement}
                  onChange={(e) => setCertifications(prev => ({ ...prev, inspectorStatement: e.target.value }))}
                  placeholder="I certify that this inspection was performed in accordance with API 510..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certification-date">Certification Date</Label>
                  <Input
                    id="certification-date"
                    type="date"
                    value={certifications.certificationDate}
                    onChange={(e) => setCertifications(prev => ({ ...prev, certificationDate: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next-due-date">Next Certification Due</Label>
                  <Input
                    id="next-due-date"
                    type="date"
                    value={certifications.nextDueDate}
                    onChange={(e) => setCertifications(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurisdictional-requirements">Jurisdictional Requirements</Label>
                <Textarea
                  id="jurisdictional-requirements"
                  value={certifications.jurisdictionalRequirements}
                  onChange={(e) => setCertifications(prev => ({ ...prev, jurisdictionalRequirements: e.target.value }))}
                  placeholder="Document any specific jurisdictional or regulatory requirements"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Generate */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span>Report Preview & Generation</span>
              </CardTitle>
              <CardDescription>
                Preview and generate the final inspection report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Report Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">Report Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 mb-1">Completion</h5>
                    <div className="text-lg font-bold text-blue-600">{getCompletionStatus()}%</div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="font-medium text-green-900 mb-1">Data Sections</h5>
                    <div className="text-lg font-bold text-green-600">{getDataSummary().length}</div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h5 className="font-medium text-purple-900 mb-1">Report Sections</h5>
                    <div className="text-lg font-bold text-purple-600">
                      {Object.values(reportSections).filter(Boolean).length}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h5 className="font-medium text-orange-900 mb-1">Format</h5>
                    <div className="text-sm font-medium text-orange-600">
                      {reportFormat.format.charAt(0).toUpperCase() + reportFormat.format.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={generateReportPreview} className="bg-green-600 hover:bg-green-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Report
                </Button>

                <Button onClick={() => exportReport('pdf')} className="bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>

                <Button onClick={() => exportReport('docx')} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Word
                </Button>

                <Button onClick={() => exportReport('print')} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>

              {/* Report Preview */}
              <div className="border border-slate-200 rounded-lg p-6 bg-white">
                <h4 className="font-medium text-slate-900 mb-4">Report Preview</h4>
                
                <div className="space-y-4 text-sm">
                  {/* Header Preview */}
                  <div className="border-b border-slate-200 pb-4">
                    <h5 className="font-medium text-slate-800 mb-2">API 510 PRESSURE VESSEL INSPECTION REPORT</h5>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p><strong>Report Number:</strong> {reportHeader.reportNumber || 'TBD'}</p>
                        <p><strong>Inspector:</strong> {reportHeader.inspector || 'TBD'}</p>
                        <p><strong>Company:</strong> {reportHeader.company || 'TBD'}</p>
                      </div>
                      <div>
                        <p><strong>Inspection Date:</strong> {reportHeader.inspectionDate || 'TBD'}</p>
                        <p><strong>Customer:</strong> {reportHeader.customer || 'TBD'}</p>
                        <p><strong>Location:</strong> {reportHeader.location || 'TBD'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Preview */}
                  <div className="border-b border-slate-200 pb-4">
                    <h5 className="font-medium text-slate-800 mb-2">EXECUTIVE SUMMARY</h5>
                    <p><strong>Overall Condition:</strong> {executiveSummary.overallCondition || 'TBD'}</p>
                    <p><strong>Key Findings:</strong> {executiveSummary.keyFindings || 'TBD'}</p>
                    <p><strong>Next Inspection:</strong> {executiveSummary.nextInspectionDate || 'TBD'}</p>
                  </div>

                  {/* Sections Preview */}
                  <div>
                    <h5 className="font-medium text-slate-800 mb-2">REPORT SECTIONS</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(reportSections)
                        .filter(([_, included]) => included)
                        .map(([key, _]) => {
                          const sectionNames = {
                            includeVesselData: 'Vessel Data',
                            includeCalculations: 'Calculations',
                            includeThicknessAnalysis: 'Thickness Analysis',
                            includeExternalInspection: 'External Inspection',
                            includeInternalInspection: 'Internal Inspection',
                            includeInLieuInspection: 'In-Lieu Inspection',
                            includeFitnessForService: 'Fitness-for-Service',
                            includeRepairsAlterations: 'Repairs & Alterations',
                            includePressureTesting: 'Pressure Testing',
                            includeReliefDevices: 'Relief Devices',
                            includeInspectionPlanning: 'Inspection Planning',
                            includePhotos: 'Photographs',
                            includeDrawings: 'Drawings',
                            includeAppendices: 'Appendices'
                          }
                          return (
                            <p key={key} className="text-xs">• {sectionNames[key]}</p>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </div>

              {getCompletionStatus() < 100 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Report Incomplete</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Complete all required fields in the Report Header and Executive Summary sections before generating the final report.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <span>Report Generation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">API 510 Report Requirements</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Comprehensive documentation of all inspection activities and findings</p>
              <p>• Engineering calculations and assessments per ASME and API standards</p>
              <p>• Thickness measurement data and corrosion analysis</p>
              <p>• Fitness-for-service evaluations where applicable</p>
              <p>• Inspection interval determinations and next inspection planning</p>
              <p>• Inspector certification and regulatory compliance statements</p>
              <p>• Professional formatting suitable for regulatory submission</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
