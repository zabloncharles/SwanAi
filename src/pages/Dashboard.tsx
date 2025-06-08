import React from 'react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<{
    phoneNumber: string;
    personality: string;
    summary: string;
    profile: string;
    tokensUsed: number;
  }>({
    phoneNumber: '',
    personality: '',
    summary: '',
    profile: '',
    tokensUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({
          phoneNumber: data.phoneNumber || '',
          personality: data.personality || '',
          summary: data.summary || '',
          profile: data.profile || '',
          tokensUsed: data.tokensUsed || 0,
        });
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome to AI Buddy
        </h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto text-xs">{JSON.stringify(userData.profile, null, 2)}</pre>
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">{userData.summary}</div>
          <h2 className="text-xl font-semibold mb-2">Recent Chat History</h2>
          <ul className="bg-gray-100 p-4 rounded text-sm">
            {/* Assuming history is stored in userData */}
          </ul>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Total Tokens Used</h3>
            <p className="text-gray-600">{userData.tokensUsed}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 