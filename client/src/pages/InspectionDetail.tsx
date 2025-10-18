import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { Settings, ArrowLeft, FileText, Calculator, BarChart3, Eye, Upload } from "lucide-react";
import { APP_TITLE } from "@/const";
import VesselDataTab from "@/components/inspection/VesselDataTab";
import CalculationsTab from "@/components/inspection/CalculationsTab";
import ThicknessAnalysisTab from "@/components/inspection/ThicknessAnalysisTab";
import InspectionReportTab from "@/components/inspection/InspectionReportTab";
import InspectionFindingsTab from "@/components/inspection/InspectionFindingsTab";

export default function InspectionDetail() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("vessel-data");

  const { data: inspection, isLoading } = trpc.inspections.get.useQuery({ id });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-600 mb-4">Inspection not found</p>
            <Button asChild>
              <Link href="/inspections">Back to Inspections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{inspection.vesselTagNumber}</h1>
                <p className="text-sm text-gray-600">{inspection.vesselName || "No description"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(inspection.status || "draft")}>
                {inspection.status || "draft"}
              </Badge>
              <Button asChild variant="outline" size="sm">
                <Link href="/inspections">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="vessel-data">
              <FileText className="h-4 w-4 mr-2" />
              Vessel Data
            </TabsTrigger>
            <TabsTrigger value="calculations">
              <Calculator className="h-4 w-4 mr-2" />
              Calculations
            </TabsTrigger>
            <TabsTrigger value="thickness">
              <BarChart3 className="h-4 w-4 mr-2" />
              Thickness Analysis
            </TabsTrigger>
            <TabsTrigger value="inspections">
              <Eye className="h-4 w-4 mr-2" />
              Inspections
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileText className="h-4 w-4 mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vessel-data">
            <VesselDataTab inspection={inspection} />
          </TabsContent>

          <TabsContent value="calculations">
            <CalculationsTab inspectionId={id} />
          </TabsContent>

          <TabsContent value="thickness">
            <ThicknessAnalysisTab inspectionId={id} />
          </TabsContent>

          <TabsContent value="inspections">
            <InspectionFindingsTab inspectionId={id} />
          </TabsContent>

          <TabsContent value="report">
            <InspectionReportTab inspection={inspection} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

