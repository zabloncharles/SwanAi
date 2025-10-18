import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { sendWebMessage } from "../../services/messageApi";
import { getAvatarUrl } from "../../services/avatarApi";
import { generateDayInLifeDescription } from "../../services/dayInLifeService";
import { getExistingLifeResume } from "../../services/lifeResumeApi";
import LifeResumeGenerator from "./LifeResumeGenerator";
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
    name?: string;
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
  const [currentLifeResume, setCurrentLifeResume] = useState<any>(null);
  const [showLifeResumeGenerator, setShowLifeResumeGenerator] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality disabled as requested

  const handleResumeGenerated = (resume: any) => {
    setCurrentLifeResume(resume);
    setShowLifeResumeGenerator(false);
    // Optionally send a welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hey there! I'm ${
          resume.name
        }, your new ${aiPersonality?.relationship.toLowerCase()}. I'm excited to get to know you! What's on your mind today?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleResumeError = (error: string) => {
    console.error("Life resume generation error:", error);
    // You could show a toast notification here
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

    // Load user data for location
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }

    // Check for existing AI life resume
    let lifeResume: any = null;
    try {
      lifeResume = await getExistingLifeResume(
        personality.personality,
        personality.relationship,
        userId
      );
      if (lifeResume) {
        setCurrentLifeResume(lifeResume);
        setShowLifeResumeGenerator(false);
      } else {
        setShowLifeResumeGenerator(true);
      }
    } catch (error) {
      console.error("Error checking for life resume:", error);
      setShowLifeResumeGenerator(true);
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

  // Auto-scroll disabled as requested by user

  // Load life resume when component mounts or AI personality changes
  useEffect(() => {
    const loadLifeResume = async () => {
      if (aiPersonality?.personality && aiPersonality?.relationship && userId) {
        try {
          const lifeResume = await getExistingLifeResume(
            aiPersonality.personality,
            aiPersonality.relationship,
            userId
          );
          if (lifeResume) {
            setCurrentLifeResume(lifeResume);
            setShowLifeResumeGenerator(false);
          } else {
            setShowLifeResumeGenerator(true);
          }
        } catch (error) {
          console.error("Error loading life resume:", error);
          setShowLifeResumeGenerator(true);
        }
      }
    };

    loadLifeResume();
  }, [aiPersonality?.personality, aiPersonality?.relationship, userId]);

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

    // Minimum delay of 1 second, maximum of 8 seconds
    return Math.max(1000, Math.min(8000, baseTime * variation + thinkingTime));
  };

  // Function to split long messages into multiple bubbles for more human-like texting
  const splitMessageIntoBubbles = (message: string): string[] => {
    // Split by sentences (periods, exclamation marks, question marks)
    const sentences = message.split(/([.!?]+)/).filter((s) => s.trim());

    // Rejoin sentences with their punctuation
    const completeSentences: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      if (sentences[i] && sentences[i + 1]) {
        completeSentences.push((sentences[i] + sentences[i + 1]).trim());
      } else if (sentences[i]) {
        completeSentences.push(sentences[i].trim());
      }
    }

    // If only 1-2 sentences, return as single message
    if (completeSentences.length <= 2) {
      return [message];
    }

    // Group sentences into multiple bubbles (2-3 sentences per bubble)
    const bubbles: string[] = [];
    for (let i = 0; i < completeSentences.length; i += 2) {
      const bubble = completeSentences.slice(i, i + 2).join(" ");
      if (bubble.trim()) {
        bubbles.push(bubble.trim());
      }
    }

    return bubbles.length > 1 ? bubbles : [message];
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
        // Scroll to show "seen" indicator disabled
      }, 1000);

      // Calculate realistic response time
      const responseTime = calculateResponseTime(message, messages.length);

      // Show AI typing indicator after "seen" delay
      setTimeout(() => {
        setAiTyping(true);
        // Scroll to show typing indicator disabled
      }, 1500);

      // Send message to API with delay
      setTimeout(async () => {
        try {
          const response = await sendWebMessage(userId, message);

          // Check if response message is empty or invalid
          if (!response.message || response.message.trim().length === 0) {
            console.error("Received empty response from API:", response);
            throw new Error("Received empty response from AI");
          }

          // Split long AI responses into multiple bubbles for more human-like texting
          const messageBubbles = splitMessageIntoBubbles(response.message);
          console.log("🎯 MESSAGES: Message split into bubbles:", messageBubbles.length, "bubbles");
          messageBubbles.forEach((bubble, index) => {
            const wordCount = bubble.trim().split(/\s+/).filter(word => word.length > 0).length;
            console.log(`🎯 MESSAGES: Bubble ${index + 1}: "${bubble}" (${wordCount} words)`);
          });

          // Add first bubble with realistic typing delay
          const firstTypingDelay = calculateTypingDelay(messageBubbles[0]);
          const firstWordCount = messageBubbles[0].trim().split(/\s+/).filter(word => word.length > 0).length;
          console.log(`🎯 MESSAGES: First bubble delay: ${firstTypingDelay}ms for ${firstWordCount} words`);
          
          setTimeout(() => {
            console.log("🎯 MESSAGES: First bubble appearing now");
            const firstBubble: Message = {
              role: "assistant",
              content: messageBubbles[0],
              timestamp: Date.now(),
              povImageUrl: response.povImageUrl,
            };

            setMessages((prev) => [...prev, firstBubble]);

            // If there are more bubbles, keep typing indicator visible
            if (messageBubbles.length === 1) {
              console.log("🎯 MESSAGES: Single bubble response - hiding typing indicator");
              setAiTyping(false); // Only hide typing indicator if this is the last bubble
            } else {
              console.log("🎯 MESSAGES: Multiple bubbles - keeping typing indicator visible");
            }
          }, firstTypingDelay);

          // Add remaining bubbles with realistic typing delays
          if (messageBubbles.length > 1) {
            let cumulativeDelay = firstTypingDelay; // Start from the first bubble's delay
            for (let i = 1; i < messageBubbles.length; i++) {
              const typingDelay = calculateTypingDelay(messageBubbles[i]);
              const wordCount = messageBubbles[i].trim().split(/\s+/).filter(word => word.length > 0).length;
              cumulativeDelay += typingDelay;
              
              console.log(`🎯 MESSAGES: Bubble ${i + 1} scheduled for ${cumulativeDelay}ms (${typingDelay}ms delay for ${wordCount} words)`);

              setTimeout(() => {
                console.log(`🎯 MESSAGES: Bubble ${i + 1} appearing now`);
                const nextBubble: Message = {
                  role: "assistant",
                  content: messageBubbles[i],
                  timestamp: Date.now(),
                };
                setMessages((prev) => [...prev, nextBubble]);
                
                // Hide typing indicator only if this is the last bubble
                if (i === messageBubbles.length - 1) {
                  console.log("🎯 MESSAGES: Last bubble appeared - hiding typing indicator");
                  setAiTyping(false);
                } else {
                  console.log(`🎯 MESSAGES: Bubble ${i + 1} appeared - keeping typing indicator visible for next bubble`);
                }
              }, cumulativeDelay);
            }
          }
        } catch (error) {
          console.error("Error sending message:", error);
          // Remove the user message if sending failed
          setMessages((prev) => prev.slice(0, -1));

          // Add an error message to show the user what happened
          const errorMessage: Message = {
            role: "assistant",
            content:
              "Sorry, I'm having trouble responding right now. Please try again in a moment.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);

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

  // Show life resume generator if no resume exists
  if (showLifeResumeGenerator && aiPersonality) {
    return (
      <div className="flex h-full bg-white">
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
              <p>Create your AI companion to start chatting</p>
            </div>
          </div>
        </div>

        {/* Right Column - Life Resume Generator */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <LifeResumeGenerator
              userId={userId}
              personality={aiPersonality.personality}
              relationship={aiPersonality.relationship}
              userLocation={userData?.location}
              onResumeGenerated={handleResumeGenerated}
              onError={handleResumeError}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Left Column - Messages List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer bg-gray-50">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {(currentLifeResume?.name || "A")[0]}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentLifeResume?.name || "Your Companion"}
                  </p>
                  <p className="text-xs text-green-600">3/8/24</p>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {messages.length > 0 && messages[messages.length - 1]?.content
                    ? messages[messages.length - 1].content.substring(0, 30) +
                      "..."
                    : "Start a conversation"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {(currentLifeResume?.name || "A")[0]}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {currentLifeResume?.name || "Your Companion"}
              </h3>
              <p className="text-xs text-gray-500">Last seen hour ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
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
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
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
                Start chatting with{" "}
                {currentLifeResume?.name || "your companion"} to see your
                conversation history
              </p>
            </div>
          ) : (
            <>
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-xs text-gray-500 bg-white">
                  {new Date().toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      message.role === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {currentLifeResume?.name || "Companion"},{" "}
                          {new Date(
                            message.timestamp || Date.now()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-purple-100 text-gray-900"
                          : "bg-pink-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
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
                    </div>
                    {message.role === "user" && (
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(
                            message.timestamp || Date.now()
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center ml-2 order-1">
                      <span className="text-white text-xs font-semibold">
                        U
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {aiTyping && (
                <div className="flex justify-start">
                  <div className="bg-pink-100 text-gray-900 px-4 py-2 rounded-lg">
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
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-8V6a3 3 0 116 0v1M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z"
                />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type a message"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const content = e.currentTarget.value.trim();
                    if (content && !sending && !aiTyping) {
                      handleSendMessage(content);
                      e.currentTarget.value = "";
                    }
                  }
                }}
                disabled={sending || aiTyping}
              />
            </div>
            <div className="flex items-center space-x-1">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
