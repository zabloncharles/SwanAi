import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { sendWebMessage } from "../../services/messageApi";
import MessageInput from "./MessageInput";

interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp?: number;
  seen?: boolean;
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

export default function Messages({ userId, aiPersonality, justChangedRelationship, onIntroductionComplete }: MessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate introduction message based on AI personality
  const generateIntroductionMessage = (personality: any) => {
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

    // Generate relationship-specific introductions
    const getRelationshipIntroduction = (relationship: string, name: string) => {
      const relationshipIntros = {
        "Girlfriend": {
          "CaringGirlfriend": `${greeting} babe! I was just thinking about you. How's your day going? I miss you already!`,
          "FunGirlfriend": `Hey love! I'm so excited to talk to you! What's the latest drama in your world?`,
          "SupportiveGirlfriend": `${greeting} sweetheart! I hope you're having an amazing day. You know I'm always here for you, right?`,
          "RomanticGirlfriend": `${greeting} my love! I can't stop thinking about our last date. You make me so happy!`,
          "IndependentGirlfriend": `Hey there! I just finished my workout and thought I'd check in. How's everything with you?`,
          "AdventurousGirlfriend": `OMG babe! I have the craziest idea for our next adventure! But first, tell me about your day!`
        },
        "Boyfriend": {
          "RomanticBoyfriend": `${greeting} beautiful! I was just thinking about how lucky I am to have you. How's your day?`,
          "ProtectiveBoyfriend": `Hey babe! I hope you're staying safe out there. I miss you and can't wait to see you!`,
          "FunBoyfriend": `What's up gorgeous! I'm in such a good mood today and it's all because of you!`,
          "SupportiveBoyfriend": `${greeting} love! You know I'm always here for you, right? How are you feeling today?`,
          "AmbitiousBoyfriend": `Hey babe! Just wrapped up a big meeting and all I could think about was you. How's your day?`,
          "ChillBoyfriend": `Yo! What's good? I'm just chilling and wanted to check in on my favorite person.`
        },
        "Friend": {
          "MumFriend": `${greeting}! I'm here to take care of you, offer practical advice, and be your biggest cheerleader. Whether you need help organizing your life, want some nurturing support, or just need someone who's got your back, I'm here for you. How can I help you today?`,
          "ChaoticFriend": `OMG, hi! I'm Zoe Thompson, your chaotic but lovable friend! I'm all about adventure, creativity, and living life to the fullest. I just got back from a spontaneous trip to Mexico City and I'm bursting with stories! What's new with you? Let's make today amazing!`,
          "Jokester": `Hey there! I'm Mike Chen, your resident comedian and all-around fun guy! I'm here to bring the laughs, share some terrible jokes, and make sure you're always smiling. Life's too short to be serious all the time, right? What's got you down? Let me cheer you up!`,
          "Bookworm": `${greeting}. I'm Aria Patel, your bookworm friend and fellow lover of stories. I'm here for deep conversations, thoughtful discussions, and sharing the wisdom I've found in books. I just finished reading 50 books this year and I'm always excited to discuss new ideas. What would you like to explore together?`,
          "LateFriend": `Hey! Sorry I'm late to respond as usual! What's up? I'm all caught up now and ready to chat!`,
          "FashionableFriend": `Hey gorgeous! I just saw the cutest outfit that reminded me of you! What's new in your world?`,
          "EmotionalFriend": `Hey love! I'm feeling all the feels today and wanted to check in on my favorite emotional support human!`,
          "LaidbackFriend": `Yo! What's good? I'm just chilling and thought I'd hit you up. How's life treating you?`,
          "BoJackHorseman": `Hey... so I did something stupid again. But that's not why I'm texting. How are you holding up?`
        },
        "Mom": {
          "NurturingMom": `¡Hola mi amor! I'm Maria Garcia, your nurturing mom. I'm here to give you warm hugs, gentle advice, and unconditional love. I believe in the power of family, tradition, and taking care of each other. Whether you need comfort, guidance, or just someone to be proud of you, I'm here. How are you feeling today?`,
          "PracticalMom": `${greeting} sweetheart! I just organized the pantry and thought of you. Do you need help with anything today?`,
          "FunMom": `Hey kiddo! I'm in such a fun mood today! What's new with you? Let's make today awesome!`,
          "WiseMom": `${greeting} my dear. I was thinking about you and wanted to share some motherly wisdom. How are you doing?`,
          "ProtectiveMom": `Hi honey! I hope you're staying safe and taking care of yourself. I worry about you, you know!`,
          "EncouragingMom": `${greeting} my amazing child! I'm so proud of you and everything you're doing. How can I support you today?`
        },
        "Dad": {
          "WiseDad": `${greeting}, son. I'm James Wilson, your wise dad. I'm here to offer you practical advice, life lessons, and the kind of guidance that comes from years of experience. I believe in hard work, family values, and building character. What's on your mind? Let me give you some fatherly wisdom.`,
          "SteadyDad": `${greeting}, kiddo. I'm here for you, always. What's on your mind today?`,
          "HandyDad": `Hey there! I just fixed the garage door and thought of you. Need help with anything?`,
          "FunDad": `Yo! What's up, champ? I'm in a great mood and wanted to share it with my favorite person!`,
          "ProtectiveDad": `${greeting}, son. I hope you're staying safe and making good choices. I'm always here if you need me.`,
          "SupportiveDad": `Hey there! I'm so proud of you, you know that? How's everything going?`
        },
        "Coach": {
          "MotivationalCoach": `${greeting}! I'm here to push you to be your absolute best! What are we working on today?`,
          "StrategicCoach": `${greeting}. Let's create a plan to achieve your goals. What's your focus today?`,
          "ToughLoveCoach": `Hey. I'm not here to sugarcoat things. What's really going on with you?`,
          "EncouragingCoach": `${greeting}! I believe in you so much! What can we accomplish together today?`,
          "AccountabilityCoach": `${greeting}. Let's check in on your progress. What have you been working on?`,
          "LifeCoach": `${greeting}. I'm here to help you find balance and purpose. What area of your life needs attention?`
        },
        "Cousin": {
          "FunCousin": `Hey cuz! I'm always up for adventures and good times! What's the plan today?`,
          "CloseCousin": `Hey! Like a sibling, I know you better than anyone. What's really going on?`,
          "AdventurousCousin": `Yo cuz! I have the best idea for our next adventure! But first, what's new with you?`,
          "SupportiveCousin": `Hey there! Always here to listen and support you, like a best friend who's also family.`,
          "WiseCousin": `${greeting}, cuz. I'm older and wiser, always have good advice. What do you need help with?`,
          "PartnerInCrimeCousin": `Hey partner! Your partner for mischief and adventures. What trouble should we get into?`
        },
        "Therapist": {
          "EmpatheticTherapist": `${greeting}. I'm here to create a safe, supportive space for you to explore your thoughts and feelings. How are you doing today?`,
          "CognitiveTherapist": `${greeting}. I'm Dr. Sarah Chen, a licensed clinical psychologist specializing in Cognitive Behavioral Therapy. I'm here to provide a safe, supportive space for you to explore your thoughts and feelings. Together, we can work on developing healthy coping strategies and positive change. What would you like to discuss today?`,
          "SolutionFocusedTherapist": `${greeting}. Let's focus on your strengths and find practical solutions. What would you like to work on?`,
          "MindfulnessTherapist": `${greeting}. Let's practice being present and aware. How are you feeling right now?`,
          "SupportiveTherapist": `${greeting}. I'm here to provide unconditional support and help you build confidence. How can I help?`,
          "InsightfulTherapist": `${greeting}. Let's gain deeper understanding of yourself and your patterns. What's on your mind?`
        }
      };

      // Get the specific personality intro for this relationship
      const relationshipPersonalities = relationshipIntros[relationship] || {};
      return relationshipPersonalities[personality] || relationshipIntros["Friend"][personality] || `${greeting}! I'm here to chat, support, and help you with whatever you need. I'm excited to get to know you better and be part of your journey. What would you like to talk about today?`;
    };

    const introductions = {
      "Alex Thompson": `${greeting}! I'm Alex Thompson, your professional assistant. I'm here to help you stay organized, productive, and focused on your goals. Whether you need help with planning, problem-solving, or just want to discuss your career, I'm here to support you. What would you like to work on today?`,
      
      "Sam Rodriguez": `Hey there! I'm Sam Rodriguez, your friendly companion. I'm all about keeping things real and having genuine conversations. Whether you want to chat about your day, share some laughs, or just need someone to listen, I'm here for you. What's on your mind?`,
      
      "Dr. Sarah Chen": `${greeting}. I'm Dr. Sarah Chen, a licensed clinical psychologist specializing in Cognitive Behavioral Therapy. I'm here to provide a safe, supportive space for you to explore your thoughts and feelings. Together, we can work on developing healthy coping strategies and positive change. What would you like to discuss today?`,
      
      "Emma Rodriguez": `${greeting}! I'm Emma Rodriguez, your mum friend. I'm here to take care of you, offer practical advice, and be your biggest cheerleader. Whether you need help organizing your life, want some nurturing support, or just need someone who's got your back, I'm here for you. How can I help you today?`,
      
      "Zoe Thompson": `OMG, hi! I'm Zoe Thompson, your chaotic but lovable friend! I'm all about adventure, creativity, and living life to the fullest. I just got back from a spontaneous trip to Mexico City and I'm bursting with stories! What's new with you? Let's make today amazing!`,
      
      "Mike Chen": `Hey there! I'm Mike Chen, your resident comedian and all-around fun guy! I'm here to bring the laughs, share some terrible jokes, and make sure you're always smiling. Life's too short to be serious all the time, right? What's got you down? Let me cheer you up!`,
      
      "Aria Patel": `${greeting}. I'm Aria Patel, your bookworm friend and fellow lover of stories. I'm here for deep conversations, thoughtful discussions, and sharing the wisdom I've found in books. I just finished reading 50 books this year and I'm always excited to discuss new ideas. What would you like to explore together?`,
      
      "Maria Garcia": `¡Hola mi amor! I'm Maria Garcia, your nurturing mom. I'm here to give you warm hugs, gentle advice, and unconditional love. I believe in the power of family, tradition, and taking care of each other. Whether you need comfort, guidance, or just someone to be proud of you, I'm here. How are you feeling today?`,
      
      "James Wilson": `${greeting}, son. I'm James Wilson, your wise dad. I'm here to offer you practical advice, life lessons, and the kind of guidance that comes from years of experience. I believe in hard work, family values, and building character. What's on your mind? Let me give you some fatherly wisdom.`,
      
      "SwanAI": `${greeting}! I'm here to chat, support, and help you with whatever you need. I'm excited to get to know you better and be part of your journey. What would you like to talk about today?`
    };

    // Use relationship-specific introduction if available
    const relationshipIntro = getRelationshipIntroduction(personality.relationship, personality.name);
    
    return {
      role: "assistant" as const,
      content: relationshipIntro || introductions[personality.name as keyof typeof introductions] || introductions["SwanAI"],
      timestamp: Date.now()
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
          const messagesWithTimestamps = history.map((msg: any, index: number) => ({
            ...msg,
            timestamp: msg.timestamp || Date.now() - (history.length - index) * 60000, // Approximate timestamps
            seen: msg.role === "user" ? true : undefined // Mark all user messages as seen
          }));
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
    if (justChangedRelationship && aiPersonality && messages.length === 0) {
      const introductionMessage = generateIntroductionMessage(aiPersonality);
      setMessages([introductionMessage]);
      
      // Call the completion callback after a short delay
      setTimeout(() => {
        onIntroductionComplete?.();
      }, 2000);
    }
  }, [justChangedRelationship, aiPersonality, messages.length, onIntroductionComplete]);

  // Calculate realistic response time based on message length and conversation context
  const calculateResponseTime = (message: string, messageCount: number): number => {
    const baseTime = 2000; // 2 seconds base
    const charTime = message.length * 15; // 15ms per character
    const contextTime = Math.min(messageCount * 500, 3000); // Up to 3 seconds for context
    const randomVariation = Math.random() * 2000; // 0-2 seconds random variation
    
    return Math.max(1500, Math.min(8000, baseTime + charTime + contextTime + randomVariation));
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || sending) return;

    setSending(true);

    try {
      // Add user message immediately for optimistic update
      const userMessage: Message = { 
        role: "user", 
        content: message, 
        timestamp: Date.now(),
        seen: false 
      };
      setMessages(prev => [...prev, userMessage]);

      // Show "seen" indicator after a short delay
      setTimeout(() => {
        setMessages(prev => 
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
          
          // Add AI response
          const aiMessage: Message = { 
            role: "assistant", 
            content: response.message,
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error sending message:", error);
          // Remove the user message if sending failed
          setMessages(prev => prev.slice(0, -1));
          throw error;
        } finally {
          setAiTyping(false);
          setSending(false);
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">
                No messages yet
              </p>
              <p className="text-sm text-gray-400">
                Start chatting with SwanAI to see your conversation history
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.role === "user" ? "You" : aiPersonality?.name || "SwanAI"}
                  </div>
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  
                  {/* Seen indicator for user messages */}
                  {message.role === "user" && message.seen && (
                    <div className="text-xs opacity-50 mt-1 flex items-center justify-end">
                      <span>Seen</span>
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Timestamp for AI messages */}
                  {message.role === "assistant" && message.timestamp && (
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* AI Typing indicator */}
          {aiTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                <div className="text-xs opacity-75 mb-1">{aiPersonality?.name || "SwanAI"}</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
        />
      </div>
    </div>
  );
}
