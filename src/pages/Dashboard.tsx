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
import Messages from "../components/dashboard/Messages";
import Settings from "../components/dashboard/Settings";
import PricingSection from "../components/dashboard/PricingSection";
import SlimFooter from "../components/SlimFooter";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  age?: string;
  gender?: string;
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
  updatedAt: Date;
  profile?: { personality: string; relationship: string };
  isAdmin?: boolean;
}

export default function Dashboard() {
  // --- Auth and navigation hooks ---
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // --- Local state for user data and analytics ---
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
    updatedAt: new Date(),
    uid: "",
  });
  const [loading, setLoading] = useState({
    userData: true,
    analytics: true,
  });
  const [activeTab, setActiveTab] = useState("Overview");
  const [justChangedRelationship, setJustChangedRelationship] = useState(false);
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
  const [usersByDay, setUsersByDay] = useState<{ [date: string]: number }>({});
  const [tokensByDay, setTokensByDay] = useState<{ [date: string]: number }>(
    {}
  );
  const [messagesByDay, setMessagesByDay] = useState<{
    [date: string]: number;
  }>({});
  const [remainingBalance, setRemainingBalance] = useState<number | undefined>(
    undefined
  );

  // --- Fetch user data from Firestore on mount or when user changes ---
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.log("No user found, returning");
        return;
      }
      console.log("Fetching user data for:", user.uid);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        console.log("User snapshot exists:", userSnap.exists());
        if (userSnap.exists()) {
          const data = userSnap.data() as UserData;
          console.log("User data:", data);
          const updatedUserData = {
            ...data,
            uid: user.uid,
            profile: data.profile || {
              personality: "Friendly",
              relationship: "Friend",
            },
            notificationsEnabled: data.notificationsEnabled || false,
          };
          console.log("Updated user data:", updatedUserData);
          setUserData(updatedUserData);

          // Wait 5 seconds before checking and setting modal visibility
          setTimeout(() => {
            // Check if any required fields are empty
            const hasEmptyFields =
              !data.firstName?.trim() ||
              !data.lastName?.trim() ||
              !data.phoneNumber?.trim();
            console.log("Has empty fields:", hasEmptyFields);
            setModalVisible(hasEmptyFields);
          }, 5000);
        } else {
          console.log("No user document found in Firestore");
        }
        setLoading((prev) => ({ ...prev, userData: false }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading((prev) => ({ ...prev, userData: false }));
      }
    };

    fetchUserData();
  }, [user]);

  // --- Listen for custom event to set active tab from child components ---
  useEffect(() => {
    const handleSetTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener("dashboard-set-tab", handleSetTab);
    return () => window.removeEventListener("dashboard-set-tab", handleSetTab);
  }, []);

  // --- Fetch analytics data for the current user ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !user.uid) {
        console.log("No authenticated user for analytics");
        setLoading((prev) => ({ ...prev, analytics: false }));
        return;
      }
      
      try {
        console.log("Fetching analytics for user:", user.uid);
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
        console.log("Analytics fetched successfully");
        setLoading((prev) => ({ ...prev, analytics: false }));
      } catch (error) {
        console.error("Error fetching analytics:", error);
        // Don't fail completely, just set empty stats
        setMessageStats([]);
        setResponseTimeStats([]);
        setTotalMessages(0);
        setAverageResponseTime(0);
        setLoading((prev) => ({ ...prev, analytics: false }));
      }
    };

    fetchAnalytics();
  }, [user]);

  // --- Fetch global analytics if user is admin ---
  useEffect(() => {
    if (userData.type !== "admin" && !(userData as any).isAdmin) return;
    const fetchGlobalAnalytics = async () => {
      try {
        const analyticsRef = doc(db, "analytics", "global");
        const analyticsSnap = await getDoc(analyticsRef);
        if (analyticsSnap.exists()) {
          const data = analyticsSnap.data();
          setUsersByDay(data.usersByDay || {});
          setTokensByDay(data.tokensByDay || {});
          setMessagesByDay(data.messagesByDay || {});

          // Get the most recent remaining balance from costPerDay
          if (data.costPerDay) {
            const dates = Object.keys(data.costPerDay).sort();
            const latestDate = dates[dates.length - 1];
            if (latestDate) {
              setRemainingBalance(data.costPerDay[latestDate]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching global analytics:", err);
      }
    };
    fetchGlobalAnalytics();
  }, [userData.type, (userData as any).isAdmin]);

  // --- Sign out handler ---
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // --- Save phone and name from modal ---
  const handleSavePhone = async (
    phone: string,
    firstName: string,
    lastName: string,
    age: string,
    gender: string
  ) => {
    if (!user) return;
    setPhoneLoading(true);
    setPhoneError("");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        phoneNumber: phone,
        firstName: firstName,
        lastName: lastName,
        age: age,
        gender: gender,
      });
      setUserData((prev) => ({
        ...prev,
        phoneNumber: phone,
        firstName: firstName,
        lastName: lastName,
        age: age,
        gender: gender,
      }));
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      setPhoneError("Failed to save profile information");
    } finally {
      setPhoneLoading(false);
    }
  };

  // --- Settings update handler for Settings component ---
  const handleSettingsUpdate = async (dataToSave: Partial<UserData>) => {
    if (!user) return;
    try {
      // Check if relationship is changing
      const isRelationshipChanging = 
        dataToSave.profile?.relationship && 
        dataToSave.profile.relationship !== userData.profile?.relationship;

      let finalDataToSave = { ...dataToSave };

      // If relationship is changing, clear all context for fresh start
      if (isRelationshipChanging) {
        console.log(`Relationship changing from ${userData.profile?.relationship} to ${dataToSave.profile?.relationship}`);
        
        // Clear all learned context and start fresh
        finalDataToSave = {
          ...dataToSave,
          // Clear conversation summary
          summary: "",
          // Clear detailed profile while keeping basic settings
          profile: {
            personality: dataToSave.profile?.personality || userData.profile?.personality || "Friendly",
            relationship: dataToSave.profile?.relationship || "Friend"
          }
        };

        // Also clear the history field directly in Firebase
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            history: []
          });
          console.log("Successfully cleared conversation history");
        } catch (historyError) {
          console.error("Error clearing history:", historyError);
        }

        console.log("Relationship change detected - clearing all context for fresh start");
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, finalDataToSave);

      // Create a clean version of data for local state by removing sentinels
      const cleanDataForState = { ...finalDataToSave };
      if ("personality" in cleanDataForState)
        delete (cleanDataForState as any).personality;
      if ("aiRelationship" in cleanDataForState)
        delete (cleanDataForState as any).aiRelationship;

      // Optimistically update local state instead of re-fetching
      setUserData((prevUserData) => ({
        ...prevUserData,
        ...cleanDataForState,
        profile: {
          ...(prevUserData.profile as object),
          ...(cleanDataForState.profile as object),
        },
      }));

      // Show success message for relationship change
      if (isRelationshipChanging) {
        console.log("Successfully cleared context for new relationship");
        setJustChangedRelationship(true);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      // Optional: Add logic to revert state on error
      throw error;
    }
  };

  // --- Loading spinner while fetching data ---
  if (loading.userData || loading.analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- Modal logic for incomplete profile ---
  const needsPhone = !userData.phoneNumber;
  const needsName = !userData.firstName || !userData.lastName;
  const showModal = !loading.userData && user && (needsPhone || needsName);
  const startStep = needsPhone ? 1 : 2;

  // --- Main dashboard layout ---
  return (
    <>
      {!user ? (
        <Login />
      ) : (
        <div className="min-h-screen bg-white">
          {/* Main container for sidebar and content, aligned with navbar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex pt-8 mt-10">
            {/* Sidebar navigation */}
            <DashboardSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onSignOut={handleSignOut}
            />
            {/* Main content area */}
            <div className="flex-1 pl-8">
              <div className="py-8">
                {/* Dashboard header with greeting */}
                <DashboardHeader firstName={userData.firstName} />
                <main>
                  {/* Overview tab content */}
                  {activeTab === "Overview" && (
                    <>
                      <StatCards
                        totalMessages={totalMessages}
                        averageResponseTime={averageResponseTime}
                        tokensUsed={userData.tokensUsed}
                        notificationsEnabled={
                          userData.notificationsEnabled || false
                        }
                      />
                      <div className="mt-8">
                        <DashboardCharts
                          messageStats={messageStats}
                          responseTimeStats={responseTimeStats}
                          totalMessages={totalMessages}
                          averageResponseTime={averageResponseTime}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <ProfileInfo
                          phoneNumber={userData.phoneNumber}
                          personality={userData.profile?.personality || ""}
                          responseTime={userData.responseTime || 0}
                          notificationsEnabled={
                            userData.notificationsEnabled || false
                          }
                          aiRelationship={userData.profile?.relationship}
                          type={userData.type}
                        />
                        <ConversationSummary summary={userData.summary || ""} />
                      </div>
                      {/* Admin analytics only for admin users */}
                      {(userData.type === "admin" ||
                        (userData as any).isAdmin === true) && (
                        <AdminAnalytics
                          usersByDay={usersByDay}
                          tokensByDay={tokensByDay}
                          messagesByDay={messagesByDay}
                          remainingBalance={remainingBalance}
                        />
                      )}
                    </>
                  )}
                  {/* Messages tab content */}
                  {activeTab === "Messages" && userData.uid && (
                    <div className="h-[calc(100vh-200px)]">
                      <Messages 
                        userId={userData.uid} 
                        aiPersonality={{
                          name: userData.profile?.personality === "Professional" ? "Alex Thompson" :
                                userData.profile?.personality === "Friendly" ? "Sam Rodriguez" :
                                userData.profile?.personality === "CognitiveTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "MumFriend" ? "Emma Rodriguez" :
                                userData.profile?.personality === "ChaoticFriend" ? "Zoe Thompson" :
                                userData.profile?.personality === "Jokester" ? "Mike Chen" :
                                userData.profile?.personality === "Bookworm" ? "Aria Patel" :
                                userData.profile?.personality === "NurturingMom" ? "Maria Garcia" :
                                userData.profile?.personality === "WiseDad" ? "James Wilson" :
                                userData.profile?.personality === "EmpatheticTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "SolutionFocusedTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "MindfulnessTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "SupportiveTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "InsightfulTherapist" ? "Dr. Sarah Chen" :
                                userData.profile?.personality === "Mentor" ? "Alex Thompson" :
                                userData.profile?.personality === "Rick" ? "SwanAI" :
                                userData.profile?.personality === "LateFriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "FashionableFriend" ? "Emma Rodriguez" :
                                userData.profile?.personality === "EmotionalFriend" ? "Aria Patel" :
                                userData.profile?.personality === "LaidbackFriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "BoJackHorseman" ? "Mike Chen" :
                                userData.profile?.personality === "PracticalMom" ? "Maria Garcia" :
                                userData.profile?.personality === "FunMom" ? "Emma Rodriguez" :
                                userData.profile?.personality === "WiseMom" ? "Maria Garcia" :
                                userData.profile?.personality === "ProtectiveMom" ? "Maria Garcia" :
                                userData.profile?.personality === "EncouragingMom" ? "Maria Garcia" :
                                userData.profile?.personality === "SteadyDad" ? "James Wilson" :
                                userData.profile?.personality === "HandyDad" ? "James Wilson" :
                                userData.profile?.personality === "FunDad" ? "James Wilson" :
                                userData.profile?.personality === "ProtectiveDad" ? "James Wilson" :
                                userData.profile?.personality === "SupportiveDad" ? "James Wilson" :
                                userData.profile?.personality === "RomanticBoyfriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "ProtectiveBoyfriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "FunBoyfriend" ? "Mike Chen" :
                                userData.profile?.personality === "SupportiveBoyfriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "AmbitiousBoyfriend" ? "Alex Thompson" :
                                userData.profile?.personality === "ChillBoyfriend" ? "Sam Rodriguez" :
                                userData.profile?.personality === "CaringGirlfriend" ? "Emma Rodriguez" :
                                userData.profile?.personality === "FunGirlfriend" ? "Zoe Thompson" :
                                userData.profile?.personality === "SupportiveGirlfriend" ? "Emma Rodriguez" :
                                userData.profile?.personality === "RomanticGirlfriend" ? "Emma Rodriguez" :
                                userData.profile?.personality === "IndependentGirlfriend" ? "Aria Patel" :
                                userData.profile?.personality === "AdventurousGirlfriend" ? "Zoe Thompson" :
                                userData.profile?.personality === "MotivationalCoach" ? "Alex Thompson" :
                                userData.profile?.personality === "StrategicCoach" ? "Alex Thompson" :
                                userData.profile?.personality === "ToughLoveCoach" ? "James Wilson" :
                                userData.profile?.personality === "EncouragingCoach" ? "Emma Rodriguez" :
                                userData.profile?.personality === "AccountabilityCoach" ? "Alex Thompson" :
                                userData.profile?.personality === "LifeCoach" ? "Alex Thompson" :
                                userData.profile?.personality === "FunCousin" ? "Zoe Thompson" :
                                userData.profile?.personality === "CloseCousin" ? "Sam Rodriguez" :
                                userData.profile?.personality === "AdventurousCousin" ? "Zoe Thompson" :
                                userData.profile?.personality === "SupportiveCousin" ? "Emma Rodriguez" :
                                userData.profile?.personality === "WiseCousin" ? "James Wilson" :
                                userData.profile?.personality === "PartnerInCrimeCousin" ? "Mike Chen" :
                                "SwanAI",
                          personality: userData.profile?.personality || "Friendly",
                          relationship: userData.profile?.relationship || "Friend"
                        }}
                        justChangedRelationship={justChangedRelationship}
                        onIntroductionComplete={() => setJustChangedRelationship(false)}
                      />
                    </div>
                  )}
                  {/* Settings tab content */}
                  {activeTab === "Settings" && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Settings
                      </h2>
                      <p className="text-gray-500 mb-4 text-sm">
                        Edit your AI profile, update your personal information,
                        and customize your SwanAI experience.
                      </p>
                      <Settings
                        userData={userData}
                        onUpdate={handleSettingsUpdate}
                      />
                    </>
                  )}
                  {/* Pricing tab content */}
                  {activeTab === "Pricing" && (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Plans and Pricing
                      </h2>
                      <p className="text-gray-500 mb-4 text-sm">
                        Choose the perfect plan for your needs. Upgrade or
                        downgrade at any time.
                      </p>
                      <PricingSection />
                    </>
                  )}
                </main>
              </div>
            </div>
          </div>
          {/* Footer for branding */}
          <SlimFooter />
        </div>
      )}
      {/* Modal for required phone/name info */}
      {modalVisible && (
        <PhoneRequiredModal
          onSave={handleSavePhone}
          loading={phoneLoading}
          error={phoneError}
          open={modalVisible}
          onClose={() => setModalVisible(false)}
          phone={userData.phoneNumber || ""}
          firstName={userData.firstName || ""}
          lastName={userData.lastName || ""}
          age={userData.age || ""}
          gender={userData.gender || ""}
          fadeIn={true}
        />
      )}
    </>
  );
}
