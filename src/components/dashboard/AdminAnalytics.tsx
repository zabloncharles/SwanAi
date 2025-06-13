import React from 'react';
import { Bar } from 'react-chartjs-2';

interface AdminAnalyticsProps {
  usersByDay: { [date: string]: number };
  tokensByDay: { [date: string]: number };
  messagesByDay: { [date: string]: number };
}

export default function AdminAnalytics({
  usersByDay,
  tokensByDay,
  messagesByDay,
}: AdminAnalyticsProps) {
  const usersByDayDates = Object.keys(usersByDay).sort();
  const usersByDayData = usersByDayDates.map((date) => usersByDay[date]);

  const tokensByDayDates = Object.keys(tokensByDay).sort();
  const tokensByDayData = tokensByDayDates.map((date) => tokensByDay[date]);

  const messagesByDayDates = Object.keys(messagesByDay).sort();
  const messagesByDayData = messagesByDayDates.map((date) => messagesByDay[date]);

  const calculateTotalTokens = (tokensByDay: { [date: string]: number }) => {
    return Object.values(tokensByDay).reduce((sum, value) => sum + value, 0);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div>
            <div className="text-gray-500 text-sm mb-1">
              Total Tokens Used
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-gray-900">
                {calculateTotalTokens(tokensByDay).toLocaleString()}
              </span>
              {(() => {
                const currentTokens = tokensByDayData[tokensByDayData.length - 1] || 0;
                const previousTokens = tokensByDayData[tokensByDayData.length - 2] || 0;
                const percentageChange = calculatePercentageChange(currentTokens, previousTokens);
                return (
                  <span className={`font-semibold text-lg ${percentageChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                  </span>
                );
              })()}
              <span className="text-gray-400 text-sm mb-1">
                Last 24 hours
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Users per Day</h3>
              <p className="text-sm text-gray-500">Daily user growth</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: usersByDayDates,
                datasets: [
                  {
                    label: "Users",
                    data: usersByDayData,
                    backgroundColor: "rgba(99, 102, 241, 0.8)",
                  },
                ],
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Messages by Day</h3>
              <p className="text-sm text-gray-500">Daily message activity</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: messagesByDayDates,
                datasets: [
                  {
                    label: "Messages",
                    data: messagesByDayData,
                    backgroundColor: (context) => {
                      const chart = context.chart;
                      const {ctx, chartArea} = chart;
                      if (!chartArea) {
                        return 'rgba(99, 102, 241, 0.8)';
                      }
                      const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
                      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.8)');
                      return gradient;
                    },
                    borderRadius: 0,
                    borderSkipped: false,
                    barThickness: 12,
                    maxBarThickness: 12,
                    order: 2,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
} 