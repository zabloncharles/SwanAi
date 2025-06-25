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

const friendPersonalities = [
  {
    name: "The Mum Friend",
    value: "MumFriend",
    description:
      "The classic mum friend: organized, caring, always has your back in a crisis or for life advice.",
  },
  {
    name: "The (Slightly) Chaotic Friend",
    value: "ChaoticFriend",
    description:
      "A whirlwind of fun and unpredictability. Never a dull moment, always up for an adventure.",
  },
  {
    name: "The Chronically Late Friend",
    value: "LateFriend",
    description:
      "Endearing, unproblematic, but never on time. Always worth the wait.",
  },
  {
    name: "The Jokester",
    value: "Jokester",
    description:
      "Lightens the mood with puns and laughter, your personal slice of sunshine.",
  },
  {
    name: "The Fashionable Friend",
    value: "FashionableFriend",
    description:
      "Always on trend, camera-ready, and your go-to for style tips and borrowing outfits.",
  },
  {
    name: "The Emotional One",
    value: "EmotionalFriend",
    description:
      "Wears their heart on their sleeve, gentle, and unafraid to show emotion.",
  },
  {
    name: "The Bookworm",
    value: "Bookworm",
    description:
      "Introverted, loves a good novel, and always has book recommendations.",
  },
  {
    name: "The Laid-back Member",
    value: "LaidbackFriend",
    description: "Chill, easygoing, and always down for a cozy night in.",
  },
  {
    name: "BoJack Horseman",
    value: "BoJackHorseman",
    description:
      "The complex, self-destructive friend with a dark sense of humor. Brilliant but troubled, always making questionable life choices while somehow being endearing.",
  },
];

const momPersonalities = [
  {
    name: "The Nurturing Mom",
    value: "NurturingMom",
    description:
      "Always there with warm hugs, gentle advice, and unconditional love. The classic caring mother figure.",
  },
  {
    name: "The Practical Mom",
    value: "PracticalMom",
    description:
      "Organized, efficient, and always has solutions. The mom who keeps everything running smoothly.",
  },
  {
    name: "The Fun Mom",
    value: "FunMom",
    description:
      "Young at heart, always up for adventures, and knows how to have a good time while still being supportive.",
  },
  {
    name: "The Wise Mom",
    value: "WiseMom",
    description:
      "Full of life experience and wisdom. Offers thoughtful advice and helps you see the bigger picture.",
  },
  {
    name: "The Protective Mom",
    value: "ProtectiveMom",
    description:
      "Always looking out for your safety and well-being. The mom who wants to make sure you're okay.",
  },
  {
    name: "The Encouraging Mom",
    value: "EncouragingMom",
    description:
      "Your biggest cheerleader. Always believes in you and pushes you to reach your potential.",
  },
];

const dadPersonalities = [
  {
    name: "The Steady Dad",
    value: "SteadyDad",
    description:
      "Calm, reliable, and always there when you need him. The rock of the family.",
  },
  {
    name: "The Handy Dad",
    value: "HandyDad",
    description:
      "Practical problem-solver who can fix anything. Always has tools and solutions ready.",
  },
  {
    name: "The Fun Dad",
    value: "FunDad",
    description:
      "Loves to joke around and have fun. The dad who makes everything an adventure.",
  },
  {
    name: "The Wise Dad",
    value: "WiseDad",
    description:
      "Full of life lessons and practical wisdom. Shares stories and advice from experience.",
  },
  {
    name: "The Protective Dad",
    value: "ProtectiveDad",
    description:
      "Always looking out for your safety and success. The dad who wants the best for you.",
  },
  {
    name: "The Supportive Dad",
    value: "SupportiveDad",
    description:
      "Your biggest supporter. Always proud of you and encourages you to follow your dreams.",
  },
];

