import React, { useState } from "react";
import { generateAndStoreLifeResume } from "../../services/lifeResumeApi";
import { AILifeResume } from "../../types/aiLifeResume";
import { ChatService } from "../../services/chatService";

interface LifeResumeGeneratorProps {
  userId: string;
  personality: string;
  relationship: string;
  userLocation?: string;
  onResumeGenerated: (resume: AILifeResume) => void;
  onError: (error: string) => void;
  onClearConversationHistory?: () => Promise<void>;
}

export default function LifeResumeGenerator({
  userId,
  personality,
  relationship,
  userLocation,
  onResumeGenerated,
  onError,
  onClearConversationHistory,
}: LifeResumeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      const newResume = await generateAndStoreLifeResume(
        personality,
        relationship,
        userId,
        userLocation
      );

      clearInterval(progressInterval);
      setProgress(100);

      // Clear conversation history for fresh start
      try {
        console.log(
          "🧹 LifeResumeGenerator: Starting conversation history clearing..."
        );
        console.log("User ID for clearing:", userId);

        // Clear entire chat document (this deletes all messages automatically)
        console.log(
          "Step 1: Clearing entire chat document and all messages..."
        );
        await ChatService.clearChatMessages(userId);
        console.log("✅ Chat document and all messages cleared");

        // Verify that messages were actually cleared
        const hasMessages = await ChatService.hasMessages(userId);
        console.log(
          `🔍 Verification: User has messages after clearing: ${hasMessages}`
        );

        // Call the parent's conversation history clearing function if provided
        if (onClearConversationHistory) {
          console.log(
            "Step 2: Calling parent's conversation history clearing..."
          );
          await onClearConversationHistory();
          console.log("✅ Parent conversation history clearing completed");
        }

        console.log(
          "🎉 LifeResumeGenerator: All conversation history clearing completed successfully!"
        );
      } catch (historyError) {
        console.error(
          "❌ LifeResumeGenerator: Error clearing conversation history:",
          historyError
        );
        console.error("Error details:", {
          message: historyError.message,
          stack: historyError.stack,
          code: historyError.code,
        });
        // Don't fail the entire operation if history clearing fails
      }

      // Small delay to show 100% completion
      setTimeout(() => {
        setIsGenerating(false);
        onResumeGenerated(newResume);
      }, 500);
    } catch (error) {
      setIsGenerating(false);
      setProgress(0);
      console.error("Error generating life resume:", error);
      onError(
        error instanceof Error
          ? error.message
          : "Failed to generate life resume"
      );
    }
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Creating Your Companion
              </h3>
              <p className="text-gray-600 mb-4">
                We're crafting a unique personality based on your preferences...
              </p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p className="mb-2">✨ Generating personality traits</p>
              <p className="mb-2">🎭 Creating unique characteristics</p>
              <p className="mb-2">💭 Building conversation style</p>
              <p>🚀 Almost ready to chat!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create Your Companion
        </h3>

        <p className="text-gray-600 mb-4">
          Generate a personalized companion with a unique personality,
          background, and conversation style based on your preferences.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-amber-800">
                Important Notice
              </h4>
              <p className="text-sm text-amber-700 mt-1">
                <strong>This will delete your current chat history</strong> and
                create a completely new companion. Your previous conversations
                will be permanently lost.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4 text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Personality:
            </span>
            <span className="text-sm text-gray-600 capitalize">
              {personality}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Relationship:
            </span>
            <span className="text-sm text-gray-600 capitalize">
              {relationship}
            </span>
          </div>
        </div>

        <button
          onClick={handleGenerateResume}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Generate Companion
        </button>

        <p className="text-xs text-gray-500 mt-3">
          This will create a unique personality that you can chat with. The
          process usually takes 30-60 seconds.
        </p>
      </div>
    </div>
  );
}
