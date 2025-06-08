import React from 'react';
import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface UserSettings {
  phoneNumber: string;
  aiPersonality: string;
  responseTime: number;
  notifications: boolean;
}

export default function Settings() {
  const [user] = useAuthState(auth);
  const [settings, setSettings] = useState<UserSettings>({
    phoneNumber: '',
    aiPersonality: 'friendly',
    responseTime: 5,
    notifications: true,
  });
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            phoneNumber: data.phoneNumber || '',
            aiPersonality: data.aiPersonality || 'friendly',
            responseTime: data.responseTime || 5,
            notifications: data.notifications !== undefined ? data.notifications : true,
          });
          setProfile(data.profile || {});
          setSummary(data.summary || '');
          setHistory(data.history || []);
        }
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber: settings.phoneNumber,
        aiPersonality: settings.aiPersonality,
        responseTime: settings.responseTime,
        notifications: settings.notifications,
      });
      setMessage('Settings saved successfully!');
    } catch (error: any) {
      setMessage(error.message);
    }

    setIsSaving(false);
  };

  const handleReset = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'users', user.uid), { summary: '', history: [] }, { merge: true });
      setSummary('');
      setHistory([]);
      setMessage('Summary and history reset!');
    } catch (error) {
      setMessage('Error resetting summary/history.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={settings.phoneNumber}
              onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1234567890"
              required
            />
          </div>

          <div>
            <label htmlFor="aiPersonality" className="block text-sm font-medium text-gray-700 mb-1">
              AI Personality
            </label>
            <textarea
              id="aiPersonality"
              value={settings.aiPersonality}
              onChange={(e) => setSettings({ ...settings, aiPersonality: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
              placeholder="Describe how you want your AI assistant to behave..."
              required
            />
          </div>

          <div>
            <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700 mb-1">
              Response Time (seconds)
            </label>
            <input
              type="number"
              id="responseTime"
              value={settings.responseTime}
              onChange={(e) => setSettings({ ...settings, responseTime: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
              max="30"
              required
            />
          </div>

          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="notifications" className="font-medium text-gray-700">
                Enable Notifications
              </label>
              <p className="text-gray-500">
                Receive notifications when your AI assistant responds
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isSaving ? 'Resetting...' : 'Reset Summary & History'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Profile</h3>
          <pre className="bg-gray-100 p-4 rounded mb-4 overflow-x-auto text-xs">{JSON.stringify(profile, null, 2)}</pre>
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">{summary}</div>
          <h3 className="text-lg font-semibold mb-2">Recent Chat History</h3>
          <ul className="bg-gray-100 p-4 rounded text-sm">
            {history.map((msg, i) => (
              <li key={i}><b>{msg.role}:</b> {msg.content}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 