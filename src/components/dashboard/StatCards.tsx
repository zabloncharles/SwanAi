import React, { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon, CurrencyDollarIcon, ClockIcon, BellIcon } from '@heroicons/react/24/outline';

interface StatCardsProps {
  totalMessages: number;
  tokensUsed: number;
  averageResponseTime: number;
  notificationsEnabled: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const step = Math.ceil(value / (duration / 16));
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let raf: number;
    function animate() {
      start += step;
      if (start >= value) {
        setDisplay(value);
        return;
      }
      setDisplay(start);
      raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display}</span>;
}

export default function StatCards({
  totalMessages,
  tokensUsed,
  averageResponseTime,
  notificationsEnabled,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />
          Total Messages
        </div>
        <div className="text-2xl font-bold text-gray-900">
          <AnimatedNumber value={totalMessages} />
        </div>
      </div>
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <CurrencyDollarIcon className="w-5 h-5 text-indigo-500" />
          Total Tokens Used
        </div>
        <div className="text-2xl font-bold text-gray-900">
          <AnimatedNumber value={tokensUsed} />
        </div>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <ClockIcon className="w-5 h-5 text-green-500" />
          Avg. Response Time
        </div>
        <div className="text-2xl font-bold text-gray-900">
          <AnimatedNumber value={Number(averageResponseTime.toFixed(2))} />s
        </div>
      </div>
      <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <BellIcon className="w-5 h-5 text-yellow-500" />
          Notifications
        </div>
        <div className={`text-2xl font-bold ${notificationsEnabled ? 'text-green-600' : 'text-red-500'}`}>
          {notificationsEnabled ? "On" : "Off"}
        </div>
      </div>
    </div>
  );
} 