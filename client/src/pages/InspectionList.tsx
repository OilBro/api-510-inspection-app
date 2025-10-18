import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Settings, Plus, ArrowLeft, FileText, Calendar, Trash2 } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function InspectionList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: inspections, isLoading } = trpc.inspections.list.useQuery();
  const deleteMutation = trpc.inspections.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inspection?")) {
      await deleteMutation.mutateAsync({ id });
      utils.inspections.list.invalidate();
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Inspections</h2>
            <p className="text-gray-600">Manage all your pressure vessel inspection records</p>
          </div>
          <Button asChild>
            <Link href="/inspections/new">
              <Plus className="mr-2 h-4 w-4" />
              New Inspection
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading inspections...</p>
          </div>
        ) : inspections && inspections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{inspection.vesselTagNumber}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {inspection.vesselName || "No description"}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(inspection.status || "draft")}>
                      {inspection.status || "draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {inspection.manufacturer && (
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{inspection.manufacturer}</span>
                      </div>
                    )}
                    {inspection.vesselType && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{inspection.vesselType}</span>
                      </div>
                    )}
                    {inspection.updatedAt && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Updated {new Date(inspection.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild variant="default" size="sm" className="flex-1">
                      <Link href={`/inspections/${inspection.id}`}>View Details</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(inspection.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first inspection record</p>
              <Button asChild>
                <Link href="/inspections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Inspection
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

