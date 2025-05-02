
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { addPdfByUrl } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

const Url = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Extract the PDF URL from the search parameters
  const pdfUrl = searchParams.get("url");
  
  useEffect(() => {
    // If there's a PDF URL, process it automatically
    if (pdfUrl) {
      processPdf();
    }
  }, [pdfUrl]);
  
  const processPdf = async () => {
    if (!pdfUrl) {
      toast({
        title: "Error",
        description: "No PDF URL provided. Please include a URL parameter.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      toast({
        title: "Adding PDF...",
        description: "Please wait while we process your PDF",
      });
      
      const sourceId = await addPdfByUrl(pdfUrl);
      const pdfName = pdfUrl.split('/').pop() || 'PDF from URL';
      
      // Navigate to the chat page with the source ID and name
      navigate(`/chat?sourceId=${encodeURIComponent(sourceId)}&name=${(pdfName)}`);
      
    } catch (error) {
      console.error("Error accessing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to access the PDF",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="w-full max-w-md p-6 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-black/30 text-white rounded-lg shadow-md">
        <div className="mb-6">
        {/* <Button variant="ghost" onClick={() => navigate('https://pixelclass.netlify.app')} className="flex items-center space-x-2 text-white hover:bg-white/30 ">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button> */}

        </div>
        
        <h1 className="text-2xl font-bold mb-4">Access PDF by URL</h1>
        
        {!pdfUrl ? (
          <div className="text-center p-4 bg-orange-100 text-black rounded mb-4">
            <p>No PDF URL detected in the address.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please use a URL with the format: <br/>
              <code>/url?url=https://example.com/yourpdf.pdf</code>
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="mb-2 font-medium">PDF URL detected:</p>
            <p className="text-sm break-words bg-muted p-2 rounded">{pdfUrl}</p>
            
            <Button 
              onClick={processPdf}
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? "Processing..." : "Access PDF Now"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Url;
