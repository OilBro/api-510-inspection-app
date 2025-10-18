import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface InspectionReportTabProps {
  inspection: any;
}

export default function InspectionReportTab({ inspection }: InspectionReportTabProps) {
  const { data: calculations } = trpc.calculations.get.useQuery({ inspectionId: inspection.id });
  const { data: tmlReadings } = trpc.tmlReadings.list.useQuery({ inspectionId: inspection.id });
  const { data: externalInspection } = trpc.externalInspection.get.useQuery({ inspectionId: inspection.id });
  const { data: internalInspection } = trpc.internalInspection.get.useQuery({ inspectionId: inspection.id });

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("API 510 Pressure Vessel Inspection Report", 105, yPos, { align: "center" });
      yPos += 15;

      // Vessel Information
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Vessel Information", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Vessel Tag Number: ${inspection.vesselTagNumber || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Vessel Name: ${inspection.vesselName || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Manufacturer: ${inspection.manufacturer || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Year Built: ${inspection.yearBuilt || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Vessel Type: ${inspection.vesselType || "N/A"}`, 20, yPos);
      yPos += 10;

      // Design Parameters
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Design Parameters", 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Design Pressure: ${inspection.designPressure ? `${inspection.designPressure} psig` : "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Design Temperature: ${inspection.designTemperature ? `${inspection.designTemperature} °F` : "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Operating Pressure: ${inspection.operatingPressure ? `${inspection.operatingPressure} psig` : "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Material Specification: ${inspection.materialSpec || "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Inside Diameter: ${inspection.insideDiameter ? `${inspection.insideDiameter} inches` : "N/A"}`, 20, yPos);
      yPos += 6;
      doc.text(`Overall Length: ${inspection.overallLength ? `${inspection.overallLength} ft` : "N/A"}`, 20, yPos);
      yPos += 10;

      // Calculations
      if (calculations) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Calculation Results", 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (calculations.minThicknessResult) {
          doc.text(`Minimum Required Thickness (Shell): ${calculations.minThicknessResult} inches`, 20, yPos);
          yPos += 6;
        }
        
        if (calculations.mawpResult) {
          doc.text(`Maximum Allowable Working Pressure (Shell): ${calculations.mawpResult} psig`, 20, yPos);
          yPos += 6;
        }
        
        if (calculations.remainingLifeResult) {
          doc.text(`Remaining Life: ${calculations.remainingLifeResult} years`, 20, yPos);
          yPos += 6;
          
          if (calculations.remainingLifeNextInspection) {
            doc.text(`Next Inspection Due: ${calculations.remainingLifeNextInspection} years`, 20, yPos);
            yPos += 6;
          }
        }
        yPos += 4;
      }

      // TML Readings
      if (tmlReadings && tmlReadings.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Thickness Measurement Locations", 20, yPos);
        yPos += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        // Table header
        doc.setFont("helvetica", "bold");
        doc.text("TML ID", 20, yPos);
        doc.text("Component", 50, yPos);
        doc.text("Nominal", 90, yPos);
        doc.text("Previous", 120, yPos);
        doc.text("Current", 150, yPos);
        doc.text("Status", 175, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        
        for (const reading of tmlReadings.slice(0, 30)) {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
            
            // Repeat header on new page
            doc.setFont("helvetica", "bold");
            doc.text("TML ID", 20, yPos);
            doc.text("Component", 50, yPos);
            doc.text("Nominal", 90, yPos);
            doc.text("Previous", 120, yPos);
            doc.text("Current", 150, yPos);
            doc.text("Status", 175, yPos);
            yPos += 6;
            doc.setFont("helvetica", "normal");
          }

          doc.text(reading.tmlId || "", 20, yPos);
          doc.text(reading.component || "", 50, yPos);
          doc.text(reading.nominalThickness || "", 90, yPos);
          doc.text(reading.previousThickness || "", 120, yPos);
          doc.text(reading.currentThickness || "", 150, yPos);
          doc.text(reading.status || "", 175, yPos);
          yPos += 5;
        }
        yPos += 5;
      }

      // External Inspection
      if (externalInspection) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("External Inspection Findings", 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (externalInspection.visualCondition) {
          doc.text("Visual Condition:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(externalInspection.visualCondition, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (externalInspection.damageMechanism) {
          doc.text("Damage Mechanism:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(externalInspection.damageMechanism, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (externalInspection.findings) {
          doc.text("Findings:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(externalInspection.findings, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (externalInspection.recommendations) {
          doc.text("Recommendations:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(externalInspection.recommendations, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }
      }

      // Internal Inspection
      if (internalInspection) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Internal Inspection Findings", 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (internalInspection.internalCondition) {
          doc.text("Internal Condition:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(internalInspection.internalCondition, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (internalInspection.corrosionPattern) {
          doc.text("Corrosion Pattern:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(internalInspection.corrosionPattern, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (internalInspection.findings) {
          doc.text("Findings:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(internalInspection.findings, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }

        if (internalInspection.recommendations) {
          doc.text("Recommendations:", 20, yPos);
          yPos += 6;
          const lines = doc.splitTextToSize(internalInspection.recommendations, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 4;
        }
      }

      // Save the PDF
      const fileName = `API510_Inspection_${inspection.vesselTagNumber || inspection.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Report</CardTitle>
          <CardDescription>Generate comprehensive API 510 inspection report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Vessel Information</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Tag Number:</dt>
                  <dd className="font-medium">{inspection.vesselTagNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Vessel Name:</dt>
                  <dd className="font-medium">{inspection.vesselName || "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Manufacturer:</dt>
                  <dd className="font-medium">{inspection.manufacturer || "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Year Built:</dt>
                  <dd className="font-medium">{inspection.yearBuilt || "N/A"}</dd>
                </div>
              </dl>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Design Parameters</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Design Pressure:</dt>
                  <dd className="font-medium">{inspection.designPressure ? `${inspection.designPressure} psig` : "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Design Temp:</dt>
                  <dd className="font-medium">{inspection.designTemperature ? `${inspection.designTemperature} °F` : "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Material:</dt>
                  <dd className="font-medium">{inspection.materialSpec || "N/A"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Vessel Type:</dt>
                  <dd className="font-medium">{inspection.vesselType || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </div>

          {calculations && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold mb-3">Calculation Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {calculations.minThicknessResult && (
                  <div>
                    <p className="text-gray-600">Min. Required Thickness</p>
                    <p className="text-lg font-bold text-blue-700">{calculations.minThicknessResult} in</p>
                  </div>
                )}
                {calculations.mawpResult && (
                  <div>
                    <p className="text-gray-600">MAWP</p>
                    <p className="text-lg font-bold text-blue-700">{calculations.mawpResult} psig</p>
                  </div>
                )}
                {calculations.remainingLifeResult && (
                  <div>
                    <p className="text-gray-600">Remaining Life</p>
                    <p className="text-lg font-bold text-blue-700">{calculations.remainingLifeResult} years</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tmlReadings && tmlReadings.length > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold mb-3">Thickness Readings</h4>
              <p className="text-sm text-gray-600">
                {tmlReadings.length} TML locations recorded
              </p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Good</p>
                  <p className="text-lg font-bold text-green-700">
                    {tmlReadings.filter((r) => r.status === "good").length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Monitor</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {tmlReadings.filter((r) => r.status === "monitor").length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Critical</p>
                  <p className="text-lg font-bold text-red-700">
                    {tmlReadings.filter((r) => r.status === "critical").length}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Report Sections</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Vessel Identification & Specifications</span>
              </div>
              <div className="flex items-center">
                <span className={calculations ? "text-green-600 mr-2" : "text-gray-400 mr-2"}>
                  {calculations ? "✓" : "○"}
                </span>
                <span className={calculations ? "" : "text-gray-500"}>
                  Design Calculations (Min Thickness, MAWP, Remaining Life)
                </span>
              </div>
              <div className="flex items-center">
                <span className={tmlReadings && tmlReadings.length > 0 ? "text-green-600 mr-2" : "text-gray-400 mr-2"}>
                  {tmlReadings && tmlReadings.length > 0 ? "✓" : "○"}
                </span>
                <span className={tmlReadings && tmlReadings.length > 0 ? "" : "text-gray-500"}>
                  Thickness Measurement Analysis
                </span>
              </div>
              <div className="flex items-center">
                 <span className={externalInspection ? "text-green-600 mr-2" : "text-gray-400 mr-2"}>
                  {externalInspection ? "✓" : "○"}
                </span>
                <span className={externalInspection ? "" : "text-gray-500"}>
                  External Inspection Findings
                </span>
              </div>
              <div className="flex items-center">
                <span className={internalInspection ? "text-green-600 mr-2" : "text-gray-400 mr-2"}>
                  {internalInspection ? "✓" : "○"}
                </span>
                <span className={internalInspection ? "" : "text-gray-500"}>
                  Internal Inspection Findings
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

