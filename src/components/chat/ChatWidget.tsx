import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      setMessages([{
        role: 'assistant',
        content: "Hi there! I'm CleanBot, your 24/7 assistant. How can I help you today?\n\n1. **Get an Instant Quote & Book** - Fast service booking\n2. **Ask a Question** - Learn about our services\n3. **Manage Existing Booking** - Reschedule or check status\n\nJust type your choice or ask me anything!"
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Check for admin command
    if (userMessage.toLowerCase() === 'admin/sscleaners') {
      window.location.href = '/admin/login';
      return;
    }
    
    setInput("");
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          sessionId,
          message: userMessage,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      if (data?.message) {
        let messageContent = data.message;
        
        // Check if message contains payment trigger keywords
        if (messageContent.toLowerCase().includes('proceed with payment') || 
            messageContent.toLowerCase().includes('payment_link')) {
          // Extract booking details from conversation
          const conversationText = messages.map(m => m.content).join(' ');
          
          // Simple estimation (in production, parse properly from conversation)
          const estimatedPrice = 2500; // Default estimate
          
          messageContent = messageContent.replace('PAYMENT_LINK', '');
          messageContent += `\n\n[Click here to complete payment and confirm booking](/payment/mock-checkout?amount=${estimatedPrice})`;
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: messageContent
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble right now. Please call us at +91 1234567890 or try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-large transition-all duration-300",
          isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:opacity-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] shadow-large border-border">
          <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="bg-gradient-primary p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-foreground">SS PureCare Assistant</h3>
                  <p className="text-xs text-primary-foreground/80">Online • 24/7 Available</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap",
                        msg.role === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {/* Handle payment links in message */}
                      {msg.content.includes('](/payment/') ? (
                        <div>
                          {msg.content.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                            const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                            if (linkMatch) {
                              return (
                                <Button
                                  key={i}
                                  onClick={() => window.location.href = linkMatch[2]}
                                  variant="default"
                                  size="sm"
                                  className="mt-2"
                                >
                                  {linkMatch[1]}
                                </Button>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Powered by AI • Available 24/7
              </p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;