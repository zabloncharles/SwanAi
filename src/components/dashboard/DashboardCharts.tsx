import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  messageStats: { date: string; count: number }[];
  responseTimeStats: { date: string; averageTime: number }[];
}

export default function DashboardCharts({
  messageStats,
  responseTimeStats,
}: DashboardChartsProps) {
  const messageChartData = {
    labels: messageStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Messages per Day",
        data: messageStats.map((stat) => stat.count),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#2563eb",
        pointBorderWidth: 2,
      },
    ],
  };

  const responseTimeChartData = {
    labels: responseTimeStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Average Response Time (seconds)",
        data: responseTimeStats.map((stat) => stat.averageTime),
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) {
            return 'rgba(37,99,235,0.8)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(37,99,235,0.1)');
          gradient.addColorStop(1, 'rgba(37,99,235,0.8)');
          return gradient;
        },
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 12,
        maxBarThickness: 12,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Inter',
            size: 12,
            weight: 'normal' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: '#6B7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          },
          color: '#6B7280',
          padding: 8
        }
      }
    }
  };

  const lineOptions = {
    ...commonOptions,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Message Activity
        </h3>
        <div className="h-[300px]">
          <Line data={messageChartData} options={lineOptions} />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Response Time Trends
        </h3>
        <div className="h-[300px]">
          <Bar data={responseTimeChartData} options={barOptions} />
        </div>
      </div>
    </div>
  );
} 