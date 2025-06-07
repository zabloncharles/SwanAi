import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface QuickStats {
  totalMessages: number;
  averageResponseTime: number;
  lastMessageTime: string | null;
}

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [stats, setStats] = useState<QuickStats>({
    totalMessages: 0,
    averageResponseTime: 0,
    lastMessageTime: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        let total = 0;
        let totalResponseTime = 0;
        let lastMessage: any = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          if (data.responseTime) {
            totalResponseTime += data.responseTime;
          }
          if (!lastMessage || data.timestamp > lastMessage.timestamp) {
            lastMessage = data;
          }
        });

        setStats({
          totalMessages: total,
          averageResponseTime: total > 0 ? totalResponseTime / total : 0,
          lastMessageTime: lastMessage ? new Date(lastMessage.timestamp.toDate()).toLocaleString() : null,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome to AI Buddy
        </h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Messages
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalMessages}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Response Time
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.averageResponseTime.toFixed(2)}s
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Last Message
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.lastMessageTime || 'No messages yet'}
              </dd>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Getting Started
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  To start using your AI assistant, simply send a text message to your
                  configured phone number. The AI will respond based on your settings.
                </p>
              </div>
              <div className="mt-5">
                <a
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Configure Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 