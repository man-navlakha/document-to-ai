
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { addPdfByFile } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PdfUploaderProps {
  onSourceAdded: (sourceId: string, name: string) => void;
}

const PdfUploader = ({ onSourceAdded }: PdfUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 33554432) { // 32 MB in bytes
        toast({
          title: "File too large",
          description: "PDF files are limited to 32 MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);

    try {
      const sourceId = await addPdfByFile(selectedFile);
      onSourceAdded(sourceId, selectedFile.name);
      setUploadProgress(100);
      toast({
        title: "Upload successful",
        description: "PDF has been uploaded and processed",
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload PDF file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <Card id="upload" className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload PDF
        </CardTitle>
        <CardDescription>
          Upload a PDF file from your computer (max 32 MB)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={loading}
            />
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF (max 32 MB)
              </p>
            </div>
          </div>
          {selectedFile && (
            <div className="text-sm">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </div>
          )}
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="h-2 w-full" />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          className="w-full"
        >
          {loading ? "Uploading..." : "Upload PDF"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PdfUploader;
