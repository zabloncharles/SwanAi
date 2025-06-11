import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  where,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Globe from "react-globe.gl";
import { useNavigate } from "react-router-dom";
import SlimFooter from "../components/SlimFooter";
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  EllipsisHorizontalIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CommandLineIcon,
  UserGroupIcon,
  PhoneIcon,
  BellIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  location: {
    lat: number;
    lng: number;
  };
  notifications: boolean;
  phoneNumber: string;
  status: string;
  type: string;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
}

interface Location {
  lat: number;
  lng: number;
  name: string;
  color: string;
  size: number;
  altitude: number;
  count?: number;
}

interface AnalyticsData {
  usersByDay: { [key: string]: number };
  messagesByDay: { [key: string]: number };
  tokensByDay: { [key: string]: number };
  subscriptionsByDay: { [key: string]: number };
  activeUsers: number;
  activeSubscriptions: number;
  locationData: any[];
}

// Helper to fetch state from coordinates using Nominatim
const getStateFromCoords = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`
    );
    const data = await response.json();
    // console.log("Nominatim response for", lat, lng, data); // Debug log
    if (data && data.address) {
      return (
        data.address.state || data.address.region || data.address.county || null
      );
    }
    return null;
  } catch (e) {
    console.error("Nominatim error for", lat, lng, e);
    return null;
  }
};

const DashboardAdmin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData>({
    uid: "",
    email: "",
    firstName: "",
    lastName: "",
    displayName: "",
    createdAt: Timestamp.fromDate(new Date()),
    lastLogin: Timestamp.fromDate(new Date()),
    location: {
      lat: 0,
      lng: 0,
    },
    notifications: false,
    phoneNumber: "",
    status: "",
    type: "",
  });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const globeRef = useRef<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [locationArcs, setLocationArcs] = useState<any[]>([]);
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );

  // Dummy data for fields not fetched from Firebase
  const [totalResumes] = useState(1234);
  const [totalApiCalls] = useState(5678);
  const [totalTokens] = useState(91011);
  const [activityStats] = useState({
    totalUsers: 0,
    totalResumes: 0,
    resumesThisWeek: 42,
  });
  const [coverLettersThisWeek] = useState(17);
  const [totalPaths] = useState(8);
  const [recentPathProfessions] = useState(["Engineer", "Designer", "Manager"]);
  const [recentUsers] = useState<UserData[]>([]); // Not used in admin
  const [userLocations, setUserLocations] = useState<Location[]>([
    {
      lat: 37.77,
      lng: -122.41,
      name: "San Francisco",
      color: "#ef4444",
      size: 0.8,
      altitude: 0.1,
      count: 1,
    },
    {
      lat: 40.71,
      lng: -74.01,
      name: "New York",
      color: "#ef4444",
      size: 0.8,
      altitude: 0.1,
      count: 1,
    },
    {
      lat: 51.51,
      lng: -0.13,
      name: "London",
      color: "#ef4444",
      size: 0.8,
      altitude: 0.1,
      count: 1,
    },
  ]);
  const [topStates, setTopStates] = useState([
    { state: "California", count: 100, percent: 40 },
    { state: "New York", count: 60, percent: 24 },
    { state: "Texas", count: 40, percent: 16 },
  ]);
  const [profileImpressionData, setProfileImpressionData] = useState([
    { month: "Jan", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Feb", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Mar", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Apr", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "May", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Jun", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Jul", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Aug", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Sep", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Oct", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Nov", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
    { month: "Dec", coverLetter: 0, resume: 0, careerPath: 0, users: 0 },
  ]);
  const [apiTokenChartData, setApiTokenChartData] = useState([
    { month: "Jan", apiCalls: 0, tokens: 0 },
    { month: "Feb", apiCalls: 0, tokens: 0 },
    { month: "Mar", apiCalls: 0, tokens: 0 },
    { month: "Apr", apiCalls: 0, tokens: 0 },
    { month: "May", apiCalls: 0, tokens: 0 },
    { month: "Jun", apiCalls: 0, tokens: 0 },
    { month: "Jul", apiCalls: 0, tokens: 0 },
    { month: "Aug", apiCalls: 0, tokens: 0 },
    { month: "Sep", apiCalls: 0, tokens: 0 },
    { month: "Oct", apiCalls: 0, tokens: 0 },
    { month: "Nov", apiCalls: 0, tokens: 0 },
    { month: "Dec", apiCalls: 0, tokens: 0 },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUserData(userData);

          // Check if user is admin, if not redirect to regular dashboard
          if (userData.type !== "admin") {
            navigate("/dashboard");
            return;
          }
        }
      } else {
        setUser(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Set up real-time listener for analytics data
    const unsubscribe = onSnapshot(
      doc(db, "analytics", "global"),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as AnalyticsData;
          setAnalyticsData(data);
          setTotalUsers(data.activeUsers || 0);
          setActiveUsers(data.activeSubscriptions || 0);

          // Transform location data for the globe and location list
          if (data.locationData && Array.isArray(data.locationData)) {
            // Group locations by coordinates to count users per location
            const locationCounts = data.locationData.reduce(
              (acc: { [key: string]: number }, loc: any) => {
                const key = `${loc.lat},${loc.lng}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              },
              {}
            );

            // Get unique locations with their counts
            const uniqueLocations = Object.entries(locationCounts).map(
              ([key, count]) => {
                const [lat, lng] = key.split(",").map(Number);
                return { lat, lng, count };
              }
            );

            // Set initial userLocations with coordinates as name
            const initialLocations = uniqueLocations.map((loc) => ({
              lat: loc.lat,
              lng: loc.lng,
              name: `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`,
              color: "#ef4444",
              size: 0.8,
              altitude: 0.1,
              count: loc.count,
            }));
            setUserLocations(initialLocations);

            // Batch state name updates
            const stateUpdates = uniqueLocations.map(async (loc) => {
              const state = await getStateFromCoords(loc.lat, loc.lng);
              return { lat: loc.lat, lng: loc.lng, state };
            });

            Promise.all(stateUpdates).then((updates) => {
              setUserLocations((prev) =>
                prev.map((l) => {
                  const update = updates.find(
                    (u) => u.lat === l.lat && u.lng === l.lng
                  );
                  return update ? { ...l, name: update.state || l.name } : l;
                })
              );
            });
          }

          // Transform daily data into monthly data for charts
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          // Helper function to aggregate daily data into monthly data
          const aggregateDailyToMonthly = (dailyData: {
            [key: string]: number;
          }) => {
            const monthlyData = Array(12).fill(0);
            Object.entries(dailyData).forEach(([date, value]) => {
              const month = new Date(date).getMonth();
              monthlyData[month] += value;
            });
            return monthlyData;
          };

          // Get monthly aggregations
          const messagesByMonth = aggregateDailyToMonthly(
            data.messagesByDay || {}
          );
          const tokensByMonth = aggregateDailyToMonthly(data.tokensByDay || {});
          const usersByMonth = aggregateDailyToMonthly(data.usersByDay || {});
          const subscriptionsByMonth = aggregateDailyToMonthly(
            data.subscriptionsByDay || {}
          );

          // Update chart data
          setProfileImpressionData(
            months.map((month, i) => ({
              month,
              coverLetter: subscriptionsByMonth[i] || 0,
              resume: messagesByMonth[i] || 0,
              careerPath: usersByMonth[i] || 0,
              users: usersByMonth[i] || 0,
            }))
          );

          setApiTokenChartData(
            months.map((month, i) => ({
              month,
              apiCalls: messagesByMonth[i] || 0,
              tokens: tokensByMonth[i] || 0,
            }))
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching analytics/global:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Derive unique users from recentMessages
  const uniqueUsers = Array.from(
    recentMessages
      .reduce((map, msg) => {
        if (!map.has(msg.userId)) {
          map.set(msg.userId, msg);
        }
        return map;
      }, new Map())
      .values()
  );

  // Add zoom level initialization
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ altitude: 8.5 }, 0);
    }
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Add any additional logic needed when changing sections
  };

  const handleSignOut = () => {
    auth.signOut();
    navigate("/login");
  };

  // Add loading state while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not admin, don't render the admin dashboard
  if (userData.type !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto flex justify-between flex pt-16">
        {/* Sidebar (modern admin) */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col justify-between py-8 px-4 sticky top-16 h-[calc(100vh-4rem)]">
          {/* Profile section */}
          <div>
            <div className="flex flex-col items-center gap-2 mb-8">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow border-4 border-white">
                {userData.firstName?.[0] || userData.email?.[0] || "U"}
                {userData.lastName?.[0] || ""}
              </div>
              <div className="text-center mt-2">
                <div className="text-lg font-semibold text-gray-900">
                  {userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.email || "User"}
                </div>
                <div className="text-xs font-medium text-indigo-500 mt-1 flex items-center justify-center gap-1">
                  <UserCircleIcon className="w-4 h-4 inline-block" /> Admin
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 mt-6">
              <button
                onClick={() => handleSectionChange("dashboard")}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition group focus:outline-none ${
                  activeSection === "dashboard"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
                aria-label="Dashboard"
              >
                <HomeIcon
                  className={`w-5 h-5 ${
                    activeSection === "dashboard"
                      ? "text-indigo-500"
                      : "text-gray-500"
                  } group-hover:scale-110 transition-transform`}
                />
                Dashboard
              </button>
              <button
                onClick={() => handleSectionChange("analytics")}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition group focus:outline-none ${
                  activeSection === "analytics"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
                aria-label="Analytics"
              >
                <ChartBarIcon
                  className={`w-5 h-5 ${
                    activeSection === "analytics"
                      ? "text-indigo-500"
                      : "text-gray-500"
                  } group-hover:scale-110 transition-transform`}
                />
                Analytics
              </button>
              <button
                onClick={() => handleSectionChange("settings")}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition group focus:outline-none ${
                  activeSection === "settings"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
                aria-label="Settings"
              >
                <Cog6ToothIcon
                  className={`w-5 h-5 ${
                    activeSection === "settings"
                      ? "text-indigo-500"
                      : "text-gray-500"
                  } group-hover:scale-110 transition-transform`}
                />
                Settings
              </button>
              <button
                onClick={() => handleSectionChange("help")}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition group focus:outline-none ${
                  activeSection === "help"
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-700 hover:bg-indigo-50"
                }`}
                aria-label="Help"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                Help
              </button>
              <div className="mt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group focus:outline-none border border-gray-100"
                  aria-label="Sign Out"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
          {/* Footer */}
          <div className="mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold shadow">
                {userData.firstName?.[0] || userData.email?.[0] || "U"}
                {userData.lastName?.[0] || ""}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {userData.firstName && userData.lastName
                    ? `${userData.firstName} ${userData.lastName}`
                    : userData.email || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {userData.email || "user@example.com"}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main and Right Columns */}
        <div className="bg-white flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Middle/Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Section Heading and Description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Monitor global usage, activities, and analytics for your AI SMS
                platform.
              </p>
            </div>
            {/* Spinning Globe User Locations */}
            <div className="bg-white rounded-xl shadow p-6 mb-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span
                  title="User locations on globe"
                  aria-label="User locations globe"
                >
                  🌍
                </span>
                User Locations
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Visualize where your users are located around the world.
              </p>
              <div className="flex gap-8">
                {/* Globe Section */}
                <div className="w-1/2">
                  {loading ? (
                    <div className="flex items-center justify-center h-[300px]">
                      <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"
                        aria-label="Loading globe"
                      />
                    </div>
                  ) : userLocations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <p>No user locations to display</p>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: 300,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Globe
                        ref={globeRef}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-water.png"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        pointsData={userLocations.map((loc) => ({
                          lat: loc.lat,
                          lng: loc.lng,
                          name: loc.name,
                          color: "#ef4444",
                          size: 0.8,
                          altitude: 0.1,
                        }))}
                        arcsData={locationArcs}
                        arcColor="color"
                        arcAltitude={0.3}
                        arcStroke={0.5}
                        arcDashLength={0.4}
                        arcDashGap={0.2}
                        arcDashAnimateTime={2000}
                        arcLabel={(arcObj: any) => {
                          const { startLat, startLng, endLat, endLng } =
                            arcObj || {};
                          const start = userLocations.find(
                            (loc) =>
                              loc.lat === startLat && loc.lng === startLng
                          );
                          const end = userLocations.find(
                            (loc) => loc.lat === endLat && loc.lng === endLng
                          );
                          return `${start?.name ?? ""} → ${end?.name ?? ""}`;
                        }}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude="altitude"
                        pointRadius="size"
                        pointLabel="name"
                        backgroundColor="#ffffff"
                        animateIn={true}
                        atmosphereColor="#0708340"
                        atmosphereAltitude={0.21}
                        pointsMerge={false}
                        pointsTransitionDuration={1000}
                        onPointClick={(point) => {
                          // console.log("Clicked point:", point);
                        }}
                        onPointHover={(point) => {
                          if (point) {
                            document.body.style.cursor = "pointer";
                          } else {
                            document.body.style.cursor = "default";
                          }
                        }}
                        onGlobeReady={() => {
                          if (globeRef.current) {
                            globeRef.current.pointOfView({ altitude: 6.5 }, 0);
                          }
                        }}
                        enablePointerInteraction={true}
                        width={800}
                        height={600}
                        aria-label="User locations globe"
                      />
                    </div>
                  )}
                </div>
                <div className="w-1/2">
                  <div className="space-y-6 h-[300px] overflow-y-auto pr-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Total Active Users
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {Object.values(analyticsData?.usersByDay || {}).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Global reach of SwanAI
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                        Top Locations
                      </h3>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {userLocations
                          .sort((a, b) => (b.count || 0) - (a.count || 0))
                          .slice(0, 3)
                          .map((location, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-blue-100"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
                                  <span className="text-sm font-medium text-blue-600">
                                    {location.name?.slice(0, 2) || "U"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {location.name ===
                                    `${location.lat.toFixed(
                                      2
                                    )}, ${location.lng.toFixed(2)}` ? (
                                      <span className="italic text-gray-400">
                                        Loading…
                                      </span>
                                    ) : (
                                      location.name
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {location.count || 1} users
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Active
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Users */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Users
                    </h3>
                    <p className="text-sm text-gray-500">Active SwanAI users</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Object.values(analyticsData?.usersByDay || {}).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>
                    {(() => {
                      const today = new Date().toISOString().split("T")[0];
                      const yesterday = new Date(Date.now() - 86400000)
                        .toISOString()
                        .split("T")[0];
                      const todayUsers =
                        analyticsData?.usersByDay?.[today] || 0;
                      const yesterdayUsers =
                        analyticsData?.usersByDay?.[yesterday] || 0;
                      const increase = yesterdayUsers
                        ? Math.round(
                            ((todayUsers - yesterdayUsers) / yesterdayUsers) *
                              100
                          )
                        : 0;
                      return `${increase}% increase`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Users
                    </h3>
                    <p className="text-sm text-gray-500">Currently online</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {analyticsData?.activeUsers || 0}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>
                    {(() => {
                      const totalUsers = Object.values(
                        analyticsData?.usersByDay || {}
                      ).reduce((sum, count) => sum + count, 0);
                      const activePercentage = totalUsers
                        ? Math.round(
                            ((analyticsData?.activeUsers || 0) / totalUsers) *
                              100
                          )
                        : 0;
                      return `${activePercentage}% of total users`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Total Messages */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Messages
                    </h3>
                    <p className="text-sm text-gray-500">
                      Conversations processed
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {Object.values(analyticsData?.messagesByDay || {}).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  <span>
                    {(() => {
                      const today = new Date().toISOString().split("T")[0];
                      const yesterday = new Date(Date.now() - 86400000)
                        .toISOString()
                        .split("T")[0];
                      const todayMessages =
                        analyticsData?.messagesByDay?.[today] || 0;
                      const yesterdayMessages =
                        analyticsData?.messagesByDay?.[yesterday] || 0;
                      const increase = yesterdayMessages
                        ? Math.round(
                            ((todayMessages - yesterdayMessages) /
                              yesterdayMessages) *
                              100
                          )
                        : 0;
                      return `${increase}% increase`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
            {/* Profile Impression Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-4">
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center space-x-2">
                    <span className="inline-block w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center"></span>
                    <span className="text-sm font-medium text-gray-700">
                      Chats Created
                    </span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="inline-block w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"></span>
                    <span className="text-sm font-medium text-gray-700">
                      AI Prompts
                    </span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <span className="inline-block w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center"></span>
                    <span className="text-sm font-medium text-gray-700">
                      New Users
                    </span>
                  </span>
                </div>
                <select className="text-sm border-gray-200 rounded-md bg-gray-50">
                  <option>Past Year</option>
                  <option>Past 6 Months</option>
                  <option>Past Month</option>
                </select>
              </div>
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={profileImpressionData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    barCategoryGap={16}
                  >
                    <defs>
                      <linearGradient
                        id="coverLetterGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#fdba74" />
                        <stop offset="100%" stopColor="#fb923c" />
                      </linearGradient>
                      <linearGradient
                        id="resumeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                      <linearGradient
                        id="careerPathGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#7dd3fc" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 13, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => value}
                      allowDecimals={false}
                      tick={{ fontSize: 13, fill: "#6366f1" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "AI Calls",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6366f1",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => value}
                      allowDecimals={false}
                      tick={{ fontSize: 13, fill: "#ec4899" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Tokens",
                        angle: 90,
                        position: "insideRight",
                        fill: "#ec4899",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      formatter={(value) => value.toLocaleString()}
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 14,
                        boxShadow: "0 4px 24px 0 rgba(16, 30, 54, 0.12)",
                      }}
                    />
                    <Bar
                      dataKey="coverLetter"
                      stackId="a"
                      name="AI Prompts"
                      fill="url(#coverLetterGradient)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="left"
                    />
                    <Bar
                      dataKey="resume"
                      stackId="a"
                      name="Chats"
                      fill="url(#resumeGradient)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="left"
                    />
                    <Bar
                      dataKey="careerPath"
                      stackId="a"
                      name="Productivity"
                      fill="url(#careerPathGradient)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="left"
                    />
                    <Bar
                      dataKey="users"
                      stackId="a"
                      name="New Users"
                      fill="#6366f1"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="left"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* API Calls & Tokens Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-4 mt-6">
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                    A
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">
                    AI Calls & Tokens by Month
                  </h2>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Monthly totals of AI requests and tokens used
              </p>
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={apiTokenChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    barCategoryGap={8}
                    barSize={40}
                  >
                    <defs>
                      <linearGradient
                        id="apiCallsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <linearGradient
                        id="tokensGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f472b6" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 13, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(value) => value}
                      allowDecimals={false}
                      tick={{ fontSize: 13, fill: "#6366f1" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "AI Calls",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#6366f1",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => value}
                      allowDecimals={false}
                      tick={{ fontSize: 13, fill: "#ec4899" }}
                      axisLine={false}
                      tickLine={false}
                      label={{
                        value: "Tokens",
                        angle: 90,
                        position: "insideRight",
                        fill: "#ec4899",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      formatter={(value) => value.toLocaleString()}
                      contentStyle={{
                        borderRadius: 12,
                        fontSize: 14,
                        boxShadow: "0 4px 24px 0 rgba(16, 30, 54, 0.12)",
                      }}
                    />
                    <Bar
                      dataKey="apiCalls"
                      name="AI Calls"
                      fill="url(#apiCallsGradient)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="left"
                    />
                    <Bar
                      dataKey="tokens"
                      name="Tokens"
                      fill="url(#tokensGradient)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      yAxisId="right"
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 14, paddingTop: 8 }}
                      iconType="circle"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-8">
            {/* Top Regions Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Top Regions
                  </h3>
                  <p className="text-sm text-gray-500">
                    User distribution by location
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                {userLocations
                  .sort((a, b) => (b.count || 0) - (a.count || 0))
                  .slice(0, 3)
                  .map((location, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                          <MapPinIcon className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {location.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {location.count || 1} users
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-indigo-600">
                        {analyticsData?.usersByDay
                          ? Math.round(
                              ((location.count || 1) /
                                Object.values(analyticsData.usersByDay).reduce(
                                  (sum, count) => sum + count,
                                  0
                                )) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Analytics Section - Only shown when analytics is active */}
            {activeSection === "analytics" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Your Profile
                    </h3>
                    <p className="text-sm text-gray-500">
                      Account information and activity
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* User Profile */}
                  <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                        {userData.firstName?.[0] || userData.email?.[0] || "U"}
                        {userData.lastName?.[0] || ""}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-indigo-900">
                          {userData.firstName} {userData.lastName}
                        </div>
                        <div className="text-sm text-indigo-600">
                          {userData.email}
                        </div>
                        <div className="text-xs text-indigo-500 mt-1">
                          @{userData.displayName} • {userData.type}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Account Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Member Since
                            </div>
                            <div className="text-xs text-gray-500">
                              Account creation date
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {userData.createdAt
                            ? userData.createdAt
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Location
                            </div>
                            <div className="text-xs text-gray-500">
                              Current coordinates
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {userData.location.lat.toFixed(4)},{" "}
                          {userData.location.lng.toFixed(4)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                            <PhoneIcon className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Phone Number
                            </div>
                            <div className="text-xs text-gray-500">
                              Contact information
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">
                          {userData.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Session Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Last Login
                            </div>
                            <div className="text-xs text-gray-500">
                              Session start time
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-orange-600">
                          {userData.lastLogin
                            ? userData.lastLogin
                                .toDate()
                                .toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                            <BellIcon className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Notifications
                            </div>
                            <div className="text-xs text-gray-500">Status</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {userData.notifications ? "Enabled" : "Disabled"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <UserCircleIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Account Status
                            </div>
                            <div className="text-xs text-gray-500">
                              Current state
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-blue-600 capitalize">
                          {userData.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section - Only shown when settings is active */}
            {activeSection === "settings" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Profile Settings
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update your account information
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="border-b border-gray-100 pb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={userData.firstName}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={userData.lastName}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={userData.displayName}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              displayName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={userData.phoneNumber}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              phoneNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Settings */}
                  <div className="border-b border-gray-100 pb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                      Location
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={userData.location.lat}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              location: {
                                ...userData.location,
                                lat: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={userData.location.lng}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              location: {
                                ...userData.location,
                                lng: parseFloat(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">
                      Notifications
                    </h4>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userData.notifications}
                          onChange={(e) =>
                            setUserData({
                              ...userData,
                              notifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                          Enable Notifications
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={() => {
                        // Save changes logic here
                        alert("Changes saved successfully!");
                      }}
                      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SlimFooter />
    </div>
  );
};

export default DashboardAdmin;
