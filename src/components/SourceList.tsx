
import { Source } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Trash2, MessageSquare } from "lucide-react";
import { deletePdfSource } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SourceListProps {
  sources: Source[];
  selectedSource: Source | null;
  onSelectSource: (source: Source) => void;
  onDeleteSource: (sourceId: string) => void;
}

const SourceList = ({
  sources,
  selectedSource,
  onSelectSource,
  onDeleteSource,
}: SourceListProps) => {
  const { toast } = useToast();

  const handleDelete = async (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deletePdfSource(sourceId);
      onDeleteSource(sourceId);
      toast({
        title: "PDF deleted",
        description: "The PDF has been removed from your sources",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive",
      });
    }
  };

  if (sources.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No PDFs added yet. Upload a PDF or add one by URL.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-1 p-2">
        {sources.map((source) => (
          <div
            key={source.id}
            onClick={() => onSelectSource(source)}
            className={cn(
              "flex items-center justify-between p-2 rounded-md cursor-pointer",
              {
                "bg-primary/10": selectedSource?.id === source.id,
                "hover:bg-muted": selectedSource?.id !== source.id,
              }
            )}
          >
            <div className="flex items-center space-x-2 truncate">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm truncate">{source.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Link
                to={`/chat?sourceId=${encodeURIComponent(source.id)}&name=${encodeURIComponent(source.name)}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-primary" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(source.id, e)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default SourceList;
