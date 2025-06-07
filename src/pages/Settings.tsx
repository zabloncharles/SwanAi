import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';

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
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as UserSettings);
        }
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
      await setDoc(doc(db, 'users', user.uid), settings);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Assistant Settings
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Configure your AI assistant's behavior and preferences.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="+1234567890"
                  value={settings.phoneNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, phoneNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="aiPersonality"
                className="block text-sm font-medium text-gray-700"
              >
                AI Personality
              </label>
              <select
                id="aiPersonality"
                name="aiPersonality"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={settings.aiPersonality}
                onChange={(e) =>
                  setSettings({ ...settings, aiPersonality: e.target.value })
                }
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="responseTime"
                className="block text-sm font-medium text-gray-700"
              >
                Response Time (seconds)
              </label>
              <input
                type="number"
                name="responseTime"
                id="responseTime"
                min="1"
                max="30"
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={settings.responseTime}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    responseTime: parseInt(e.target.value),
                  })
                }
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
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: e.target.checked,
                    })
                  }
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="notifications"
                  className="font-medium text-gray-700"
                >
                  Enable Notifications
                </label>
                <p className="text-gray-500">
                  Receive notifications when your AI assistant responds
                </p>
              </div>
            </div>

            {message && (
              <div
                className={`text-sm ${
                  message.includes('Error') ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 