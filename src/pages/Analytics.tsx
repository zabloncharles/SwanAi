import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
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

interface MessageStats {
  date: string;
  count: number;
}

interface ResponseTimeStats {
  date: string;
  averageTime: number;
}

export default function Analytics() {
  const [user] = useAuthState(auth);
  const [messageStats, setMessageStats] = useState<MessageStats[]>([]);
  const [responseTimeStats, setResponseTimeStats] = useState<ResponseTimeStats[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        // Fetch message statistics
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const stats: { [key: string]: number } = {};
        const responseTimes: { [key: string]: number[] } = {};
        let total = 0;
        let totalResponseTime = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp).toLocaleDateString();
          
          stats[date] = (stats[date] || 0) + 1;
          total++;
          
          if (data.responseTime) {
            if (!responseTimes[date]) {
              responseTimes[date] = [];
            }
            responseTimes[date].push(data.responseTime);
            totalResponseTime += data.responseTime;
          }
        });

        // Convert stats to arrays for charts
        const messageStatsArray = Object.entries(stats).map(([date, count]) => ({
          date,
          count,
        }));

        const responseTimeStatsArray = Object.entries(responseTimes).map(
          ([date, times]) => ({
            date,
            averageTime: times.reduce((a, b) => a + b, 0) / times.length,
          })
        );

        setMessageStats(messageStatsArray);
        setResponseTimeStats(responseTimeStatsArray);
        setTotalMessages(total);
        setAverageResponseTime(totalResponseTime / total);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [user]);

  const messageChartData = {
    labels: messageStats.map((stat) => stat.date),
    datasets: [
      {
        label: 'Messages per Day',
        data: messageStats.map((stat) => stat.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const responseTimeChartData = {
    labels: responseTimeStats.map((stat) => stat.date),
    datasets: [
      {
        label: 'Average Response Time (seconds)',
        data: responseTimeStats.map((stat) => stat.averageTime),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Messages
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {totalMessages}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Response Time
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {averageResponseTime.toFixed(2)}s
              </dd>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Message Activity
              </h3>
              <div className="mt-2">
                <Line data={messageChartData} />
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Response Time Trends
              </h3>
              <div className="mt-2">
                <Bar data={responseTimeChartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 