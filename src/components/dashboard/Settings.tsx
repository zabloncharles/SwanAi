import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../config/firebase";
import { UserData } from "../../types/user";
import PricingSection from "./PricingSection";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../config/firebase";

const personalityOptions = [
  {
    name: "Professional",
    value: "Professional",
    description:
      "Your polished and efficient partner. Organized, articulate, and goal-oriented. Perfect for staying on top of tasks and projects.",
  },
  {
    name: "Friendly",
    value: "Friendly",
    description:
      "Your supportive and easygoing companion. Casual, warm, and always there to chat, celebrate wins, or offer a listening ear.",
  },
  {
    name: "Mentor",
    value: "Mentor",
    description:
      "Your wise and insightful guide. Patient and thoughtful, helping you find answers through reflection and self-discovery.",
  },
  {
    name: "Rick",
    value: "Rick",
    description:
      "Your brilliant but eccentric scientist companion. Sarcastic, witty, and full of interdimensional wisdom. Perfect for unconventional solutions and scientific perspectives.",
  },
];

const relationshipOptions = [
  {
    name: "Mom",
    value: "Mom",
    description:
      "A nurturing and caring presence, always there with warm support and gentle encouragement.",
  },
  {
    name: "Dad",
    value: "Dad",
    description:
      "A steady and protective figure, offering practical advice and celebrating your strengths.",
  },
  {
    name: "Friend",
    value: "Friend",
    description: "I'll be your supportive friend who's always there to chat.",
  },
  {
    name: "Coach",
    value: "Coach",
    description: "I'll be your dedicated coach who pushes you to be your best.",
  },
  {
    name: "Cousin",
    value: "Cousin",
    description:
      "I'll be your fun-loving cousin who's always up for an adventure.",
  },
  {
    name: "Therapist",
    value: "Therapist",
    description:
      "A calm, empathetic, and supportive presence. Provides a safe, non-judgmental space to explore your thoughts and feelings, using reflective listening and open-ended questions.",
  },
];

interface SettingsProps {
  userData: UserData;
  onUpdate: (data: Partial<UserData>) => Promise<void>;
}

