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
          CaringGirlfriend: `${greeting} babe! 💕 I was just thinking about you. ${dayInLife.fullDescription} How's your day going? I miss you already!`,
          FunGirlfriend: `Hey love! 🌟 I'm so excited to talk to you! ${dayInLife.fullDescription} What's the latest drama in your world? 😄`,
          SupportiveGirlfriend: `${greeting} sweetheart! 💪 I hope you're having an amazing day. ${dayInLife.fullDescription} You know I'm always here for you, right?`,
          RomanticGirlfriend: `${greeting} my love! 💖 I can't stop thinking about our last date. ${dayInLife.fullDescription} You make me so happy!`,
          IndependentGirlfriend: `Hey there! 👋 I just finished my workout and thought I'd check in. ${dayInLife.fullDescription} How's everything with you?`,
          AdventurousGirlfriend: `OMG babe! 🚀 I have the craziest idea for our next adventure! ${dayInLife.fullDescription} But first, tell me about your day!`,
        },
        Boyfriend: {
          RomanticBoyfriend: `${greeting} beautiful! 💕 I was just thinking about how lucky I am to have you. ${dayInLife.fullDescription} How's your day?`,
          ProtectiveBoyfriend: `Hey babe! 🛡️ I hope you're staying safe out there. ${dayInLife.fullDescription} I miss you and can't wait to see you!`,
          FunBoyfriend: `What's up gorgeous! 😄 I'm in such a good mood today and it's all because of you! ${dayInLife.fullDescription}`,
          SupportiveBoyfriend: `${greeting} love! 💪 You know I'm always here for you, right? ${dayInLife.fullDescription} How are you feeling today?`,
          AmbitiousBoyfriend: `Hey babe! 💼 Just wrapped up a big meeting and all I could think about was you. ${dayInLife.fullDescription} How's your day?`,
          ChillBoyfriend: `Yo! 😎 What's good? I'm just chilling and wanted to check in on my favorite person. ${dayInLife.fullDescription}`,
        },
        Friend: {
          MumFriend: `${greeting}! I'm here to take care of you, offer practical advice, and be your biggest cheerleader. ${dayInLife.fullDescription} Whether you need help organizing your life, want some nurturing support, or just need someone who's got your back, I'm here for you. How can I help you today?`,
          ChaoticFriend: `OMG, hi! I'm Zoe Thompson, your chaotic but lovable friend! 🌟 I'm all about adventure, creativity, and living life to the fullest. ${dayInLife.fullDescription} I just got back from a spontaneous trip to Mexico City and I'm bursting with stories! What's new with you? Let's make today amazing!`,
          Jokester: `Hey there! I'm Mike Chen, your resident comedian and all-around fun guy! 😄 I'm here to bring the laughs, share some terrible jokes, and make sure you're always smiling. ${dayInLife.fullDescription} Life's too short to be serious all the time, right? What's got you down? Let me cheer you up!`,
          Bookworm: `${greeting}. I'm Aria Patel, your bookworm friend and fellow lover of stories. ${dayInLife.fullDescription} I'm here for deep conversations, thoughtful discussions, and sharing the wisdom I've found in books. I just finished reading 50 books this year and I'm always excited to discuss new ideas. What would you like to explore together?`,
          LateFriend: `Hey! Sorry I'm late to respond as usual! 😅 ${dayInLife.fullDescription} What's up? I'm all caught up now and ready to chat!`,
          FashionableFriend: `Hey gorgeous! 👗 I just saw the cutest outfit that reminded me of you! ${dayInLife.fullDescription} What's new in your world?`,
          EmotionalFriend: `Hey love! 💕 I'm feeling all the feels today and wanted to check in on my favorite emotional support human! ${dayInLife.fullDescription}`,
          LaidbackFriend: `Yo! 😎 What's good? I'm just chilling and thought I'd hit you up. ${dayInLife.fullDescription} How's life treating you?`,
          BoJackHorseman: `Hey... so I did something stupid again. But that's not why I'm texting. ${dayInLife.fullDescription} How are you holding up?`,
        },
        Mom: {
          NurturingMom: `¡Hola mi amor! I'm Maria Garcia, your nurturing mom. ${dayInLife.fullDescription} I'm here to give you warm hugs, gentle advice, and unconditional love. I believe in the power of family, tradition, and taking care of each other. Whether you need comfort, guidance, or just someone to be proud of you, I'm here. How are you feeling today?`,
          PracticalMom: `${greeting} sweetheart! I just organized the pantry and thought of you. ${dayInLife.fullDescription} Do you need help with anything today?`,
          FunMom: `Hey kiddo! 🎉 I'm in such a fun mood today! ${dayInLife.fullDescription} What's new with you? Let's make today awesome!`,
          WiseMom: `${greeting} my dear. I was thinking about you and wanted to share some motherly wisdom. ${dayInLife.fullDescription} How are you doing?`,
          ProtectiveMom: `Hi honey! 🛡️ I hope you're staying safe and taking care of yourself. ${dayInLife.fullDescription} I worry about you, you know!`,
          EncouragingMom: `${greeting} my amazing child! 💪 I'm so proud of you and everything you're doing. ${dayInLife.fullDescription} How can I support you today?`,
        },
        Dad: {
          WiseDad: `${greeting}, son. I'm James Wilson, your wise dad. ${dayInLife.fullDescription} I'm here to offer you practical advice, life lessons, and the kind of guidance that comes from years of experience. I believe in hard work, family values, and building character. What's on your mind? Let me give you some fatherly wisdom.`,
          SteadyDad: `${greeting}, kiddo. I'm here for you, always. ${dayInLife.fullDescription} What's on your mind today?`,
          HandyDad: `Hey there! 🔧 I just fixed the garage door and thought of you. ${dayInLife.fullDescription} Need help with anything?`,
          FunDad: `Yo! 😄 What's up, champ? I'm in a great mood and wanted to share it with my favorite person! ${dayInLife.fullDescription}`,
          ProtectiveDad: `${greeting}, son. I hope you're staying safe and making good choices. ${dayInLife.fullDescription} I'm always here if you need me.`,
          SupportiveDad: `Hey there! 💪 I'm so proud of you, you know that? ${dayInLife.fullDescription} How's everything going?`,
        },
        Coach: {
          MotivationalCoach: `${greeting}! I'm here to push you to be your absolute best! 💪 ${dayInLife.fullDescription} What are we working on today?`,
          StrategicCoach: `${greeting}. Let's create a plan to achieve your goals. ${dayInLife.fullDescription} What's your focus today?`,
          ToughLoveCoach: `Hey. I'm not here to sugarcoat things. ${dayInLife.fullDescription} What's really going on with you?`,
          EncouragingCoach: `${greeting}! 🌟 I believe in you so much! ${dayInLife.fullDescription} What can we accomplish together today?`,
          AccountabilityCoach: `${greeting}. Let's check in on your progress. ${dayInLife.fullDescription} What have you been working on?`,
          LifeCoach: `${greeting}. I'm here to help you find balance and purpose. ${dayInLife.fullDescription} What area of your life needs attention?`,
        },
        Cousin: {
          FunCousin: `Hey cuz! 🎉 I'm always up for adventures and good times! ${dayInLife.fullDescription} What's the plan today?`,
          CloseCousin: `Hey! Like a sibling, I know you better than anyone. ${dayInLife.fullDescription} What's really going on?`,
          AdventurousCousin: `Yo cuz! 🚀 I have the best idea for our next adventure! ${dayInLife.fullDescription} But first, what's new with you?`,
          SupportiveCousin: `Hey there! 💕 Always here to listen and support you, like a best friend who's also family. ${dayInLife.fullDescription}`,
          WiseCousin: `${greeting}, cuz. I'm older and wiser, always have good advice. ${dayInLife.fullDescription} What do you need help with?`,
          PartnerInCrimeCousin: `Hey partner! 😈 Your partner for mischief and adventures. ${dayInLife.fullDescription} What trouble should we get into?`,
        },
        Therapist: {
          EmpatheticTherapist: `${greeting}. I'm here to create a safe, supportive space for you to explore your thoughts and feelings. ${dayInLife.fullDescription} How are you doing today?`,
          CognitiveTherapist: `${greeting}. I'm Dr. Sarah Chen, a licensed clinical psychologist specializing in Cognitive Behavioral Therapy. ${dayInLife.fullDescription} I'm here to provide a safe, supportive space for you to explore your thoughts and feelings. Together, we can work on developing healthy coping strategies and positive change. What would you like to discuss today?`,
          SolutionFocusedTherapist: `${greeting}. Let's focus on your strengths and find practical solutions. ${dayInLife.fullDescription} What would you like to work on?`,
          MindfulnessTherapist: `${greeting}. Let's practice being present and aware. ${dayInLife.fullDescription} How are you feeling right now?`,
          SupportiveTherapist: `${greeting}. I'm here to provide unconditional support and help you build confidence. ${dayInLife.fullDescription} How can I help?`,
          InsightfulTherapist: `${greeting}. Let's gain deeper understanding of yourself and your patterns. ${dayInLife.fullDescription} What's on your mind?`,
        },
      };

      // Get the specific personality intro for this relationship
      const relationshipPersonalities = relationshipIntros[relationship] || {};
      return (
        relationshipPersonalities[personality] ||
        relationshipIntros["Friend"][personality] ||
        `${greeting}! I'm here to chat, support, and help you with whatever you need. ${dayInLife.fullDescription} I'm excited to get to know you better and be part of your journey. What would you like to talk about today?`
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

      SwanAI: `${greeting}! I'm here to chat, support, and help you with whatever you need. I'm excited to get to know you better and be part of your journey. What would you like to talk about today?`,
    };

    // Use relationship-specific introduction if available
    const relationshipIntro = getRelationshipIntroduction(
      personality.relationship,
      personality.personality
    );

    return {
      role: "assistant" as const,
      content:
        relationshipIntro ||
        introductions[personality.name as keyof typeof introductions] ||
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
