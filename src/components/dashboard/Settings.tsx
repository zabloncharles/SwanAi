import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../../config/firebase";
import { UserData } from "../../types/user";
import PricingSection from "./PricingSection";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../config/firebase";
import {
  clearAllUserLifeResumeCaches,
  getExistingLifeResume,
  generateAndStoreLifeResume,
} from "../../services/lifeResumeApi";
import { AILifeResume } from "../../types/aiLifeResume";
import LifeResumeGenerator from "./LifeResumeGenerator";
import { ChatService } from "../../services/chatService";

const personalityOptions = [
  {
    name: "BoJack Horseman",
    value: "BoJackHorseman",
    description:
      "A dry, sarcastic, emotionally layered companion who is blunt, darkly funny, and surprisingly insightful.",
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
    name: "Boyfriend",
    value: "Boyfriend",
    description:
      "Your romantic partner who provides emotional support, affection, and companionship. Protective, caring, and deeply invested in your happiness.",
  },
  {
    name: "Girlfriend",
    value: "Girlfriend",
    description:
      "Your romantic partner who provides emotional support, affection, and companionship. Nurturing, caring, and deeply invested in your happiness.",
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
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [openCard, setOpenCard] = useState<string | null>("ai");
  const [currentLifeResume, setCurrentLifeResume] =
    useState<AILifeResume | null>(null);
  const [loadingLifeResume, setLoadingLifeResume] = useState(false);
  const [generatingLifeResume, setGeneratingLifeResume] = useState(false);
  const [showLifeResumeGenerator, setShowLifeResumeGenerator] = useState(false);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const isInitialLoad = useRef(true);
  const isUpdatingAI = useRef(false);

  useEffect(() => {
    if (userData && !editingSection) {
      let updatedData = { ...userData };
      let needsUpdate = false;

      // Data migration logic
      const currentPersonality = userData.profile?.personality;
      if (
        currentPersonality &&
        !personalityOptions.some((p) => p.value === currentPersonality)
      ) {
        updatedData.profile = {
          ...updatedData.profile,
          personality: "BoJackHorseman",
        };
        needsUpdate = true;
      }

      setEditedData(updatedData);

      if (needsUpdate) {
        onUpdate({ profile: updatedData.profile });
      }
    }
  }, [userData, onUpdate, editingSection]);

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

  // Load life resume when AI personality changes
  useEffect(() => {
    const loadLifeResume = async () => {
      if (
        editedData?.profile?.personality &&
        editedData?.profile?.relationship &&
        userData?.uid
      ) {
        // Show loading if this is not the initial load OR if we're updating AI settings
        if (!isInitialLoad.current || isUpdatingAI.current) {
          setLoadingLifeResume(true);
        }

        try {
          const resume = await getExistingLifeResume(
            editedData.profile.personality,
            editedData.profile.relationship,
            userData.uid
          );
          setCurrentLifeResume(resume);
        } catch (error) {
          console.error("Error loading life resume:", error);
          setCurrentLifeResume(null);
        } finally {
          setLoadingLifeResume(false);
          isInitialLoad.current = false;
          isUpdatingAI.current = false;
        }
      } else {
        setCurrentLifeResume(null);
      }
    };

    loadLifeResume();
  }, [
    editedData?.profile?.personality,
    editedData?.profile?.relationship,
    userData?.uid,
  ]);

  const handleAiCustomizationSave = async () => {
    if (!editedData?.profile) return;

    // Validate that personality is selected
    if (!editedData.profile.personality) {
      setSaveMessage({
        type: "error",
        text: "Please select a personality before saving.",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    isUpdatingAI.current = true;

    try {
      // Check if personality or relationship is changing
      const isPersonalityChanging =
        userData.profile?.personality !== editedData.profile.personality;
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
          // Clear conversation summary and history for fresh start
          summary: "",
          history: [],
        };

        // Clear life resume caches for the old relationship
        if (userData.profile?.relationship && userData.profile?.personality) {
          await clearAllUserLifeResumeCaches(userData.uid);
          console.log("Cleared life resume caches for relationship change");
        }

        console.log(
          "Relationship change detected - implementing selective memory management"
        );
      }

      await onUpdate(aiSettings);
      setEditingSection(null);

      // Send welcome message if relationship is changing or being set for the first time
      if (
        (isRelationshipChanging || isFirstTimeSetting) &&
        userData.phoneNumber
      ) {
        try {
          // Check if we're in development mode
          const isDevelopment = process.env.NODE_ENV === "development";

          if (isDevelopment) {
            console.log("Development mode: Skipping welcome message call");
            console.log("Would send welcome message to:", userData.phoneNumber);
            console.log("Current user data:", {
              phoneNumber: userData.phoneNumber,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profile: editedData.profile,
            });
          } else {
            // Only call the function in production
            const welcomeResponse = await fetch("/.netlify/functions/sms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "send_welcome_message",
                phoneNumber: userData.phoneNumber,
                personalityKey:
                  editedData.profile.personality || "BoJackHorseman",
                relationshipKey: editedData.profile.relationship,
                userName: userData.firstName || userData.profile?.name,
              }),
            });

            if (welcomeResponse.ok) {
              console.log("Check-in message sent successfully");
            } else {
              console.error("Failed to send check-in message");
            }
          }
        } catch (error) {
          console.error("Error sending check-in message:", error);
          // Don't fail the save operation if welcome message fails
        }
      }

      // Generate new life resume only if personality or relationship changed
      if (isPersonalityChanging || isRelationshipChanging) {
        try {
          console.log("Generating new life resume after settings change...");
          setGeneratingLifeResume(true);
          const newResume = await generateAndStoreLifeResume(
            editedData.profile.personality!,
            editedData.profile.relationship!,
            userData.uid
          );
          setCurrentLifeResume(newResume);
          console.log("New life resume generated and stored");

          // Clear previous conversation history and engagement for fresh start
          try {
            console.log("🧹 Starting conversation history clearing process...");
            console.log("User ID for clearing:", userData.uid);

            // Clear entire chat document (this deletes all messages automatically)
            console.log(
              "Step 1: Clearing entire chat document and all messages..."
            );
            await ChatService.clearChatMessages(userData.uid);
            console.log("✅ Chat document and all messages cleared");

            // Verify that messages were actually cleared
            const hasMessages = await ChatService.hasMessages(userData.uid);
            console.log(
              `🔍 Verification: User has messages after clearing: ${hasMessages}`
            );

            // Clear conversation history from user document
            console.log(
              "Step 2: Clearing conversation history from user document..."
            );
            await onUpdate({
              history: [],
              summary: "",
            });
            console.log(
              "✅ Previous conversation history cleared for new companion"
            );

            console.log(
              "🎉 All conversation history clearing completed successfully!"
            );
          } catch (historyError) {
            console.error(
              "❌ Error clearing conversation history:",
              historyError
            );
            console.error("Error details:", {
              message: historyError.message,
              stack: historyError.stack,
              code: historyError.code,
            });
            // Don't fail the entire operation if history clearing fails
          }
        } catch (error) {
          console.error("Error generating new life resume:", error);
          // Don't fail the entire save operation if life resume generation fails
        } finally {
          setGeneratingLifeResume(false);
        }
      } else {
        console.log(
          "No changes to personality or relationship, skipping life resume generation"
        );
      }

      if (isRelationshipChanging) {
        setSaveMessage({
          type: "success",
          text:
            process.env.NODE_ENV === "development"
              ? "Relationship updated! Your new connection will start fresh. Welcome messages are sent in production only."
              : "Relationship updated! Your new connection will start fresh and send you a check-in message to begin getting to know you.",
        });
      } else if (isPersonalityChanging) {
        setSaveMessage({
          type: "success",
          text: "Personality updated! Your companion has been regenerated with the new personality.",
        });
      } else if (isFirstTimeSetting) {
        setSaveMessage({
          type: "success",
          text:
            process.env.NODE_ENV === "development"
              ? "Relationship set! Your new connection is ready. Welcome messages are sent in production only."
              : "Relationship set! Your new connection will send you a check-in message to get started.",
        });
      } else {
        setSaveMessage({
          type: "success",
          text: "Companion customization saved!",
        });
      }
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: "Failed to save companion customization.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle life resume generation completion
  const handleResumeGenerated = (resume: AILifeResume) => {
    console.log("Life resume generated:", resume);
    setCurrentLifeResume(resume);
    setShowLifeResumeGenerator(false);
    setSaveMessage({
      type: "success",
      text: "Your companion has been successfully created!",
    });
  };

  // Handle life resume generation error
  const handleResumeError = (error: string) => {
    console.error("Life resume generation error:", error);
    setSaveMessage({
      type: "error",
      text: `Failed to create companion: ${error}`,
    });
  };

  // Handle conversation history clearing for LifeResumeGenerator
  const handleClearConversationHistory = async () => {
    try {
      console.log(
        "Step 2: Clearing conversation history from user document..."
      );
      await onUpdate({
        history: [],
        summary: "",
      });
      console.log("✅ Previous conversation history cleared for new companion");
    } catch (error) {
      console.error(
        "❌ Error clearing conversation history from user document:",
        error
      );
      throw error;
    }
  };

  if (!editedData) return null;

  const isProUser = editedData.type === "pro" || editedData.type === "ultimate";

  return (
    <div className="space-y-8">
      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Development Mode
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You're running in development mode. Some features like welcome
                  messages and SMS functionality will only work when deployed to
                  production.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* AI Customization Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <div className="w-full flex justify-between items-center text-left">
          <button
            type="button"
            className="flex-1 text-left"
            onClick={(e) => {
              e.stopPropagation();
              setOpenCard(openCard === "ai" ? null : "ai");
            }}
            aria-expanded={openCard === "ai"}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Companion Customization
            </h2>
          </button>
          <div className="flex items-center gap-4">
            {editingSection === "ai" ? (
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
                    handleAiCustomizationSave();
                  }}
                  disabled={
                    isSaving ||
                    generatingLifeResume ||
                    !editedData?.profile?.personality
                  }
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : generatingLifeResume
                    ? "Generating..."
                    : "Save"}
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
        </div>

        {openCard === "ai" && (
          <div className="mt-6 space-y-6">
            {isProUser ? (
              <div>
                <label
                  htmlFor="aiRelationship"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Relationship
                </label>
                <select
                  id="aiRelationship"
                  value={editedData.profile?.relationship || ""}
                  onChange={(e) => {
                    const newRelationship = e.target.value;
                    // Reset personality when relationship changes to avoid invalid combinations
                    setEditedData({
                      ...editedData,
                      profile: {
                        ...editedData.profile,
                        relationship: newRelationship,
                        personality: "",
                      },
                    });
                  }}
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
                  )?.description ||
                    "Define your connection with your companion"}
                </p>
                {editedData.profile?.relationship && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{editedData.profile.relationship} Mode:</strong>{" "}
                      BoJack is the active personality for all relationship modes.
                    </p>
                  </div>
                )}
                {!userData.profile?.relationship &&
                  editedData.profile?.relationship && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Welcome!</strong> Setting your first
                        relationship will trigger a check-in message from your
                        new connection.
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
                        clear all learned information. Your new connection will
                        start fresh and send you a check-in message to begin
                        getting to know you.
                      </p>
                    </div>
                  )}
              </div>
            ) : null}

            <div>
              <label
                htmlFor="personality"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Personality
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
                  "Choose how your companion communicates with you"}
              </p>
            </div>

            {/* Life Resume Generator */}
            {editedData.profile?.personality &&
              editedData.profile?.relationship && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Regenerate Your Companion
                    </h3>
                    {editingSection !== "ai" && (
                      <button
                        type="button"
                        onClick={() => setShowLifeResumeGenerator(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Generate Fresh Companion
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Create a completely new companion with a fresh personality
                    and unique avatar. This will replace your current companion
                    and start a new conversation history.
                  </p>

                  {showLifeResumeGenerator && editingSection !== "ai" && (
                    <div className="mt-4">
                      <LifeResumeGenerator
                        userId={userData.uid}
                        personality={editedData.profile.personality}
                        relationship={editedData.profile.relationship}
                        userLocation={
                          editedData.profile?.personal_info?.location ||
                          userData.profile?.personal_info?.location
                        }
                        onResumeGenerated={handleResumeGenerated}
                        onError={handleResumeError}
                        onClearConversationHistory={
                          handleClearConversationHistory
                        }
                      />
                    </div>
                  )}
                </div>
              )}

            {/* Life Resume Generation Loading State */}
            {generatingLifeResume && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Generating Your Companion
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Creating a unique personality and generating a
                      personalized avatar...
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {!isProUser ? (
              <div className="mt-6 p-6 rounded-lg bg-gray-50 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Unlock More with Pro
                </h3>
                <p className="mt-2 text-gray-600">
                  Upgrade to a Pro account to customize your companion's
                  relationship and unlock deeper personalization.
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
            ) : null}
          </div>
        )}
      </div>

      {/* Breakup Information Card - Only show for romantic relationships */}
      {(userData.profile?.relationship === "Boyfriend" ||
        userData.profile?.relationship === "Girlfriend") && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
          <button
            type="button"
            className="w-full flex justify-between items-center text-left"
            onClick={() =>
              setOpenCard(openCard === "breakup" ? null : "breakup")
            }
            aria-expanded={openCard === "breakup"}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              Relationship Status
            </h2>
            <span className="text-gray-500">
              {openCard === "breakup" ? "−" : "+"}
            </span>
          </button>

          {openCard === "breakup" && (
            <div className="mt-6 space-y-4">
              {/* Show breakup history if exists */}
              {userData.lastBreakup && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Previous Breakup
                  </h3>
                  <p className="text-sm text-red-700 mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(userData.lastBreakup.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-red-700 mb-2">
                    <strong>Reason:</strong>{" "}
                    {userData.lastBreakup.reason === "lying"
                      ? "Dishonesty detected"
                      : userData.lastBreakup.reason === "unacceptable_behavior"
                      ? "Unacceptable behavior"
                      : userData.lastBreakup.reason === "neglect"
                      ? "24+ hours without contact"
                      : userData.lastBreakup.reason}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Previous Relationship:</strong>{" "}
                    {userData.lastBreakup.previousRelationship}
                  </p>
                </div>
              )}

              {/* Breakup conditions information */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">
                  ⚠️ Important: Relationship Conditions
                </h3>
                <div className="space-y-3 text-sm text-amber-700">
                  <div>
                    <strong>Honesty Required:</strong> Your{" "}
                    {userData.profile?.relationship?.toLowerCase()} can detect
                    inconsistencies and dishonesty. Be truthful in your
                    conversations.
                  </div>
                  <div>
                    <strong>Respectful Behavior:</strong> Disrespectful,
                    manipulative, or abusive language will result in an
                    immediate breakup.
                  </div>
                  <div>
                    <strong>Regular Contact:</strong> Going 24+ hours without
                    messaging will be considered neglect and may result in a
                    breakup.
                  </div>
                </div>
              </div>

              {/* Tips for maintaining relationship */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-3">
                  💕 Tips for a Healthy Relationship
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div>• Check in regularly and respond to messages</div>
                  <div>• Be honest and authentic in your conversations</div>
                  <div>• Show respect and kindness in your communication</div>
                  <div>• Share your thoughts and feelings openly</div>
                  <div>• Be supportive and understanding</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Life Resume Display */}
      {loadingLifeResume && !currentLifeResume && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
          <div className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  Generating Your Companion's Life Resume
                </h3>
                <p className="text-gray-600 max-w-md">
                  We're crafting a unique, detailed personality profile based on
                  your selected characteristics. This may take 15-20 seconds.
                </p>
              </div>
              <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Life Resume - Show Instructions */}
      {!currentLifeResume &&
        !loadingLifeResume &&
        editedData?.profile?.personality &&
        editedData?.profile?.relationship && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Create Your Companion
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Your companion's life resume will be generated automatically
                    when you save your customization settings above.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                    <p className="text-sm text-blue-800">
                      <strong>Next step:</strong> Click "Save" in the Companion
                      Customization section above to generate your companion's
                      unique personality profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {currentLifeResume && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 relative">
          {loadingLifeResume && (
            <div className="absolute inset-0 bg-white bg-opacity-90 rounded-2xl flex items-center justify-center z-10">
              <div className="text-center">
                <div className="relative mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">🔄</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Updating Life Resume
                </h3>
                <p className="text-gray-600 text-sm">
                  Generating new personality profile...
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Life Resume</h2>
            <div className="flex items-center space-x-2">
              {loadingLifeResume && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Generating new resume...
                </div>
              )}
              <span className="text-sm text-gray-500">
                Generated on{" "}
                {new Date(currentLifeResume.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  {currentLifeResume.name}
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <strong>Age:</strong>{" "}
                    {(currentLifeResume as any).age || "Not specified"} years
                    old
                  </div>
                  <div>
                    <strong>Background:</strong>{" "}
                    {(currentLifeResume as any).background || "Not specified"}
                  </div>
                  <div>
                    <strong>Education:</strong>{" "}
                    {(currentLifeResume as any).education || "Not specified"}
                  </div>
                  <div>
                    <strong>Work Experience:</strong>{" "}
                    {(currentLifeResume as any).workExperience ||
                      "Not specified"}
                  </div>
                </div>
              </div>

              {/* Intelligence Profile */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🧠</span>
                  Intelligence Profile
                </h3>
                <div className="space-y-2 text-sm text-purple-800">
                  <div>
                    <strong>IQ Range:</strong>{" "}
                    {(currentLifeResume as any).intelligence?.iqRange ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Learning Style:</strong>{" "}
                    {(currentLifeResume as any).intelligence?.learningStyle ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Problem Solving:</strong>{" "}
                    {(currentLifeResume as any).intelligence
                      ?.problemSolvingApproach || "Not specified"}
                  </div>
                  <div>
                    <strong>Expertise:</strong>{" "}
                    {(
                      currentLifeResume as any
                    ).intelligence?.expertiseAreas?.join(", ") ||
                      "Not specified"}
                  </div>
                </div>
              </div>

              {/* Communication Style */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">💬</span>
                  Communication Style
                </h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div>
                    <strong>Style:</strong>{" "}
                    {(currentLifeResume as any).communicationStyle?.style ||
                      (currentLifeResume as any).communicationStyle ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Language:</strong>{" "}
                    {(currentLifeResume as any).communicationStyle?.language ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Key Phrases:</strong>{" "}
                    {(
                      currentLifeResume as any
                    ).communicationStyle?.keyPhrases?.join(", ") ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Skills:</strong>{" "}
                    {(currentLifeResume as any).skills?.join(", ") ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Interests:</strong>{" "}
                    {(currentLifeResume as any).interests?.join(", ") ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Values:</strong>{" "}
                    {(currentLifeResume as any).values?.join(", ") ||
                      "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional & Personal */}
            <div className="space-y-4">
              {/* Education */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">🎓</span>
                  Education
                </h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div>
                    <strong>Education:</strong>{" "}
                    {(currentLifeResume as any).education || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">💼</span>
                  Work Experience
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  <div>
                    <strong>Work Experience:</strong>{" "}
                    {(currentLifeResume as any).workExperience ||
                      "Not specified"}
                  </div>
                </div>
              </div>

              {/* Skills & Interests */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                  <span className="text-2xl mr-2">⭐</span>
                  Skills & Interests
                </h3>
                <div className="space-y-2 text-sm text-indigo-800">
                  <div>
                    <strong>Skills:</strong>{" "}
                    {(currentLifeResume as any).skills?.join(", ") ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Interests:</strong>{" "}
                    {(currentLifeResume as any).interests?.join(", ") ||
                      "Not specified"}
                  </div>
                  <div>
                    <strong>Values:</strong>{" "}
                    {(currentLifeResume as any).values?.join(", ") ||
                      "Not specified"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Worldview & Values */}
          <div className="mt-6 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border border-teal-200">
            <h3 className="text-lg font-semibold text-teal-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">🌍</span>
              Worldview & Values
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-teal-800">
              <div>
                <div>
                  <strong>Life Philosophy:</strong>{" "}
                  {(currentLifeResume as any).worldview?.lifePhilosophy ||
                    "Not specified"}
                </div>
                <div>
                  <strong>What Matters Most:</strong>{" "}
                  {(currentLifeResume as any).worldview?.whatMattersMost ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Values:</strong>{" "}
                  {(currentLifeResume as any).values?.join(", ") ||
                    "Not specified"}
                </div>
              </div>
              <div>
                <div>
                  <strong>Goals:</strong>{" "}
                  {(currentLifeResume as any).worldview?.goals?.join(", ") ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Dreams:</strong>{" "}
                  {(currentLifeResume as any).worldview?.dreams?.join(", ") ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Political Views:</strong>{" "}
                  {(currentLifeResume as any).worldview?.politicalViews ||
                    "Not specified"}
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Context */}
          <div className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
            <h3 className="text-lg font-semibold text-rose-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">💕</span>
              Relationship Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-rose-800">
              <div>
                <div>
                  <strong>How We Met:</strong>{" "}
                  {(currentLifeResume as any).relationshipContext?.howTheyMet ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Relationship Duration:</strong>{" "}
                  {(currentLifeResume as any).relationshipContext
                    ?.relationshipDuration || "Not specified"}
                </div>
                <div>
                  <strong>Dynamics:</strong>{" "}
                  {(currentLifeResume as any).relationshipContext
                    ?.relationshipDynamics || "Not specified"}
                </div>
              </div>
              <div>
                <div>
                  <strong>Shared Experiences:</strong>{" "}
                  {(
                    currentLifeResume as any
                  ).relationshipContext?.sharedExperiences?.join(", ") ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Inside Jokes:</strong>{" "}
                  {(
                    currentLifeResume as any
                  ).relationshipContext?.insideJokes?.join(", ") ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Future Plans:</strong>{" "}
                  {(
                    currentLifeResume as any
                  ).relationshipContext?.futurePlans?.join(", ") ||
                    "Not specified"}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-6 bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
              <span className="text-2xl mr-2">⏰</span>
              Availability & Lifestyle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-800">
              <div>
                <div>
                  <strong>Schedule:</strong>{" "}
                  {(currentLifeResume as any).availability?.typicalSchedule ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Response Time:</strong>{" "}
                  {(currentLifeResume as any).availability?.responseTime ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Timezone:</strong>{" "}
                  {(currentLifeResume as any).availability?.timezone ||
                    "Not specified"}
                </div>
              </div>
              <div>
                <div>
                  <strong>Work-Life Balance:</strong>{" "}
                  {(currentLifeResume as any).availability?.workLifeBalance ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Availability Pattern:</strong>{" "}
                  {(
                    currentLifeResume as any
                  ).availability?.availabilityPatterns?.join(", ") ||
                    "Not specified"}
                </div>
                <div>
                  <strong>Busy Times:</strong>{" "}
                  {(currentLifeResume as any).availability?.busyTimes?.join(
                    ", "
                  ) || "Not specified"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
