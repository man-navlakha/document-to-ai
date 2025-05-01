import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { chatWithPdf } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Send } from "lucide-react";
import { Message, Source } from "@/lib/types";

const Chat = () => {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset messages on PDF source change
  useEffect(() => {
    setMessages([]);
  }, [selectedSource]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sourceId = params.get("sourceId");
    const name = params.get("name");

    if (!sourceId || !name) {
      navigate("/");
      return;
    }

    setSelectedSource({
      id: sourceId,
      name: decodeURIComponent(name),
      dateAdded: new Date().toISOString(),
    });
  }, [location, navigate]);

 const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};


const formatMessageContent = (content: string, references?: { pageNumber: number }[]) => {
  if (!content) return "";

  let formatted = escapeHtml(content);

  // Format code blocks: ```lang\ncode\n```
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const language = lang || "text";
    const escapedCode = escapeHtml(code);
    
    return `
    <div class="relative bg-[#1e1e1e] rounded-md overflow-hidden mb-4 w-full max-w-full md:max-w-4xl">
  <div class="flex items-center justify-between text-xs px-4 py-2 bg-[#2d2d2d] text-white font-mono">
    <span class="lowercase">${language}</span>
    <div class="flex gap-2">
      <button class="copy-code-button text-white hover:text-green-400 transition" data-code="${encodeURIComponent(code)}">Copy</button>
    </div>
  </div>
  <div class="overflow-auto">
    <pre class="p-4 text-sm text-green-400 whitespace-pre-wrap break-words"><code class="language-${language}">${escapedCode}</code></pre>
  </div>
</div>

    `;
  });
// Format ### headers as h3 titles
formatted = formatted.replace(/^### (.*)$/gm, `<h3 class="text-xl font-bold text-white mt-4 mb-2">$1</h3>`);

  // Format bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Format inline code: `code`
  formatted = formatted.replace(/`([^`]+?)`/g, `<code class="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm">$1</code>`);

  // Highlight page references like [P5]
  if (references) {
    references.forEach((ref) => {
      const pageRef = `[P${ref.pageNumber}]`;
      formatted = formatted.replace(
        escapeHtml(pageRef),
        `<span class="text-blue-400 font-semibold">${pageRef}</span>`
      );
    });
  }

  return formatted;
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
console.log(response.content)
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to get response from Pixel's server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  console.log(messages);

  const predefinedQuestions = [
    "What is the summary of the document?",
    "What is the Java explain with code?",
    // `What are the key points of the ${selectedSource.name}?`,
    // `Can you provide an analysis of this ${selectedSource.name}?`,
    // `What are the conclusions of this ${selectedSource.name}?`,
  ];
  
  const handlePredefinedQuestion = async (question: string) => {
    setInput(""); // Clear the input field
    if (!selectedSource) return;
  
    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
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
        description: "Failed to get response from pixel's server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="w-full border-b border-white/10 backdrop-blur-md bg-white/10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center space-x-2 text-white hover:bg-white/30 ">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>

          <h1 className="text-xl font-semibold text-center w-full text-white">
            {selectedSource?.name ? `Chat with: ${selectedSource.name}` : "Pixel"}
          </h1>

          {/* Placeholder to balance center alignment */}
          <div className="w-[100px]" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        {!selectedSource ? (
          <div className="flex flex-col items-center justify-center flex-1 border rounded-md p-6 text-center bg-white/5 backdrop-blur-md">
            <h3 className="text-lg font-semibold mb-2">No PDF Selected</h3>
            <p className="text-gray-300">Please upload a PDF or add one by URL to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Message View */}
            <ScrollArea className="flex-1 overflow-y-auto mb-3 px-1">
              <div className="space-y-6">
                {messages.length === 0 ? (
                  <>
                  <div className="text-center text-gray-400 py-12">Ask a question about {selectedSource.name}</div>
                  

                  <div className="p-4 ">
        <h4 className="text-lg font-medium text-white mb-4">Predefined Questions:</h4>
        <div className="flex flex-wrap gap-2">
          {predefinedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handlePredefinedQuestion(question)}
              className="text-white bg-transparent border-gray-600 hover:bg-gray-700"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
                  </>
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
                        className={cn(
                          "max-w-xl md:max-w-[20rem] lg:max-w-xl px-4 py-3 rounded-2xl shadow-md whitespace-pre-wrap backdrop-blur-sm",
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-gray-100 border border-white/10"
                        )}
                      >
                        <div
                          className="prose dark:prose-invert prose-sm"
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content),
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
               {loading && (
  <div className="flex justify-start text-sm text-gray-400 italic animate-pulse px-2">
    Pixel is typing...
  </div>
)}
<div ref={messagesEndRef} />

              </div>
            </ScrollArea>
{

}
  {/* Predefined Questions */}
     

          {/* Input Box */}
<form
  onSubmit={handleSubmit}
  className="sticky bottom-0 z-10 rounded-md border-t border-white/50 shadow-xl bg-white/10 backdrop-blur-md p-3 flex items-end gap-2"
>
  <Textarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder={`Ask a question about ${selectedSource.name}...`}
    className="resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-white"
    disabled={loading}
  />
  <Button
    type="submit"
    size="icon"
    className="bg-blue-600 hover:bg-blue-700 text-white"
    disabled={!input.trim() || loading}
  >
    <Send className="h-4 w-4" />
  </Button>
</form>

          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
