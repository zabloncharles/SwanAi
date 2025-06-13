import React from 'react';

interface ConversationSummaryProps {
  summary: string;
}

export default function ConversationSummary({ summary }: ConversationSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Conversation Summary
      </h3>
      {summary ? (
        <p className="text-gray-600">{summary}</p>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">
            No conversation summary available yet
          </p>
          <p className="text-sm text-gray-400">
            Your conversation summaries will appear here once
            you start chatting with SwanAI
          </p>
        </div>
      )}
    </div>
  );
} 