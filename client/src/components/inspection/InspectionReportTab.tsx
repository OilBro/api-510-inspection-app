import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface InspectionReportTabProps {
  inspection: any;
}

export default function InspectionReportTab({ inspection }: InspectionReportTabProps) {
  const { data: calculations } = trpc.calculations.get.useQuery({ inspectionId: inspection.id });
  const { data: tmlReadings } = trpc.tmlReadings.list.useQuery({ inspectionId: inspection.id });

  const handleGenerateReport = () => {
    // This will be implemented with PDF generation
    alert("Report generation feature coming soon!");
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
                <span className="text-green-600 mr-2">✓</span>
                <span>Design Calculations (Min Thickness, MAWP, Remaining Life)</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                <span>Thickness Measurement Analysis</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">○</span>
                <span className="text-gray-500">External Inspection Findings</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">○</span>
                <span className="text-gray-500">Internal Inspection Findings</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">○</span>
                <span className="text-gray-500">Recommendations & Conclusions</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={handleGenerateReport}>
              <FileText className="mr-2 h-4 w-4" />
              Preview Report
            </Button>
            <Button onClick={handleGenerateReport}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

