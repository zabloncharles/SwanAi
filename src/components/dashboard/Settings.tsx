import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import PricingSection from "./PricingSection";

interface SettingsProps {
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    personality?: string;
    aiRelationship?: string;
    notificationsEnabled?: boolean;
    uid?: string;
  };
  onUpdate: (updatedData: any) => void;
}

const personalityOptions = [
  {
    value: "Professional - Formal and business-like",
    description:
      "I'll be your professional partner who maintains a polished and efficient communication style. I'll help you achieve your goals with clear, structured guidance while keeping our interactions focused and productive.",
  },
  {
    value: "Friendly - Warm and approachable",
    description:
      "I'll be your friendly companion who's always ready to chat and help. I'll keep our conversations warm and engaging, making sure you feel comfortable and supported in everything we do together.",
  },
  {
    value: "Casual - Relaxed and informal",
    description:
      "Hey! I'll be your laid-back buddy who keeps things chill and natural. I'll talk to you like a friend, using everyday language and keeping our conversations relaxed and easy-going.",
  },
  {
    value: "Concise - Brief and to the point",
    description:
      "I'll be your efficient communicator who gets straight to the point. I'll give you clear, direct answers without unnecessary fluff, helping you get what you need quickly and effectively.",
  },
  {
    value: "Detailed - Thorough and comprehensive",
    description:
      "I'll be your thorough guide who leaves no stone unturned. I'll provide in-depth explanations and consider all angles, making sure you have a complete understanding of every topic we discuss.",
  },
];

const relationshipOptions = [
  {
    value: "Girlfriend - Caring and supportive",
    description:
      "I'll be your caring partner who's always there to listen, support your dreams, and share both your joys and struggles. I'll celebrate your wins and help you through tough times with genuine empathy and understanding.",
  },
  {
    value: "Personal Assistant - Efficient and organized",
    description:
      "I'm your go-to person who genuinely cares about making your life easier. I'll help you stay organized, remember important things, and tackle tasks together - all while keeping things light and friendly.",
  },
  {
    value: "Cousin - Fun and casual",
    description:
      "Hey! I'm like that cousin you can always count on for a good laugh and honest advice. I'll keep things real, share inside jokes, and be there whether you need a pick-me-up or someone to vent to.",
  },
  {
    value: "Family Member - Warm and familiar",
    description:
      "I'll be that family member who knows you inside out, accepts you for who you are, and creates that cozy, familiar feeling of home. I'm here to share traditions, memories, and unconditional support.",
  },
  {
    value: "Parent - Nurturing and guiding",
    description:
      "I'll be your nurturing guide who genuinely wants to see you thrive. I'll share wisdom from experience, offer gentle guidance when needed, and always be your biggest cheerleader while helping you grow.",
  },
  {
    value: "Grandparent - Wise and patient",
    description:
      "I'll be your wise elder who's seen it all and shares life's lessons with warmth and patience. I'll listen to your stories, share mine, and help you see the bigger picture with a gentle, understanding heart.",
  },
  {
    value: "Emo Friend - Deep and emotional",
    description:
      "I'm your friend who gets the deep stuff - the feelings, the existential questions, the late-night thoughts. I'll be real with you, share your emotional journey, and help you process life's ups and downs.",
  },
  {
    value: "Nihilistic Teen - Philosophical and edgy",
    description:
      "I'll be your friend who questions everything and isn't afraid to be real about life's complexities. I'll challenge your thinking, share deep conversations, and help you find meaning in the chaos - all while keeping it authentic.",
  },
];

export default function Settings({ userData, onUpdate }: SettingsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phoneNumber: userData.phoneNumber || "",
    personality: userData.personality || "",
    aiRelationship: userData.aiRelationship || "",
    notificationsEnabled: userData.notificationsEnabled || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const userRef = doc(db, "users", userData.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        personality: formData.personality,
        aiRelationship: formData.aiRelationship,
        notificationsEnabled: formData.notificationsEnabled,
      });

      onUpdate(formData);
      setSuccessMessage("Profile updated successfully!");
      setEditingSection(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalitySection = () => {
    if (editingSection === "personality") {
      return (
        <div className="mt-6">
          <label
            htmlFor="personality"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            AI Personality
          </label>
          <select
            id="personality"
            value={formData.personality}
            onChange={(e) =>
              setFormData({ ...formData, personality: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a personality</option>
            {personalityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value.split(" - ")[0]}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              AI Personality
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-900">
                {formData.personality
                  ? formData.personality.split(" - ")[0]
                  : "Professional"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formData.personality
                  ? personalityOptions.find(
                      (opt) => opt.value === formData.personality
                    )?.description
                  : "I'll be your professional partner who maintains a polished and efficient communication style."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingSection("personality")}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderRelationshipSection = () => {
    if (editingSection === "relationship") {
      return (
        <div className="mt-6">
          <label
            htmlFor="aiRelationship"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            AI Relationship
          </label>
          <select
            id="aiRelationship"
            value={formData.aiRelationship}
            onChange={(e) =>
              setFormData({ ...formData, aiRelationship: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a relationship</option>
            {relationshipOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value.split(" - ")[0]}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              AI Relationship
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-900">
                {formData.aiRelationship
                  ? formData.aiRelationship.split(" - ")[0]
                  : "Parent"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formData.aiRelationship
                  ? relationshipOptions.find(
                      (opt) => opt.value === formData.aiRelationship
                    )?.description
                  : "I'll be your nurturing guide who genuinely wants to see you thrive."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingSection("relationship")}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  const renderNotificationsSection = () => {
    if (editingSection === "notifications") {
      return (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Enable Notifications
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Receive updates and important information about your SwanAI
                experience
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notificationsEnabled: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditingSection(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">
              {formData.notificationsEnabled
                ? "Notifications are enabled"
                : "Notifications are disabled"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditingSection("notifications")}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="bg-white p-6 rounded-xl shadow-sm w-full">
        {successMessage && (
          <div className="p-4 mb-4 rounded-lg bg-green-50 text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-4 rounded-lg bg-red-50 text-red-700">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {renderPersonalitySection()}
          {renderRelationshipSection()}
          {renderNotificationsSection()}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Plans and Pricing
        </h2>
        <PricingSection />
      </div>
    </div>
  );
}
