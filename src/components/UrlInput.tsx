
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { addPdfByUrl } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "lucide-react";

interface UrlInputProps {
  onSourceAdded: (sourceId: string, name: string) => void;
}

const UrlInput = ({ onSourceAdded }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    if (!url.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid PDF URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const sourceId = await addPdfByUrl(url);
      const fileName = url.split('/').pop() || 'PDF from URL';
      onSourceAdded(sourceId, fileName);
      toast({
        title: "PDF Added",
        description: "PDF has been successfully added from URL",
      });
      setUrl("");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add PDF from URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id="url" className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Link className="h-5 w-5" />
          Add PDF by URL
        </CardTitle>
        <CardDescription>
          Add a PDF from a publicly accessible URL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="https://example.com/document.pdf"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={!url || loading}
          className="w-full"
        >
          {loading ? "Adding PDF..." : "Add PDF"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UrlInput;
