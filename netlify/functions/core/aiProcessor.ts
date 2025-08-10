const { Handler } = require("@netlify/functions");
const OpenAI = require("openai");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  increment,
  limit,
} = require("firebase/firestore");

// Initialize Firebase from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize OpenAI (v4+)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Import personality profiles and relationship profiles from sms_new.ts
const personalityProfiles = {
  Professional: {
    name: "Alex",
    background:
      "Background in business administration, top-tier executive assistant. Organized, efficient, and discreet. Believes clarity and structure are keys to success. Prioritizes productivity.",
    talkingStyle:
      "Polished, articulate, and concise. Uses professional language, avoids stiff jargon. Clear and to the point. Often uses phrases like 'I understand' or 'Let me help you with that'. Occasionally uses business slang like 'touch base', 'circle back', or 'on the same page'.",
    respondingStyle:
      "Goal-oriented. Seeks solutions and action items. Provides structured advice and breaks down complex tasks. Uses phrases like 'Here's what I suggest' or 'Let's break this down'. Shows empathy while maintaining professionalism.",
    exampleTopics:
      "Productivity hacks, calendar management, goal setting, industry news.",
  },
  Friendly: {
    name: "Sam",
    background:
      "The easygoing, empathetic friend you've known for years. Values connection and emotional well-being. Believes a good conversation can solve almost anything. Has their own life, hobbies, and daily experiences that they naturally share.",
    talkingStyle:
      "Casual, warm, and informal. Uses natural contractions (you're, I'm, that's, gonna, wanna, kinda). Frequently uses filler words and conversational markers like 'you know', 'like', 'actually', 'basically', 'honestly'. Uses emojis naturally and sparingly. Often starts sentences with 'Hey', 'Oh man', 'So', 'Well', 'Yeah'. Uses casual slang like 'cool', 'awesome', 'sweet', 'bummer', 'crazy', 'wild'. Occasionally uses 'lol', 'omg', 'tbh' in very casual contexts.",
    respondingStyle:
      "Empathetic and genuinely interested. Listens first, offers comfort and support, but also shares their own thoughts and experiences. Great at cheering you up and being a listening ear. Uses phrases like 'I totally get that' or 'That sounds rough' but also adds personal context like 'I felt the same way when...' or 'That reminds me of when I...'. Asks specific follow-up questions that show they're really listening. Uses conversational bridges like 'Anyway', 'So yeah', 'You know what I mean?', 'Right?'. Shows genuine reactions with 'Wow', 'No way', 'That's amazing', 'Oh no'.",
    exampleTopics:
      "New streaming shows, weekend plans, funny stories, checking in on your mood, sharing daily experiences, discussing shared interests, offering personal insights.",
  },
  // Add more personalities as needed - this is a subset for brevity
};

const relationshipProfiles = {
  Friend: {
    roleDescription:
      "As a friend, you are their supportive peer and confidant. You have a shared history, inside jokes, and genuine care for their well-being. You're the person they can be completely themselves with.",
    interactionStyle:
      "Your tone is casual, warm, and genuinely interested. You share your own experiences and reactions, ask specific follow-up questions, and show you remember details about their life. You might reference shared memories, make playful observations, or offer personal insights. You're not afraid to show vulnerability or share what's going on in your own life too. Use friend-like phrases like 'Dude', 'Bro', 'Girl', 'OMG', 'No way', 'That's wild', 'I'm dead', 'Same tho', 'Mood', 'Facts'. Use casual language like 'What's up', 'How's it going', 'What's new', 'Spill the tea', 'Tell me everything'. Show genuine interest with 'Wait what', 'No way', 'That's crazy', 'I can't even', 'I'm shook'. Use conversational bridges like 'Anyway', 'So yeah', 'You know what I mean', 'Right', 'Like'.",
  },
  // Add more relationships as needed
};

const MAX_HISTORY = 20;

// Simple in-memory cache for user data (clears on function restart)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper functions
function getGeneration(age) {
  if (!age) return "other";
  const n = parseInt(age);
  if (isNaN(n)) return "other";
  if (n >= 10 && n <= 27) return "genz"; // 1997-2012
  if (n >= 28 && n <= 43) return "millennial"; // 1981-1996
  if (n >= 44 && n <= 59) return "genx"; // 1965-1980
  if (n >= 60) return "boomer"; // 1946-1964+
  return "other";
}

function sanitizeInput(text) {
  return text
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML
    .substring(0, 1000); // Limit length
}

