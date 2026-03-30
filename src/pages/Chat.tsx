import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import { sendWebMessage } from "../services/messageApi";
import { getExistingLifeResume } from "../services/lifeResumeApi";
import {
  Search,
  MessageCircle,
  Star,
  Users,
  Settings,
  RefreshCw,
  Send,
  Image,
  Mic,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Edit3,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar?: string;
}

export default function Chat() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [currentLifeResume, setCurrentLifeResume] = useState<any>(null);
  const [showLifeResumeGenerator, setShowLifeResumeGenerator] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Focus on input function
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when AI typing changes
  useEffect(() => {
    if (aiTyping) {
      scrollToBottom();
    }
  }, [aiTyping]);

  // Focus input when component mounts or when AI stops typing
  useEffect(() => {
    if (!aiTyping && !isLoading) {
      focusInput();
    }
  }, [aiTyping, isLoading]);

  // Mock chat data for sidebar
  const chats: Chat[] = useMemo(
    () => [
      {
        id: "1",
        name: currentLifeResume?.name || "SwanAI",
        lastMessage:
          messages.length > 0
            ? messages[messages.length - 1].content
            : currentLifeResume?.welcomeMessage ||
              "Hey there! I'm your companion. What's on your mind today?",
        timestamp:
          messages.length > 0
            ? new Date(
                messages[messages.length - 1].timestamp
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "15:08",
        unreadCount: 0,
        avatar: currentLifeResume?.avatarUrl || "/images/punkgirl.png",
      },
      {
        id: "2",
        name: "Anna Johnson",
        lastMessage: "Thanks for the help with the project!",
        timestamp: "09:15",
        unreadCount: 4,
      },
      {
        id: "3",
        name: "Brian Carter",
        lastMessage: "Let's schedule a meeting for next week",
        timestamp: "09:22",
        unreadCount: 0,
      },
      {
        id: "4",
        name: "David Brown",
        lastMessage: "The presentation went great!",
        timestamp: "08:45",
        unreadCount: 1,
      },
      {
        id: "5",
        name: "Henry Moore",
        lastMessage: "Can you review the document?",
        timestamp: "08:30",
        unreadCount: 5,
      },
      {
        id: "6",
        name: "Steve Evans",
        lastMessage: "Looking forward to our collaboration",
        timestamp: "08:15",
        unreadCount: 8,
      },
    ],
    [currentLifeResume, messages]
  );

  const [activeChat, setActiveChat] = useState("1");

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      const formattedMessages = mapHistoryToMessages(data.history || []);
      setMessages(formattedMessages);
    });

    return () => unsubscribe();
  }, [user]);

  // Check if life resume matches current AI settings when userData changes
  useEffect(() => {
    if (userData && currentLifeResume) {
      checkLifeResumeMatch();
    }
  }, [userData, currentLifeResume]);

  useEffect(() => {
    console.log("UserData changed:", userData);
    if (userData && userData.profile?.personality && userData.profile?.relationship) {
      console.log(
        "Loading life resume with:",
        userData.profile.personality,
        userData.profile.relationship
      );
      loadLifeResume();
    } else {
      console.log(
        "Missing required fields - personality:",
        userData?.profile?.personality,
        "relationship:",
        userData?.profile?.relationship
      );
    }
  }, [userData]);

  // Check for life resume updates when the page becomes visible
  useEffect(() => {
    if (!userData || !userData.profile?.personality || !userData.profile?.relationship) return;

    const checkForLifeResumeUpdates = async () => {
      try {
        const latestLifeResume = await getExistingLifeResume(
          userData.profile.personality,
          userData.profile.relationship,
          user!.uid
        );

        if (latestLifeResume && latestLifeResume.id) {
          // Check if this is a different life resume than what we currently have
          if (
            !currentLifeResume ||
            currentLifeResume.id !== latestLifeResume.id
          ) {
            console.log("🔄 New life resume detected - reloading");
            await loadLifeResume();
          }
        }
      } catch (error) {
        console.error("Error checking for life resume updates:", error);
      }
    };

    // Check when page becomes visible (user navigates back to chat)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForLifeResumeUpdates();
      }
    };

    // Check when window gains focus
    const handleFocus = () => {
      checkForLifeResumeUpdates();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Check immediately when component mounts
    checkForLifeResumeUpdates();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [userData, user, currentLifeResume]);

  useEffect(() => {
    console.log("Current life resume changed:", currentLifeResume);
  }, [currentLifeResume]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user!.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Loaded user data from Firestore:", data);
        console.log("Available fields:", Object.keys(data));

        if (!data.profile?.personality || !data.profile?.relationship) {
          const normalizedProfile = {
            personality: data.profile?.personality || "BoJackHorseman",
            relationship: data.profile?.relationship || "Friend",
          };
          await updateDoc(doc(db, "users", user!.uid), {
            profile: {
              ...(data.profile || {}),
              ...normalizedProfile,
            },
          });
          setUserData({
            ...data,
            profile: {
              ...(data.profile || {}),
              ...normalizedProfile,
            },
          });
        } else {
          setUserData(data);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadLifeResume = async () => {
    try {
      console.log("=== LOADING LIFE RESUME ===");
      console.log("User data:", userData);
      console.log("User ID:", user!.uid);
      // Get the user's life resume (single resume per user)
      const lifeResume = await getExistingLifeResume(
        userData.profile?.personality,
        userData.profile?.relationship,
        user!.uid
      );

      console.log("Life resume result:", lifeResume);
      console.log("Life resume ID:", lifeResume?.id);

      if (lifeResume && lifeResume.id) {
        console.log("✅ Life resume found with ID:", lifeResume.id);
        console.log("Setting current life resume:", lifeResume);
        console.log("Life resume avatar URL:", lifeResume.avatarUrl);

        // Check if this is a new life resume (different from current one)
        const isNewLifeResume =
          !currentLifeResume || currentLifeResume.id !== lifeResume.id;
        if (isNewLifeResume) {
          console.log(
            "🔄 New life resume detected - clearing conversation history"
          );
          setMessages([]); // Clear local messages immediately
        }

        setCurrentLifeResume(lifeResume);
        setShowLifeResumeGenerator(false);
        // Load conversation history if available, passing the life resume directly
        await loadConversationHistory(lifeResume);
      } else {
        console.log("❌ No life resume found for user, showing generator");
        setShowLifeResumeGenerator(true);
      }
    } catch (error) {
      console.error("Error loading life resume:", error);
      setShowLifeResumeGenerator(true);
    }
  };

  // Check if current life resume matches user's AI settings
  const checkLifeResumeMatch = () => {
    // Only check for match if we have both currentLifeResume and userData
    // If there's a life resume, we should use it regardless of current settings
    // The user can regenerate from the dashboard if they want to change settings
    if (currentLifeResume && userData) {
      console.log(
        "Life resume exists, using it regardless of current settings"
      );
      // Don't force regeneration - let the user decide from dashboard
    }
  };

  const mapHistoryToMessages = (history: any[]): Message[] => {
    const now = Date.now();
    return history
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim() !== ""
      )
      .map((item, index) => ({
        role: item.role,
        content: item.content,
        timestamp:
          typeof item.timestamp === "number"
            ? item.timestamp
            : now - (history.length - index) * 1000,
      }));
  };

  const loadConversationHistory = async (lifeResume?: any) => {
    try {
      console.log("Loading conversation history...");
      console.log("UserData:", userData);
      console.log("Current life resume:", currentLifeResume);
      console.log("Passed life resume:", lifeResume);

      const resumeToUse = lifeResume || currentLifeResume;

      if (!resumeToUse || !user) {
        console.log("No life resume or user, starting fresh");
        setMessages([]);
        return;
      }

      const userSnapshot = await getDoc(doc(db, "users", user.uid));
      if (userSnapshot.exists()) {
        const userFirestoreData = userSnapshot.data();
        const history = userFirestoreData.history || [];
        const formattedMessages = mapHistoryToMessages(history);
        setMessages(formattedMessages);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        console.log("No conversation history found, adding welcome message");
        if (messages.length === 0) {
          const welcomeMessage: Message = {
            role: "assistant",
            content: `Hey there! I'm ${
              resumeToUse.name
            }, your new ${resumeToUse.relationship.toLowerCase()}. I'm excited to get to know you! What's on your mind today?`,
            timestamp: Date.now(),
          };
          setMessages([welcomeMessage]);
          setTimeout(() => scrollToBottom(), 100);
        } else {
          console.log("Messages already exist, skipping welcome message");
        }
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
      setMessages([]);
    }
  };

  // Function to calculate realistic typing delay for a message
  const calculateTypingDelay = (message: string): number => {
    // Base typing speed: 200-300 WPM (words per minute) for humans
    // That's about 3.3-5 words per second
    const baseTypingSpeed = 4; // words per second (240 WPM)

    // Count words in the message
    const wordCount = message
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    // Calculate base time needed to type the message
    const baseTime = (wordCount / baseTypingSpeed) * 1000; // convert to milliseconds

    // Add random variation to make it feel more human (50% faster to 50% slower)
    const variation = 0.5 + Math.random(); // 0.5 to 1.5 multiplier

    // Add thinking time (humans pause to think)
    const thinkingTime = Math.random() * 2000; // 0-2 seconds of thinking

    // Calculate final delay
    const finalDelay = Math.max(
      1000,
      Math.min(8000, baseTime * variation + thinkingTime)
    );

    console.log(
      `🎯 CHAT: Typing delay calculation for "${message}": ${wordCount} words, baseTime: ${baseTime.toFixed(
        0
      )}ms, variation: ${variation.toFixed(
        2
      )}x, thinking: ${thinkingTime.toFixed(0)}ms, final: ${finalDelay.toFixed(
        0
      )}ms`
    );

    return finalDelay;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendWebMessage(user!.uid, inputMessage.trim());

      if (response.success && response.message) {
        setAiTyping(true);
        const typingDelay = calculateTypingDelay(response.message);
        setTimeout(() => {
          const assistantMessage: Message = {
            role: "assistant",
            content: response.message,
            timestamp: Date.now(),
          };
          setMessages([...updatedMessages, assistantMessage]);
          setAiTyping(false);
        }, typingDelay);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again in a moment.",
          timestamp: Date.now(),
        };
        const errorMessages = [...updatedMessages, errorMessage];
        setMessages(errorMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (showLifeResumeGenerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Companion
            </h2>
            <p className="text-gray-600">
              Set up your personalized companion to start chatting
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Dashboard to Set Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="px-4 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <Search className="w-5 h-5 text-gray-400" />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 mb-4">
              {["All messages", "Unread", "Friends"].map((tab, index) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    index === 0
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-shadow">
              ✨ Chat smarter with SwanAI!
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeChat === chat.id
                    ? "bg-purple-50 border-r-2 border-purple-500"
                    : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {chat.avatar ? (
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold text-sm">
                        {chat.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {chat.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat Header */}
          <div className="px-4 py-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentLifeResume?.avatarUrl || "/images/punkgirl.png"}
                  alt="Profile Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.log("Avatar failed to load, using fallback");
                    // Fallback to default avatar if generated avatar fails to load
                    e.currentTarget.src = "/images/punkgirl.png";
                  }}
                  onLoad={() => {
                    console.log(
                      "Avatar loaded successfully:",
                      currentLifeResume?.avatarUrl
                    );
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentLifeResume?.name || "SwanAI"}
                  </h1>
                  <p className="text-gray-600">
                    {currentLifeResume?.personality
                      ? `${currentLifeResume.personality}`
                      : "Chat with your companion"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {userData?.type === "free" && (
                  <button className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
                    <Zap className="w-4 h-4" />
                    <span>Upgrade</span>
                  </button>
                )}
                <button
                  onClick={() => navigate("/dashboard?tab=Settings")}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={loadLifeResume}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Refresh companion"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Star className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6"
          >
            {/* Date Header */}
            <div className="text-center">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Today 15:08
              </span>
            </div>

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } items-start space-x-3`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {currentLifeResume?.avatarUrl ? (
                      <img
                        src={currentLifeResume.avatarUrl}
                        alt="AI Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the image and show fallback icon if avatar fails to load
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center ${
                        currentLifeResume?.avatarUrl ? "hidden" : ""
                      }`}
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-black text-white"
                      : "bg-purple-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {message.role === "assistant" && (
                  <div className="flex flex-col space-y-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {aiTyping && (
              <div className="flex justify-start items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="bg-purple-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="px-4 py-6 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Let's ask SwanAI..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
