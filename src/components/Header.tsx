
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">assistant AI</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Upload PDF
          </a>
          <a href="#url" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Add by URL
          </a>
          <RouterLink to="/url" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <Link className="h-4 w-4" />
            PDF by URL Link
          </RouterLink>
          <a href="#chat" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Chat
          </a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <Button variant="default" size="sm">Get API Key</Button>
        </nav>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {isMenuOpen && (
        <div className="container py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col space-y-4">
            <a 
              href="#upload" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Upload PDF
            </a>
            <a 
              href="#url" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Add by URL
            </a>
            <RouterLink 
              to="/url" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted flex items-center gap-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link className="h-4 w-4" />
              PDF by URL Link
            </RouterLink>
            <a 
              href="#chat" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Chat
            </a>
            <a 
              href="#about" 
              className="text-sm font-medium p-2 rounded-md hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <Button variant="default" size="sm" className="w-full">
              Get API Key
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