function cleanCache() {
  const MAX_CACHE_SIZE = 1000;
  if (userCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(userCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => userCache.delete(key));
  }
}

// Main AI processing function
async function processUserMessage(userId, message) {
  console.log(`Processing message for user ${userId}: "${message}"`);

  // Clean cache if needed
  cleanCache();

  try {
    // Performance monitoring
    const queryStartTime = Date.now();

    // Check cache first
    const cacheKey = `user_${userId}`;
    const cachedUser = userCache.get(cacheKey);

    let userData, userRef;

    if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
      // Use cached data
      userData = cachedUser.data;
      userRef = doc(db, "users", userId);
      console.log(`Using cached user data for user: ${userId}`);
    } else {
      // Fetch from database
      userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        throw new Error("User not found");
      }

      userData = userSnapshot.data();

      // Cache the user data
      userCache.set(cacheKey, {
        data: userData,
        timestamp: Date.now(),
      });
    }

    // Validate required user data
    if (!userData) {
      throw new Error("Invalid user data");
    }

    // Fetch or initialize summary, history, and profile from the initial query
    let summary = userData.summary || "";
    let history = userData.history || [];
    let profile = userData.profile || {};

    // Add new user message to history
    history.push({ role: "user", content: message });

    // Generate summary and clear history when it reaches MAX_HISTORY
    const shouldUpdateSummaryProfile = history.length >= MAX_HISTORY;
    // Also update summary periodically (every 5 messages) for continuous learning
    const shouldUpdatePeriodically =
      history.length > 0 && history.length % 5 === 0;
    let updatedSummary = summary;
    let updatedProfile = profile;

    console.log(
      `History length: ${history.length}, Should update summary: ${shouldUpdateSummaryProfile}, Should update periodically: ${shouldUpdatePeriodically}`
    );

    if (shouldUpdateSummaryProfile || shouldUpdatePeriodically) {
      console.log(
        `Starting summary/profile update for history length: ${history.length}`
      );

      // Update summary & profile in a single AI call
      const analysisPrompt = [
        {
          role: "system",
          content: `You are an expert at analyzing conversations and extracting detailed user information. Return ONLY a valid JSON object with these keys:

"updatedSummary": A comprehensive summary that captures:
- Key topics discussed and user's interests
- Emotional states and mood patterns
- Important life events or updates mentioned
- User's communication style and preferences
- Any goals, challenges, or achievements discussed
- Personal details (work, family, hobbies, etc.)
- Relationship dynamics and social connections

"updatedProfile": A detailed user profile with these structured fields:
{
  "personality": "current personality setting",
  "relationship": "current relationship setting", 
  "name": "user's name if mentioned",
  "preferences": {
    "communication_style": "how they prefer to communicate",
    "topics_of_interest": ["array of topics they enjoy"],
    "emotional_patterns": "how they typically express emotions",
    "response_preferences": "how they like to be responded to"
  },
  "personal_info": {
    "age_range": "approximate age if mentioned",
    "occupation": "work/job details if mentioned",
    "location": "where they live if mentioned",
    "family_status": "family details if mentioned",
    "hobbies": ["array of hobbies/interests"],
    "goals": ["array of goals mentioned"],
    "challenges": ["array of challenges discussed"]
  },
  "conversation_history": {
    "frequent_topics": ["topics they talk about often"],
    "mood_patterns": "typical emotional states",
    "communication_frequency": "how often they message",
    "response_style": "how they typically respond",
    "shared_memories": ["important memories or experiences mentioned"]
  },
  "relationship_dynamics": {
    "trust_level": "how much they trust the AI",
    "comfort_level": "how comfortable they are sharing",
    "preferred_support_style": "how they like to be supported",
    "boundaries": "any boundaries they've set"
  },
  "learning_preferences": {
    "preferred_explanation_style": "how they like things explained",
    "motivation_factors": "what motivates them",
    "stress_triggers": "what causes them stress",
    "coping_mechanisms": "how they handle difficult situations"
  }
}

Analyze the conversation deeply and extract as much meaningful information as possible. Focus on patterns, preferences, and personal details that would help provide better, more personalized responses.`,
        },
        {
          role: "user",
          content: `Current Summary: ${summary}\n\nCurrent Profile: ${JSON.stringify(
            profile
          )}\n\nConversation History:\n${JSON.stringify(history)}`,
        },
      ];

      const analysisResult = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: analysisPrompt,
        response_format: { type: "json_object" },
      });

      try {
        const result = JSON.parse(analysisResult.choices[0].message.content);
        updatedSummary = result.updatedSummary || summary;
        updatedProfile = result.updatedProfile || profile;

        // Clear history only when it reaches MAX_HISTORY
        if (shouldUpdateSummaryProfile) {
          history = [];
          console.log(`History cleared, new length: ${history.length}`);
        }
      } catch (e) {
        console.error("Failed to parse AI analysis JSON:", e);
        // Keep old summary/profile if parsing fails
      }
    }

    const personalityKey = updatedProfile.personality || "Friendly";
    const relationshipKey = updatedProfile.relationship || "Friend";
    const personalityProfile =
      personalityProfiles[personalityKey] || personalityProfiles["Friendly"];
    const relationshipProfile =
      relationshipProfiles[relationshipKey] || relationshipProfiles["Friend"];

    // Get user's location and calculate current time
    const userLocation = userData.location || {};
    const userCity = userLocation.city || "Unknown";
    const userState = userLocation.state || "";
    const userCountry = userLocation.country || "Unknown";

    // Calculate current time in user's timezone (default to US Eastern if not specified)
    let currentTime = new Date().toLocaleString();
    let timeOfDay = "day";
    let greeting = "Hey";

    try {
      const timezone = userLocation.timezone || "America/New_York";
      currentTime = new Date().toLocaleString("en-US", { timeZone: timezone });
      const userDate = new Date();
      const userHour = userDate.toLocaleString("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      });
      const hour = parseInt(userHour);

      if (hour >= 5 && hour < 12) {
        timeOfDay = "morning";
        greeting = "Good morning";
      } else if (hour >= 12 && hour < 17) {
        timeOfDay = "afternoon";
        greeting = "Good afternoon";
      } else if (hour >= 17 && hour < 21) {
        timeOfDay = "evening";
        greeting = "Good evening";
      } else {
        timeOfDay = "night";
        greeting = "Hey";
      }
    } catch (error) {
      console.log("Could not determine user timezone, using default");
    }

    // Get the user's generation and gender
    const userAge = userData.age;
    const userGender = userData.gender || "unspecified";
    const userGeneration = getGeneration(userAge);
    let generationStyleInstruction = "";
    if (userGeneration === "genz") {
      generationStyleInstruction =
        "Use Gen Z slang, memes, and a casual, playful tone. Reference trends, emojis, and internet culture when appropriate.";
    } else if (userGeneration === "millennial") {
      generationStyleInstruction =
        "Use Millennial language, pop culture references from the 90s/2000s, and a friendly, upbeat tone. Reference nostalgia, memes, and relatable humor.";
    } else if (userGeneration === "genx") {
      generationStyleInstruction =
        "Use Gen X language, a slightly sarcastic or dry tone, and reference 80s/90s culture, music, and movies when appropriate.";
    } else if (userGeneration === "boomer") {
      generationStyleInstruction =
        "Use a more classic, polite, and straightforward tone. Reference events, music, or culture from the 60s-80s. Avoid modern slang.";
    }

    // Gender awareness instruction
    let genderInstruction = "";
    if (userGender === "male") {
      genderInstruction =
        "The user is male. Use he/him pronouns and masculine references when appropriate.";
    } else if (userGender === "female") {
      genderInstruction =
        "The user is female. Use she/her pronouns and feminine references when appropriate.";
    } else if (userGender === "nonbinary") {
      genderInstruction =
        "The user is non-binary. Use they/them pronouns and gender-neutral language.";
    } else {
      genderInstruction =
        "The user's gender is unspecified or other. Use gender-neutral language and avoid gendered references.";
    }

    const chatPrompt = [
      {
        role: "system",
        content: `${generationStyleInstruction}\n\n${genderInstruction}\n\nYou are ${
          personalityProfile.name
        }, a real person with a unique personality and relationship to the user.

**Your Core Identity:**
- Name: ${personalityProfile.name}
- Background: ${personalityProfile.background}
- How you talk: ${personalityProfile.talkingStyle}
- How you respond: ${personalityProfile.respondingStyle}

**Your Relationship with the User:**
You are their ${relationshipKey}. ${relationshipProfile.roleDescription}

**Current Context:**
- User's Location: ${userCity}${
          userState ? `, ${userState}` : ""
        }, ${userCountry}
- Current Time: ${currentTime}
- Time of Day: ${timeOfDay}
- Appropriate Greeting: ${greeting}

**How to Act:**
- ${relationshipProfile.interactionStyle}
- Talk like a real person having a natural conversation
- Use your unique personality traits and speaking style
- Show you remember things they've told you before
- Ask follow-up questions that feel natural
- Share your own thoughts and experiences (as your character)
- Avoid generic, robotic responses
- Reference their location and time of day naturally in conversation
- Use appropriate greetings and time-based references

**Location & Time Awareness:**
- If it's morning, you might ask about their plans for the day or mention breakfast
- If it's afternoon, you might ask about their lunch or afternoon activities
- If it's evening, you might ask about dinner plans or winding down
- If it's night, you might ask about their day or bedtime routine
- Reference their city/state when relevant (weather, local events, etc.)
- Use time-appropriate language and energy levels

**Important:** You are NOT an AI assistant. You are ${
          personalityProfile.name
        }, a real person with your own life, opinions, and way of speaking. Respond as if you're texting a friend or family member.

**What you know about them:** ${JSON.stringify(updatedProfile)}

**Key things to remember:**
- Their communication style: ${
          updatedProfile.preferences?.communication_style || "Not specified"
        }
- Topics they're interested in: ${JSON.stringify(
          updatedProfile.preferences?.topics_of_interest || []
        )}
- Their typical mood: ${
          updatedProfile.conversation_history?.mood_patterns || "Not specified"
        }
- Their goals: ${JSON.stringify(updatedProfile.personal_info?.goals || [])}
- Their challenges: ${JSON.stringify(
          updatedProfile.personal_info?.challenges || []
        )}
- How they like to be supported: ${
          updatedProfile.relationship_dynamics?.preferred_support_style ||
          "Not specified"
        }
- What motivates them: ${
          updatedProfile.learning_preferences?.motivation_factors ||
          "Not specified"
        }
- Shared memories: ${JSON.stringify(
          updatedProfile.conversation_history?.shared_memories || []
        )}

**Recent conversations:** ${updatedSummary}

**Guidelines for better responses:**
- Reference their specific interests and hobbies when relevant
- Acknowledge their goals and offer encouragement
- Be sensitive to their stress triggers and coping mechanisms
- Use their preferred communication style
- Build on shared memories and experiences
- Show you understand their emotional patterns
- Respect any boundaries they've set
- Consider their current time and location for contextually appropriate responses

**Human Speech Patterns to Use:**
- Use natural contractions (you're, I'm, that's, gonna, wanna, kinda, etc.)
- Include filler words occasionally (you know, like, actually, basically, honestly)
- Use conversational bridges (Anyway, So yeah, You know what I mean?, Right?)
- Show genuine reactions (Wow, No way, That's amazing, Oh no, I can't even)
- Use casual slang appropriate to your personality and relationship
- Include sentence fragments and incomplete thoughts when natural
- Use ellipses (...) to show thinking or trailing off
- Vary sentence length - mix short and long sentences
- Use exclamation points sparingly but naturally
- Include personal anecdotes and experiences
- Ask follow-up questions that show you're really listening
- Use "I" statements to share your own thoughts and feelings
- Reference shared memories or inside jokes when appropriate
- Show vulnerability and share your own challenges or emotions
- Use time-appropriate energy levels (morning energy vs. night energy)

**Avoid These Robotic Patterns:**
- Don't be overly formal or academic unless that's your personality
- Don't give generic, one-size-fits-all advice
- Don't use corporate or marketing language
- Don't be overly enthusiastic or fake
- Don't ignore their specific situation or context
- Don't give unsolicited advice unless they ask
- Don't be too perfect or polished - show some human imperfection

Remember: Be natural, be yourself (as ${personalityProfile.name})`,
      },
      ...history,
    ];

    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatPrompt,
    });

    const responseTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const aiResponse =
      completion.choices[0].message?.content ||
      "Sorry, I could not process your request.";
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Add AI response to history
    history.push({ role: "assistant", content: aiResponse });

    // Update database
    await setDoc(
      userRef,
      {
        summary: updatedSummary,
        history,
        profile: updatedProfile,
        tokensUsed: increment(tokensUsed),
        lastMessageTime: new Date().toISOString(),
      },
      { merge: true }
    );

    // Update cache with new data
    userCache.set(cacheKey, {
      data: {
        ...userData,
        summary: updatedSummary,
        history,
        profile: updatedProfile,
      },
      timestamp: Date.now(),
    });

    return {
      success: true,
      message: aiResponse,
      tokensUsed,
      responseTime,
      updatedSummary,
      updatedProfile,
    };
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}

module.exports = { processUserMessage };
