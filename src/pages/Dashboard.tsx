import React from "react";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import {
  ChartBarIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  CubeIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  InboxIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Line, Bar } from "react-chartjs-2";
import DashboardAdmin from "./DashboardAdmin";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PhoneRequiredModal from "../components/PhoneRequiredModal";
import SlimFooter from "../components/SlimFooter";

const mainNav = [
  { label: "Overview", icon: HomeIcon },
  { label: "Messages", icon: InboxIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];
const salesChannels = [{ label: "Vonage", icon: GlobeAltIcon }];

const activities = [
  {
    type: "inventory",
    label: "Inventory Updated",
    desc: `Women's Summer Dress - Blue\nStock: +150 units added`,
    time: "11:30 AM",
  },
  {
    type: "price",
    label: "Price Change",
    desc: "Seasonal discount applied\n$89.99 → $69.99 (-22%)",
    time: "11:30 AM",
  },
  {
    type: "product",
    label: "New Product Added",
    desc: `Women's Summer Dress - Red\nListed in Women\'s Fashion`,
    time: "11:30 AM",
  },
  {
    type: "images",
    label: "Product Images Updated",
    desc: `Women's Summer Dress - Blue\n5 new images added`,
    time: "11:30 AM",
  },
  {
    type: "desc",
    label: "Description Updated",
    desc: `Women's Summer Dress - Blue\nAdded size guide and materials`,
    time: "11:30 AM",
  },
];

const statUp = "text-green-600";
const statDown = "text-red-500";

interface Message {
  role: string;
  content: string;
}

interface NotificationMessage {
  type: "success" | "error";
  text: string;
}

interface UserData {
  phoneNumber: string;
  personality: string;
  aiRelationship?: string;
  tokensUsed: number;
  responseTime?: number;
  notifications?: boolean;
  isAdmin?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  summary?: string;
  history?: Message[];
}

const personalityDefinitions = {
  professional: {
    label: "Professional",
    description: "Formal and business-like",
    fullDefinition: {
      tone: "formal and professional",
      communication: "clear, concise, and structured",
      vocabulary: "business-appropriate and technical",
      responseStyle: "direct and solution-oriented",
      emotionalRange: "moderate and controlled",
      examples:
        "uses proper titles, maintains professional distance, focuses on efficiency",
    },
  },
  friendly: {
    label: "Friendly",
    description: "Warm and approachable",
    fullDefinition: {
      tone: "warm and welcoming",
      communication: "conversational and engaging",
      vocabulary: "accessible and inclusive",
      responseStyle: "empathetic and supportive",
      emotionalRange: "positive and encouraging",
      examples:
        "uses friendly greetings, shows genuine interest, maintains a positive atmosphere",
    },
  },
  casual: {
    label: "Casual",
    description: "Relaxed and informal",
    fullDefinition: {
      tone: "relaxed and informal",
      communication: "conversational and laid-back",
      vocabulary: "everyday and colloquial",
      responseStyle: "easy-going and natural",
      emotionalRange: "light and playful",
      examples:
        "uses casual language, includes humor, maintains a relaxed atmosphere",
    },
  },
  concise: {
    label: "Concise",
    description: "Brief and to the point",
    fullDefinition: {
      tone: "direct and efficient",
      communication: "brief and focused",
      vocabulary: "simple and clear",
      responseStyle: "straightforward and practical",
      emotionalRange: "neutral and focused",
      examples:
        "uses bullet points, avoids unnecessary details, focuses on key information",
    },
  },
  detailed: {
    label: "Detailed",
    description: "Thorough and comprehensive",
    fullDefinition: {
      tone: "thorough and analytical",
      communication: "comprehensive and detailed",
      vocabulary: "precise and technical",
      responseStyle: "in-depth and explanatory",
      emotionalRange: "measured and thoughtful",
      examples: "provides context, includes examples, explains reasoning",
    },
  },
};

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [userData, setUserData] = useState<UserData>({
    phoneNumber: "",
    personality: "",
    tokensUsed: 0,
  });
  const [loading, setLoading] = useState({
    userData: true,
    analytics: true,
  });
  const [activeTab, setActiveTab] = useState("Overview");
  const [profileForm, setProfileForm] = useState({
    phoneNumber: "",
    aiPersonality: "",
    aiRelationship: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<NotificationMessage | null>(null);
  const [messageStats, setMessageStats] = useState<
    { date: string; count: number }[]
  >([]);
  const [responseTimeStats, setResponseTimeStats] = useState<
    { date: string; averageTime: number }[]
  >([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Real-time user data subscription
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile(data.profile || {});
          setSummary(data.summary || "");
          setHistory(data.history || []);
          setUserData({
            phoneNumber: data.phoneNumber || "",
            personality: data.personality || "",
            tokensUsed: data.tokensUsed || 0,
            responseTime: data.responseTime,
            notifications: data.notifications,
            isAdmin: data.isAdmin,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            summary: data.summary || "",
            history: data.history || [],
          });
          setLoading((prev) => ({ ...prev, userData: false }));

          // Redirect to admin dashboard if user is admin
          if (data.type === "admin") {
            navigate("/dashboardadmin");
          }
        }
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading((prev) => ({ ...prev, userData: false }));
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  // Update profile form when user data changes
  useEffect(() => {
    setProfileForm({
      phoneNumber: userData.phoneNumber,
      aiPersonality: userData.personality || "",
      aiRelationship: userData.aiRelationship || "",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: user?.email || "",
    });
  }, [userData, user]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const stats: { [key: string]: number } = {};
        const responseTimes: { [key: string]: number[] } = {};
        let total = 0;
        let totalResponseTime = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.timestamp.toDate()).toLocaleDateString();
          stats[date] = (stats[date] || 0) + 1;
          total++;

          if (data.responseTime) {
            if (!responseTimes[date]) responseTimes[date] = [];
            responseTimes[date].push(data.responseTime);
            totalResponseTime += data.responseTime;
          }
        });

        const messageStatsArray = Object.entries(stats).map(
          ([date, count]) => ({ date, count })
        );
        const responseTimeStatsArray = Object.entries(responseTimes).map(
          ([date, times]) => ({
            date,
            averageTime: times.reduce((a, b) => a + b, 0) / times.length,
          })
        );

        setMessageStats(messageStatsArray);
        setResponseTimeStats(responseTimeStatsArray);
        setTotalMessages(total);
        setAverageResponseTime(total ? totalResponseTime / total : 0);
        setLoading((prev) => ({ ...prev, analytics: false }));
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setLoading((prev) => ({ ...prev, analytics: false }));
      }
    };

    fetchAnalytics();
  }, [user]);

  // Determine if modal should show and which step to start on
  const needsPhone = !userData.phoneNumber;
  const needsName = !userData.firstName || !userData.lastName;
  const showModal = !loading.userData && user && (needsPhone || needsName);
  const startStep = needsPhone ? 1 : 2;

  // Fade in modal after 5 seconds when it should be shown
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (showModal) {
      setModalVisible(false);
      timeout = setTimeout(() => setModalVisible(true), 5000);
    } else {
      setModalVisible(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showModal]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const selectedPersonality =
        personalityDefinitions[
          profileForm.aiPersonality as keyof typeof personalityDefinitions
        ];

      await updateDoc(userRef, {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        aiPersonality: selectedPersonality
          ? JSON.stringify(selectedPersonality.fullDefinition)
          : "",
        aiRelationship: profileForm.aiRelationship || "",
      });

      setUserData((prev) => ({
        ...prev,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        aiPersonality: selectedPersonality
          ? JSON.stringify(selectedPersonality.fullDefinition)
          : "",
        aiRelationship: profileForm.aiRelationship || "",
      }));

      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleProfileReset = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { summary: "", history: [] },
        { merge: true }
      );
      setSummary("");
      setHistory([]);
      setMessage({ type: "success", text: "Summary and history reset!" });
    } catch (error) {
      setMessage({ type: "error", text: "Error resetting summary/history." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePhone = async (
    phone: string,
    firstName: string,
    lastName: string
  ) => {
    if (!user) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        phoneNumber: phone,
        firstName: firstName,
        lastName: lastName,
        aiRelationship: profileForm.aiRelationship,
      });
      setUserData((prev: any) => ({ ...prev, phoneNumber: phone }));
    } catch (err: any) {
      setPhoneError("Failed to save profile. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const messageChartData = {
    labels: messageStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Messages per Day",
        data: messageStats.map((stat) => stat.count),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };
  const responseTimeChartData = {
    labels: responseTimeStats.map((stat) => stat.date),
    datasets: [
      {
        label: "Average Response Time (seconds)",
        data: responseTimeStats.map((stat) => stat.averageTime),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add a handler to hide the modal after success
  const handleModalClose = () => {
    setModalVisible(false);
  };

  if (loading.userData || loading.analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // User info fallback
  const displayName = user?.displayName || "SwanAI User";
  const displayEmail = user?.email || "user@swanai.com";
  const avatarUrl = profile?.avatarUrl || "/images/avatar-placeholder.png";

  // If user is an admin, render DashboardAdmin
  if (userData.isAdmin) {
    return <DashboardAdmin />;
  }

  return (
    <>
      {/* Only show modal if needed */}
      {showModal && (
        <PhoneRequiredModal
          open={true}
          onSave={handleSavePhone}
          loading={phoneLoading}
          error={phoneError}
          fadeIn={modalVisible}
          startStep={startStep}
          phone={userData.phoneNumber || ""}
          firstName={userData.firstName || ""}
          lastName={userData.lastName || ""}
          onClose={handleModalClose}
        />
      )}
      {/* Main dashboard content */}
      <div>
        <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-between ">
          {/* Sidebar */}
          <aside className="w-64 flex flex-col border-r border-gray-100 bg-white py-6 px-4 min-h-screen sticky top-0 h-screen">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div>
                  <div className="font-bold text-lg text-gray-900 leading-tight">
                    Dashboard
                  </div>
                  <div className="text-xs text-gray-400">SMS Assistant</div>
                </div>
              </div>
              <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
                MAIN
              </div>
              <nav className="space-y-1 mb-6">
                {mainNav.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors relative ${
                      label === activeTab
                        ? "bg-gray-100 text-indigo-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab(label)}
                  >
                    <span
                      className={`absolute left-0 top-0 h-full w-1 rounded bg-indigo-500 transition-all ${
                        label === activeTab
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-50"
                      }`}
                    ></span>
                    <Icon className="w-5 h-5" />
                    {label}
                    {label === activeTab && (
                      <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-400" />
                    )}
                  </button>
                ))}
              </nav>
              <div className="mb-2 text-xs font-semibold text-gray-400 tracking-widest pl-1">
                INTEGRATIONS
              </div>
              <nav className="space-y-1 mb-6">
                {salesChannels.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-gray-700 hover:bg-gray-50"
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-colors text-red-600 hover:bg-red-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>
          {/* Main Content + Right Sidebar Container */}
          <div className="flex-1 flex justify-center">
            <div
              className="flex w-full max-w-7xl"
              style={{ maxWidth: "80rem" }}
            >
              {/* Main Content */}
              <main className="flex-1 flex flex-col px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <img
                      src="/images/profile.png"
                      alt="User avatar"
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      {userData.firstName && (
                        <div className="font-bold text-2xl text-gray-900">
                          {userData.firstName}
                        </div>
                      )}
                      <div className="text-sm text-gray-400">
                        Welcome back to SwanAI <span className="ml-1">👋🏼</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded hover:bg-gray-100 transition">
                      <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </button>
                    <button className="p-2 rounded hover:bg-gray-100 transition">
                      <BellIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                {/* Tab Content */}
                {activeTab === "Overview" && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Overview
                    </h2>
                    <p className="text-gray-500 mb-4 text-sm">
                      Get a snapshot of your SMS activity, AI usage, and recent
                      conversations.
                    </p>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
                        <div className="text-xs text-gray-400 font-medium">
                          Total Messages
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {totalMessages}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
                        <div className="text-xs text-gray-400 font-medium">
                          Total Tokens Used
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {userData.tokensUsed}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
                        <div className="text-xs text-gray-400 font-medium">
                          Avg. Response Time
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {averageResponseTime.toFixed(2)}s
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col gap-2">
                        <div className="text-xs text-gray-400 font-medium">
                          Notifications
                        </div>
                        <div className="text-2xl font-bold {userData.notifications ? 'text-green-600' : 'text-red-500'}">
                          {userData.notifications ? "On" : "Off"}
                        </div>
                      </div>
                    </div>
                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Message Activity
                        </h3>
                        <Line data={messageChartData} />
                      </div>
                      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Response Time Trends
                        </h3>
                        <Bar data={responseTimeChartData} />
                      </div>
                    </div>
                    {/* Profile/AI Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Profile & AI Info
                        </h3>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">
                            Phone:
                          </span>{" "}
                          {userData.phoneNumber}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">
                            AI Personality:
                          </span>{" "}
                          {userData.personality}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">
                            Response Time:
                          </span>{" "}
                          {userData.responseTime || "N/A"}s
                        </div>
                        <div className="mb-2">
                          <span className="font-medium text-gray-700">
                            Notifications:
                          </span>{" "}
                          {userData.notifications ? "On" : "Off"}
                        </div>
                      </div>
                      {/* Conversation Summary */}
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Conversation Summary
                        </h3>
                        {userData?.summary ? (
                          <p className="text-gray-600">{userData.summary}</p>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">
                              No conversation summary available yet
                            </p>
                            <p className="text-sm text-gray-400">
                              Your conversation summaries will appear here once
                              you start chatting with SwanAI
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Recent Chat History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Recent Chat History
                      </h3>
                      {userData.history && userData.history.length > 0 ? (
                        <div className="space-y-4">
                          {userData.history.slice(0, 3).map((chat, index) => (
                            <div
                              key={index}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <p className="text-sm text-gray-600">
                                {typeof chat === "object" ? chat.content : chat}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-2">
                            No chat history available yet
                          </p>
                          <p className="text-sm text-gray-400">
                            Your recent conversations will appear here once you
                            start chatting with SwanAI
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {activeTab === "Settings" && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Settings
                    </h2>
                    <p className="text-gray-500 mb-4 text-sm">
                      Edit your AI profile, update your personal information,
                      and customize your SwanAI experience.
                    </p>
                    <div className="w-full">
                      <div className="bg-white p-6 rounded-xl shadow-sm w-full">
                        {message && (
                          <div
                            className={`p-4 mb-4 rounded-lg ${
                              message.type === "success"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {message.text}
                          </div>
                        )}
                        <form
                          onSubmit={handleProfileSubmit}
                          className="space-y-6"
                        >
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
                                name="firstName"
                                value={profileForm.firstName}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    firstName: e.target.value,
                                  })
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
                                name="lastName"
                                value={profileForm.lastName}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    lastName: e.target.value,
                                  })
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
                                name="email"
                                value={profileForm.email}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    email: e.target.value,
                                  })
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
                                name="phoneNumber"
                                value={profileForm.phoneNumber}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    phoneNumber: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  AI Personality
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Choose how your AI assistant communicates with
                                  you
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label
                                  htmlFor="aiPersonality"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Personality Type
                                </label>
                                <select
                                  id="aiPersonality"
                                  name="aiPersonality"
                                  value={profileForm.aiPersonality}
                                  onChange={(e) =>
                                    setProfileForm({
                                      ...profileForm,
                                      aiPersonality: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                  <option value="">Select a personality</option>
                                  {Object.entries(personalityDefinitions).map(
                                    ([key, { label, description }]) => (
                                      <option key={key} value={key}>
                                        {label} - {description}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                              <div className="flex items-center justify-center">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <p className="text-sm text-gray-600">
                                    {profileForm.aiPersonality ? (
                                      <>
                                        <span className="font-medium">
                                          Current Style:
                                        </span>{" "}
                                        {profileForm.aiPersonality
                                          .charAt(0)
                                          .toUpperCase() +
                                          profileForm.aiPersonality.slice(1)}
                                      </>
                                    ) : (
                                      "Select a personality type to customize your AI assistant's communication style"
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6">
                              <label
                                htmlFor="aiRelationship"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                AI Relationship
                              </label>
                              <select
                                id="aiRelationship"
                                name="aiRelationship"
                                value={profileForm.aiRelationship}
                                onChange={(e) =>
                                  setProfileForm({
                                    ...profileForm,
                                    aiRelationship: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">Select a relationship</option>
                                <option value="girlfriend">
                                  Girlfriend - Caring and supportive
                                </option>
                                <option value="personal_assistant">
                                  Personal Assistant - Efficient and organized
                                </option>
                                <option value="cousin">
                                  Cousin - Fun and casual
                                </option>
                                <option value="family_member">
                                  Family Member - Warm and familiar
                                </option>
                                <option value="parent">
                                  Parent - Nurturing and guiding
                                </option>
                                <option value="grandparent">
                                  Grandparent - Wise and patient
                                </option>
                                <option value="emo_friend">
                                  Emo Friend - Deep and emotional
                                </option>
                                <option value="nihilistic_teen">
                                  Nihilistic Teen - Philosophical and edgy
                                </option>
                              </select>
                              <p className="mt-2 text-sm text-gray-500">
                                Choose how your AI assistant relates to you
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  Notifications
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Receive updates about your SwanAI activity
                                </p>
                              </div>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newValue = !userData.notifications;
                                    setUserData((prev) => ({
                                      ...prev,
                                      notifications: newValue,
                                    }));
                                    if (user) {
                                      updateDoc(doc(db, "users", user.uid), {
                                        notifications: newValue,
                                      });
                                    }
                                  }}
                                  className={`${
                                    userData.notifications
                                      ? "bg-indigo-600"
                                      : "bg-gray-200"
                                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                >
                                  <span
                                    className={`${
                                      userData.notifications
                                        ? "translate-x-5"
                                        : "translate-x-0"
                                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "Messages" && (
                  <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Messages
                    </h2>
                    <p className="text-gray-500 mb-4 text-sm">
                      Here you can view your recent conversations and message
                      history with SwanAI.
                    </p>
                    <div className="space-y-4">
                      {history.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg ${
                            msg.role === "user" ? "bg-indigo-50" : "bg-gray-50"
                          }`}
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {msg.role}:
                          </span>
                          <p className="mt-1 text-gray-900">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </main>

              {/* Right Sidebar */}
              <aside className="w-96 border-l border-gray-100 bg-white py-8 px-6 min-h-screen sticky top-0 h-screen flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg text-gray-900">
                    Recent Activities
                  </div>
                </div>
                <p className="text-gray-500 mb-4 text-sm">
                  See your latest actions and updates within SwanAI.
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">
                    Today
                  </button>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    Yesterday
                  </button>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    This week
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-sm"
                    placeholder="Search..."
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {userData?.history && userData.history.length > 0 ? (
                    <div className="space-y-4">
                      {userData.history.slice(0, 5).map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600 truncate">
                              {typeof activity === "object"
                                ? activity.content
                                : activity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No recent activities</p>
                      <p className="text-sm text-gray-400">
                        Your recent activities will appear here once you start
                        using SwanAI
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
        <SlimFooter />
      </div>
    </>
  );
}
