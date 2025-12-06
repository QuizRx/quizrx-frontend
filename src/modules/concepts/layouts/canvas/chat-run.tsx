"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Send, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { validateWorkflow } from "@/modules/concepts/utils/objects/node-checker";
import { toast } from "@/core/hooks/use-toast";
import { useCanvasFlow } from "../../store/react-flow-store";
import { useChatWithPipeline } from "../../hooks/use-chat-with-pipeline";
import { AnswerUsingPipelineResponse, ToolCall } from "../../apollo/mutation/pipeline";
interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  toolCalls?: ToolCall[];
  timeTaken?: number;
  statusCode?: number;
  error?: string;
}

interface ChatRunProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatRun = ({ isOpen, onToggle }: ChatRunProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm here to help you with your workflow. Before you can send messages, please make sure your workflow is properly configured and validates successfully. What would you like to know?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    nodes,
    edges,
  } = useCanvasFlow();

  const { sendMessageToPipeline, isProcessing } = useChatWithPipeline();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Validate workflow before sending message
    const validationErrors = validateWorkflow(nodes as any, edges);
    
    if (validationErrors.length > 0) {
      // Show validation errors and prevent message sending
      validationErrors.forEach(error => {
        toast({
          variant: "destructive",
          title: `[${error.category.toUpperCase()}] Workflow Validation Error`,
          description: error.message,
        });
      });
      return; // Don't send the message if validation fails
    }

    // Show success message when validation passes
    toast({
      title: "Workflow Validation Successful",
      description: "Your workflow is properly configured. Sending your message...",
      variant: "default",
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Send message to pipeline
    try {
      const pipelineResponse = await sendMessageToPipeline(userMessage.text);
      
      if (pipelineResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: pipelineResponse.response || "No response from pipeline",
          sender: "assistant",
          timestamp: new Date(),
          toolCalls: pipelineResponse.toolCalls,
          timeTaken: pipelineResponse.timeTaken,
          statusCode: pipelineResponse.statusCode,
          error: pipelineResponse.error,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Show additional info if there was an error
        if (pipelineResponse.error) {
          toast({
            title: "Pipeline Error",
            description: pipelineResponse.error,
            variant: "destructive",
          });
        }
        
        // Show tool calls if any
        if (pipelineResponse.toolCalls && pipelineResponse.toolCalls.length > 0) {
          toast({
            title: "Tool Calls Executed",
            description: `${pipelineResponse.toolCalls.length} tool(s) were executed`,
            variant: "default",
          });
        }
      } else {
        // Fallback message if pipeline fails
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: "Sorry, I couldn't process your request through the pipeline. Please check your workflow configuration and try again.",
          sender: "assistant",
          timestamp: new Date(),
          error: "Pipeline processing failed",
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        text: "An unexpected error occurred while processing your message. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
        error: "Unexpected error",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <CardTitle className="text-lg font-semibold text-primary">
            Chat Assistant
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-4 pt-0">
            {/* Messages Container */}
            <div className="h-80 overflow-y-auto mb-4 space-y-3 bg-gray-50/50 rounded-lg p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white border border-gray-200 text-gray-900"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    
                    {/* Show tool calls if present */}
                    {message.toolCalls && message.toolCalls.length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          Tool Calls ({message.toolCalls.length}):
                        </p>
                        {message.toolCalls.map((tool, index) => (
                          <div key={index} className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">{tool.name}</span>
                            {tool.result && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Show error if present */}
                    {message.error && (
                      <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded">
                        Error: {message.error}
                      </div>
                    )}
                    
                    <p
                      className={cn(
                        "text-xs mt-1 opacity-70 flex items-center justify-between",
                        message.sender === "user"
                          ? "text-primary-foreground/70"
                          : "text-gray-500"
                      )}
                    >
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.timeTaken && (
                        <span className="ml-2 text-blue-600">
                          {message.timeTaken}ms
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {(isLoading || isProcessing) && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isProcessing ? "Processing through pipeline..." : "Thinking..."}
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading || isProcessing}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isProcessing}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatRun;