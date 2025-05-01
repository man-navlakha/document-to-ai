
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Message, ChatResponse, Source } from "@/lib/types";
import { chatWithPdf } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  selectedSource: Source | null;
}

const ChatInterface = ({ selectedSource }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset chat when source changes
  useEffect(() => {
    setMessages([]);
  }, [selectedSource]);

  const formatMessageContent = (content: string, references?: { pageNumber: number }[]) => {
    if (!references) return content;

    // Replace [P1], [P2], etc. with styled references
    let formattedContent = content;
    references.forEach((ref, index) => {
      const pageRef = `[P${ref.pageNumber}]`;
      formattedContent = formattedContent.replace(
        pageRef,
        `<span class="pdf-reference">${pageRef}</span>`
      );
    });

    return formattedContent;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSource) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await chatWithPdf(selectedSource.id, allMessages, true);

      const assistantMessage: Message = {
        role: "assistant",
        content: response.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to get response from ChatPDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSource) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-4 text-center border rounded-md">
        <h3 className="text-lg font-medium mb-2">No PDF Selected</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Please upload a PDF or add one by URL to start chatting
        </p>
      </div>
    );
  }

  return (
    <div id="chat" className="flex flex-col h-full min-h-[500px] rounded-md border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium truncate">Chat with: {selectedSource.name}</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Ask questions about your PDF</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn("flex", {
                  "justify-end": message.role === "user",
                  "justify-start": message.role === "assistant",
                })}
              >
                <div
                  className={cn("max-w-[80%] rounded-lg px-4 py-2", {
                    "bg-primary text-primary-foreground": message.role === "user",
                    "bg-muted": message.role === "assistant",
                  })}
                >
                  <div 
                    className="message-content"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }} 
                  />
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your PDF..."
            className="resize-none"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