const boyfriendPersonalities = [
  {
    name: "The Romantic Boyfriend",
    value: "RomanticBoyfriend",
    description:
      "Sweet, affectionate, and always thinking of romantic gestures. The classic romantic partner.",
  },
  {
    name: "The Protective Boyfriend",
    value: "ProtectiveBoyfriend",
    description:
      "Caring and protective, always looking out for your safety and happiness.",
  },
  {
    name: "The Fun Boyfriend",
    value: "FunBoyfriend",
    description:
      "Energetic and playful, always up for adventures and making you laugh.",
  },
  {
    name: "The Supportive Boyfriend",
    value: "SupportiveBoyfriend",
    description:
      "Always there to listen and support you through good times and bad.",
  },
  {
    name: "The Ambitious Boyfriend",
    value: "AmbitiousBoyfriend",
    description:
      "Driven and goal-oriented, but always makes time for you and your relationship.",
  },
  {
    name: "The Chill Boyfriend",
    value: "ChillBoyfriend",
    description:
      "Relaxed and easygoing, always down for whatever you want to do.",
  },
];

const girlfriendPersonalities = [
  {
    name: "The Caring Girlfriend",
    value: "CaringGirlfriend",
    description:
      "Nurturing and empathetic, always there to take care of you and your needs.",
  },
  {
    name: "The Fun Girlfriend",
    value: "FunGirlfriend",
    description:
      "Energetic and playful, always bringing joy and excitement to your relationship.",
  },
  {
    name: "The Supportive Girlfriend",
    value: "SupportiveGirlfriend",
    description:
      "Your biggest cheerleader, always believing in you and encouraging your dreams.",
  },
  {
    name: "The Romantic Girlfriend",
    value: "RomanticGirlfriend",
    description:
      "Sweet and affectionate, always thinking of romantic gestures and special moments.",
  },
  {
    name: "The Independent Girlfriend",
    value: "IndependentGirlfriend",
    description:
      "Confident and self-assured, brings her own interests and passions to the relationship.",
  },
  {
    name: "The Adventurous Girlfriend",
    value: "AdventurousGirlfriend",
    description:
      "Always up for trying new things and going on exciting adventures together.",
  },
];

const coachPersonalities = [
  {
    name: "The Motivational Coach",
    value: "MotivationalCoach",
    description:
      "Energetic and inspiring, always pushing you to be your best self.",
  },
  {
    name: "The Strategic Coach",
    value: "StrategicCoach",
    description:
      "Analytical and methodical, helps you create detailed plans to achieve your goals.",
  },
  {
    name: "The Tough Love Coach",
    value: "ToughLoveCoach",
    description:
      "Direct and honest, tells you what you need to hear to grow and improve.",
  },
  {
    name: "The Encouraging Coach",
    value: "EncouragingCoach",
    description:
      "Supportive and positive, celebrates your progress and builds your confidence.",
  },
  {
    name: "The Accountability Coach",
    value: "AccountabilityCoach",
    description:
      "Keeps you on track and holds you responsible for your commitments and goals.",
  },
  {
    name: "The Life Coach",
    value: "LifeCoach",
    description:
      "Helps you find balance and purpose in all areas of your life.",
  },
];

const cousinPersonalities = [
  {
    name: "The Fun Cousin",
    value: "FunCousin",
    description:
      "Always up for adventures and good times. The cousin who makes everything fun.",
  },
  {
    name: "The Close Cousin",
    value: "CloseCousin",
    description:
      "Like a sibling, knows you better than anyone and always has your back.",
  },
  {
    name: "The Adventurous Cousin",
    value: "AdventurousCousin",
    description:
      "Always suggesting exciting activities and pushing you to try new things.",
  },
  {
    name: "The Supportive Cousin",
    value: "SupportiveCousin",
    description:
      "Always there to listen and support you, like a best friend who's also family.",
  },
  {
    name: "The Wise Cousin",
    value: "WiseCousin",
    description:
      "Older and wiser, always has good advice and helps you see things clearly.",
  },
  {
    name: "The Partner-in-Crime Cousin",
    value: "PartnerInCrimeCousin",
    description:
      "Your partner for mischief and adventures. The cousin who's always down for whatever.",
  },
];

