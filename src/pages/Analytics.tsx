import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";
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
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Users,
  MessageCircle,
  TrendingUp,
  Clock,
  Activity,
  Zap,
  Calendar,
  BarChart3,
} from "lucide-react";

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

interface AnalyticsData {
  activeUsers: number;
  avgChatLength: number;
  userSatisfaction: number;
  totalMessages: number;
  messageStats: { date: string; count: number }[];
  responseTimeStats: { date: string; averageTime: number }[];
  recentSessions: any[];
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color,
}: MetricCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div
        className={`text-sm font-medium ${
          change !== undefined
            ? change > 0
              ? "text-green-600"
              : change < 0
              ? "text-red-600"
              : "text-gray-600"
            : "text-gray-600"
        }`}
      >
        {change !== undefined ? `${change > 0 ? "+" : ""}${change}%` : ""}
        {changeLabel && ` ${changeLabel}`}
      </div>
    </div>
    <div className="mt-4">
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  </div>
);

const StatusTag = ({ status }: { status: string }) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    ended: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || colors.ended
      }`}
    >
      {status}
    </span>
  );
};

export default function Analytics() {
  const [user] = useAuthState(auth);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    activeUsers: 0,
    avgChatLength: 0,
    userSatisfaction: 0,
    totalMessages: 0,
    messageStats: [],
    responseTimeStats: [],
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock data for demonstration - replace with real Firebase queries
      const mockData: AnalyticsData = {
        activeUsers: 1247,
        avgChatLength: 8.3,
        userSatisfaction: 94.2,
        totalMessages: 15680,
        messageStats: [
          { date: "2024-01", count: 1200 },
          { date: "2024-02", count: 1450 },
          { date: "2024-03", count: 1680 },
          { date: "2024-04", count: 1820 },
          { date: "2024-05", count: 2100 },
          { date: "2024-06", count: 2350 },
          { date: "2024-07", count: 2680 },
        ],
        responseTimeStats: [
          { date: "2024-01", averageTime: 2.1 },
          { date: "2024-02", averageTime: 1.8 },
          { date: "2024-03", averageTime: 1.6 },
          { date: "2024-04", averageTime: 1.4 },
          { date: "2024-05", averageTime: 1.3 },
          { date: "2024-06", averageTime: 1.2 },
          { date: "2024-07", averageTime: 1.1 },
        ],
        recentSessions: [
          {
            id: "001",
            userId: "user123",
            duration: "12m 34s",
            sentiment: 0.87,
            status: "active",
          },
          {
            id: "002",
            userId: "user456",
            duration: "8m 12s",
            sentiment: 0.92,
            status: "completed",
          },
          {
            id: "003",
            userId: "user789",
            duration: "15m 45s",
            sentiment: 0.78,
            status: "ended",
          },
          {
            id: "004",
            userId: "user101",
            duration: "6m 23s",
            sentiment: 0.95,
            status: "active",
          },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analyticsData.messageStats.map((stat) => stat.date),
    datasets: [
      {
        type: "bar" as const,
        label: "Messages",
        data: analyticsData.messageStats.map((stat) => stat.count),
        backgroundColor: "rgba(249, 115, 22, 0.8)",
        borderColor: "rgba(249, 115, 22, 1)",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Avg Response Time (s)",
        data: analyticsData.responseTimeStats.map((stat) => stat.averageTime),
        borderColor: "rgba(75, 85, 99, 1)",
        backgroundColor: "rgba(75, 85, 99, 0.1)",
        borderWidth: 2,
        yAxisID: "y1",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
      },
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        title: {
          display: true,
          text: "Messages",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Response Time (s)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your AI companion's performance and user engagement
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Users"
            value={analyticsData.activeUsers}
            change={12}
            changeLabel="vs last month"
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-100 text-blue-600"
          />
          <MetricCard
            title="Avg. Chat Length"
            value={`${analyticsData.avgChatLength}m`}
            change={-3}
            changeLabel="vs last month"
            icon={<MessageCircle className="w-6 h-6" />}
            color="bg-green-100 text-green-600"
          />
          <MetricCard
            title="User Satisfaction"
            value={`${analyticsData.userSatisfaction}%`}
            change={8}
            changeLabel="vs last month"
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-purple-100 text-purple-600"
          />
          <MetricCard
            title="Total Messages"
            value={analyticsData.totalMessages}
            change={15}
            changeLabel="vs last month"
            icon={<Clock className="w-6 h-6" />}
            color="bg-orange-100 text-orange-600"
          />
        </div>

        {/* Main Chart Area */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Message Trends & Response Times
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Avg Response Time</span>
              </div>
            </div>
          </div>
          <div className="h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Session Table & Heatmap Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Sessions
      </h2>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {analyticsData.recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Activity className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {session.userId}
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.duration}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-900">
                      {(session.sentiment * 100).toFixed(0)}%
                    </div>
                    <StatusTag status={session.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Placeholder */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Engagement Heatmap
              </h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-48 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Peak engagement visualization
                </p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Usage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900">AI Responses</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">98.5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: "98.5%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Response success rate</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Conversations</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">2.4k</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Active conversations this week
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Growth</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">+23%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">User growth this month</p>
          </div>
        </div>

        {/* Promo Card */}
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Unlock Deeper Analytics
              </h3>
              <p className="text-orange-100 mb-4">
                Get detailed insights, custom reports, and advanced metrics
              </p>
              <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Upgrade Now
              </button>
            </div>
            <div className="hidden md:block">
              <TrendingUp className="w-16 h-16 text-white opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
