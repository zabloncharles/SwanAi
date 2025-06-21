import React from "react";

interface SimpleStatCardProps {
  label: string;
  value: number;
  percentageChange: number;
  Icon: React.ElementType;
}

export default function SimpleStatCard({
  label,
  value,
  percentageChange,
  Icon,
}: SimpleStatCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-center bg-gray-100 w-12 h-12 rounded-full mb-4">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
          <div
            className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isPositive ? "↑" : "↓"} {Math.abs(percentageChange)}%
          </div>
        </div>
      </div>
    </div>
  );
}
