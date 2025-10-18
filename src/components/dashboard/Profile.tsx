import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { UserData } from "../../types/user";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../config/firebase";

interface ProfileProps {
  userData: UserData | null;
  onUpdate: (updates: Partial<UserData>) => Promise<void>;
}

export default function Profile({ userData, onUpdate }: ProfileProps) {
  const [user] = useAuthState(auth);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>("personal");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize editedData when userData changes
  useEffect(() => {
    if (userData) {
      setEditedData({
        ...userData,
        name:
          (userData.firstName || "") +
          (userData.lastName ? ` ${userData.lastName}` : ""),
        phone: userData.phoneNumber || "",
      });
    }
  }, [userData]);

  // Clear save message after 3 seconds
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handlePersonalInfoSave = async () => {
    if (!user || !editedData) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);

      // Parse name into first and last name
      const nameParts = editedData.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await updateDoc(userRef, {
        firstName,
        lastName,
        phoneNumber: editedData.phone,
        email: editedData.email,
      });

      // Update local state
      onUpdate({
        firstName,
        lastName,
        phoneNumber: editedData.phone,
        email: editedData.email,
      });

      setEditingSection(null);
      setSaveMessage({
        type: "success",
        text: "Personal information updated successfully!",
      });
    } catch (error) {
      console.error("Error updating personal information:", error);
      setSaveMessage({
        type: "error",
        text: "Failed to update personal information. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsSave = async () => {
    if (!user || !editedData) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        notificationsEnabled: editedData.notificationsEnabled,
      });

      // Update local state
      onUpdate({
        notificationsEnabled: editedData.notificationsEnabled,
      });

      setSaveMessage({
        type: "success",
        text: "Notification preferences updated successfully!",
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      setSaveMessage({
        type: "error",
        text: "Failed to update notification preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedData) return null;

  return (
    <div className="space-y-6">
      {/* Save Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <div className="w-full flex justify-between items-center text-left">
          <button
            type="button"
            className="flex-1 text-left"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCard(openCard === "personal" ? null : "personal");
            }}
            aria-expanded={openCard === "personal"}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Information
            </h2>
          </button>
          <div className="flex items-center gap-4">
            {editingSection === "personal" ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(null);
                    // Reset changes on cancel
                    setEditedData({
                      ...userData,
                      name:
                        (userData?.firstName || "") +
                        (userData?.lastName ? ` ${userData.lastName}` : ""),
                      phone: userData?.phoneNumber || "",
                    });
                  }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePersonalInfoSave();
                  }}
                  disabled={isSaving}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSection("personal");
                  setOpenCard("personal");
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            <span className="text-gray-500">
              {openCard === "personal" ? "−" : "+"}
            </span>
          </div>
        </div>

        {openCard === "personal" && (
          <div className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={editedData.name}
                onChange={(e) =>
                  setEditedData({ ...editedData, name: e.target.value })
                }
                disabled={editingSection !== "personal"}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="name-description"
              />
              <p id="name-description" className="mt-1 text-sm text-gray-500">
                Your display name in the dashboard
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={editedData.email}
                onChange={(e) =>
                  setEditedData({ ...editedData, email: e.target.value })
                }
                disabled={editingSection !== "personal"}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="email-description"
              />
              <p id="email-description" className="mt-1 text-sm text-gray-500">
                Your contact email address
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={editedData.phone}
                onChange={(e) =>
                  setEditedData({ ...editedData, phone: e.target.value })
                }
                disabled={editingSection !== "personal"}
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

      {/* Notifications Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <div className="w-full flex justify-between items-center text-left">
          <button
            type="button"
            className="flex-1 text-left"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCard(
                openCard === "notifications" ? null : "notifications"
              );
            }}
            aria-expanded={openCard === "notifications"}
          >
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          </button>
          <div className="flex items-center gap-4">
            {editingSection === "notifications" ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(null);
                    // Reset changes on cancel
                    setEditedData(userData);
                  }}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNotificationsSave();
                  }}
                  disabled={isSaving}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSection("notifications");
                  setOpenCard("notifications");
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            <span className="text-gray-500">
              {openCard === "notifications" ? "−" : "+"}
            </span>
          </div>
        </div>

        {openCard === "notifications" && (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Enable Notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Receive updates and important information about your SwanAI
                  experience
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedData.notificationsEnabled}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      notificationsEnabled: e.target.checked,
                    })
                  }
                  disabled={editingSection !== "notifications"}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
