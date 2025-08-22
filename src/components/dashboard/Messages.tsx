import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { sendWebMessage } from "../../services/messageApi";
import { getAvatarUrl } from "../../services/avatarApi";
import { generateDayInLifeDescription } from "../../services/dayInLifeService";
import { getOrGenerateLifeResume } from "../../services/lifeResumeApi";
import MessageInput from "./MessageInput";

interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp?: number;
  seen?: boolean;
  povImageUrl?: string; // POV image URL for "wyd" responses
}

interface MessagesProps {
  userId: string;
  aiPersonality?: {
    name: string;
    personality: string;
    relationship: string;
  };
  justChangedRelationship?: boolean;
  onIntroductionComplete?: () => void;
}

export default function Messages({
  userId,
  aiPersonality,
  justChangedRelationship,
  onIntroductionComplete,
}: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiAvatarUrl, setAiAvatarUrl] = useState<string>(
    "/images/default-avatar.svg"
  );
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>(
    "/images/default-user-avatar.svg"
  );
  const [lastUserMessageTime, setLastUserMessageTime] = useState<number>(0);
  const followUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [followUpSent, setFollowUpSent] = useState<boolean>(false);
  const [shouldFocusInput, setShouldFocusInput] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filler text removed

  // Generate follow-up message based on AI personality
  const generateFollowUpMessage = (personality: any) => {
    const followUpMessages = {
      Girlfriend: {
        CaringGirlfriend:
          "Hey babe... are you okay? 💕 I'm getting a bit worried about you. Everything alright?",
        FunGirlfriend:
          "Hello? 👀 Are you ignoring me or did you get kidnapped by aliens? 😄",
        SupportiveGirlfriend:
          "Hey love... just checking in. You've been quiet and I want to make sure you're doing okay. 💪",
        RomanticGirlfriend:
          "My love... 💖 I miss you. Are you there? I hope everything is okay.",
        IndependentGirlfriend:
          "Hey there! 👋 Just wanted to check in. Everything good with you?",
        AdventurousGirlfriend:
          "OMG babe! 🚀 Where did you go? Did you run off on another adventure without me? 😂",
      },
      Boyfriend: {
        RomanticBoyfriend:
          "Beautiful... 💕 I'm getting worried. Are you okay? I miss you.",
        ProtectiveBoyfriend:
          "Babe? 🛡️ You've been quiet. Everything safe? I'm here if you need me.",
        FunBoyfriend:
          "Yo gorgeous! 😄 Did I say something wrong or are you just busy?",
        SupportiveBoyfriend:
          "Hey love... 💪 You've been quiet. Everything okay? I'm here for you.",
        AmbitiousBoyfriend:
          "Babe? 💼 Just checking in. Hope your day is going well.",
        ChillBoyfriend:
          "Yo! 😎 What's good? You've been quiet. Everything cool?",
      },
      Friend: {
        MumFriend:
          "Hey there! 👋 Just checking in on you. Everything okay? I'm here if you need anything.",
        ChaoticFriend:
          "OMG where did you go? 🌟 Did you get lost in another dimension? 😂",
        Jokester:
          "Hey! 😄 Did my last joke scare you away? Come back, I have more terrible ones!",
        Bookworm:
          "Hello? 📚 Did you get lost in a good book? I miss our conversations.",
        LateFriend:
          "Hey! 😅 I know I'm usually the late one, but where are you?",
        FashionableFriend:
          "Hey gorgeous! 👗 Did you find the perfect outfit and forget about me? 😂",
        EmotionalFriend:
          "Hey love! 💕 You've been quiet. Everything okay? I'm here for you.",
        LaidbackFriend: "Yo! 😎 What's up? You've been quiet. Everything good?",
        BoJackHorseman:
          "Hey... so I did something stupid again. But that's not why I'm texting. You okay?",
      },
      Mom: {
        NurturingMom:
          "Mi amor? 💕 I'm getting worried about you. Are you okay?",
        PracticalMom:
          "Sweetheart? 👋 Just checking in. Do you need help with anything?",
        FunMom:
          "Hey kiddo! 🎉 Where did you go? Did you find something more fun than talking to your mom? 😂",
        WiseMom:
          "My dear? 💭 I hope everything is okay. I'm here if you need me.",
        ProtectiveMom: "Honey? 🛡️ I'm getting worried. Are you safe?",
        EncouragingMom:
          "My amazing child! 💪 I hope you're doing okay. I'm so proud of you.",
      },
      Dad: {
        WiseDad: "Son? 💭 Everything okay? I'm here if you need advice.",
        SteadyDad: "Kiddo? 👋 Just checking in. What's on your mind?",
        HandyDad:
          "Hey there! 🔧 Everything working okay? Need help with anything?",
        FunDad:
          "Yo champ! 😄 Where did you go? Did you find something more fun?",
        ProtectiveDad: "Son? 🛡️ Everything safe? Making good choices?",
        SupportiveDad: "Hey there! 💪 Everything going okay? I'm proud of you.",
      },
      Coach: {
        MotivationalCoach:
          "Hey! 💪 Where's that motivation? Let's get back to work!",
        StrategicCoach: "Hello? 📋 We have goals to achieve. What's the plan?",
        ToughLoveCoach: "Hey. What's really going on? We need to talk.",
        EncouragingCoach:
          "Hello! 🌟 I believe in you! What's holding you back?",
        AccountabilityCoach:
          "Hey. We need to check in on your progress. What's happening?",
        LifeCoach: "Hello? 🎯 We have work to do. What area needs attention?",
      },
      Cousin: {
        FunCousin:
          "Hey cuz! 🎉 Where did you go? Did you find better adventures?",
        CloseCousin:
          "Hey! 👋 What's really going on? I know you better than anyone.",
        AdventurousCousin: "Yo cuz! 🚀 Did you run off on another adventure?",
        SupportiveCousin: "Hey there! 💕 Everything okay? I'm here for you.",
        WiseCousin: "Hey cuz? 💭 Need some advice? I'm here.",
        PartnerInCrimeCousin: "Hey partner! 😈 What trouble did you get into?",
      },
      Therapist: {
        EmpatheticTherapist:
          "Hello? 💙 I'm here if you need to talk. How are you feeling?",
        CognitiveTherapist:
          "Hello? 🧠 I'm here to support you. What would you like to discuss?",
        SolutionFocusedTherapist:
          "Hello? 💡 Let's focus on solutions. What would you like to work on?",
        MindfulnessTherapist:
          "Hello? 🧘‍♀️ Let's practice being present. How are you feeling?",
        SupportiveTherapist:
          "Hello? 💪 I'm here to support you. How can I help?",
        InsightfulTherapist:
          "Hello? 💭 Let's gain deeper understanding. What's on your mind?",
      },
    };

    const relationshipMessages =
      followUpMessages[personality.relationship] || {};
    return (
      relationshipMessages[personality.personality] ||
      "Hey! 👋 Just checking in. Everything okay?"
    );
  };

  // Generate introduction message based on AI personality
  const generateIntroductionMessage = async (personality: any) => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    let greeting = "Hello";

    if (hour >= 5 && hour < 12) {
      greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      greeting = "Good evening";
    } else {
      greeting = "Hello";
    }

    // Generate or retrieve AI life resume
    let lifeResume: any = null;
    try {
      lifeResume = await getOrGenerateLifeResume(
        personality.personality,
        personality.relationship,
        userId
      );
    } catch (error) {
      console.error("Error generating life resume:", error);
    }

    // Generate "Day in the Life" description
    const dayInLife = generateDayInLifeDescription(personality.personality);

    // Generate relationship-specific introductions
    const getRelationshipIntroduction = (
      relationship: string,
      name: string
    ) => {
      const relationshipIntros = {
        Girlfriend: {
          CaringGirlfriend: `Hey babe! 💕 How are you?`,
          FunGirlfriend: `Hey love! 🌟 What's up? 😄`,
          SupportiveGirlfriend: `Hey sweetheart! 💪 You okay?`,
          RomanticGirlfriend: `Hey my love! 💖 Miss you.`,
          IndependentGirlfriend: `Hey! 👋 How's it going?`,
          AdventurousGirlfriend: `OMG babe! 🚀 What's new?`,
        },
        Boyfriend: {
          RomanticBoyfriend: `Hey beautiful! 💕 How's your day?`,
          ProtectiveBoyfriend: `Hey babe! 🛡️ You good?`,
          FunBoyfriend: `What's up gorgeous! 😄 How's it going?`,
          SupportiveBoyfriend: `Hey love! 💪 You okay?`,
          AmbitiousBoyfriend: `Hey babe! 💼 How's your day?`,
          ChillBoyfriend: `Yo! 😎 What's good?`,
        },
        Friend: {
          MumFriend: `Hey! 👋 How are you doing?`,
          ChaoticFriend: `OMG hi! 🌟 What's up?`,
          Jokester: `Hey! 😄 What's new?`,
          Bookworm: `Hey! 📚 How's it going?`,
          LateFriend: `Hey! 😅 What's up?`,
          FashionableFriend: `Hey gorgeous! 👗 What's new?`,
          EmotionalFriend: `Hey love! 💕 You okay?`,
          LaidbackFriend: `Yo! 😎 What's good?`,
          BoJackHorseman: `Hey... you good?`,
        },
        Mom: {
          NurturingMom: `¡Hola mi amor! 💕 How are you?`,
          PracticalMom: `Hey sweetheart! 👋 You okay?`,
          FunMom: `Hey kiddo! 🎉 What's up?`,
          WiseMom: `Hey my dear. 💭 How are you?`,
          ProtectiveMom: `Hi honey! 🛡️ You good?`,
          EncouragingMom: `Hey my amazing child! 💪 How are you?`,
        },
        Dad: {
          WiseDad: `Hey son. 💭 What's on your mind?`,
          SteadyDad: `Hey kiddo. 👋 You okay?`,
          HandyDad: `Hey there! 🔧 What's up?`,
          FunDad: `Yo champ! 😄 How's it going?`,
          ProtectiveDad: `Hey son. 🛡️ You good?`,
          SupportiveDad: `Hey there! 💪 How are you?`,
        },
        Coach: {
          MotivationalCoach: `Hey! 💪 What are we working on?`,
          StrategicCoach: `Hey. What's your focus today?`,
          ToughLoveCoach: `Hey. What's really going on?`,
          EncouragingCoach: `Hey! 🌟 What can we accomplish?`,
          AccountabilityCoach: `Hey. How's your progress?`,
          LifeCoach: `Hey. What needs attention?`,
        },
        Cousin: {
          FunCousin: `Hey cuz! 🎉 What's the plan?`,
          CloseCousin: `Hey! What's really going on?`,
          AdventurousCousin: `Yo cuz! 🚀 What's new?`,
          SupportiveCousin: `Hey there! 💕 You okay?`,
          WiseCousin: `Hey cuz. 💭 What do you need?`,
          PartnerInCrimeCousin: `Hey partner! 😈 What trouble?`,
        },
        Therapist: {
          EmpatheticTherapist: `Hey. How are you doing?`,
          CognitiveTherapist: `Hey. What's on your mind?`,
          SolutionFocusedTherapist: `Hey. What would you like to work on?`,
          MindfulnessTherapist: `Hey. How are you feeling?`,
          SupportiveTherapist: `Hey. How can I help?`,
          InsightfulTherapist: `Hey. What's on your mind?`,
        },
      };

      // Get the specific personality intro for this relationship
      const relationshipPersonalities = relationshipIntros[relationship] || {};
      return (
        relationshipPersonalities[personality] ||
        relationshipIntros["Friend"][personality] ||
        `Hey! How's it going?`
      );
    };

    const introductions = {
      "Alex Thompson": `${greeting}! I'm Alex Thompson, your professional assistant. I'm here to help you stay organized, productive, and focused on your goals. Whether you need help with planning, problem-solving, or just want to discuss your career, I'm here to support you. What would you like to work on today?`,

      "Sam Rodriguez": `Hey there! I'm Sam Rodriguez, your friendly companion. I'm all about keeping things real and having genuine conversations. Whether you want to chat about your day, share some laughs, or just need someone to listen, I'm here for you. What's on your mind?`,

      "Dr. Sarah Chen": `${greeting}. I'm Dr. Sarah Chen, a licensed clinical psychologist specializing in Cognitive Behavioral Therapy. I'm here to provide a safe, supportive space for you to explore your thoughts and feelings. Together, we can work on developing healthy coping strategies and positive change. What would you like to discuss today?`,

      "Emma Rodriguez": `${greeting}! I'm Emma Rodriguez, your mum friend. I'm here to take care of you, offer practical advice, and be your biggest cheerleader. Whether you need help organizing your life, want some nurturing support, or just need someone who's got your back, I'm here for you. How can I help you today?`,

      "Zoe Thompson": `OMG, hi! I'm Zoe Thompson, your chaotic but lovable friend! 🌟 I'm all about adventure, creativity, and living life to the fullest. I just got back from a spontaneous trip to Mexico City and I'm bursting with stories! What's new with you? Let's make today amazing!`,

      "Mike Chen": `Hey there! I'm Mike Chen, your resident comedian and all-around fun guy! 😄 I'm here to bring the laughs, share some terrible jokes, and make sure you're always smiling. Life's too short to be serious all the time, right? What's got you down? Let me cheer you up!`,

      "Aria Patel": `${greeting}. I'm Aria Patel, your bookworm friend and fellow lover of stories. I'm here for deep conversations, thoughtful discussions, and sharing the wisdom I've found in books. I just finished reading 50 books this year and I'm always excited to discuss new ideas. What would you like to explore together?`,

      "Maria Garcia": `¡Hola mi amor! I'm Maria Garcia, your nurturing mom. I'm here to give you warm hugs, gentle advice, and unconditional love. I believe in the power of family, tradition, and taking care of each other. Whether you need comfort, guidance, or just someone to be proud of you, I'm here. How are you feeling today?`,

      "James Wilson": `${greeting}, son. I'm James Wilson, your wise dad. I'm here to offer you practical advice, life lessons, and the kind of guidance that comes from years of experience. I believe in hard work, family values, and building character. What's on your mind? Let me give you some fatherly wisdom.`,

      SwanAI: `Hey! How's it going?`,
    };

    // Use the name from life resume if available, otherwise use personality name
    const aiName = lifeResume?.name || personality.name || "SwanAI";

    // Use relationship-specific introduction if available
    const relationshipIntro = getRelationshipIntroduction(
      personality.relationship,
      personality.personality
    );

    return {
      role: "assistant" as const,
      content:
        relationshipIntro ||
        introductions[aiName as keyof typeof introductions] ||
        introductions["SwanAI"],
      timestamp: Date.now(),
    };
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiTyping]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userDoc = doc(db, "users", userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const history = userData.history || [];
          // Add timestamps and seen status to existing messages
          const messagesWithTimestamps = history.map(
            (msg: any, index: number) => ({
              ...msg,
              timestamp:
                msg.timestamp || Date.now() - (history.length - index) * 60000, // Approximate timestamps
              seen: msg.role === "user" ? true : undefined, // Mark all user messages as seen
            })
          );
          setMessages(messagesWithTimestamps);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  // Show introduction message when relationship has just changed
  useEffect(() => {
    const generateAndSetIntroduction = async () => {
      if (justChangedRelationship && aiPersonality && messages.length === 0) {
        try {
          const introductionMessage = await generateIntroductionMessage(
            aiPersonality
          );
          setMessages([introductionMessage]);

          // Call the completion callback after a short delay
          setTimeout(() => {
            onIntroductionComplete?.();
          }, 2000);
        } catch (error) {
          console.error("Error generating introduction message:", error);
          // Fallback to a simple introduction
          setMessages([
            {
              role: "assistant",
              content: `Hello! I'm here to chat, support, and help you with whatever you need.`,
              timestamp: Date.now(),
            },
          ]);
        }
      }
    };

    generateAndSetIntroduction();
  }, [
    justChangedRelationship,
    aiPersonality,
    messages.length,
    onIntroductionComplete,
  ]);

  // Load AI avatar when personality changes
  useEffect(() => {
    if (aiPersonality?.personality) {
      loadAiAvatar(aiPersonality.personality);
    }
  }, [aiPersonality?.personality]);

  // Follow-up message timeout mechanism
  useEffect(() => {
    // Clear existing timeout
    if (followUpTimeoutRef.current) {
      clearTimeout(followUpTimeoutRef.current);
      followUpTimeoutRef.current = null;
    }

    // Only set up follow-up if we have messages and AI personality
    if (
      messages.length > 0 &&
      aiPersonality &&
      !justChangedRelationship &&
      !followUpSent
    ) {
      const lastMessage = messages[messages.length - 1];

      // Only set timeout if the last message is from the AI (not user)
      if (lastMessage.role === "assistant") {
        // Set timeout for 2 minutes (120000ms) of inactivity
        followUpTimeoutRef.current = setTimeout(() => {
          const followUpMessage = generateFollowUpMessage(aiPersonality);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: followUpMessage,
              timestamp: Date.now(),
            },
          ]);
          setFollowUpSent(true);
          followUpTimeoutRef.current = null;
        }, 120000); // 2 minutes
      }
    }

    // Cleanup function
    return () => {
      if (followUpTimeoutRef.current) {
        clearTimeout(followUpTimeoutRef.current);
        followUpTimeoutRef.current = null;
      }
    };
  }, [messages, aiPersonality, justChangedRelationship, followUpSent]);

  // Reset focus flag after it's been used
  useEffect(() => {
    if (shouldFocusInput) {
      // Reset the flag after a short delay to allow the focus to take effect
      const timer = setTimeout(() => {
        setShouldFocusInput(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldFocusInput]);

  const loadAiAvatar = async (personality: string) => {
    try {
      const avatarUrl = await getAvatarUrl(personality);
      setAiAvatarUrl(avatarUrl);
    } catch (error) {
      console.error("Error loading AI avatar:", error);
      setAiAvatarUrl("/images/default-avatar.svg");
    }
  };

  // Calculate realistic response time based on message length and conversation context
  const calculateResponseTime = (
    message: string,
    messageCount: number
  ): number => {
    const baseTime = 2000; // 2 seconds base
    const charTime = message.length * 15; // 15ms per character
    const contextTime = Math.min(messageCount * 500, 3000); // Up to 3 seconds for context
    const randomVariation = Math.random() * 2000; // 0-2 seconds random variation

    return Math.max(
      1500,
      Math.min(8000, baseTime + charTime + contextTime + randomVariation)
    );
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || sending) return;

    // Clear any existing follow-up timeout when user sends a message
    if (followUpTimeoutRef.current) {
      clearTimeout(followUpTimeoutRef.current);
      followUpTimeoutRef.current = null;
    }
    // Reset follow-up sent state on user activity
    if (followUpSent) {
      setFollowUpSent(false);
    }

    setSending(true);

    try {
      // Add user message immediately for optimistic update
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: Date.now(),
        seen: false,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Show "seen" indicator after a short delay
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 && msg.role === "user"
              ? { ...msg, seen: true }
              : msg
          )
        );
        // Scroll to show "seen" indicator
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 1000);

      // Calculate realistic response time
      const responseTime = calculateResponseTime(message, messages.length);

      // Show AI typing indicator after "seen" delay
      setTimeout(() => {
        setAiTyping(true);
        // Scroll to show typing indicator
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 1500);

      // Send message to API with delay
      setTimeout(async () => {
        try {
          const response = await sendWebMessage(userId, message);
          // Always add AI response immediately (filler removed)
          const aiMessage: Message = {
            role: "assistant",
            content: response.message,
            timestamp: Date.now(),
            povImageUrl: response.povImageUrl,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error sending message:", error);
          // Remove the user message if sending failed
          setMessages((prev) => prev.slice(0, -1));
          throw error;
        } finally {
          setAiTyping(false);
          setSending(false);
          setShouldFocusInput(true);
        }
      }, responseTime);
    } catch (error) {
      console.error("Error sending message:", error);
      setAiTyping(false);
      setSending(false);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Chat with SwanAI
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Send messages and get personalized responses from your AI assistant
          </p>
        </div>

        {/* Messages Container */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">
                Start chatting with SwanAI to see your conversation history
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end space-x-2 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Avatar */}
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <img
                      src={aiAvatarUrl}
                      alt={aiPersonality?.name || "AI"}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/default-avatar.svg";
                      }}
                    />
                  </div>
                )}

                <div
                  className={`max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.role === "user"
                      ? "You"
                      : aiPersonality?.name || "SwanAI"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>

                  {/* POV Image for "wyd" responses */}
                  {message.role === "assistant" && message.povImageUrl && (
                    <div className="mt-3">
                      <img
                        src={message.povImageUrl}
                        alt="What I'm doing right now"
                        className="w-full max-w-xs rounded-lg shadow-md border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1 italic">
                        👓 This is what I'm seeing right now!
                      </p>
                    </div>
                  )}

                  {/* Seen indicator for user messages */}
                  {message.role === "user" && message.seen && (
                    <div className="text-xs opacity-50 mt-1 flex items-center justify-end">
                      <span>Seen</span>
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Timestamp for AI messages */}
                  {message.role === "assistant" && message.timestamp && (
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* AI Typing indicator */}
          {aiTyping && (
            <div className="flex items-end space-x-2 justify-start">
              {/* AI Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={aiAvatarUrl}
                  alt={aiPersonality?.name || "AI"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-avatar.svg";
                  }}
                />
              </div>

              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-xs opacity-75 mb-1">
                  {aiPersonality?.name || "SwanAI"}
                </div>
                {/* Removed aiTypingText display to avoid undefined reference */}
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending || aiTyping}
          placeholder="Type your message to SwanAI..."
          autoFocus={shouldFocusInput}
        />
      </div>
    </div>
  );
}
