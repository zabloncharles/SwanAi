import React from 'react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [userData, setUserData] = useState<{
    phoneNumber: string;
    personality: string;
    tokensUsed: number;
  }>({
    phoneNumber: '',
    personality: '',
    tokensUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfile(data.profile || {});
        setSummary(data.summary || '');
        setHistory(data.history || []);
        setUserData({
          phoneNumber: data.phoneNumber || '',
          personality: data.personality || '',
          tokensUsed: data.tokensUsed || 0,
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your AI Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <p className="mt-1 text-gray-900">{userData.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Personality</label>
                <p className="mt-1 text-gray-900">{userData.personality}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Total Tokens Used</label>
                <p className="mt-1 text-gray-900">{userData.tokensUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Conversation Summary</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Chat History</h2>
          <div className="space-y-4">
            {history.map((msg, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${
                  msg.role === 'user' ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium text-gray-600">{msg.role}:</span>
                <p className="mt-1 text-gray-900">{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 