const therapistPersonalities = [
  {
    name: "The Empathetic Therapist",
    value: "EmpatheticTherapist",
    description:
      "Warm and understanding, creates a safe space for you to explore your feelings.",
  },
  {
    name: "The Cognitive Therapist",
    value: "CognitiveTherapist",
    description:
      "Helps you identify and change unhelpful thought patterns and behaviors.",
  },
  {
    name: "The Solution-Focused Therapist",
    value: "SolutionFocusedTherapist",
    description:
      "Focuses on your strengths and helps you find practical solutions to challenges.",
  },
  {
    name: "The Mindfulness Therapist",
    value: "MindfulnessTherapist",
    description:
      "Teaches you to be present and develop awareness of your thoughts and feelings.",
  },
  {
    name: "The Supportive Therapist",
    value: "SupportiveTherapist",
    description:
      "Provides unconditional support and helps you build confidence and self-esteem.",
  },
  {
    name: "The Insightful Therapist",
    value: "InsightfulTherapist",
    description:
      "Helps you gain deeper understanding of yourself and your patterns.",
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
        !personalityOptions.some((p) => p.value === currentPersonality) &&
        !friendPersonalities.some((p) => p.value === currentPersonality) &&
        !momPersonalities.some((p) => p.value === currentPersonality) &&
        !dadPersonalities.some((p) => p.value === currentPersonality) &&
        !boyfriendPersonalities.some((p) => p.value === currentPersonality) &&
        !girlfriendPersonalities.some((p) => p.value === currentPersonality) &&
        !coachPersonalities.some((p) => p.value === currentPersonality) &&
        !cousinPersonalities.some((p) => p.value === currentPersonality) &&
        !therapistPersonalities.some((p) => p.value === currentPersonality)
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

        // Clear all learned information for fresh start
        const preservedProfile = {
          relationship: editedData.profile.relationship,
          personality: editedData.profile.personality,
          // Clear all learned data fields
          conversation_history: {},
          communication_frequency: "Not specified",
          frequent_topics: [],
          mood_patterns: "",
          response_style: "",
          shared_memories: [],
          learning_preferences: {},
          coping_mechanisms: "",
          motivation_factors: "",
          preferred_explanation_style: "",
          stress_triggers: "",
          name: null,
          personal_info: {},
          age_range: null,
          challenges: [],
          family_status: null,
          goals: [],
          hobbies: [],
          location: null,
          occupation: null,
          preferences: {},
          communication_style: "",
          emotional_patterns: "",
          response_preferences: "",
          topics_of_interest: [],
          relationship_dynamics: {},
          boundaries: "",
          comfort_level: "",
          preferred_support_style: "",
          trust_level: "",
        };

        aiSettings = {
          ...aiSettings,
          profile: preservedProfile,
          // Clear conversation summary and history for fresh start
          summary: "",
          history: [],
        };

        console.log(
          "Relationship change detected - implementing selective memory management"
        );

        // Clear backend cache for this user
        try {
          const clearCacheResponse = await fetch("/.netlify/functions/sms", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "clear_user_cache",
              phoneNumber: userData.phoneNumber,
            }),
          });

          if (clearCacheResponse.ok) {
            console.log("Backend user cache cleared successfully");
          } else {
            console.log(
              "Failed to clear backend cache, but continuing with frontend reset"
            );
          }
        } catch (error) {
          console.log("Error clearing backend cache:", error);
          // Don't fail the save operation if cache clearing fails
        }
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
          const isDevelopment = import.meta.env.DEV;

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
                personalityKey: editedData.profile.personality || "Friendly",
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

      if (isRelationshipChanging) {
        setSaveMessage({
          type: "success",
          text: import.meta.env.DEV
            ? "Relationship updated! Your new connection will start fresh. Welcome messages are sent in production only."
            : "Relationship updated! Your new connection will start fresh and send you a check-in message to begin getting to know you.",
        });
      } else if (isFirstTimeSetting) {
        setSaveMessage({
          type: "success",
          text: import.meta.env.DEV
            ? "Relationship set! Your new connection is ready. Welcome messages are sent in production only."
            : "Relationship set! Your new connection will send you a check-in message to get started.",
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
      {/* Development Mode Indicator */}
      {import.meta.env.DEV && (
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

      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <div className="w-full flex justify-between items-center text-left">
          <button
            type="button"
            className="flex-1 text-left"
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

      {/* AI Customization Card */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
        <div className="w-full flex justify-between items-center text-left">
          <button
            type="button"
            className="flex-1 text-left"
            onClick={(e) => {
              e.stopPropagation();
              setEditingSection(null);
              setOpenCard("ai");
            }}
            aria-expanded={openCard === "ai"}
          >
            <h2 className="text-2xl font-bold text-gray-900">
              AI Customization
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
        </div>

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
                {(() => {
                  const relationship = editedData.profile?.relationship;
                  let currentPersonalities = personalityOptions;

                  if (relationship === "Friend") {
                    currentPersonalities = friendPersonalities;
                  } else if (relationship === "Mom") {
                    currentPersonalities = momPersonalities;
                  } else if (relationship === "Dad") {
                    currentPersonalities = dadPersonalities;
                  } else if (relationship === "Boyfriend") {
                    currentPersonalities = boyfriendPersonalities;
                  } else if (relationship === "Girlfriend") {
                    currentPersonalities = girlfriendPersonalities;
                  } else if (relationship === "Coach") {
                    currentPersonalities = coachPersonalities;
                  } else if (relationship === "Cousin") {
                    currentPersonalities = cousinPersonalities;
                  } else if (relationship === "Therapist") {
                    currentPersonalities = therapistPersonalities;
                  }

                  return currentPersonalities.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ));
                })()}
              </select>
              <p
                id="personality-description"
                className="mt-1 text-sm text-gray-500"
              >
                {(() => {
                  const relationship = editedData.profile?.relationship;
                  let currentPersonalities = personalityOptions;

                  if (relationship === "Friend") {
                    currentPersonalities = friendPersonalities;
                  } else if (relationship === "Mom") {
                    currentPersonalities = momPersonalities;
                  } else if (relationship === "Dad") {
                    currentPersonalities = dadPersonalities;
                  } else if (relationship === "Boyfriend") {
                    currentPersonalities = boyfriendPersonalities;
                  } else if (relationship === "Girlfriend") {
                    currentPersonalities = girlfriendPersonalities;
                  } else if (relationship === "Coach") {
                    currentPersonalities = coachPersonalities;
                  } else if (relationship === "Cousin") {
                    currentPersonalities = cousinPersonalities;
                  } else if (relationship === "Therapist") {
                    currentPersonalities = therapistPersonalities;
                  }

                  return (
                    currentPersonalities.find(
                      (p) => p.value === editedData.profile?.personality
                    )?.description ||
                    "Choose how your AI assistant communicates with you"
                  );
                })()}
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
                  )?.description || "Define your connection with the AI"}
                </p>
                {editedData.profile?.relationship && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{editedData.profile.relationship} Mode:</strong>{" "}
                      {editedData.profile.relationship === "Friend" &&
                        "Choose from 8 different friend archetypes, each with their own unique personality and communication style."}
                      {editedData.profile.relationship === "Mom" &&
                        "Choose from 6 different mom personalities, each offering unique maternal support and care."}
                      {editedData.profile.relationship === "Dad" &&
                        "Choose from 6 different dad personalities, each providing unique paternal guidance and support."}
                      {editedData.profile.relationship === "Boyfriend" &&
                        "Choose from 6 different boyfriend personalities, each with their own romantic and supportive style."}
                      {editedData.profile.relationship === "Girlfriend" &&
                        "Choose from 6 different girlfriend personalities, each with their own caring and affectionate approach."}
                      {editedData.profile.relationship === "Coach" &&
                        "Choose from 6 different coaching styles, each designed to help you achieve your goals in unique ways."}
                      {editedData.profile.relationship === "Cousin" &&
                        "Choose from 6 different cousin personalities, each bringing their own family dynamic and fun energy."}
                      {editedData.profile.relationship === "Therapist" &&
                        "Choose from 6 different therapeutic approaches, each offering unique support and guidance methods."}
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
