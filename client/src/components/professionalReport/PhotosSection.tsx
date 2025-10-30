import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotosSectionProps {
  reportId: string;
}

export default function PhotosSection({ reportId }: PhotosSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();

  const { data: photos, isLoading } = trpc.professionalReport.photos.list.useQuery({
    reportId,
  });

  const createPhoto = trpc.professionalReport.photos.create.useMutation({
    onSuccess: () => {
      utils.professionalReport.photos.list.invalidate();
      toast.success("Photo added successfully");
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to add photo: ${error.message}`);
    },
  });

  const deletePhoto = trpc.professionalReport.photos.delete.useMutation({
    onSuccess: () => {
      utils.professionalReport.photos.list.invalidate();
      toast.success("Photo deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete photo: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Inspection Photos</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage photos for the inspection report
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Inspection Photo</DialogTitle>
              <DialogDescription>
                Add photos with captions and descriptions
              </DialogDescription>
            </DialogHeader>
            <PhotoUploadForm
              reportId={reportId}
              onSubmit={(data) => {
                setUploading(true);
                createPhoto.mutate(data, {
                  onSettled: () => setUploading(false),
                });
              }}
              onCancel={() => setDialogOpen(false)}
              uploading={uploading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo: any) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative group">
                {photo.photoUrl ? (
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || "Inspection photo"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this photo?")) {
                        deletePhoto.mutate({ photoId: photo.id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-sm">{photo.caption || "Untitled"}</CardTitle>
                {photo.description && (
                  <CardDescription className="text-xs line-clamp-2">
                    {photo.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No photos uploaded yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add photos to document inspection findings
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload First Photo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface PhotoUploadFormProps {
  reportId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  uploading: boolean;
}

function PhotoUploadForm({ reportId, onSubmit, onCancel, uploading }: PhotoUploadFormProps) {
  const [formData, setFormData] = useState({
    caption: "",
    description: "",
    photoUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, we'll use the preview URL as the photo URL
    // In production, you'd upload to S3 first
    const photoData = {
      reportId,
      ...formData,
      photoUrl: previewUrl || formData.photoUrl,
    };
    
    onSubmit(photoData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Photo *</Label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 mx-auto rounded"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Change Photo
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                or paste image URL below
              </p>
            </div>
          )}
        </div>
      </div>

      {!previewUrl && (
        <div className="space-y-2">
          <Label htmlFor="photoUrl">Photo URL (alternative)</Label>
          <Input
            id="photoUrl"
            value={formData.photoUrl}
            onChange={(e) => handleChange("photoUrl", e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="caption">Caption *</Label>
        <Input
          id="caption"
          value={formData.caption}
          onChange={(e) => handleChange("caption", e.target.value)}
          placeholder="e.g., Shell corrosion at 3 o'clock position"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Additional details about the photo..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading || (!previewUrl && !formData.photoUrl)}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Add Photo"
          )}
        </Button>
      </div>
    </form>
  );
}

