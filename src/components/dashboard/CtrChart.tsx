import React from "react";
import { Bar } from "react-chartjs-2";

interface CtrChartProps {
  data: { [date: string]: number };
}

export default function CtrChart({ data }: CtrChartProps) {
  // Aggregate data by month and fill missing months
  const aggregateByMonth = () => {
    const monthlyData: { [month: string]: number } = {};

    // Initialize all months with 0
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    months.forEach((month) => {
      monthlyData[month] = 0;
    });

    // Aggregate data by month
    Object.entries(data).forEach(([dateString, value]) => {
      const date = new Date(dateString);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      monthlyData[month] += value;
    });

    return {
      labels: months,
      values: months.map((month) => monthlyData[month]),
    };
  };

  const aggregatedData = aggregateByMonth();

  // Calculate total tokens and percentage change
  const totalTokens = Object.values(data).reduce(
    (sum, value) => sum + value,
    0
  );
  const tokensByMonth = aggregatedData.values;

  // Calculate percentage change (comparing current month to previous month)
  const currentMonthIndex = new Date().getMonth();
  const currentMonthTokens = tokensByMonth[currentMonthIndex];
  const previousMonthTokens = tokensByMonth[currentMonthIndex - 1] || 0;

  const percentageChange =
    previousMonthTokens > 0
      ? Math.round(
          ((currentMonthTokens - previousMonthTokens) / previousMonthTokens) *
            100
        )
      : currentMonthTokens > 0
      ? 100
      : 0;

  const chartData = {
    labels: aggregatedData.labels,
    datasets: [
      {
        label: "Tokens",
        data: aggregatedData.values,
        backgroundColor: "rgba(255, 159, 64, 0.2)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { display: false } },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-1">Token Usage</h3>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-3xl font-bold text-gray-900">
          {totalTokens.toLocaleString()}
        </p>
        <div
          className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
            percentageChange >= 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {percentageChange >= 0 ? "↑" : "↓"} {Math.abs(percentageChange)}%
        </div>
      </div>
      <div className="h-40">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
