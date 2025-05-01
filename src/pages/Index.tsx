import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PdfUploader from "@/components/PdfUploader";
import UrlInput from "@/components/UrlInput";
import ChatInterface from "@/components/ChatInterface";
import SourceList from "@/components/SourceList";
import { Source } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addPdfByUrl } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load sources from localStorage on component mount
  useEffect(() => {
    const savedSources = localStorage.getItem("chatpdf-sources");
    if (savedSources) {
      const parsedSources = JSON.parse(savedSources);
      setSources(parsedSources);
      if (parsedSources.length > 0) {
        setSelectedSource(parsedSources[0]);
      }
    }
  }, []);

  // Save sources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatpdf-sources", JSON.stringify(sources));
  }, [sources]);

  const handleSourceAdded = (sourceId: string, name: string) => {
    const newSource: Source = {
      id: sourceId,
      name,
      dateAdded: new Date().toISOString(),
    };
    setSources((prev) => [newSource, ...prev]);
    setSelectedSource(newSource);
  };

  const handleDeleteSource = (sourceId: string) => {
    setSources((prev) => prev.filter((source) => source.id !== sourceId));
    if (selectedSource?.id === sourceId) {
      const remainingSources = sources.filter((source) => source.id !== sourceId);
      setSelectedSource(remainingSources.length > 0 ? remainingSources[0] : null);
    }
  };

  const handleQuickAccess = async () => {
    const pdfUrl = "https://mphkxojdifbgafp1.public.blob.vercel-storage.com/QuePdf/Notes/unit-1.pptx-ty4A14EygykZwhllGCxmQJfv8vCYqt.pdf";
    const pdfName = "Unit-1 Notes";
    
    try {
      toast({
        title: "Adding PDF...",
        description: "Please wait while we process your PDF",
      });
      
      const sourceId = await addPdfByUrl(pdfUrl);
      
      // Navigate to the chat page with the source ID and name
      navigate(`/chat?sourceId=${encodeURIComponent(sourceId)}&name=${encodeURIComponent(pdfName)}`);
      
    } catch (error) {
      console.error("Error accessing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to access the PDF",
        variant: "destructive",
      });
    }
  };

  // Example PDF URL for demonstration
  const examplePdfUrl = "https://mphkxojdifbgafp1.public.blob.vercel-storage.com/QuePdf/Notes/unit-1.pptx-ty4A14EygykZwhllGCxmQJfv8vCYqt.pdf";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <section className="mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chat with Your PDF Documents
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Upload your PDF files and ask questions to extract information using the assistant AI
            </p>
            
            {/* Quick Access Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={handleQuickAccess} 
                className="bg-gradient-to-r from-blue-600 to-blue-800"
              >
                Quick Access to Unit-1 Notes PDF Chat
              </Button>
              
              <Link to={`/url?url=${encodeURIComponent(examplePdfUrl)}`}>
                <Button 
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Try PDF URL Access Feature
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <PdfUploader onSourceAdded={handleSourceAdded} />
            <UrlInput onSourceAdded={handleSourceAdded} />
          </div>
        </section>

        <Separator className="my-8" />
        
        <section className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Your PDFs</CardTitle>
              </CardHeader>
              <CardContent>
                <SourceList
                  sources={sources}
                  selectedSource={selectedSource}
                  onSelectSource={setSelectedSource}
                  onDeleteSource={handleDeleteSource}
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <ChatInterface selectedSource={selectedSource} />
          </div>
        </section>
        
        <Separator className="my-16" />
        
        <section id="about" className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">About assistant AI</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-2">PDF Processing</h3>
              <p className="text-muted-foreground text-sm">
                Process PDF documents up to 2,000 pages or 32 MB per file.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-2">Multiple Sources</h3>
              <p className="text-muted-foreground text-sm">
                Upload files directly or add PDFs from public URLs.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-2">Contextual Answers</h3>
              <p className="text-muted-foreground text-sm">
                Get accurate answers with page references to verify sources.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-muted py-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            Built with assistant AI | {new Date().getFullYear()}
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
