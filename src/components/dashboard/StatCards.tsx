import React from 'react';

interface StatCardsProps {
  totalMessages: number;
  tokensUsed: number;
  averageResponseTime: number;
  notificationsEnabled: boolean;
}

export default function StatCards({
  totalMessages,
  tokensUsed,
  averageResponseTime,
  notificationsEnabled,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="text-xs text-gray-400 font-medium">
          Total Messages
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {totalMessages}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="text-xs text-gray-400 font-medium">
          Total Tokens Used
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {tokensUsed}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="text-xs text-gray-400 font-medium">
          Avg. Response Time
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {averageResponseTime.toFixed(2)}s
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="text-xs text-gray-400 font-medium">
          Notifications
        </div>
        <div className={`text-2xl font-bold ${notificationsEnabled ? 'text-green-600' : 'text-red-500'}`}>
          {notificationsEnabled ? "On" : "Off"}
        </div>
      </div>
    </div>
  );
} 