import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Download, Plus, Trash2, Upload } from "lucide-react";
import FindingsSection from "@/components/professionalReport/FindingsSection";
import RecommendationsSection from "@/components/professionalReport/RecommendationsSection";
import PhotosSection from "@/components/professionalReport/PhotosSection";
import ChecklistSection from "@/components/professionalReport/ChecklistSection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfessionalReportTabProps {
  inspectionId: string;
}

export default function ProfessionalReportTab({ inspectionId }: ProfessionalReportTabProps) {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("info");
  const [generating, setGenerating] = useState(false);

  // Get or create professional report
  const { data: report, isLoading } = trpc.professionalReport.getOrCreate.useQuery({
    inspectionId,
  });

  // Update report mutation
  const updateReport = trpc.professionalReport.update.useMutation({
    onSuccess: () => {
      utils.professionalReport.getOrCreate.invalidate();
      toast.success("Report updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });

  // Generate PDF mutation
  const generatePDF = trpc.professionalReport.generatePDF.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inspection-Report-${report?.reportNumber || Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Professional report generated successfully!");
      setGenerating(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
      setGenerating(false);
    },
  });

  const handleGeneratePDF = () => {
    if (!report) return;
    setGenerating(true);
    generatePDF.mutate({
      reportId: report.id,
      inspectionId,
    });
  };

  const handleUpdateField = (field: string, value: string) => {
    if (!report) return;
    updateReport.mutate({
      reportId: report.id,
      data: { [field]: value },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Failed to load professional report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Professional Inspection Report</h2>
          <p className="text-sm text-muted-foreground">
            API 510 Pressure Vessel Inspection Report - Complete Documentation
          </p>
        </div>
        <Button
          onClick={handleGeneratePDF}
          disabled={generating}
          size="lg"
          className="gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generate Final Report
            </>
          )}
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="info">Report Info</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="findings">Findings</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        {/* Report Information Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>
                Basic report metadata and client information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportNumber">Report Number</Label>
                  <Input
                    id="reportNumber"
                    value={report.reportNumber || ""}
                    onChange={(e) => handleUpdateField("reportNumber", e.target.value)}
                    placeholder="RPT-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportDate">Report Date</Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={report.reportDate ? new Date(report.reportDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdateField("reportDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectorName">Inspector Name</Label>
                  <Input
                    id="inspectorName"
                    value={report.inspectorName || ""}
                    onChange={(e) => handleUpdateField("inspectorName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inspectorCertification">API 510 Certification</Label>
                  <Input
                    id="inspectorCertification"
                    value={report.inspectorCertification || ""}
                    onChange={(e) => handleUpdateField("inspectorCertification", e.target.value)}
                    placeholder="API-510-12345"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employerName">Employer/Company Name</Label>
                <Input
                  id="employerName"
                  value={report.employerName || ""}
                  onChange={(e) => handleUpdateField("employerName", e.target.value)}
                  placeholder="OilPro Consulting LLC"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Client details and approval information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={report.clientName || ""}
                    onChange={(e) => handleUpdateField("clientName", e.target.value)}
                    placeholder="SACHEM INC"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientLocation">Client Location</Label>
                  <Input
                    id="clientLocation"
                    value={report.clientLocation || ""}
                    onChange={(e) => handleUpdateField("clientLocation", e.target.value)}
                    placeholder="CLEBURNE TX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientContact">Client Contact</Label>
                <Input
                  id="clientContact"
                  value={report.clientContact || ""}
                  onChange={(e) => handleUpdateField("clientContact", e.target.value)}
                  placeholder="Contact person and phone"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientApprovalName">Client Approval Name</Label>
                  <Input
                    id="clientApprovalName"
                    value={report.clientApprovalName || ""}
                    onChange={(e) => handleUpdateField("clientApprovalName", e.target.value)}
                    placeholder="Approval signature name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientApprovalTitle">Client Approval Title</Label>
                  <Input
                    id="clientApprovalTitle"
                    value={report.clientApprovalTitle || ""}
                    onChange={(e) => handleUpdateField("clientApprovalTitle", e.target.value)}
                    placeholder="Title/Position"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>
                High-level summary of inspection findings and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="executiveSummary">Summary</Label>
                <Textarea
                  id="executiveSummary"
                  value={report.executiveSummary || ""}
                  onChange={(e) => handleUpdateField("executiveSummary", e.target.value)}
                  placeholder="A criterion for nondestructive examinations was conducted on vessel..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="governingComponent">Governing Component</Label>
                <Input
                  id="governingComponent"
                  value={report.governingComponent || ""}
                  onChange={(e) => handleUpdateField("governingComponent", e.target.value)}
                  placeholder="Shell 1, North Head, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextExternalInspectionClient">Next External Inspection (Client)</Label>
                  <Input
                    id="nextExternalInspectionClient"
                    type="date"
                    value={report.nextExternalInspectionClient ? new Date(report.nextExternalInspectionClient).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdateField("nextExternalInspectionClient", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextExternalInspectionAPI">Next External Inspection (API)</Label>
                  <Input
                    id="nextExternalInspectionAPI"
                    type="date"
                    value={report.nextExternalInspectionAPI ? new Date(report.nextExternalInspectionAPI).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdateField("nextExternalInspectionAPI", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextInternalInspection">Next Internal Inspection</Label>
                  <Input
                    id="nextInternalInspection"
                    type="date"
                    value={report.nextInternalInspection ? new Date(report.nextInternalInspection).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdateField("nextInternalInspection", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextUTInspection">Next UT Inspection</Label>
                  <Input
                    id="nextUTInspection"
                    type="date"
                    value={report.nextUTInspection ? new Date(report.nextUTInspection).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleUpdateField("nextUTInspection", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculations Tab */}
        <TabsContent value="calculations">
          <ComponentCalculationsSection reportId={report.id} />
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings">
          <InspectionFindingsSection reportId={report.id} />
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          <RecommendationsSection reportId={report.id} />
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <PhotosSection reportId={report.id} />
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <ChecklistSection reportId={report.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Component Calculations Section
function ComponentCalculationsSection({ reportId }: { reportId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [componentType, setComponentType] = useState<"shell" | "head">("shell");
  const utils = trpc.useUtils();

  const { data: calculations, isLoading } = trpc.professionalReport.componentCalculations.list.useQuery({
    reportId,
  });

  const createCalculation = trpc.professionalReport.componentCalculations.create.useMutation({
    onSuccess: () => {
      utils.professionalReport.componentCalculations.list.invalidate();
      toast.success("Component calculation added");
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to add calculation: ${error.message}`);
    },
  });

  const deleteCalculation = trpc.professionalReport.componentCalculations.delete.useMutation({
    onSuccess: () => {
      utils.professionalReport.componentCalculations.list.invalidate();
      toast.success("Component calculation deleted");
    },
  });

  const handleExportTemplate = () => {
    // Create Excel template with component calculation columns
    const headers = [
      "Component Name",
      "Component Type (shell/head)",
      "Material Code",
      "Material Name",
      "Design Temperature (°F)",
      "Design MAWP (psi)",
      "Static Head (psi)",
      "Corrosion Allowance (in)",
      "Inside Diameter (in)",
      "Nominal Thickness (in)",
      "Measured Thickness (in)",
      "Joint Efficiency",
      "Allowable Stress (psi)",
      "Head Type (elliptical/hemispherical/torispherical)",
      "Crown Radius (in)",
      "Knuckle Radius (in)"
    ];

    // Create CSV content
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `component-calculations-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Template downloaded");
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info("Importing components...");

    try {
      if (file.name.endsWith(".pdf")) {
        // TODO: Implement PDF parsing
        toast.error("PDF import not yet implemented");
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
        // Read CSV/Excel file
        const text = await file.text();
        const lines = text.split("\n").filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("File is empty or invalid");
          return;
        }

        const headers = lines[0].split(",");
        const dataLines = lines.slice(1);

        for (const line of dataLines) {
          const values = line.split(",");
          const componentData: any = {
            componentName: values[0]?.trim() || "",
            componentType: values[1]?.trim().toLowerCase() === "head" ? "head" : "shell",
            materialCode: values[2]?.trim() || "",
            materialName: values[3]?.trim() || "",
            designTemp: values[4]?.trim() || "",
            designMAWP: values[5]?.trim() || "",
            staticHead: values[6]?.trim() || "0",
            corrosionAllowance: values[7]?.trim() || "",
            insideDiameter: values[8]?.trim() || "",
            nominalThickness: values[9]?.trim() || "",
            measuredThickness: values[10]?.trim() || "",
            jointEfficiency: values[11]?.trim() || "",
            allowableStress: values[12]?.trim() || "",
          };

          if (componentData.componentType === "head") {
            componentData.headType = values[13]?.trim() || "elliptical";
            componentData.crownRadius = values[14]?.trim() || "";
            componentData.knuckleRadius = values[15]?.trim() || "";
          }

          if (componentData.componentName) {
            await createCalculation.mutateAsync({ reportId, ...componentData });
          }
        }

        toast.success(`Imported ${dataLines.length} components`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import file");
    }

    // Reset input
    e.target.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mechanical Integrity Calculations</h3>
          <p className="text-sm text-muted-foreground">
            Shell and head evaluations per ASME Section VIII
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExportTemplate()}>
            <Download className="h-4 w-4" />
            Export Template
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => document.getElementById('component-import-input')?.click()}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <input
            id="component-import-input"
            type="file"
            accept=".xlsx,.xls,.pdf"
            className="hidden"
            onChange={handleImportFile}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Component Calculation</DialogTitle>
                <DialogDescription>
                  Enter component data for mechanical integrity evaluation
                </DialogDescription>
              </DialogHeader>
              <ComponentCalculationForm
                reportId={reportId}
                componentType={componentType}
                onComponentTypeChange={setComponentType}
                onSubmit={(data) => createCalculation.mutate({ reportId, ...data })}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {calculations && calculations.length > 0 ? (
        <div className="grid gap-4">
          {calculations.map((calc) => (
            <Card key={calc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{calc.componentName}</CardTitle>
                    <CardDescription>
                      {calc.componentType === "shell" ? "Shell Evaluation" : "Head Evaluation"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCalculation.mutate({ calcId: calc.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Material</p>
                    <p className="font-medium">{calc.materialCode || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Design MAWP</p>
                    <p className="font-medium">{calc.designMAWP} psi</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Thickness</p>
                    <p className="font-medium">{calc.minimumThickness} in</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Remaining Life</p>
                    <p className="font-medium">{calc.remainingLife} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Corrosion Rate</p>
                    <p className="font-medium">{calc.corrosionRate} in/yr</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MAWP @ Next Insp</p>
                    <p className="font-medium">{calc.mawpAtNextInspection} psi</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Actual Thickness</p>
                    <p className="font-medium">{calc.actualThickness} in</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Inspection</p>
                    <p className="font-medium">{calc.nextInspectionYears} years</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No component calculations added yet
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Component
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component Calculation Form
interface ComponentCalculationFormProps {
  reportId: string;
  componentType: "shell" | "head";
  onComponentTypeChange: (type: "shell" | "head") => void;
  onSubmit: (data: any) => void;
}

function ComponentCalculationForm({
  componentType,
  onComponentTypeChange,
  onSubmit,
}: ComponentCalculationFormProps) {
  const [formData, setFormData] = useState<any>({
    componentName: "",
    componentType,
    materialCode: "",
    materialName: "",
    designTemp: "",
    designMAWP: "",
    staticHead: "0",
    specificGravity: "1.0",
    insideDiameter: "",
    nominalThickness: "",
    allowableStress: "",
    jointEfficiency: "1.0",
    headType: "torispherical",
    crownRadius: "",
    knuckleRadius: "",
    previousThickness: "",
    actualThickness: "",
    timeSpan: "",
    nextInspectionYears: "5",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, componentType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Component Type</Label>
        <Select
          value={componentType}
          onValueChange={(value) => {
            onComponentTypeChange(value as "shell" | "head");
            setFormData((prev: any) => ({ ...prev, componentType: value }));
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shell">Shell</SelectItem>
            <SelectItem value="head">Head</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="componentName">Component Name *</Label>
          <Input
            id="componentName"
            value={formData.componentName}
            onChange={(e) => handleChange("componentName", e.target.value)}
            placeholder="Shell 1, North Head, etc."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="materialCode">Material Code</Label>
          <Input
            id="materialCode"
            value={formData.materialCode}
            onChange={(e) => handleChange("materialCode", e.target.value)}
            placeholder="CS-A455-A"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="designTemp">Design Temp (°F) *</Label>
          <Input
            id="designTemp"
            value={formData.designTemp}
            onChange={(e) => handleChange("designTemp", e.target.value)}
            placeholder="250"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designMAWP">Design MAWP (psi) *</Label>
          <Input
            id="designMAWP"
            value={formData.designMAWP}
            onChange={(e) => handleChange("designMAWP", e.target.value)}
            placeholder="250"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insideDiameter">Inside Diameter (in) *</Label>
          <Input
            id="insideDiameter"
            value={formData.insideDiameter}
            onChange={(e) => handleChange("insideDiameter", e.target.value)}
            placeholder="72.000"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nominalThickness">Nominal Thickness (in) *</Label>
          <Input
            id="nominalThickness"
            value={formData.nominalThickness}
            onChange={(e) => handleChange("nominalThickness", e.target.value)}
            placeholder="0.500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="allowableStress">Allowable Stress (psi) *</Label>
          <Input
            id="allowableStress"
            value={formData.allowableStress}
            onChange={(e) => handleChange("allowableStress", e.target.value)}
            placeholder="20000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jointEfficiency">Joint Efficiency *</Label>
          <Select
            value={formData.jointEfficiency}
            onValueChange={(value) => handleChange("jointEfficiency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1.0">1.0 (Fully RT)</SelectItem>
              <SelectItem value="0.85">0.85 (Spot RT)</SelectItem>
              <SelectItem value="0.70">0.70 (No RT)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {componentType === "head" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="headType">Head Type</Label>
            <Select
              value={formData.headType}
              onValueChange={(value) => handleChange("headType", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hemispherical">Hemispherical</SelectItem>
                <SelectItem value="ellipsoidal">Ellipsoidal 2:1</SelectItem>
                <SelectItem value="torispherical">Torispherical (F&D)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crownRadius">Crown Radius (in)</Label>
            <Input
              id="crownRadius"
              value={formData.crownRadius}
              onChange={(e) => handleChange("crownRadius", e.target.value)}
              placeholder="72.000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knuckleRadius">Knuckle Radius (in)</Label>
            <Input
              id="knuckleRadius"
              value={formData.knuckleRadius}
              onChange={(e) => handleChange("knuckleRadius", e.target.value)}
              placeholder="4.320"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="previousThickness">Previous Thickness (in) *</Label>
          <Input
            id="previousThickness"
            value={formData.previousThickness}
            onChange={(e) => handleChange("previousThickness", e.target.value)}
            placeholder="0.500"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actualThickness">Actual Thickness (in) *</Label>
          <Input
            id="actualThickness"
            value={formData.actualThickness}
            onChange={(e) => handleChange("actualThickness", e.target.value)}
            placeholder="0.480"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeSpan">Time Span (years) *</Label>
          <Input
            id="timeSpan"
            value={formData.timeSpan}
            onChange={(e) => handleChange("timeSpan", e.target.value)}
            placeholder="10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staticHead">Static Head (ft)</Label>
          <Input
            id="staticHead"
            value={formData.staticHead}
            onChange={(e) => handleChange("staticHead", e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specificGravity">Specific Gravity</Label>
          <Input
            id="specificGravity"
            value={formData.specificGravity}
            onChange={(e) => handleChange("specificGravity", e.target.value)}
            placeholder="1.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextInspectionYears">Next Inspection (years) *</Label>
          <Input
            id="nextInspectionYears"
            value={formData.nextInspectionYears}
            onChange={(e) => handleChange("nextInspectionYears", e.target.value)}
            placeholder="5"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Component Calculation
      </Button>
    </form>
  );
}

// Placeholder sections (to be implemented)
function InspectionFindingsSection({ reportId }: { reportId: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center text-muted-foreground">
        Inspection findings section - Coming soon
      </CardContent>
    </Card>
  );
}



