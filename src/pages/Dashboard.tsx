import React from "react";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import Login from "./Login";
import PhoneRequiredModal from "../components/PhoneRequiredModal";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatCards from "../components/dashboard/StatCards";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import ProfileInfo from "../components/dashboard/ProfileInfo";
import ConversationSummary from "../components/dashboard/ConversationSummary";
import AdminAnalytics from "../components/dashboard/AdminAnalytics";
import Settings from "../components/dashboard/Settings";
import Messages from "../components/dashboard/Messages";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  personality?: string;
  aiRelationship?: string;
  createdAt: any;
  lastLogin: any;
  type?: string;
  notificationsEnabled?: boolean;
  tokensUsed: number;
  responseTime?: number;
  summary?: string;
  uid?: string;
}

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    personality: "",
    aiRelationship: "",
    notificationsEnabled: false,
    createdAt: Timestamp.fromDate(new Date()),
    lastLogin: Timestamp.fromDate(new Date()),
    tokensUsed: 0,
  });
  const [loading, setLoading] = useState({
    userData: true,
    analytics: true,
  });
  const [activeTab, setActiveTab] = useState("Overview");
  const [messageStats, setMessageStats] = useState<{ date: string; count: number }[]>([]);
  const [responseTimeStats, setResponseTimeStats] = useState<{ date: string; averageTime: number }[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [modalVisible, setModalVisible] = useState(true);
  const [usersByDay, setUsersByDay] = useState<{ [date: string]: number }>({});
  const [tokensByDay, setTokensByDay] = useState<{ [date: string]: number }>({});
  const [messagesByDay, setMessagesByDay] = useState<{ [date: string]: number }>({});

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          setUserData({
            ...data,
            uid: user.uid,
            personality: data.personality || "",
            aiRelationship: data.aiRelationship || "",
            notificationsEnabled: data.notificationsEnabled || false
          });
        }
        setLoading((prev) => ({ ...prev, userData: false }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading((prev) => ({ ...prev, userData: false }));
      }
    };

    fetchUserData();
  }, [user]);

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

  // Fetch analytics/global for tokensByDay only if admin
  useEffect(() => {
    if (userData.type !== "admin") return;
    const fetchGlobalAnalytics = async () => {
      try {
        const analyticsRef = doc(db, "analytics", "global");
        const analyticsSnap = await getDoc(analyticsRef);
        if (analyticsSnap.exists()) {
          const data = analyticsSnap.data();
          setUsersByDay(data.usersByDay || {});
          setTokensByDay(data.tokensByDay || {});
          setMessagesByDay(data.messagesByDay || {});
        }
      } catch (err) {
        console.error("Error fetching global analytics:", err);
      }
    };
    fetchGlobalAnalytics();
  }, [userData.type]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSavePhone = async (phone: string, firstName: string, lastName: string) => {
    if (!user) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phoneNumber: phone,
        firstName: firstName,
        lastName: lastName,
      });
      setUserData((prev) => ({
        ...prev,
        phoneNumber: phone,
        firstName: firstName,
        lastName: lastName,
      }));
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setPhoneError("Failed to save profile information");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSettingsUpdate = (updatedData: any) => {
      setUserData((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  if (loading.userData || loading.analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Determine if modal should show and which step to start on
  const needsPhone = !userData.phoneNumber;
  const needsName = !userData.firstName || !userData.lastName;
  const showModal = !loading.userData && user && (needsPhone || needsName);
  const startStep = needsPhone ? 1 : 2;

  return (
    <>
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
          onClose={() => setModalVisible(false)}
        />
      )}
      <div>
        <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-between">
          <DashboardSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSignOut={handleSignOut}
          />
          <div className="flex-1 flex justify-center">
            <div className="flex w-full max-w-7xl" style={{ maxWidth: "80rem" }}>
              <main className="flex-1 flex flex-col px-8 py-8">
                <DashboardHeader firstName={userData.firstName} />
                {activeTab === "Overview" && (
                  <>
                    {userData.type === "admin" && (
                      <AdminAnalytics
                        usersByDay={usersByDay}
                        tokensByDay={tokensByDay}
                        messagesByDay={messagesByDay}
                      />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Overview
                    </h2>
                    <p className="text-gray-500 mb-4 text-sm">
                      Get a snapshot of your SMS activity, AI usage, and recent
                      conversations.
                    </p>
                    <StatCards
                      totalMessages={totalMessages}
                      tokensUsed={userData.tokensUsed}
                      averageResponseTime={averageResponseTime}
                      notificationsEnabled={userData.notificationsEnabled || false}
                    />
                    <DashboardCharts
                      messageStats={messageStats}
                      responseTimeStats={responseTimeStats}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <ProfileInfo
                        phoneNumber={userData.phoneNumber}
                        personality={userData.personality || ""}
                        responseTime={userData.responseTime || 0}
                        notificationsEnabled={userData.notificationsEnabled || false}
                      />
                      <ConversationSummary summary={userData.summary || ""} />
                      </div>
                  </>
                )}
                {activeTab === "Messages" && userData.uid && (
                  <Messages userId={userData.uid} />
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
                    <Settings userData={userData} onUpdate={handleSettingsUpdate} />
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

