import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

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
  const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'messages'>('users');

  const exportCSV = (data: Record<string, number>, label: string) => {
    const rows = [['Date', label]];
    Object.entries(data).forEach(([date, value]) => {
      rows.push([date, value.toString()]);
    });
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label}-by-day.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabData = [
    { key: 'users', label: 'Active Users', data: usersByDay, color: 'blue' },
    { key: 'tokens', label: 'Tokens Used', data: tokensByDay, color: 'indigo' },
    { key: 'messages', label: 'Messages', data: messagesByDay, color: 'green' },
  ];

  const current = tabData.find(t => t.key === activeTab)!;
  const dates = Object.keys(current.data).sort();
  const values = dates.map(date => current.data[date]);
  const last = values[values.length - 1] || 0;
  const prev = values[values.length - 2] || 0;
  const trend = last - prev;

  const usersByDayDates = Object.keys(usersByDay).sort();
  const usersByDayData = usersByDayDates.map((date) => usersByDay[date]);

  const tokensByDayDates = Object.keys(tokensByDay).sort();
  const tokensByDayData = tokensByDayDates.map((date) => tokensByDay[date]);

  const messagesByDayDates = Object.keys(messagesByDay).sort();
  const messagesByDayData = messagesByDayDates.map(
    (date) => messagesByDay[date]
  );

  const calculateTotalTokens = (tokensByDay: { [date: string]: number }) => {
    return Object.values(tokensByDay).reduce((sum, value) => sum + value, 0);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // State for top states
  const [topStates, setTopStates] = useState<
    { state: string; count: number }[]
  >([]);

  // State for user type breakdown per day
  const [userTypePerDay, setUserTypePerDay] = useState<any>({});
  const [allDates, setAllDates] = useState<string[]>([]);
  const [userTypes, setUserTypes] = useState<string[]>([]);

  // State for users per day
  const [usersPerDay, setUsersPerDay] = useState<{ [date: string]: number }>(
    {}
  );
  const [usersPerDayDates, setUsersPerDayDates] = useState<string[]>([]);
  const [usersPerDayCounts, setUsersPerDayCounts] = useState<number[]>([]);

  // State for users per day by type from analytics
  const [usersPerDayByType, setUsersPerDayByType] = useState<any>({});
  const [usersPerDayTypes, setUsersPerDayTypes] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUsersAndAggregateStates() {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const stateCounts: { [state: string]: number } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.state) {
          const state = data.state;
          stateCounts[state] = (stateCounts[state] || 0) + 1;
        }
      });
      // Convert to array and sort by count desc
      const sorted = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 states
      setTopStates(sorted);
    }
    fetchUsersAndAggregateStates();
  }, []);

  useEffect(() => {
    async function fetchUsersAndAggregateTypes() {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const typeDateCounts: { [type: string]: { [date: string]: number } } = {};
      const dateSet = new Set<string>();
      const typeSet = new Set<string>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const type = data.type || "free";
        let createdAt = data.createdAt;
        if (createdAt instanceof Timestamp) {
          createdAt = createdAt.toDate();
        } else if (createdAt && createdAt.seconds) {
          createdAt = new Date(createdAt.seconds * 1000);
        } else {
          createdAt = new Date();
        }
        const dateStr = createdAt.toISOString().split("T")[0];
        if (!typeDateCounts[type]) typeDateCounts[type] = {};
        typeDateCounts[type][dateStr] =
          (typeDateCounts[type][dateStr] || 0) + 1;
        dateSet.add(dateStr);
        typeSet.add(type);
      });
      // Sort dates
      const sortedDates = Array.from(dateSet).sort();
      setAllDates(sortedDates);
      setUserTypes(Array.from(typeSet));
      setUserTypePerDay(typeDateCounts);
    }
    fetchUsersAndAggregateTypes();
  }, []);

  useEffect(() => {
    async function fetchUsersPerDay() {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const perDay: { [date: string]: number } = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        let createdAt = data.createdAt;
        if (createdAt instanceof Timestamp) {
          createdAt = createdAt.toDate();
        } else if (createdAt && createdAt.seconds) {
          createdAt = new Date(createdAt.seconds * 1000);
        } else {
          createdAt = new Date();
        }
        const dateStr = createdAt.toISOString().split("T")[0];
        perDay[dateStr] = (perDay[dateStr] || 0) + 1;
      });
      const sortedDates = Object.keys(perDay).sort();
      setUsersPerDay(perDay);
      setUsersPerDayDates(sortedDates);
      setUsersPerDayCounts(sortedDates.map((date) => perDay[date]));
    }
    fetchUsersPerDay();
  }, []);

  useEffect(() => {
    async function fetchUsersPerDayByType() {
      // Fetch from analytics/global
      const analyticsRef = collection(db, "analytics");
      const snapshot = await getDocs(analyticsRef);
      let usersPerDay = {};
      snapshot.forEach((doc) => {
        if (doc.id === "global") {
          const data = doc.data();
          if (data.usersPerDay) {
            usersPerDay = data.usersPerDay;
          }
        }
      });
      // Get all dates and types
      const allDates = Object.keys(usersPerDay).sort();
      const typeSet = new Set<string>();
      allDates.forEach((date) => {
        Object.keys(usersPerDay[date] || {}).forEach((type) =>
          typeSet.add(type)
        );
      });
      setUsersPerDayByType(usersPerDay);
      setUsersPerDayDates(allDates);
      setUsersPerDayTypes(Array.from(typeSet));
    }
    fetchUsersPerDayByType();
  }, []);

  return (
    <>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-8 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            {tabData.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === tab.key
                    ? `bg-${tab.color}-600 text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            className="ml-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
            onClick={() => exportCSV(current.data, current.label.replace(/ /g, ''))}
          >
            Export CSV
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
          <div>
            <div className="text-gray-500 text-sm mb-1">Total {current.label}</div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-gray-900">
                {values.reduce((a, b) => a + b, 0).toLocaleString()}
              </span>
              <span
                className={`font-semibold text-lg ${
                  trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                {trend > 0 ? '+' : ''}{trend}
              </span>
              <span className="text-gray-400 text-sm mb-1">Last 24 hours</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg bg-white text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">{current.label}</th>
              </tr>
            </thead>
            <tbody>
              {dates.map(date => (
                <tr key={date} className="border-t">
                  <td className="px-4 py-2 text-gray-600">{date}</td>
                  <td className="px-4 py-2 text-gray-900">{current.data[date]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin-only Active Users Section */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Active users by type per day
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            How many users of each type joined per day.
          </p>
          <div className="h-[260px]">
            <Line
              data={{
                labels: allDates,
                datasets: userTypes.map((type, idx) => ({
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  data: allDates.map(
                    (date) => userTypePerDay[type]?.[date] || 0
                  ),
                  borderColor: idx === 0 ? "#6366f1" : "#f59e42",
                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                  tension: 0.4,
                  pointRadius: 5,
                  pointBackgroundColor: "#fff",
                  pointBorderColor: idx === 0 ? "#6366f1" : "#f59e42",
                  pointBorderWidth: 2,
                })),
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                  tooltip: {
                    enabled: true,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#F3F4F6" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Users Per Day By Type Chart */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Users Per Day (by Type)
        </h2>
        <div className="h-[260px]">
          <Line
            data={{
              labels: usersPerDayDates,
              datasets: usersPerDayTypes.map((type, idx) => ({
                label: type.charAt(0).toUpperCase() + type.slice(1),
                data: usersPerDayDates.map(
                  (date) => usersPerDayByType[date]?.[type] || 0
                ),
                borderColor: idx === 0 ? "#6366f1" : "#f59e42",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "#fff",
                pointBorderColor: idx === 0 ? "#6366f1" : "#f59e42",
                pointBorderWidth: 2,
              })),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, position: "top" },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, grid: { color: "#F3F4F6" } },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Users per Day
              </h3>
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
              <h3 className="text-lg font-semibold text-gray-900">
                Messages by Day
              </h3>
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
                      const { ctx, chartArea } = chart;
                      if (!chartArea) {
                        return "rgba(99, 102, 241, 0.8)";
                      }
                      const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.bottom,
                        0,
                        chartArea.top
                      );
                      gradient.addColorStop(0, "rgba(99, 102, 241, 0.2)");
                      gradient.addColorStop(1, "rgba(99, 102, 241, 0.8)");
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
