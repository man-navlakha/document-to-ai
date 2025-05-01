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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [selectedSource]);

  const formatMessageContent = (content: string, references?: { pageNumber: number }[]) => {
    if (!references) return content;
    let formattedContent = content;
    references.forEach((ref) => {
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

    const userMessage: Message = { role: "user", content: input };
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
    <div id="chat" className="flex flex-col h-full min-h-[500px] rounded-md bg-[#212121] text-white">
    {/* Message Area */}
    <ScrollArea className="flex-1 p-4 overflow-y-auto">
      <div className="space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Ask questions about {selectedSource.name}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex w-full", {
                "justify-end": message.role === "user",
                "justify-start": message.role === "assistant",
              })}
            >
              <div
                className={cn(
                  "w-full max-w-3xl rounded-xl px-4 py-3 whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-[#2a2a2a] text-gray-100"
                )}
              >
                <div
                  className="message-content prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: formatMessageContent(message.content),
                  }}
                />
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  
    {/* Input Area */}
    <div className="w-full border-t border-gray-700 bg-[#1e1e1e] px-4 py-3 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your PDF..."
          className="resize-none bg-[#2a2a2a] text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
