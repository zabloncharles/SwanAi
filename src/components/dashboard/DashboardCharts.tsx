import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartsProps {
  messageStats: { date: string; count: number }[];
  responseTimeStats: { date: string; averageTime: number }[];
  totalMessages: number;
  averageResponseTime: number;
}

export default function DashboardCharts({
  messageStats,
  responseTimeStats,
  totalMessages,
  averageResponseTime,
}: DashboardChartsProps) {
  const messageData = {
    labels: messageStats.map((stat) => stat.date),
    datasets: [
      {
        label: 'Messages',
        data: messageStats.map((stat) => stat.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const responseTimeData = {
    labels: responseTimeStats.map((stat) => stat.date),
    datasets: [
      {
        label: 'Average Response Time (ms)',
        data: responseTimeStats.map((stat) => stat.averageTime),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Message Activity</h3>
          <div className="h-64">
            <Line data={messageData} options={options} />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Total Messages: {totalMessages}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Time</h3>
          <div className="h-64">
            <Line data={responseTimeData} options={options} />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Average Response Time: {Math.round(averageResponseTime)}ms
          </div>
        </div>
      </div>
    </div>
  );
} 