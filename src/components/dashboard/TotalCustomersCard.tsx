import React from "react";

interface TotalCustomersCardProps {
  count: number;
  percentageChange: number;
}

export default function TotalCustomersCard({
  count,
  percentageChange,
}: TotalCustomersCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Total customers
      </h3>
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold text-gray-900">
          {count.toLocaleString()}
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
      <div className="flex -space-x-2 mt-4">
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src="/images/p1.png"
          alt=""
        />
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src="/images/p2.png"
          alt=""
        />
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src="/images/p3.png"
          alt=""
        />
        <img
          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
          src="/images/p4.png"
          alt=""
        />
      </div>
      <button className="text-sm font-medium text-blue-600 hover:underline mt-2">
        Show All →
      </button>
    </div>
  );
}
