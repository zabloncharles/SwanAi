import React, { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || disabled) {
      return;
    }

    const trimmedMessage = message.trim();
    setMessage("");
    setIsSending(true);
    setError("");

    try {
      await onSendMessage(trimmedMessage);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const characterCount = message.length;
  const maxCharacters = 1000;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              isOverLimit
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            } ${
              disabled || isSending
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-white"
            }`}
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          
          {/* Character count */}
          <div className="absolute bottom-2 right-2">
            <span
              className={`text-xs ${
                isOverLimit ? "text-red-500" : "text-gray-400"
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={
            !message.trim() ||
            isSending ||
            disabled ||
            isOverLimit
          }
          className={`flex-shrink-0 p-3 rounded-lg transition-all duration-200 ${
            !message.trim() || isSending || disabled || isOverLimit
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800"
          }`}
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>
      
      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
}
