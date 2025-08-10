import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { sendWebMessage } from "../../services/messageApi";
import MessageInput from "./MessageInput";

interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp?: number;
  seen?: boolean;
}

interface MessagesProps {
  userId: string;
  aiPersonality?: {
    name: string;
    personality: string;
    relationship: string;
  };
}

export default function Messages({ userId, aiPersonality }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const history = userData.history || [];
          // Add timestamps and seen status to existing messages
          const messagesWithTimestamps = history.map((msg: any, index: number) => ({
            ...msg,
            timestamp: msg.timestamp || Date.now() - (history.length - index) * 60000, // Approximate timestamps
            seen: msg.role === "user" ? true : undefined // Mark all user messages as seen
          }));
          setMessages(messagesWithTimestamps);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  // Calculate realistic response time based on message length and conversation context
  const calculateResponseTime = (message: string, messageCount: number): number => {
    const baseTime = 2000; // 2 seconds base
    const charTime = message.length * 15; // 15ms per character
    const contextTime = Math.min(messageCount * 500, 3000); // Up to 3 seconds for context
    const randomVariation = Math.random() * 2000; // 0-2 seconds random variation
    
    return Math.max(1500, Math.min(8000, baseTime + charTime + contextTime + randomVariation));
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      // Add user message immediately for optimistic update
      const userMessage: Message = { 
        role: "user", 
        content: message, 
        timestamp: Date.now(),
        seen: false 
      };
      setMessages(prev => [...prev, userMessage]);

      // Show "seen" indicator after a short delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map((msg, index) => 
            index === prev.length - 1 && msg.role === "user" 
              ? { ...msg, seen: true }
              : msg
          )
        );
        // Scroll to show "seen" indicator
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 1000);

      // Calculate realistic response time
      const responseTime = calculateResponseTime(message, messages.length);
      
      // Show AI typing indicator after "seen" delay
      setTimeout(() => {
        setAiTyping(true);
        // Scroll to show typing indicator
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 1500);

      // Send message to API with delay
      setTimeout(async () => {
        try {
          const response = await sendWebMessage(userId, message);
          
          // Add AI response
          const aiMessage: Message = { 
            role: "assistant", 
            content: response.message,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error sending message:", error);
          // Remove the user message if sending failed
          setMessages(prev => prev.slice(0, -1));
          throw error;
        } finally {
          setAiTyping(false);
          setSending(false);
        }
      }, responseTime);

    } catch (error) {
      console.error("Error sending message:", error);
      setAiTyping(false);
      setSending(false);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Chat with SwanAI
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Send messages and get personalized responses from your AI assistant
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">
                No messages yet
              </p>
              <p className="text-sm text-gray-400">
                Start chatting with SwanAI to see your conversation history
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.role === "user" ? "You" : aiPersonality?.name || "SwanAI"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  
                  {/* Seen indicator for user messages */}
                  {message.role === "user" && message.seen && (
                    <div className="text-xs opacity-50 mt-1 flex items-center justify-end">
                      <span>Seen</span>
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Timestamp for AI messages */}
                  {message.role === "assistant" && message.timestamp && (
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* AI Typing indicator */}
          {aiTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-xs opacity-75 mb-1">{aiPersonality?.name || "SwanAI"}</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending || aiTyping}
          placeholder="Type your message to SwanAI..."
        />
      </div>
    </div>
  );
}
