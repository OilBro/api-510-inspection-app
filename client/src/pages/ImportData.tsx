import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Settings, ArrowLeft, Upload, FileText, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function ImportData() {
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  
  const parseMutation = trpc.importedFiles.parseFile.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const isPDF = file.type === "application/pdf";
      const isExcel = 
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isPDF && !isExcel) {
        toast.error("Please select a PDF or Excel file");
        return;
      }

      setSelectedFile(file);
      setParseResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Content = base64Data.split(",")[1]; // Remove data:...;base64, prefix

        const fileType = selectedFile.name.endsWith(".pdf") ? "pdf" : "excel";

        try {
          const result = await parseMutation.mutateAsync({
            fileData: base64Content,
            fileName: selectedFile.name,
            fileType,
          });

          setParseResult(result);
          toast.success("File imported successfully!");
          
          // Redirect to inspection after 2 seconds
          setTimeout(() => {
            setLocation(`/inspections/${result.inspectionId}`);
          }, 2000);
        } catch (error) {
          console.error("Parse error:", error);
          toast.error("Failed to parse file. Please check the file format.");
          setUploading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Upload failed");
      setUploading(false);
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Inspection Data</h2>
          <p className="text-gray-600">Upload PDF or Excel files to automatically create inspection records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-red-600 mb-2" />
              <CardTitle>PDF Import</CardTitle>
              <CardDescription>Upload API 510 inspection reports in PDF format</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Automatically extracts vessel identification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Parses design specifications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Extracts thickness measurement data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>AI-powered intelligent parsing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileSpreadsheet className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Excel Import</CardTitle>
              <CardDescription>Upload inspection data from Excel spreadsheets</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Supports .xlsx and .xls formats</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Multi-sheet workbook processing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Bulk TML reading import</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Flexible column header matching</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select a PDF or Excel file to import inspection data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
              size="lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Processing..." : "Upload and Import"}
            </Button>

            {uploading && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="font-medium text-blue-900">Processing file...</p>
                    <p className="text-sm text-blue-700">This may take a few moments</p>
                  </div>
                </div>
              </div>
            )}

            {parseResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 mb-2">Import Successful!</p>
                    <div className="text-sm text-green-700 space-y-1">
                      {parseResult.parsedData.vesselTagNumber && (
                        <p>Vessel: {parseResult.parsedData.vesselTagNumber}</p>
                      )}
                      {parseResult.parsedData.vesselName && (
                        <p>Name: {parseResult.parsedData.vesselName}</p>
                      )}
                      {parseResult.parsedData.tmlReadings && parseResult.parsedData.tmlReadings.length > 0 && (
                        <p>TML Readings: {parseResult.parsedData.tmlReadings.length} locations imported</p>
                      )}
                    </div>
                    <p className="text-sm text-green-600 mt-3">Redirecting to inspection...</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Import Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ensure PDF files are text-based (not scanned images) for best results</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Excel files should have clear column headers for vessel data and TML readings</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>After import, review and complete any missing information in the inspection record</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Imported data is automatically saved to the database for future reference</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

