import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { UserData } from "../../types/user";
import PricingSection from "./PricingSection";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../config/firebase";

const personalityOptions = [
  {
    value: "Professional - I'll be your professional partner who maintains a polished and efficient communication style.",
    description: "I'll be your professional partner who maintains a polished and efficient communication style."
  },
  {
    value: "Friendly - I'll be your friendly companion who keeps things casual and approachable.",
    description: "I'll be your friendly companion who keeps things casual and approachable."
  },
  {
    value: "Mentor - I'll be your mentor who provides guidance and wisdom.",
    description: "I'll be your mentor who provides guidance and wisdom."
  }
];

const relationshipOptions = [
  {
    value: "Parent - I'll be your nurturing guide who genuinely wants to see you thrive.",
    description: "I'll be your nurturing guide who genuinely wants to see you thrive."
  },
  {
    value: "Friend - I'll be your supportive friend who's always there to chat.",
    description: "I'll be your supportive friend who's always there to chat."
  },
  {
    value: "Coach - I'll be your dedicated coach who pushes you to be your best.",
    description: "I'll be your dedicated coach who pushes you to be your best."
  }
];

interface SettingsProps {
  userData: UserData;
  onUpdate: (data: UserData) => Promise<void>;
}

export default function Settings({ userData, onUpdate }: SettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData & { name: string; phone: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [openCard, setOpenCard] = useState<string | null>("personal");
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (userData) {
      setEditedData({
        ...userData,
        name: (userData.firstName || "") + (userData.lastName ? ` ${userData.lastName}` : ""),
        phone: userData.phoneNumber || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (isEditing && saveButtonRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            saveButtonRef.current?.classList.remove('fixed', 'bottom-4', 'right-4', 'z-50');
          } else {
            saveButtonRef.current?.classList.add('fixed', 'bottom-4', 'right-4', 'z-50');
          }
        },
        { threshold: 0 }
      );

      observer.observe(saveButtonRef.current);
      return () => observer.disconnect();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!editedData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const [firstName, ...lastArr] = (editedData.name || "").split(" ");
      const lastName = lastArr.join(" ");
      const updated = {
        ...editedData,
        firstName,
        lastName,
        phoneNumber: editedData.phone,
      };
      await onUpdate(updated);
      setIsEditing(false);
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedData) return null;

  const isProUser = editedData.type === "pro";

  return (
    <div className="space-y-8">
      {saveMessage && (
        <div
          role="alert"
          className={`p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <button
          type="button"
          className="w-full flex justify-between items-center text-left"
          onClick={() => setOpenCard(openCard === "personal" ? null : "personal")}
          aria-expanded={openCard === "personal"}
        >
          <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
          <span className="text-gray-500">{openCard === "personal" ? "−" : "+"}</span>
        </button>

        {openCard === "personal" && (
          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="name-description"
              />
              <p id="name-description" className="mt-1 text-sm text-gray-500">
                Your display name in the dashboard
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editedData.email}
                onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="email-description"
              />
              <p id="email-description" className="mt-1 text-sm text-gray-500">
                Your contact email address
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={editedData.phone}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="phone-description"
              />
              <p id="phone-description" className="mt-1 text-sm text-gray-500">
                Your phone number for SMS notifications
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Customization Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <button
          type="button"
          className="w-full flex justify-between items-center text-left"
          onClick={() => setOpenCard(openCard === "ai" ? null : "ai")}
          aria-expanded={openCard === "ai"}
        >
          <h2 className="text-2xl font-bold text-gray-900">AI Customization</h2>
          <span className="text-gray-500">{openCard === "ai" ? "−" : "+"}</span>
        </button>

        {openCard === "ai" && (
          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="personality" className="block text-sm font-medium text-gray-700 mb-1">
                AI Personality
              </label>
              <select
                id="personality"
                value={editedData.personality || ''}
                onChange={(e) => setEditedData({ ...editedData, personality: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="personality-description"
              >
                <option value="">Select a personality</option>
                {personalityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value.split(" - ")[0]}
                  </option>
                ))}
              </select>
              <p id="personality-description" className="mt-1 text-sm text-gray-500">
                Choose how your AI assistant communicates with you
              </p>
            </div>

            {isProUser ? (
              <div>
                <label htmlFor="aiRelationship" className="block text-sm font-medium text-gray-700 mb-1">
                  AI Relationship
                </label>
                <select
                  id="aiRelationship"
                  value={editedData.aiRelationship || ''}
                  onChange={(e) => setEditedData({ ...editedData, aiRelationship: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  aria-describedby="relationship-description"
                >
                  <option value="">Select a relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value.split(" - ")[0]}
                    </option>
                  ))}
                </select>
                <p id="relationship-description" className="mt-1 text-sm text-gray-500">
                  Define your relationship with your AI assistant
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900">Pro Feature</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upgrade to Pro to customize your AI relationship and create a more personalized experience.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('dashboard-set-tab', { detail: 'Pricing' }));
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <button
          type="button"
          className="w-full flex justify-between items-center text-left"
          onClick={() => setOpenCard(openCard === "notifications" ? null : "notifications")}
          aria-expanded={openCard === "notifications"}
        >
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <span className="text-gray-500">{openCard === "notifications" ? "−" : "+"}</span>
        </button>

        {openCard === "notifications" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Notifications</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Receive updates and important information about your SwanAI experience
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedData.notificationsEnabled}
                  onChange={(e) => setEditedData({ ...editedData, notificationsEnabled: e.target.checked })}
                  disabled={!isEditing}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditedData(null);
              setSaveMessage(null);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Cancel editing"
          >
            Cancel
          </button>
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isSaving ? 'Saving changes...' : 'Save changes'}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