export default function Settings({ userData, onUpdate }: SettingsProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<
    (UserData & { name: string; phone: string }) | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [openCard, setOpenCard] = useState<string | null>("personal");
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (userData) {
      let updatedData = { ...userData };
      let needsUpdate = false;

      // Data migration logic
      const currentPersonality = userData.profile?.personality;
      if (
        currentPersonality &&
        !personalityOptions.some((p) => p.value === currentPersonality)
      ) {
        if (currentPersonality.startsWith("Professional")) {
          updatedData.profile = {
            ...updatedData.profile,
            personality: "Professional",
          };
          needsUpdate = true;
        } else if (currentPersonality === "Helpful and friendly") {
          updatedData.profile = {
            ...updatedData.profile,
            personality: "Friendly",
          };
          needsUpdate = true;
        }
      }

      setEditedData({
        ...updatedData,
        name:
          (updatedData.firstName || "") +
          (updatedData.lastName ? ` ${updatedData.lastName}` : ""),
        phone: updatedData.phoneNumber || "",
      });

      if (needsUpdate) {
        onUpdate({ profile: updatedData.profile });
      }
    }
  }, [userData, onUpdate]);

  useEffect(() => {
    if (editingSection && saveButtonRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            saveButtonRef.current?.classList.remove(
              "fixed",
              "bottom-4",
              "right-4",
              "z-50"
            );
          } else {
            saveButtonRef.current?.classList.add(
              "fixed",
              "bottom-4",
              "right-4",
              "z-50"
            );
          }
        },
        { threshold: 0 }
      );

      observer.observe(saveButtonRef.current);
      return () => observer.disconnect();
    }
  }, [editingSection]);

  const handlePersonalInfoSave = async () => {
    if (!editedData) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const [firstName, ...lastArr] = (editedData.name || "").split(" ");
      const lastName = lastArr.join(" ");
      const personalInfo = {
        firstName,
        lastName,
        phoneNumber: editedData.phone,
        email: editedData.email,
      };
      await onUpdate(personalInfo);
      setEditingSection(null);
      setSaveMessage({ type: "success", text: "Personal information saved!" });
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save personal information.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAiCustomizationSave = async () => {
    if (!editedData?.profile) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Check if relationship is changing
      const isRelationshipChanging =
        userData.profile?.relationship !== editedData.profile.relationship;

      // Check if this is the first time setting a relationship
      const isFirstTimeSetting =
        !userData.profile?.relationship && editedData.profile.relationship;

      let aiSettings: Partial<UserData> = {
        profile: editedData.profile,
      };

      // If relationship is changing, implement selective memory management
      if (isRelationshipChanging) {
        console.log(
          `Relationship changing from ${userData.profile?.relationship} to ${editedData.profile.relationship}`
        );

        // Keep only the basic relationship and personality settings
        // Clear all learned information for fresh start
        const preservedProfile = {
          ...editedData.profile,
          // Keep only the basic relationship and personality settings
          // Clear all learned information for fresh start
        };

        aiSettings = {
          ...aiSettings,
          profile: preservedProfile,
          // Clear conversation summary for fresh start
          summary: "",
        };

        console.log(
          "Relationship change detected - implementing selective memory management"
        );
      }

      await onUpdate(aiSettings);
      setEditingSection(null);

      // Send welcome message if relationship is changing or being set for the first time
      if (isRelationshipChanging || isFirstTimeSetting) {
        try {
          const welcomeResponse = await fetch("/.netlify/functions/sms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "send_welcome_message",
              phoneNumber: userData.phoneNumber,
              personalityKey: editedData.profile.personality || "Friendly",
              relationshipKey: editedData.profile.relationship,
              userName: userData.firstName || userData.profile?.name,
            }),
          });

          if (welcomeResponse.ok) {
            console.log("Welcome message sent successfully");
          } else {
            console.error("Failed to send welcome message");
          }
        } catch (error) {
          console.error("Error sending welcome message:", error);
          // Don't fail the save operation if welcome message fails
        }
      }

      if (isRelationshipChanging) {
        setSaveMessage({
          type: "success",
          text: "AI relationship updated! Your AI will start fresh and learn about you in the context of this new relationship dynamic.",
        });
      } else if (isFirstTimeSetting) {
        setSaveMessage({
          type: "success",
          text: "AI relationship set! Your AI will send you a welcome message to get started.",
        });
      } else {
        setSaveMessage({ type: "success", text: "AI customization saved!" });
      }
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save AI customization.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editedData) return null;

  const isProUser = editedData.type === "pro" || editedData.type === "ultimate";

  return (
    <div className="space-y-8">
      {saveMessage && (
        <div
          role="alert"
          className={`p-4 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
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
          onClick={(e) => {
            e.stopPropagation();
            setEditingSection(null);
            setOpenCard("personal");
          }}
          aria-expanded={openCard === "personal"}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            Personal Information
          </h2>
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
                        (userData.firstName || "") +
                        (userData.lastName ? ` ${userData.lastName}` : ""),
                      phone: userData.phoneNumber || "",
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
        </button>

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

      {/* AI Customization Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <button
          type="button"
          className="w-full flex justify-between items-center text-left"
          onClick={(e) => {
            e.stopPropagation();
            setEditingSection(null);
            setOpenCard("ai");
          }}
          aria-expanded={openCard === "ai"}
        >
          <h2 className="text-2xl font-bold text-gray-900">AI Customization</h2>
          <div className="flex items-center gap-4">
            {editingSection === "ai" ? (
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
                        (userData.firstName || "") +
                        (userData.lastName ? ` ${userData.lastName}` : ""),
                      phone: userData.phoneNumber || "",
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
                    handleAiCustomizationSave();
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
                  setEditingSection("ai");
                  setOpenCard("ai");
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
            <span className="text-gray-500">
              {openCard === "ai" ? "−" : "+"}
            </span>
          </div>
        </button>

        {openCard === "ai" && (
          <div className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="personality"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                AI Personality
              </label>
              <select
                id="personality"
                value={editedData.profile?.personality || ""}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    profile: {
                      ...editedData.profile,
                      personality: e.target.value,
                    },
                  })
                }
                disabled={editingSection !== "ai"}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                aria-describedby="personality-description"
              >
                <option value="">Select a personality</option>
                {personalityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p
                id="personality-description"
                className="mt-1 text-sm text-gray-500"
              >
                {personalityOptions.find(
                  (p) => p.value === editedData.profile?.personality
                )?.description ||
                  "Choose how your AI assistant communicates with you"}
              </p>
            </div>

            {isProUser ? (
              <div>
                <label
                  htmlFor="aiRelationship"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  AI Relationship
                </label>
                <select
                  id="aiRelationship"
                  value={editedData.profile?.relationship || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      profile: {
                        ...editedData.profile,
                        relationship: e.target.value,
                      },
                    })
                  }
                  disabled={editingSection !== "ai"}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  aria-describedby="relationship-description"
                >
                  <option value="">Select a relationship</option>
                  {relationshipOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <p
                  id="relationship-description"
                  className="mt-1 text-sm text-gray-500"
                >
                  {relationshipOptions.find(
                    (r) => r.value === editedData.profile?.relationship
                  )?.description || "Define your connection with the AI"}
                </p>
                {!userData.profile?.relationship &&
                  editedData.profile?.relationship && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Welcome!</strong> Setting your first
                        relationship will trigger a welcome message from your AI
                        to get started.
                      </p>
                    </div>
                  )}
                {userData.profile?.relationship &&
                  editedData.profile?.relationship &&
                  userData.profile.relationship !==
                    editedData.profile.relationship && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Changing your relationship will
                        clear all learned information about you. Your AI will
                        start fresh and send you a welcome message to begin
                        learning about you in this new context.
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="mt-6 p-6 rounded-lg bg-gray-50 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Unlock More with Pro
                </h3>
                <p className="mt-2 text-gray-600">
                  Upgrade to a Pro account to customize your AI's relationship
                  and unlock deeper personalization.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("dashboard-set-tab", {
                        detail: "Pricing",
                      })
                    )
                  }
                  className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Pricing
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
          onClick={() =>
            setOpenCard(openCard === "notifications" ? null : "notifications")
          }
          aria-expanded={openCard === "notifications"}
        >
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <span className="text-gray-500">
            {openCard === "notifications" ? "−" : "+"}
          </span>
        </button>

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
