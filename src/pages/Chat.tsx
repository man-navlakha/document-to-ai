
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { Source } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Chat = () => {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get sourceId from URL params
    const params = new URLSearchParams(location.search);
    const sourceId = params.get("sourceId");
    const name = params.get("name");
    
    if (!sourceId || !name) {
      // If no sourceId is provided, redirect to home
      navigate("/");
      return;
    }
    
    // Set the selected source
    setSelectedSource({
      id: sourceId,
      name: decodeURIComponent(name),
      dateAdded: new Date().toISOString()
    });
  }, [location, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
          
          <h1 className="text-2xl font-semibold">
            {selectedSource?.name ? `Chat with: ${selectedSource.name}` : "PDF Chat"}
          </h1>
        </div>
        
        <div className="flex-1">
          <ChatInterface selectedSource={selectedSource} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
